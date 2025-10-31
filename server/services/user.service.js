/**

 */

/* internal imports */
const Brand = require("../models/brand.model");
const Cart = require("../models/cart.model");
const Category = require("../models/category.model");
const Favorite = require("../models/favorite.model");
const Product = require("../models/product.model");
const Purchase = require("../models/purchase.model");
const Review = require("../models/review.model");
const Store = require("../models/store.model");
const User = require("../models/user.model");
const remove = require("../utils/remove.util");
const token = require("../utils/token.util");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../utils/email.util");

/* sign up an user */
exports.signUp = async (req, res) => {
  const { body, file } = req;

  // Create a new user instance
  const user = new User({
    name: body.name,
    email: body.email,
    password: body.password,
    phone: body.phone,
  });

  if (file) {
    user.avatar = {
      url: file.path,
      public_id: file.filename,
    };
  }

  await user.save();

  // Generate access token for auto-login
  const accessToken = token({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  });

  res.status(201).json({
    acknowledgement: true,
    message: "Created",
    description: "User created successfully",
    accessToken, // Return token for auto-login
  });

  return user;
};

/* sign in an user */
exports.signIn = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "User not found",
    });
  } else {
    const isPasswordValid = user.comparePassword(
      req.body.password,
      user.password
    );

    if (!isPasswordValid) {
      res.status(401).json({
        acknowledgement: false,
        message: "Unauthorized",
        description: "Invalid password",
      });
    } else {
      if (user.status === "inactive") {
        res.status(401).json({
          acknowledgement: false,
          message: "Unauthorized",
          description: "Your seller account in a review state",
        });
      } else {
        const accessToken = token({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        });

        res.status(200).json({
          acknowledgement: true,
          message: "OK",
          description: "Login successful",
          accessToken,
        });
      }
    }
  }
};

/* request password reset */
exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "No user found with this email address",
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  
  // Set token and expiration (1 hour)
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
  await user.save({ validateBeforeSave: false });

  try {
    // Send email
    await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({
      acknowledgement: true,
      message: "OK",
      description: "Password reset link sent to your email",
    });
  } catch (error) {
    // Clear reset fields if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500).json({
      acknowledgement: false,
      message: "Error",
      description: "Failed to send email. Please try again.",
    });
  }
};

/* reset password with token */
exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  // Find user with valid token that hasn't expired
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      acknowledgement: false,
      message: "Invalid Token",
      description: "Password reset token is invalid or has expired",
    });
  }

  // Update password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  
  await user.save();

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "Password reset successful",
  });
};

/* login persistance */
exports.persistLogin = async (req, res) => {
  const user = await User.findById(req.user._id).populate([
    {
      path: "cart",
      populate: [
        { path: "product", populate: ["brand", "category", "store"] },
        "user",
      ],
    },
    {
      path: "reviews",
      populate: ["product", "reviewer"],
    },
    {
      path: "favorites",
      populate: [
        {
          path: "product",
          populate: ["brand", "category", "store"],
        },
        "user",
      ],
    },
    {
      path: "purchases",
      populate: ["customer", "products.product"],
    },
    "store",
    "brand",
    "category",
    "products",
  ]);

  if (!user) {
    res.status(404).json({
      acknowledgement: false,
      message: "Not Found",
      description: "User not found",
    });
  } else {
    res.status(200).json({
      acknowledgement: true,
      message: "OK",
      description: "Login successful",
      data: user,
    });
  }
};

/* get all users */
exports.getUsers = async (req, res) => {
  const users = await User.find().populate("store").populate(["brand", "category", "store"]);

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "Users retrieved successfully",
    data: users,
  });
};

/* get single user */
exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id).populate("store");

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: `${user.name}'s information retrieved successfully`,
    data: user,
  });
};

