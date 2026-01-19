const mongoose = require("mongoose");

const systemSchema = new mongoose.Schema(
  {
    whatsappNumber: {
      type: String,
      default: "",
    },
    deliveryTax: {
      type: Number,
      default: 0,
      min: 0,
    },
    // 🆕 Banner configurations for different pages
    homePageBanner: {
      image: {
        url: { type: String, default: "" },
        public_id: { type: String, default: "" },
      },
      overlayColor: { type: String, default: "rgba(0, 0, 0, 0.5)" },
      textColor: { type: String, default: "#FFFFFF" },
      badge: { type: String, default: "WELCOME TO OUR STORE" },
      title: { type: String, default: "🏪 Welcome to China Deals LB" },
      subtitle: { type: String, default: "Your One-Stop Shop for Quality Products" },
      description: { type: String, default: "Discover amazing products curated just for you. Shop with confidence!" },
    },
    categoriesPageBanner: {
      image: {
        url: { type: String, default: "" },
        public_id: { type: String, default: "" },
      },
      overlayColor: { type: String, default: "rgba(0, 0, 0, 0.5)" },
      textColor: { type: String, default: "#FFFFFF" },
      badge: { type: String, default: "SHOP BY CATEGORY" },
      title: { type: String, default: "📂 Browse Categories" },
      subtitle: { type: String, default: "Explore Our Product Categories" },
      description: { type: String, default: "Find exactly what you're looking for by browsing our organized categories" },
    },
    brandsPageBanner: {
      image: {
        url: { type: String, default: "" },
        public_id: { type: String, default: "" },
      },
      overlayColor: { type: String, default: "rgba(0, 0, 0, 0.5)" },
      textColor: { type: String, default: "#FFFFFF" },
      badge: { type: String, default: "SHOP BY BRAND" },
      title: { type: String, default: "🏷️ Browse Brands" },
      subtitle: { type: String, default: "Shop Your Favorite Brands" },
      description: { type: String, default: "Discover products from the world's leading brands" },
    },
    allProductsPageBanner: {
      image: {
        url: { type: String, default: "" },
        public_id: { type: String, default: "" },
      },
      overlayColor: { type: String, default: "rgba(0, 0, 0, 0.5)" },
      textColor: { type: String, default: "#FFFFFF" },
      badge: { type: String, default: "ALL PRODUCTS" },
      title: { type: String, default: "📦 All Products" },
      subtitle: { type: String, default: "Complete Collection" },
      description: { type: String, default: "Browse our entire product catalog" },
    },
  },
  { timestamps: true }
);

const System = mongoose.model("System", systemSchema);
module.exports = System;