/**
 * Title: Write a program using JavaScript on Cart Model
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

/* external imports */
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

/* create cart schema */
const cartSchema = new mongoose.Schema(
  {
    // for product
    product: {
      type: ObjectId,
      ref: "Product",
    },

    // for user
    user: {
      type: ObjectId,
      ref: "User",
    },

    // for quantity
    quantity: {
      type: Number,
      default: 1,
    },

    // Auto-expire cart items after 20 minutes
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 20 * 60 * 1000), // 20 minutes from now
      index: { expires: 0 }, // TTL index - MongoDB will auto-delete when expiresAt is reached
    },

    // for user account time stamps
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Pre-delete hook to restore stock when cart item is removed
cartSchema.pre('findOneAndDelete', async function(next) {
  try {
    const Product = require("./product.model");
    const cart = await this.model.findOne(this.getFilter());
    
    if (cart) {
      // Restore stock when cart item is deleted
      await Product.findByIdAndUpdate(cart.product, {
        $inc: { stock: cart.quantity }
      });
      
      console.log(`✅ Stock restored: ${cart.quantity} units for product ${cart.product}`);
    }
    
    next();
  } catch (error) {
    console.error("❌ Error restoring stock on cart deletion:", error);
    next(error);
  }
});

/* create cart schema */
const Cart = mongoose.model("Cart", cartSchema);

// Background job to clean up expired carts and restore stock
// Runs every 5 minutes to check for expired items
const cleanupExpiredCarts = async () => {
  try {
    const Product = require("./product.model");
    const User = require("./user.model");
    
    // Find all expired cart items
    const expiredCarts = await Cart.find({
      expiresAt: { $lte: new Date() }
    });

    if (expiredCarts.length > 0) {
      console.log(`🧹 Cleaning up ${expiredCarts.length} expired cart items...`);

      for (const cart of expiredCarts) {
        // Restore stock
        await Product.findByIdAndUpdate(cart.product, {
          $inc: { stock: cart.quantity }
        });

        // Remove from user's cart array
        await User.findByIdAndUpdate(cart.user, {
          $pull: { cart: cart._id }
        });

        console.log(`✅ Restored ${cart.quantity} units to product ${cart.product}`);
      }

      // Delete expired carts
      await Cart.deleteMany({
        expiresAt: { $lte: new Date() }
      });

      console.log(`✅ Cleanup complete: ${expiredCarts.length} items processed`);
    }
  } catch (error) {
    console.error("❌ Error during cart cleanup:", error);
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredCarts, 5 * 60 * 1000);

// Also run on startup
setTimeout(cleanupExpiredCarts, 5000); // Wait 5 seconds after server starts

/* export cart schema */
module.exports = Cart;
