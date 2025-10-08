/**
 * Title: Section Model for Dynamic Homepage Management
 * Author: China Gate Team
 * Date: January 2025
 */

const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["built-in", "custom"],
      default: "custom",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    filterKey: {
      type: String,
      default: "",
    },
    icon: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#3B82F6",
    },
    seasons: {
      type: [String],
      default: [],
      enum: ["", "spring", "summer", "autumn", "winter", "all-season"],
    },
    
    // 🆕 Section Category (product or advertisement)
    sectionCategory: {
      type: String,
      enum: ["product", "advertisement"],
      default: "product",
    },
    
    // 🆕 Advertisement fields
    adImage: {
      url: {
        type: String,
        default: "",
      },
      public_id: {
        type: String,
        default: "",
      },
    },
    adText: {
      type: String,
      default: "",
    },
    adTextColor: {
      type: String,
      default: "#FFFFFF",
    },
    adOverlayColor: {
      type: String,
      default: "rgba(0, 0, 0, 0.5)",
    },
    adButtonText: {
      type: String,
      default: "Shop Now",
    },
    adButtonLink: {
      type: String,
      default: "/collections/all",
    },
    adButtonLinkType: {
      type: String,
      enum: ["page", "product"],
      default: "page",
    },
    adButtonProductId: {
      type: String,
      default: "",
    },
    // 🆕 Button styling
    adButtonBackgroundColor: {
      type: String,
      default: "#FFFFFF",
    },
    adButtonTextColor: {
      type: String,
      default: "#000000",
    },
    
    // Banner customization (for collection pages)
    bannerImage: {
      url: {
        type: String,
        default: "",
      },
      public_id: {
        type: String,
        default: "",
      },
    },
    bannerOverlayColor: {
      type: String,
      default: "rgba(0, 0, 0, 0.5)",
    },
    bannerTextColor: {
      type: String,
      default: "#FFFFFF",
    },
  },
  { timestamps: true }
);

const Section = mongoose.model("Section", sectionSchema);
module.exports = Section;
