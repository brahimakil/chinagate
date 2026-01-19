/**
 * Title: Write a program using JavaScript on App
 * Author: Hasibul Islam
 * Portfolio: https://devhasibulislam.vercel.app
 * Linkedin: https://linkedin.com/in/devhasibulislam
 * GitHub: https://github.com/devhasibulislam
 * Facebook: https://facebook.com/devhasibulislam
 * Instagram: https://instagram.com/devhasibulislam
 * Twitter: https://twitter.com/devhasibulislam
 * Pinterest: https://pinterest.com/devhasibulislam
 * WhatsApp: https://wa.me/8801906315901
 * Telegram: devhasibulislam
 * Date: 09, November 2023
 */

/* external imports */
const express = require("express");
const cors = require("cors");
require("dotenv").config();

/* internal import */
const error = require("./middleware/error.middleware");
const { cleanExpiredCarts } = require("./utils/cleanExpiredCarts.util");

/* application level connection */
const app = express();

/* Schedule expired cart cleanup - runs every 10 minutes */
setInterval(async () => {
  console.log("[CRON] Running expired cart cleanup...");
  const result = await cleanExpiredCarts();
  if (result.success) {
    console.log(`[CRON] Cleaned ${result.cleaned} expired cart(s)`);
  } else {
    console.error(`[CRON] Cleanup failed: ${result.error}`);
  }
}, 10 * 60 * 1000); // 10 minutes

// Run cleanup on server start
console.log("[INIT] Running initial cart cleanup...");
cleanExpiredCarts().then((result) => {
  if (result.success) {
    console.log(`[INIT] Cleaned ${result.cleaned} expired cart(s) on startup`);
  }
});

/* CORS configuration - allow multiple origins */
const allowedOrigins = [
  process.env.ORIGIN_URL, // Production frontend
  'https://chinadealslb.com',
  'https://www.chinadealslb.com',
  'http://localhost:3000', // Local development
  'http://localhost:3001', // Alternative local port
];

/* middleware connections */
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: "GET, PATCH, POST, DELETE",
    credentials: true, // Allow cookies/auth headers
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json());

/* router level connections */
app.use("/api/brand", require("./routes/brand.route"));
app.use("/api/category", require("./routes/category.route"));
app.use("/api/product", require("./routes/product.route"));
app.use("/api/store", require("./routes/store.route"));
app.use("/api/user", require("./routes/user.route"));
app.use("/api/cart", require("./routes/cart.route"));
app.use("/api/favorite", require("./routes/favorite.route"));
app.use("/api/review", require("./routes/review.route"));
app.use("/api/payment", require("./routes/payment.route"));
app.use("/api/purchase", require("./routes/purchase.route"));
// ADD: system settings route
app.use("/api/system", require("./routes/system.route"));
app.use("/api/section", require("./routes/section.route")); // ADD THIS LINE
app.use("/api/order", require("./routes/order.route")); // ✅ FIXED - now matches /api/order/create-order

/* global error handler */
app.use(error);

/* connection establishment */
app.get("/", (req, res, next) => {
  try {
    res.status(200).json({
      acknowledgement: true,
      message: "OK",
      description: "The request is OK",
    });
  } catch (err) {
    next(err);
  } finally {
    console.log(`Route: ${req.url} || Method: ${req.method}`);
  }
});

/* export application */
module.exports = app;