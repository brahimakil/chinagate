/**
 * Title: Clean Expired Cart Reservations
 * Description: Automatically release stock from expired cart items
 * This is a backup cleanup - MongoDB TTL index handles most cases
 */

const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");

async function cleanExpiredCarts() {
  try {
    const now = new Date();
    
    // Find all expired carts
    const expiredCarts = await Cart.find({
      expiresAt: { $lt: now }
    });

    if (expiredCarts.length === 0) {
      console.log("No expired carts found");
      return {
        success: true,
        cleaned: 0
      };
    }

    console.log(`Found ${expiredCarts.length} expired carts to clean`);

    // Clean each expired cart
    for (const cart of expiredCarts) {
      // Restore stock
      await Product.findByIdAndUpdate(cart.product, {
        $inc: { stock: cart.quantity }
      });

      // Remove cart from user's cart array
      await User.findByIdAndUpdate(cart.user, {
        $pull: { cart: cart._id }
      });

      // Delete cart (set quantity to 0 first to prevent double stock restoration)
      await Cart.findByIdAndUpdate(cart._id, { quantity: 0 });
      await Cart.findByIdAndDelete(cart._id);
      
      console.log(`Cleaned expired cart: restored ${cart.quantity} units for product ${cart.product}`);
    }

    return {
      success: true,
      cleaned: expiredCarts.length
    };
  } catch (error) {
    console.error("Error cleaning expired carts:", error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = { cleanExpiredCarts };

