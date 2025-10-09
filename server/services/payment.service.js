/**
 * Title: Write a program using JavaScript on Payment Service
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
 * Date: 19, January 2024
 */

const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const Purchase = require("../models/purchase.model");
const User = require("../models/user.model");

/* external import */
require("dotenv").config();

/* stripe setup */
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// create payment
exports.createPayment = async (req, res) => {
  const lineItems = req.body.map((item) => {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: [item.thumbnail],
          description: item.description,
          metadata: {
            id: item.pid,
          },
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    };
  });

  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: "payment",
    success_url: `${process.env.ORIGIN_URL}`,
    cancel_url: `${process.env.ORIGIN_URL}`,
  });

  // Validate stock before confirming payment
  for (const item of req.body) {
    const product = await Product.findById(item.pid);
    if (!product) {
      return res.status(404).json({
        acknowledgement: false,
        message: "Not Found",
        description: `Product ${item.name} not found`,
      });
    }
  }

  // create purchase for user
  const purchase = await Purchase.create({
    customer: req.user._id,
    customerId: session.id,
    orderId: session.id,
    totalAmount: session.amount_total,
    products: req.body.map((item) => ({
      product: item.pid,
      quantity: item.quantity,
    })),
  });

  // add purchase._id to user's purchases array, add pid from req.body array of object to user's products array and empty user's cart array
  await User.findByIdAndUpdate(req.user._id, {
    $push: { purchases: purchase._id },
    $set: { cart: [] },
  });

  // add pid from req.body array of object to user's products array
  for (const item of req.body) {
    await User.findByIdAndUpdate(req.user._id, {
      $push: { products: item.pid },
    });
  }

  // IMPORTANT: Delete carts WITHOUT restoring stock (stock already decreased)
  // We need to delete carts directly from DB to bypass the pre-delete hook
  for (const cart of req.body) {
    await Cart.findByIdAndUpdate(cart.cid, { quantity: 0 }); // Set quantity to 0 first
    await Cart.findByIdAndDelete(cart.cid); // Then delete (hook will restore 0)
  }

  // add user to products buyers array
  for (const item of req.body) {
    await Product.findByIdAndUpdate(item.pid, {
      $push: { buyers: req.user._id },
    });
  }

  res.status(201).json({
    acknowledgement: true,
    message: "Ok",
    description: "Payment created successfully",
    url: session.url,
  });
};
