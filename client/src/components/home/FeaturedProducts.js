/**
 * Title: Featured Products Component
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import Container from "../shared/Container";
import Card from "../shared/Card";
import { useGetProductsQuery } from "@/services/product/productApi";
import ProductCard from "../shared/skeletonLoading/ProductCard";
import { toast } from "react-hot-toast";

const FeaturedProducts = () => {
  const {
    data: productsData,
    error: productsError,
    isLoading: productsLoading,
  } = useGetProductsQuery();
  
  const products = useMemo(() => productsData?.data || [], [productsData]);
  
  // Filter featured products - Show only 4 on home page
  const featuredProducts = useMemo(() => {
    return products.filter(product => {
      // Skip hidden products
      if (product.isHidden) return false;
      
      // Handle both old string format and new array format
      if (Array.isArray(product.productStatus)) {
        return product.productStatus.includes("featured");
      } else {
        return product.productStatus === "featured";
      }
    }).slice(0, 4); // Show only 4 products on home page
  }, [products]);
  
  useEffect(() => {
    if (productsError) {
      toast.error(productsError?.data?.description, {
        id: "featured-products",
      });
    }
  }, [productsError]);

  // Don't render if no featured products
  if (!productsLoading && featuredProducts.length === 0) return null;

  return (
    <div data-section="featured">
      <Container>
        <section className="flex flex-col gap-y-10">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl">
              ⭐ Featured Products. <span className="text-slate-600">Handpicked Selection</span>
            </h1>
            {/* See More Button */}
            {!productsLoading && featuredProducts.length > 0 && (
              <Link
                href="/collections/featured"
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
                {featuredProducts?.map((product) => (
                  <Card key={product?._id} product={product} />
                ))}
              </>
            )}
          </div>

          {!productsLoading && featuredProducts?.length === 0 && (
            <p className="text-sm">No featured products found!</p>
          )}
        </section>
      </Container>
    </div>
  );
};

export default FeaturedProducts;
