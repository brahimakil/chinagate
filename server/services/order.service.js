/**
 * Title: Order Service for Cash on Delivery
 * Date: October 2025
 */

const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const Purchase = require("../models/purchase.model");
const User = require("../models/user.model");
const System = require("../models/system.model");
const { sendEmail } = require("../utils/email.util");
// Create Cash on Delivery Order
exports.createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, whatsappNumber, customerNotes } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        acknowledgement: false,
        message: "Bad Request",
        description: "No items in cart",
      });
    }

    if (!deliveryAddress || !whatsappNumber) {
      return res.status(400).json({
        acknowledgement: false,
        message: "Bad Request",
        description: "Delivery address and WhatsApp number are required",
      });
    }

    // Validate stock before creating order
    for (const item of items) {
      const product = await Product.findById(item.pid);
      if (!product) {
        return res.status(404).json({
          acknowledgement: false,
          message: "Not Found",
          description: `Product ${item.name} not found`,
        });
      }
    }

    // Get current delivery tax from system settings
    const systemSettings = await System.findOne();
    const deliveryTax = systemSettings?.deliveryTax || 0;

    // Calculate subtotal and total amount
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = subtotal + deliveryTax;

    // Generate order ID
    const orderId = `ORD-${Date.now()}-${req.user._id.toString().slice(-6)}`;

    // Create purchase/order
    const purchase = await Purchase.create({
      customer: req.user._id,
      customerId: req.user._id,
      orderId: orderId,
      subtotal: subtotal,
      deliveryTax: deliveryTax,
      totalAmount: totalAmount,
      deliveryAddress: deliveryAddress,
      whatsappNumber: whatsappNumber,
      customerNotes: customerNotes || "",
      paymentMethod: "cash_on_delivery",
      status: "pending",
      products: items.map((item) => ({
        product: item.pid,
        quantity: item.quantity,
      })),
    });

    // Update user - add purchase, clear cart
    await User.findByIdAndUpdate(req.user._id, {
      $push: { purchases: purchase._id },
      $set: { cart: [] },
    });

    // Add products to user's products array
    for (const item of items) {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { products: item.pid },
      });
    }

    // Delete cart items WITHOUT restoring stock (stock already reduced when added to cart)
    // We use deleteOne() to bypass the pre-delete hook that would restore stock
    for (const cart of items) {
      await Cart.deleteOne({ _id: cart.cid });
      // Also remove from user's cart array
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { cart: cart.cid }
      });
    }

    // Add user to products buyers array
    for (const item of items) {
      await Product.findByIdAndUpdate(item.pid, {
        $push: { buyers: req.user._id },
      });
    }

    // Populate product details for email
    const populatedPurchase = await Purchase.findById(purchase._id)
      .populate('products.product')
      .populate('customer');

    // Send confirmation email
      const emailHTML = `
      <h1>Order Confirmation</h1>
      <p>Dear ${populatedPurchase.customer.name},</p>
      <p>Your order has been placed successfully!</p>
      
      <h2>Order Details:</h2>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Payment Method:</strong> Cash on Delivery</p>
      
      <h3>Delivery Information:</h3>
      <p><strong>Address:</strong> ${deliveryAddress}</p>
      <p><strong>WhatsApp:</strong> ${whatsappNumber}</p>
      ${customerNotes ? `<p><strong>Notes:</strong> ${customerNotes}</p>` : ''}
      
      <h3>Products:</h3>
      <ul>
        ${populatedPurchase.products.map(item => `
          <li>${item.product.title} - Quantity: ${item.quantity} - Price: $${(item.product.price * item.quantity).toFixed(2)}</li>
        `).join('')}
      </ul>
      
      <hr style="margin: 20px 0;">
      <p><strong>Subtotal:</strong> $${subtotal.toFixed(2)}</p>
      <p><strong>Delivery Tax:</strong> $${deliveryTax.toFixed(2)}</p>
      <p style="font-size: 18px;"><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
      
      <p>We will contact you soon via WhatsApp to confirm your delivery.</p>
      <p>Thank you for your order!</p>
    `;

    await sendEmail({
      to: populatedPurchase.customer.email,
      subject: `Order Confirmation - ${orderId}`,
      html: emailHTML,
    });

    res.status(201).json({
      acknowledgement: true,
      message: "Ok",
      description: "Order placed successfully! Check your email for confirmation.",
      data: {
        orderId: orderId,
        totalAmount: totalAmount,
        deliveryAddress: deliveryAddress,
      },
    });
  } catch (error) {
    res.status(500).json({
      acknowledgement: false,
      message: "Internal Server Error",
      description: error.message,
    });
  }
};
