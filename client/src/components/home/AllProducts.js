/**
 * Title: All Products Component
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Container from "../shared/Container";
import Card from "../shared/Card";
import { useGetProductsQuery } from "@/services/product/productApi";
import ProductCard from "../shared/skeletonLoading/ProductCard";
import { toast } from "react-hot-toast";

const AllProducts = () => {
  const [showAll, setShowAll] = useState(false);
  const {
    data: productsData,
    error: productsError,
    isLoading: productsLoading,
  } = useGetProductsQuery();
  
  const products = useMemo(() => productsData?.data || [], [productsData]);
  
  // Filter all products (exclude hidden ones)
  const allProducts = useMemo(() => {
    return products.filter(product => !product.isHidden);
  }, [products]);

  // Show limited products initially, then all when "Show More" is clicked
  const displayedProducts = useMemo(() => {
    return showAll ? allProducts : allProducts.slice(0, 12);
  }, [allProducts, showAll]);

  useEffect(() => {
    if (productsError) {
      toast.error(productsError?.data?.description, {
        id: "all-products",
      });
    }
  }, [productsError]);

  // Don't render if no products
  if (!productsLoading && allProducts.length === 0) return null;

  return (
    <div id="all-products-section">
      <Container>
        <section className="flex flex-col gap-y-10">
          <div className="text-center">
            <h1 className="text-4xl mb-4">
              All Products. <span className="">Complete Collection</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Browse our entire collection of {allProducts.length} products
            </p>
          </div>

          <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 md:gap-x-6 gap-y-8">
            {productsLoading ? (
              <>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((_, index) => (
                  <ProductCard key={index} />
                ))}
              </>
            ) : (
              <>
                {displayedProducts?.map((product) => (
                  <Card key={product?._id} product={product} />
                ))}
              </>
            )}
          </div>

          {/* Show More / Show Less Button */}
          {!productsLoading && allProducts.length > 12 && (
            <div className="text-center">
              <button
                onClick={() => setShowAll(!showAll)}
                className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors duration-300 font-medium"
              >
                {showAll 
                  ? `Show Less (${allProducts.length - 12} products hidden)` 
                  : `Show All Products (${allProducts.length - 12} more)`
                }
              </button>
            </div>
          )}

          {!productsLoading && allProducts?.length === 0 && (
            <p className="text-sm text-center">No products found!</p>
          )}
        </section>
      </Container>
    </div>
  );
};

export default AllProducts;
