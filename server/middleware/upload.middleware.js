/**
 * Title: Write a program using JavaScript on Upload Middleware
 * Author: China Gate Team
 * Date: 26, September 2025
 */

/* external imports */
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const path = require("path");

/* cloudinary config */
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (_, file) => {
    return {
      folder: "canim-template",
      public_id: `${Date.now()}_${file.originalname
        .replace(/[^\w\s.-]/g, "")
        .replace(/\s+/g, "-")
        .toLowerCase()}`,
      // Add quality settings for better image quality
      quality: "auto:best", // Automatically choose best quality
      fetch_format: "auto", // Automatically choose best format
      flags: "progressive", // Progressive loading
      // For product images, we want high quality
      transformation: [
        {
          quality: "90", // High quality (1-100 scale)
          format: "auto", // Auto format selection
        }
      ],
    };
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (_, file, cb) => {
    const supportedImage = /jpg|png|jpeg|webp/i; // Added webp support
    const extension = path.extname(file.originalname);

    if (supportedImage.test(extension)) {
      cb(null, true);
    } else {
      cb(new Error("Must be a png/jpg/jpeg/webp format"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

module.exports = upload;