/* update user information */
exports.updateUser = async (req, res) => {
  const existingUser = await User.findById(req.user._id);
  const user = req.body;

  console.log("📝 Self-update request body:", {
    userId: req.user._id,
    hasPassword: !!req.body.password,
    passwordValue: req.body.password,
    passwordLength: req.body.password?.length,
    allKeys: Object.keys(req.body)
  });

  if (!req.body.avatar && req.file) {
    await remove(existingUser.avatar?.public_id);

    user.avatar = {
      url: req.file.path,
      public_id: req.file.filename,
    };
  }

  // 🔒 If password is being updated, hash it first
  if (user.password && user.password.trim() !== "") {
    console.log("🔐 Hashing new password for self-update");
    const hashedPassword = existingUser.encryptedPassword(user.password);
    console.log("🔐 Original password length:", user.password.length);
    console.log("🔐 Hashed password length:", hashedPassword.length);
    console.log("🔐 First 20 chars of hash:", hashedPassword.substring(0, 20));
    user.password = hashedPassword;
  } else {
    console.log("⏭️ No password to update, removing from payload");
    delete user.password;
  }

  console.log("💾 About to update user with keys:", Object.keys(user));

  const updatedUser = await User.findByIdAndUpdate(
    existingUser._id,
    { $set: user },
    {
      runValidators: true,
    }
  );

  console.log("✅ User updated successfully");

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: `${updatedUser.name}'s information updated successfully`,
  });
};

/* update user information */
exports.updateUserInfo = async (req, res) => {
  try {
    const existingUser = await User.findById(req.params.id);
    const user = req.body;

    console.log("📝 Update user request body:", {
      hasPassword: !!req.body.password,
      passwordValue: req.body.password,
      passwordLength: req.body.password?.length,
      allKeys: Object.keys(req.body)
    });

    if (!req.body.avatar && req.file) {
      await remove(existingUser.avatar?.public_id);

      user.avatar = {
        url: req.file.path,
        public_id: req.file.filename,
      };
    }

    // 🔒 If password is being updated, hash it first
    if (user.password && user.password.trim() !== "") {
      console.log("🔐 Hashing new password for admin user update");
      const hashedPassword = existingUser.encryptedPassword(user.password);
      console.log("🔐 Original password length:", user.password.length);
      console.log("🔐 Hashed password length:", hashedPassword.length);
      user.password = hashedPassword;
    } else {
      console.log("⏭️ No password to update, removing from payload");
      delete user.password;
    }

    console.log("💾 Updating user with data:", { ...user, password: user.password ? '[HASHED]' : undefined });

    const updatedUser = await User.findByIdAndUpdate(
      existingUser._id,
      { $set: user },
      {
        runValidators: true,
        new: true, // Return the updated document
      }
    );

    console.log("✅ User updated in DB. Password hash starts with:", updatedUser.password?.substring(0, 20));

    res.status(200).json({
      acknowledgement: true,
      message: "OK",
      description: `${updatedUser.name}'s information updated successfully`,
    });
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({
      acknowledgement: false,
      message: "Error",
      description: error.message || "Failed to update user",
    });
  }
};

