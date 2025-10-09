/**
 * Title: Write a program using JavaScript on Purchase Service
 * Author: Hasibul Islam
 * Portfolio: https://devhasibulislam.vercel.app
 * Linkedin: https://linkedin.com/in/devhasibulislam
 * GitHub: https://github.com/devhasibulislam
 * Facebook: https://facebook.com/devhasibulislam
 * Instagram: https:/instagram.com/devhasibulislam
 * Twitter: https://twitter.com/devhasibulislam
 * Pinterest: https://pinterest.com/devhasibulislam
 * WhatsApp: https://wa.me/8801906315901
 * Telegram: devhasibulislam
 * Date: 09, January 2024
 */

const Purchase = require("../models/purchase.model");
const Product = require("../models/product.model");
const { sendEmail } = require("../utils/email.util");

// get all purchases
async function getAllPurchases(res) {
  const purchases = await Purchase.find().populate([
    "customer",
    "products.product",
  ]);

  res.status(200).json({
    acknowledgement: true,
    message: "Ok",
    description: "Purchases fetched successfully",
    data: purchases,
  });
}

// update purchase status
async function updatePurchaseStatus(req, res) {
  // Get the current purchase to check status
  const currentPurchase = await Purchase.findById(req.params.id);

  if (!currentPurchase) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "Purchase not found",
    });
  }

  // Prevent reverting cancelled orders
  if (currentPurchase.status === "cancelled") {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "Cannot change status of a cancelled order",
    });
  }

  // Prevent reverting delivered orders
  if (currentPurchase.status === "delivered") {
    return res.status(400).json({
      acknowledgement: false,
      message: "Bad Request",
      description: "Cannot change status of a delivered order",
    });
  }

  // If cancelling the order, restore stock
  if (req.body.status === "cancelled" && currentPurchase.status !== "cancelled") {
    const purchaseWithProducts = await Purchase.findById(req.params.id).populate('products.product');
    
    // Restore stock for each product
    for (const item of purchaseWithProducts.products) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: item.quantity }
      });
    }
  }

  const purchase = await Purchase.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        status: req.body.status,
      },
    },
    {
      runValidators: true,
      new: true,
    }
  ).populate('customer').populate('products.product');

  // Send email if status changed to delivered
  if (req.body.status === "delivered" && purchase) {
    try {
      const emailHTML = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #16a34a;">Order Delivered Successfully! 🎉</h1>
          <p>Dear ${purchase.customer.name},</p>
          <p>Great news! Your order has been successfully delivered.</p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin: 20px 0;">
            <h2 style="color: #166534; margin-top: 0;">Order Details:</h2>
            <p><strong>Order ID:</strong> ${purchase.orderId}</p>
            <p><strong>Total Amount:</strong> $${purchase.totalAmount.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> Cash on Delivery</p>
          </div>
          
          <h3 style="color: #333;">Delivered Items:</h3>
          <ul style="list-style: none; padding: 0;">
            ${purchase.products.map(item => `
              <li style="background: #f9fafb; padding: 10px; margin: 10px 0; border-radius: 5px;">
                <strong>${item.product.title}</strong><br>
                Quantity: ${item.quantity} × $${item.product.price.toFixed(2)} = $${(item.product.price * item.quantity).toFixed(2)}
              </li>
            `).join('')}
          </ul>
          
          <p style="margin-top: 30px;">Thank you for shopping with us! We hope you enjoy your purchase.</p>
          <p>If you have any questions or concerns about your order, please don't hesitate to contact us.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; text-align: center;">Thank you for choosing our store!</p>
        </div>
      `;

      await sendEmail({
        to: purchase.customer.email,
        subject: `Order Delivered - ${purchase.orderId}`,
        html: emailHTML,
      });
    } catch (emailError) {
      console.error("Error sending delivery email:", emailError);
      // Don't fail the request if email fails
    }
  }

  // Send email if status changed to cancelled
  if (req.body.status === "cancelled" && purchase) {
    try {
      const emailHTML = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h1 style="color: #dc2626;">Order Cancelled</h1>
          <p>Dear ${purchase.customer.name},</p>
          <p>Your order has been cancelled.</p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <h2 style="color: #991b1b; margin-top: 0;">Order Details:</h2>
            <p><strong>Order ID:</strong> ${purchase.orderId}</p>
            <p><strong>Total Amount:</strong> $${purchase.totalAmount.toFixed(2)}</p>
            <p><strong>Status:</strong> Cancelled</p>
          </div>
          
          <h3 style="color: #333;">Cancelled Items:</h3>
          <ul style="list-style: none; padding: 0;">
            ${purchase.products.map(item => `
              <li style="background: #f9fafb; padding: 10px; margin: 10px 0; border-radius: 5px;">
                <strong>${item.product.title}</strong><br>
                Quantity: ${item.quantity} × $${item.product.price.toFixed(2)} = $${(item.product.price * item.quantity).toFixed(2)}
              </li>
            `).join('')}
          </ul>
          
          <p style="margin-top: 30px;">The items have been returned to stock and are available for purchase again.</p>
          <p>If you have any questions, please contact our support team.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px; text-align: center;">We're sorry to see this order cancelled.</p>
        </div>
      `;

      await sendEmail({
        to: purchase.customer.email,
        subject: `Order Cancelled - ${purchase.orderId}`,
        html: emailHTML,
      });
    } catch (emailError) {
      console.error("Error sending cancellation email:", emailError);
      // Don't fail the request if email fails
    }
  }

  res.status(200).json({
    acknowledgement: true,
    message: "Ok",
    description: "Purchase status updated successfully",
  });
}

module.exports = {
  getAllPurchases,
  updatePurchaseStatus,
};
