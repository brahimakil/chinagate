/**
 * Title: Seed Built-in Sections
 * Author: China Gate Team
 * Date: January 2025
 * Description: Initialize default homepage sections
 */

const mongoose = require("mongoose");
require("dotenv").config();
const Section = require("../models/section.model");

const builtInSections = [
  {
    name: "seasonal",
    displayName: "Seasonal Products",
    description: "Products based on selected seasons",
    type: "built-in",
    filterKey: "seasonal",
    icon: "🌟",
    color: "#F59E0B",
    order: 0,
    isActive: true,
  },
  {
    name: "featured",
    displayName: "Featured Products",
    description: "Highlighted featured products",
    type: "built-in",
    filterKey: "featured",
    icon: "⭐",
    color: "#3B82F6",
    order: 1,
    isActive: true,
  },
  {
    name: "trending",
    displayName: "Trending Products",
    description: "Popular and trending items",
    type: "built-in",
    filterKey: "trending",
    icon: "🔥",
    color: "#EF4444",
    order: 2,
    isActive: true,
  },
  {
    name: "best-sellers",
    displayName: "Best Sellers",
    description: "Top performing products",
    type: "built-in",
    filterKey: "best-seller",
    icon: "🏆",
    color: "#10B981",
    order: 3,
    isActive: true,
  },
];

async function seedSections() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");

    // Check if sections already exist
    const existingSections = await Section.find({ type: "built-in" });
    
    if (existingSections.length > 0) {
      console.log("⚠️  Built-in sections already exist. Updating...");
      
      // Update existing sections
      for (const section of builtInSections) {
        await Section.findOneAndUpdate(
          { name: section.name },
          section,
          { upsert: true, new: true }
        );
        console.log(`✅ Updated/Created: ${section.displayName}`);
      }
    } else {
      // Insert new sections
      await Section.insertMany(builtInSections);
      console.log("✅ Built-in sections seeded successfully!");
    }

    console.log("\n📊 Current Sections:");
    const allSections = await Section.find().sort({ order: 1 });
    allSections.forEach((section, index) => {
      console.log(
        `${index + 1}. ${section.icon} ${section.displayName} - ${
          section.isActive ? "Active" : "Hidden"
        } (${section.type})`
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding sections:", error);
    process.exit(1);
  }
}

seedSections();
