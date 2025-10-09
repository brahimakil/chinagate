/**
 * Title: Write a program using JavaScript on Cart Service
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

/* internal imports */
const Cart = require("../models/cart.model");
const User = require("../models/user.model");
const Product = require("../models/product.model");

/* add to cart */
exports.addToCart = async (req, res) => {
  const user = await User.findById(req.user._id);
  const { product: productId, quantity } = req.body;

  // Check if product exists and has enough stock
  const product = await Product.findById(productId);
  
  if (!product) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "Product not found",
    });
  }

  if (product.stock < quantity) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Insufficient Stock",
      description: `Only ${product.stock} items available in stock`,
    });
  }

  // Check if product already in cart for this user
  const existingCart = await Cart.findOne({ user: user._id, product: productId });

  if (existingCart) {
    // Update quantity
    const newQuantity = existingCart.quantity + quantity;
    
    if (product.stock < quantity) {
      return res.status(400).json({
        acknowledgement: false,
        message: "Insufficient Stock",
        description: `Cannot add more. Only ${product.stock} additional items available`,
      });
    }

    // Decrease stock by the additional quantity
    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: -quantity }
    });

    await Cart.findByIdAndUpdate(existingCart._id, {
      quantity: newQuantity,
      expiresAt: new Date(Date.now() + 20 * 60 * 1000), // Reset expiration timer to 20 minutes
    });

    return res.status(200).json({
      acknowledgement: true,
      message: "Ok",
      description: "Cart quantity updated successfully",
    });
  }

  // Decrease stock immediately
  await Product.findByIdAndUpdate(productId, {
    $inc: { stock: -quantity }
  });

  // Create new cart item
  const cart = await Cart.create({
    user: user._id,
    product: productId,
    quantity: quantity,
  });

  await User.findByIdAndUpdate(user._id, {
    $push: { cart: cart._id },
  });

  res.status(201).json({
    acknowledgement: true,
    message: "Ok",
    description: "Product added to cart successfully",
  });
};

/* get from cart */
exports.getFromCart = async (res) => {
  const cart = await Cart.find().populate(["user", "product"]);

  res.status(200).json({
    acknowledgement: true,
    message: "Ok",
    description: "Cart fetched successfully",
    data: cart,
  });
};

/* update cart */
exports.updateCart = async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findById(req.params.id);

  if (!cart) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "Cart item not found",
    });
  }

  const product = await Product.findById(cart.product);
  const quantityDiff = quantity - cart.quantity;

  if (quantityDiff > 0) {
    // Increasing quantity - check if enough stock available
    if (product.stock < quantityDiff) {
      return res.status(400).json({
        acknowledgement: false,
        message: "Insufficient Stock",
        description: `Only ${product.stock} additional items available`,
      });
    }
    
    // Decrease stock
    await Product.findByIdAndUpdate(cart.product, {
      $inc: { stock: -quantityDiff }
    });
  } else if (quantityDiff < 0) {
    // Decreasing quantity - restore stock
    await Product.findByIdAndUpdate(cart.product, {
      $inc: { stock: -quantityDiff } // negative diff becomes positive
    });
  }

  await Cart.findByIdAndUpdate(req.params.id, {
    quantity: quantity,
    expiresAt: new Date(Date.now() + 20 * 60 * 1000), // Reset expiration timer to 20 minutes
  });

  res.status(200).json({
    acknowledgement: true,
    message: "Ok",
    description: "Cart updated successfully",
  });
};

/* delete cart */
exports.deleteCart = async (req, res) => {
  const cart = await Cart.findById(req.params.id);
  
  if (!cart) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "Cart item not found",
    });
  }

  // Stock restoration is handled by pre-delete hook in cart.model.js
  await Cart.findByIdAndDelete(req.params.id);

  await User.findByIdAndUpdate(cart.user, {
    $pull: { cart: cart._id },
  });

  res.status(200).json({
    acknowledgement: true,
    message: "Ok",
    description: "Cart deleted successfully and stock restored",
  });
};
