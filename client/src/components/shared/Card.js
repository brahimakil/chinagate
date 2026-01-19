/**
 */

"use client";

import React, { useEffect, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { MdFavorite } from "react-icons/md";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useAddToFavoriteMutation,
  useRemoveFromFavoriteMutation,
} from "@/services/favorite/favoriteApi";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import Spinner from "./Spinner";

const Card = ({ index, product, ...rest }) => {
  const router = useRouter();
  const user = useSelector((state) => state?.auth?.user);

  // check if product._id match with favorites array of object's product._id
  const favorite = user?.favorites?.find(
    (fav) => fav?.product?._id === product?._id
  );

  // Get 3 random colors from the colors array
  const getRandomColors = () => {
    if (product?.colors && Array.isArray(product.colors) && product.colors.length > 0) {
      const shuffled = [...product.colors].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3); // Show max 3 colors
    }
    return [];
  };

  // Get 1 random custom specification
  const getRandomSpecification = () => {
    // FIRST: Check for customAttributes in variations (NEW FORMAT)
    if (product?.variations?.customAttributes && Array.isArray(product.variations.customAttributes)) {
      const customAttrs = product.variations.customAttributes.filter(
        attr => attr.name && attr.value && attr.name.trim() !== '' && attr.value.trim() !== ''
      );
      
      if (customAttrs.length > 0) {
        // Get random specification each time
        const randomIndex = Math.floor(Math.random() * customAttrs.length);
        const attr = customAttrs[randomIndex];
        
        return {
          name: attr.name,
          value: `${attr.value}${attr.unit ? ' ' + attr.unit : ''}`
        };
      }
    }
    
    // SECOND: Fallback to old format - check if variations has other properties
    if (product?.variations && typeof product.variations === 'object') {
      const customSpecs = Object.entries(product.variations).filter(
        ([key, value]) => 
          key !== 'colors' && 
          key !== 'sizes' && 
          key !== 'customAttributes' &&
          value && 
          value !== '' &&
          key.toLowerCase() !== 'color' &&
          key.toLowerCase() !== 'size'
      );
      
      if (customSpecs.length > 0) {
        // Get random spec each time
        const randomIndex = Math.floor(Math.random() * customSpecs.length);
        const [key, value] = customSpecs[randomIndex];
        
        // Handle both string values and object values with value/unit
        if (typeof value === 'object' && value.value) {
          return {
            name: key,
            value: `${value.value}${value.unit ? ' ' + value.unit : ''}`
          };
        }
        return {
          name: key,
          value: value.toString()
        };
      }
    }
    
    return null;
  };

  const colors = getRandomColors();
  const specification = getRandomSpecification();

  // Debug log to see what we're getting
  console.log('Product variations:', product?.variations);
  console.log('Found specification:', specification);
  console.log('Found colors:', colors);

  return (
    <div
      {...rest}
      className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100"
      onClick={() =>
        router.push(
          `/product?product_id=${
            product?._id
          }&product_title=${product?.title
            .replace(/ /g, "-")
            .toLowerCase()}}`
        )
      }
    >
      {/* Product Image */}
      <div className="relative w-full h-36 sm:h-40 md:h-48 mb-3 sm:mb-4 md:mb-6 rounded-lg sm:rounded-xl overflow-hidden bg-gray-50 p-2 sm:p-3 md:p-4">
        <div className="relative w-full h-full">
          <Image
            src={product?.thumbnail?.url}
            alt={product?.title}
            fill
            className="object-contain object-center group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        {/* Favorite Button */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          {favorite ? (
            <RemoveFromFavorite favorite={favorite} />
          ) : (
            <AddToFavorite product={product} />
          )}
        </div>

   
      </div>

      {/* Product Title */}
      <div className="text-center mb-1 sm:mb-2">
        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">
          {product?.title}
        </h3>
      </div>

      {/* Brand & Category */}
      <div className="text-center mb-2 sm:mb-3 md:mb-4 flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
        {product?.brand?.title && (
          <>
            <span className="font-medium">{product.brand.title}</span>
            {product?.category?.title && <span>•</span>}
          </>
        )}
        {product?.category?.title && (
          <span>{product.category.title}</span>
        )}
      </div>

      {/* Specification & Color Section */}
      <div className="mb-3 sm:mb-4 md:mb-6">
        <div className="text-center text-[10px] sm:text-xs md:text-sm font-medium text-gray-500 mb-2 sm:mb-3 tracking-wider">
          SPEC & COLOR
        </div>
        
        {/* Custom Specification */}
        {specification ? (
          <div className="text-center mb-2 sm:mb-3">
            <div className="inline-block bg-gray-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium text-gray-700 max-w-full truncate">
              {specification.name}: {specification.value}
            </div>
          </div>
        ) : (
          <div className="text-center mb-2 sm:mb-3">
            <div className="inline-block bg-gray-100 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium text-gray-500">
              No specifications
            </div>
          </div>
        )}

        {/* Colors (Max 3 Random) */}
        {colors.length > 0 && (
          <div className="flex justify-center space-x-1 sm:space-x-2">
            {colors.map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors cursor-pointer"
                style={{ backgroundColor: `#${color.hex}` }}
                title={color.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="text-center">
        <div className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
          ${product?.price}
        </div>
        
        {/* Rating */}
        {product?.reviews?.length > 0 && (
          <div className="flex items-center justify-center mt-1 sm:mt-2 space-x-1">
            <AiFillStar className="text-yellow-400 w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm text-gray-600">
              ({product.reviews.length})
            </span>
          </div>
        )}

        {/* Stock Status */}
        <div className="mt-2 sm:mt-3">
          {product?.stock > 0 ? (
            <div className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-green-100 text-green-700">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1 sm:mr-2 animate-pulse"></span>
              in stock
            </div>
          ) : (
            <div className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-red-100 text-red-700">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full mr-1 sm:mr-2"></span>
              Out of Stock
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function AddToFavorite({ product }) {
  const user = useSelector((state) => state?.auth?.user);
  const router = useRouter();
  const [addToFavorite, { isLoading, data, error }] = useAddToFavoriteMutation();

  useEffect(() => {
    if (isLoading) {
      toast.loading("Adding to favorite...", { id: "addToFavorite" });
    }
    if (data) {
      toast.success(data?.description, { id: "addToFavorite" });
    }
    if (error) {
      if (error?.status === 401) {
        toast.error(
          (t) => (
            <div className="flex flex-col gap-3 p-2">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900 text-base mb-1">Sign In Required</div>
                  <div className="text-sm text-gray-600">Please sign in to save your favorite items</div>
                </div>
              </div>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  router.push("/auth");
                }}
                className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In to Continue
              </button>
            </div>
          ),
          { 
            id: "addToFavorite",
            duration: 8000,
            style: {
              minWidth: "320px",
              maxWidth: "400px",
              background: "white",
              padding: "8px",
              borderRadius: "16px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
              border: "1px solid rgba(0, 0, 0, 0.05)"
            },
            icon: null,
          }
        );
      } else if (error?.data) {
        toast.error(error?.data?.description, { id: "addToFavorite" });
      }
    }
  }, [isLoading, data, error, router]);

  const handleAddToFavorite = (e) => {
    e.stopPropagation();
    
    if (!user) {
      toast.error(
        (t) => (
          <div className="flex flex-col gap-3 p-2">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-red-600 flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-900 text-base mb-1">Sign In Required</div>
                <div className="text-sm text-gray-600">Please sign in to save your favorite items</div>
              </div>
            </div>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                router.push("/auth");
              }}
              className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign In to Continue
            </button>
          </div>
        ),
        { 
          duration: 8000,
          style: {
            minWidth: "320px",
            maxWidth: "400px",
            background: "white",
            padding: "8px",
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
            border: "1px solid rgba(0, 0, 0, 0.05)"
          },
          icon: null,
        }
      );
      return;
    }
    
    addToFavorite({ product: product?._id });
  };

  return (
    <button
      className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all"
      onClick={handleAddToFavorite}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <MdFavorite className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
      )}
    </button>
  );
}

function RemoveFromFavorite({ favorite }) {
  const [removeFromFavorite, { isLoading, data, error }] = useRemoveFromFavoriteMutation();

  useEffect(() => {
    if (isLoading) {
      toast.loading("Removing from favorite...", { id: "removeFavorite" });
    }
    if (data) {
      toast.success(data?.description, { id: "removeFavorite" });
    }
    if (error?.data) {
      toast.error(error?.data?.description, { id: "removeFavorite" });
    }
  }, [isLoading, data, error]);

  return (
    <button
      className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all"
      onClick={(e) => {
        e.stopPropagation();
        removeFromFavorite({ id: favorite?._id });
      }}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <MdFavorite className="w-5 h-5 text-red-500" />
      )}
    </button>
  );
}

export default Card;
