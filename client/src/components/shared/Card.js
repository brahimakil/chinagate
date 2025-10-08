/**
 * Title: Write a program using JavaScript on Card
 * Author: Hasibul Islam
 * Portfolio: https://devhasibulislam.vercel.app
 * Linkedin: https://linkedin.com/in/devhasibulislam
 * GitHub: https://github.com/devhasibulislam
 * Facebook: https://facebook.com/devhasibulislam
 * Instagram: https://instagram.com/devhasibulislam
 * Twitter: https://twitter.com/devhasibulislam
 * Pinterest: https://pinterest.com/devhasibulislam
 * WhatsApp: https://wa.me/8801906315901
 * Telegram: devhasibulislam
 * Date: 15, October 2023
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
      className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100"
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
      <div className="relative w-full h-48 mb-6 rounded-xl overflow-hidden bg-gray-50 p-4">
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

      {/* Brand Name */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium text-gray-800 truncate">
          {product?.brand?.title || product?.title}
        </h3>
      </div>

      {/* Specification & Color Section */}
      <div className="mb-6">
        <div className="text-center text-sm font-medium text-gray-500 mb-3 tracking-wider">
          SPEC & COLOR
        </div>
        
        {/* Custom Specification */}
        {specification ? (
          <div className="text-center mb-3">
            <div className="inline-block bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
              {specification.name}: {specification.value}
            </div>
          </div>
        ) : (
          <div className="text-center mb-3">
            <div className="inline-block bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-500">
              No specifications
            </div>
          </div>
        )}

        {/* Colors (Max 3 Random) */}
        <div className="flex justify-center space-x-2">
          {colors.length > 0 ? (
            colors.map((color, index) => (
              <div
                key={index}
                className="w-6 h-6 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors cursor-pointer"
                style={{ backgroundColor: `#${color.hex}` }}
                title={color.name}
              />
            ))
          ) : (
            // Default colors if none specified
            <>
              <div className="w-6 h-6 rounded-full bg-gray-400 border-2 border-gray-200" />
              <div className="w-6 h-6 rounded-full bg-black border-2 border-gray-200" />
              <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-gray-200" />
            </>
          )}
        </div>
      </div>

      {/* Price */}
      <div className="text-center">
        <div className="text-2xl font-semibold text-gray-800">
          ${product?.price}
        </div>
        
        {/* Rating */}
        {product?.reviews?.length > 0 && (
          <div className="flex items-center justify-center mt-2 space-x-1">
            <AiFillStar className="text-yellow-400 w-4 h-4" />
            <span className="text-sm text-gray-600">
              ({product.reviews.length})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

function AddToFavorite({ product }) {
  const [addToFavorite, { isLoading, data, error }] = useAddToFavoriteMutation();

  useEffect(() => {
    if (isLoading) {
      toast.loading("Adding to favorite...", { id: "addToFavorite" });
    }
    if (data) {
      toast.success(data?.description, { id: "addToFavorite" });
    }
    if (error?.data) {
      toast.error(error?.data?.description, { id: "addToFavorite" });
    }
  }, [isLoading, data, error]);

  return (
    <button
      className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-all"
      onClick={(e) => {
        e.stopPropagation();
        addToFavorite({ product: product?._id });
      }}
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
