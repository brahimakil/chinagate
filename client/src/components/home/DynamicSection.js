"use client";

import React, { useMemo } from "react";
import { useGetProductsQuery } from "@/services/product/productApi";
import Card from "../shared/Card";
import Link from "next/link";

const DynamicSection = ({ section }) => {
  const { data: productsData } = useGetProductsQuery();
  const products = productsData?.data || [];

  // 🔍 DEBUG: Log section info
  console.log(`\n=== DYNAMIC SECTION: ${section.name} ===`);
  console.log("Section data:", section);
  console.log("Filter key:", section.filterKey);
  console.log("Is active:", section.isActive);
  console.log("Seasons (if seasonal):", section.seasons);
  console.log("Total products available:", products.length);

  // Filter products based on section filterKey
  const filteredProducts = useMemo(() => {
    if (!section || !products.length) {
      console.log("❌ No section or no products");
      return [];
    }

    // 🆕 Special handling for seasonal section - use seasons from section database
    if (section.filterKey === "seasonal" && section.seasons && section.seasons.length > 0) {
      console.log("🌍 Filtering by seasons:", section.seasons);
      
      const seasonalProducts = products.filter(product => {
        if (product.isHidden) return false;
        
        // Show products that match ANY of the selected seasons
        if (Array.isArray(product.season)) {
          const matches = product.season.some(productSeason => 
            section.seasons.includes(productSeason)
          );
          console.log(`  - Product "${product.title}" seasons:`, product.season, "Matches:", matches);
          return matches;
        } else {
          const matches = section.seasons.includes(product.season) || product.season === "all-season";
          console.log(`  - Product "${product.title}" season:`, product.season, "Matches:", matches);
          return matches;
        }
      });
      
      console.log(`✅ Seasonal products found: ${seasonalProducts.length}`);
      return seasonalProducts;
    }

    // For other sections, filter by productStatus
    console.log(`📦 Filtering by productStatus: ${section.filterKey}`);
    
    const statusProducts = products.filter((product) => {
      if (product.isHidden) return false;
      
      const hasStatus = Array.isArray(product.productStatus) &&
        product.productStatus.includes(section.filterKey);
      
      console.log(`  - Product "${product.title}" statuses:`, product.productStatus, "Has status:", hasStatus);
      return hasStatus;
    });
    
    console.log(`✅ Status products found: ${statusProducts.length}`);
    return statusProducts;
  }, [products, section]);

  // Show only first 4 products
  const displayProducts = filteredProducts.slice(0, 4);

  console.log(`📊 Display products (first 4): ${displayProducts.length}`);
  console.log(`🎯 Should render: ${section.isActive && displayProducts.length > 0}`);

  // Don't render if no products or section is inactive
  if (!section.isActive || displayProducts.length === 0) {
    console.log(`❌ Section "${section.name}" will NOT render`);
    return null;
  }

  console.log(`✅ Section "${section.name}" WILL render with ${displayProducts.length} products`);

  return (
    <section className="w-full" data-section={section.name}>
      <div className="container mx-auto px-4 py-12">
        {/* Section Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{section.icon}</span>
            <div>
              <h2
                className="text-3xl font-bold"
                style={{ color: section.color }}
              >
                {section.displayName}
              </h2>
              {section.description && (
                <p className="text-gray-600 mt-1">{section.description}</p>
              )}
              {/* Show active seasons for seasonal section */}
              {section.filterKey === "seasonal" && section.seasons && section.seasons.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {section.seasons.map(season => (
                    <span key={season} className="text-xs px-2 py-1 bg-gray-100 rounded-full capitalize">
                      {season.replace("-", " ")}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* See More Button - ALWAYS SHOW */}
          <Link
            href={`/collections/${section.filterKey}`}
            className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
            style={{
              backgroundColor: section.color,
              color: "white",
            }}
          >
            View More →
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((product) => (
            <Card key={product._id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DynamicSection;