/* delete user information */
exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);

  // remove user avatar
  await remove(user.avatar?.public_id);

  // remove user cart
  if (user.cart.length > 0) {
    user.cart.forEach(async (cart) => {
      await Cart.findByIdAndDelete(cart._id);
    });
  }

  // remove user favorites
  if (user.favorites.length > 0) {
    user.favorites.forEach(async (favorite) => {
      await Favorite.findByIdAndDelete(favorite._id);
    });
  }

  // remove user reviews
  if (user.reviews.length > 0) {
    user.reviews.forEach(async (review) => {
      await Review.findByIdAndDelete(review._id);
    });
  }

  // remove user purchases
  if (user.purchases.length > 0) {
    user.purchases.forEach(async (purchase) => {
      await Purchase.findByIdAndDelete(purchase._id);
    });
  }

  // remove store
  if (user.store) {
    const store = await Store.findByIdAndDelete(user.store);

    // remove store thumbnail
    await remove(store?.thumbnail?.public_id);

    // remove store products
    store.products.forEach(async (prod) => {
      const product = await Product.findByIdAndDelete(prod);

      // remove product thumbnail
      await remove(product?.thumbnail?.public_id);

      // remove product gallery
      product.gallery.forEach(async (gallery) => {
        await remove(gallery?.public_id);
      });

      // remove product reviews
      product.reviews.forEach(async (review) => {
        await Review.findByIdAndDelete(review._id);
      });
    });
  }

  // remove category
  if (user.category) {
    const category = await Category.findByIdAndDelete(user.category);

    // remove category thumbnail
    await remove(category?.thumbnail?.public_id);

    // remove category products
    category.products.forEach(async (prod) => {
      const product = await Product.findByIdAndDelete(prod);

      // remove product thumbnail
      await remove(product?.thumbnail?.public_id);

      // remove product gallery
      product.gallery.forEach(async (gallery) => {
        await remove(gallery?.public_id);
      });

      // remove product reviews
      product.reviews.forEach(async (review) => {
        await Review.findByIdAndDelete(review._id);
      });
    });
  }

  // remove brand
  if (user.brand) {
    const brand = await Brand.findByIdAndDelete(user.brand);

    // remove brand logo
    await remove(brand?.logo?.public_id);

    // remove brand products
    brand.products.forEach(async (prod) => {
      const product = await Product.findByIdAndDelete(prod);

      // remove product thumbnail
      await remove(product?.thumbnail?.public_id);

      // remove product gallery
      product.gallery.forEach(async (gallery) => {
        await remove(gallery?.public_id);
      });

      // remove product reviews
      product.reviews.forEach(async (review) => {
        await Review.findByIdAndDelete(review._id);
      });
    });
  }

  // remove user from product's buyers array
  if (user.products.length > 0) {
    await Product.updateMany(
      {},
      {
        $pull: {
          buyers: user._id,
        },
      }
    );
  }

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: `${user.name}'s information deleted successfully`,
  });
};

/* add user by admin */
exports.addUser = async (req, res) => {
  try {
    const { body, file } = req;

    console.log("📝 Adding user:", { 
      name: body.name, 
      email: body.email, 
      role: body.role, 
      phone: body.phone,
      phoneType: typeof body.phone,
      phoneLength: body.phone ? body.phone.length : 0,
      phoneTrimmed: body.phone ? body.phone.trim() : null
    });

    // Check if email already exists
    const existingEmail = await User.findOne({ email: body.email });
    if (existingEmail) {
      return res.status(409).json({
        acknowledgement: false,
        message: "Conflict",
        description: "A user with this email already exists",
      });
    }

    // Check if phone already exists (for non-admin users)
    // Only check if phone is provided and not empty, and role is not admin
    console.log("📞 Phone check:", {
      hasPhone: !!body.phone,
      phoneValue: body.phone,
      isAdmin: body.role === "admin",
      willCheckPhone: body.phone && body.phone.trim() !== "" && body.role !== "admin"
    });
    
    if (body.phone && body.phone.trim() !== "" && body.role !== "admin") {
      console.log("🔍 Checking for duplicate phone:", body.phone);
      const existingPhone = await User.findOne({ phone: body.phone });
      if (existingPhone) {
        console.log("❌ Found duplicate phone for user:", existingPhone._id);
        return res.status(409).json({
          acknowledgement: false,
          message: "Conflict",
          description: "A user with this phone number already exists",
        });
      }
      console.log("✅ Phone is unique");
    } else {
      console.log("⏭️ Skipping phone check");
    }

    // Create a new user instance
    const user = new User({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role || "buyer",
      status: "active",
    });

    // Only add phone for non-admin users (and only if phone is provided and not empty)
    if (body.phone && body.phone.trim() !== "" && body.role !== "admin") {
      user.phone = body.phone;
    }

    if (file) {
      user.avatar = {
        url: file.path,
        public_id: file.filename,
      };
    }

    await user.save();

    console.log("✅ User created successfully:", user._id);

    res.status(201).json({
      acknowledgement: true,
      message: "Created",
      description: "User created successfully by admin",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });

    return user;
  } catch (error) {
    console.error("❌ Error creating user:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        acknowledgement: false,
        message: "Validation Error",
        description: errors.join(", "),
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        acknowledgement: false,
        message: "Conflict",
        description: `A user with this ${field} already exists`,
      });
    }

    // Generic error
    return res.status(500).json({
      acknowledgement: false,
      message: "Internal Server Error",
      description: error.message || "Failed to create user",
    });
  }
};

