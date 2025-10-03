/**
 * Title: Products You May Like Component
 * Author: China Gate Team
 * Date: 27, September 2025
 */

"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGetProductsQuery } from "@/services/product/productApi";
import { AiFillStar } from "react-icons/ai";
import { BsHeart } from "react-icons/bs";

const ProductsYouMayLike = ({ currentProduct }) => {
  const { data: allProductsData, isLoading } = useGetProductsQuery();
  
  // Filter related products based on category and brand
  const relatedProducts = useMemo(() => {
    if (!allProductsData?.data || !currentProduct) return [];
    
    const allProducts = allProductsData.data;
    
    // Filter products with same category or brand (but not the current product)
    const related = allProducts.filter(product => {
      if (product._id === currentProduct._id) return false; // Exclude current product
      
      const sameCategory = product.category?._id === currentProduct.category?._id;
      const sameBrand = product.brand?._id === currentProduct.brand?._id;
      
      return sameCategory || sameBrand;
    });
    
    // Prioritize products with both same category AND brand
    const perfectMatches = related.filter(product => 
      product.category?._id === currentProduct.category?._id && 
      product.brand?._id === currentProduct.brand?._id
    );
    
    const categoryMatches = related.filter(product => 
      product.category?._id === currentProduct.category?._id &&
      product.brand?._id !== currentProduct.brand?._id
    );
    
    const brandMatches = related.filter(product => 
      product.brand?._id === currentProduct.brand?._id &&
      product.category?._id !== currentProduct.category?._id
    );
    
    // Combine and limit to 8 products
    const combined = [...perfectMatches, ...categoryMatches, ...brandMatches];
    return combined.slice(0, 8);
  }, [allProductsData, currentProduct]);

  if (isLoading || relatedProducts.length === 0) return null;

  return (
    <div className="mt-16 border-t border-gray-200 pt-16">
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Products You May Like</h2>
        <p className="text-gray-600">
          Based on {currentProduct.category?.title && currentProduct.brand?.title 
            ? `${currentProduct.category.title} category and ${currentProduct.brand.title} brand`
            : currentProduct.category?.title 
              ? `${currentProduct.category.title} category`
              : currentProduct.brand?.title 
                ? `${currentProduct.brand.title} brand`
                : 'similar products'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {relatedProducts.map((product) => (
          <Link 
            key={product._id} 
            href={`/product?product_id=${product._id}&product_title=${product.title.toLowerCase().replace(/\s+/g, '-')}`}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
          >
            {/* Product Image */}
            <div className="relative aspect-square bg-gray-50 overflow-hidden">
              <Image
                src={product.thumbnail?.url || "/placeholder-product.jpg"}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Product Status Badges */}
              <div className="absolute top-3 left-3 flex flex-col space-y-1">
                {product.productStatus && Array.isArray(product.productStatus) && product.productStatus.slice(0, 2).map((status) => {
                  const statusConfig = {
                    featured: { label: "Featured", color: "bg-blue-500" },
                    trending: { label: "Trending", color: "bg-green-500" },
                    "best-seller": { label: "Best Seller", color: "bg-red-500" },
                  };
                  const config = statusConfig[status];
                  if (!config) return null;
                  
                  return (
                    <span key={status} className={`${config.color} text-white px-2 py-1 rounded-full text-xs font-medium shadow-sm`}>
                      {config.label}
                    </span>
                  );
                })}
              </div>

              {/* Heart Icon */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                  <BsHeart className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Stock Status */}
              <div className="absolute bottom-3 left-3">
                {product.stock > 5 ? (
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                    In Stock
                  </span>
                ) : product.stock > 0 ? (
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                    Low Stock
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-6">
              {/* Brand */}
              {product.brand?.title && (
                <p className="text-sm text-gray-500 font-medium mb-1">{product.brand.title}</p>
              )}
              
              {/* Title */}
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {product.title}
              </h3>
              
              {/* Category */}
              {product.category?.title && (
                <p className="text-sm text-gray-500 mb-3">{product.category.title}</p>
              )}

              {/* Rating */}
              <div className="flex items-center mb-3">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, index) => (
                    <AiFillStar key={index} className="w-4 h-4 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-2">(4.8)</span>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ${product.price}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-lg text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>
                
                {/* Quick Add Button */}
                <button 
                  className="opacity-0 group-hover:opacity-100 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all transform translate-y-2 group-hover:translate-y-0"
                  onClick={(e) => {
                    e.preventDefault();
                    // Add to cart logic here
                  }}
                >
                  Quick Add
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductsYouMayLike;
