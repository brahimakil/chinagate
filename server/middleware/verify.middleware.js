/**
 * Title: Write a program using JavaScript on Verify Middleware
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
 * Date: 12, November 2023
 */

/* external imports */
const jwt = require("jsonwebtoken");
const { promisify } = require("util");

async function verify(req, res, next) {
  try {
    // catch the token from user header (tolerate extra spaces / lowercase scheme)
    const header = req.headers?.authorization || "";
    const token = header.replace(/^Bearer\s+/i, "").trim();

    // no token explicitly give error
    if (!token || token === "null" || token === "undefined") {
      return res.status(401).json({
        acknowledgement: false,
        code: "NO_TOKEN",
        message: "Unauthorized",
        description: "No token found to persist an existing user for long time",
      });
    }

    // fetching token set the user on request
    const decoded = await promisify(jwt.verify)(
      token,
      process.env.TOKEN_SECRET
    );
    req.user = decoded;

    next();
  } catch (error) {
    const expired = error?.name === "TokenExpiredError";

    res.status(401).json({
      acknowledgement: false,
      code: expired ? "TOKEN_EXPIRED" : "TOKEN_INVALID",
      message: "Unauthorized",
      description: expired
        ? "Your session has expired. Please sign in again."
        : "Sign in your account to continue",
    });
  }
}

/* export token verification */
module.exports = verify;