// seller request & approve
exports.getSellers = async (res) => {
  const users = await User.find({ role: "seller", status: "inactive" }).populate(["brand", "category", "store"]);

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "Sellers retrieved successfully",
    data: users,
  });
};

exports.reviewSeller = async (req, res) => {
  await User.findByIdAndUpdate(req.query.id, {
    $set: req.body,
  });

  res.status(200).json({
    acknowledgement: true,
    message: "OK",
    description: "Seller reviewed successfully",
  });
};

/* get dashboard statistics */
exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts for all entities
    const [
      totalUsers,
      totalBrands,
      totalCategories,
      totalStores,
      totalProducts,
      totalOrders,
      totalReviews,
      activeUsers,
      inactiveUsers,
      adminUsers,
      buyerUsers,
      recentUsers,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      User.countDocuments(),
      Brand.countDocuments(),
      Category.countDocuments(),
      Store.countDocuments(),
      Product.countDocuments(),
      Purchase.countDocuments(),
      Review.countDocuments(),
      User.countDocuments({ status: "active" }),
      User.countDocuments({ status: "inactive" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "buyer" }),
      User.find().sort({ createdAt: -1 }).limit(5).select("name email role createdAt"),
      Purchase.find().sort({ createdAt: -1 }).limit(5).populate("customer", "name email"),
      Product.find().sort({ buyers: -1 }).limit(5).populate("brand category store", "title name"),
    ]);

    // Calculate revenue (if you have price fields)
    const totalRevenue = await Purchase.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$total" }
        }
      }
    ]);

    // Monthly user registrations for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyUsers = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Monthly orders for the last 6 months
    const monthlyOrders = await Purchase.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 },
          revenue: { $sum: "$total" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    res.status(200).json({
      acknowledgement: true,
      message: "OK",
      description: "Dashboard statistics retrieved successfully",
      data: {
        overview: {
          totalUsers,
          totalBrands,
          totalCategories,
          totalStores,
          totalProducts,
          totalOrders,
          totalReviews,
          totalRevenue: totalRevenue[0]?.total || 0,
        },
        userStats: {
          active: activeUsers,
          inactive: inactiveUsers,
          admins: adminUsers,
          buyers: buyerUsers,
        },
        charts: {
          monthlyUsers,
          monthlyOrders,
        },
        recent: {
          users: recentUsers,
          orders: recentOrders,
          topProducts,
        }
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

/* export data as JSON */
exports.exportData = async (req, res) => {
  try {
    const { type } = req.params; // brands, categories, products, stores, users, orders
    let data = [];
    let filename = "";

    switch (type) {
      case "brands":
        data = await Brand.find().populate("products", "title");
        filename = "brands_export.json";
        break;
      case "categories":
        data = await Category.find().populate("products", "title");
        filename = "categories_export.json";
        break;
      case "products":
        data = await Product.find().populate("brand category store", "title name");
        filename = "products_export.json";
        break;
      case "stores":
        data = await Store.find().populate("products", "title");
        filename = "stores_export.json";
        break;
      case "users":
        data = await User.find().select("-password -resetPasswordToken");
        filename = "users_export.json";
        break;
      case "orders":
        data = await Purchase.find().populate("customer", "name email");
        filename = "orders_export.json";
        break;
      case "reviews":
        data = await Review.find().populate("product reviewer", "title name");
        filename = "reviews_export.json";
        break;
      default:
        return res.status(400).json({
          acknowledgement: false,
          message: "Bad Request",
          description: "Invalid export type",
        });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).json({
      acknowledgement: true,
      message: "OK",
      description: `${type} data exported successfully`,
      timestamp: new Date().toISOString(),
      count: data.length,
      data: data,
    });
  } catch (error) {
    res.status(500).json({
      acknowledgement: false,
      message: "Internal Server Error",
      description: error.message,
    });
  }
};
