/**
 * Title: Seasonal Products Component
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import Container from "../shared/Container";
import Card from "../shared/Card";
import { useGetProductsQuery } from "@/services/product/productApi";
import ProductCard from "../shared/skeletonLoading/ProductCard";
import { toast } from "react-hot-toast";
import Link from "next/link";

const SeasonalProducts = () => {
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const {
    data: productsData,
    error: productsError,
    isLoading: productsLoading,
  } = useGetProductsQuery();

  const products = useMemo(() => productsData?.data || [], [productsData]);

  // Load seasonal settings
  useEffect(() => {
    console.log('=== LOADING ADMIN SEASONAL SETTINGS ===');
    const savedSeasons = localStorage.getItem('homePageSeasons');
    console.log('Raw localStorage value:', savedSeasons);
    
    if (savedSeasons) {
      const parsed = JSON.parse(savedSeasons);
      console.log('Parsed admin seasons:', parsed);
      setSelectedSeasons(parsed);
    } else {
      console.log('No admin seasons found, using default: winter');
      setSelectedSeasons(['winter']); // Default to winter
    }
  }, []);

  // Filter seasonal products - SIMPLIFIED AND FIXED
  const seasonalProducts = useMemo(() => {
    console.log('=== SEASONAL PRODUCTS DEBUG ===');
    console.log('Admin selected seasons:', selectedSeasons);
    console.log('Total products:', products.length);
    
    if (selectedSeasons.length === 0) {
      console.log('No seasons selected by admin');
      return [];
    }
    
    const filtered = products.filter(product => {
      // Skip hidden products
      if (product.isHidden) {
        console.log(`Product ${product.title} is hidden, skipping`);
        return false;
      }
      
      console.log(`Checking product: ${product.title}`);
      console.log(`Product seasons:`, product.season);
      
      // Handle both old string format and new array format
      if (Array.isArray(product.season)) {
        // Product has multiple seasons - show if ANY season matches admin selection
        const hasMatch = product.season.some(productSeason => selectedSeasons.includes(productSeason));
        console.log(`Product ${product.title} - Array format - Has match:`, hasMatch);
        return hasMatch;
      } else {
        // Product has single season - show if it matches admin selection
        const hasMatch = selectedSeasons.includes(product.season) || product.season === "all-season";
        console.log(`Product ${product.title} - String format - Has match:`, hasMatch);
        return hasMatch;
      }
    }).slice(0, 4); // Show only 4 products on home page
    
    console.log('Filtered seasonal products:', filtered.length);
    console.log('Filtered products:', filtered.map(p => ({ title: p.title, season: p.season })));
    
    return filtered;
  }, [products, selectedSeasons]);

  useEffect(() => {
    if (productsError) {
      toast.error(productsError?.data?.description, {
        id: "seasonal-products",
      });
    }
  }, [productsError]);

  // Don't render if no seasons selected or no products
  if (selectedSeasons.length === 0) {
    console.log('SeasonalProducts: No seasons selected, not rendering');
    return null;
  }
  
  if (!productsLoading && seasonalProducts.length === 0) {
    console.log('SeasonalProducts: No products found, not rendering');
    return null;
  }

  // Season info for badges
  const getSeasonInfo = (season) => {
    const seasonMap = {
      spring: { icon: "🌸", label: "Spring", color: "bg-green-500" },
      summer: { icon: "☀️", label: "Summer", color: "bg-yellow-500" },
      autumn: { icon: "🍂", label: "Autumn", color: "bg-orange-500" },
      winter: { icon: "❄️", label: "Winter", color: "bg-blue-500" }
    };
    return seasonMap[season] || { icon: "🌍", label: "Seasonal", color: "bg-gray-500" };
  };

  // Get section title
  const getSectionTitle = () => {
    if (selectedSeasons.length === 1) {
      const seasonInfo = getSeasonInfo(selectedSeasons[0]);
      return `${seasonInfo.icon} ${seasonInfo.label} Collection`;
    } else {
      return " Seasonal Collection";
    }
  };

  return (
    <div data-section="seasonal">
      <Container>
        <section className="flex flex-col gap-y-10">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl">
              {getSectionTitle()}. <span className="">Perfect for the Season</span>
            </h1>
            {/* See More Button */}
            {!productsLoading && seasonalProducts.length > 0 && (
              <Link
                href="/collections/seasonal"
                className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-colors font-medium"
              >
                See More →
              </Link>
            )}
          </div>

          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 md:gap-x-6 gap-y-8">
            {productsLoading ? (
              <>
                {[1, 2, 3, 4].map((_, index) => (
                  <ProductCard key={index} />
                ))}
              </>
            ) : (
              <>
                {seasonalProducts?.map((product) => (
                  <div key={product?._id} className="relative">
                    {/* Season Badge */}
                    {product.season && (
                      <div className={`absolute top-2 left-2 z-10 ${getSeasonInfo(product.season).color} text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg`}>
                        {getSeasonInfo(product.season).icon} {getSeasonInfo(product.season).label.toUpperCase()}
                      </div>
                    )}
                    <Card product={product} />
                  </div>
                ))}
              </>
            )}
          </div>

          {!productsLoading && seasonalProducts?.length === 0 && (
            <p className="text-sm">No seasonal products found!</p>
          )}
        </section>
      </Container>
    </div>
  );
};

export default SeasonalProducts;
