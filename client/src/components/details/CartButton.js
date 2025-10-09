/**
 * Title: Write a program using JavaScript on CartButton
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
 * Date: 24, October 2023
 */

"use client";

import React, { useEffect, useState } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import Bag from "../icons/Bag";
import Spinner from "../shared/Spinner";
import { useAddToCartMutation } from "@/services/cart/cartApi";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux"; // 🆕 Import useSelector
import { useRouter } from "next/navigation"; // 🆕 Import useRouter

const CartButton = ({ product }) => {
  const [qty, setQty] = useState(1);
  const user = useSelector((state) => state?.auth?.user); // 🆕 Get user from Redux
  const router = useRouter(); // 🆕 Get router

  const [
    addToCart,
    { isLoading: addingToCart, data: cartData, error: cartError },
  ] = useAddToCartMutation();

  useEffect(() => {
    if (addingToCart) {
      toast.loading("Adding to cart...", { id: "addToCart" });
    }

    if (cartData) {
      toast.success(cartData?.description, { id: "addToCart" });
      setQty(1);
    }
    
    // Enhanced error handling with elegant sign-in prompt
    if (cartError) {
      // Check for 401 Unauthorized error
      if (cartError?.status === 401) {
        toast.error(
          (t) => (
            <div className="flex flex-col gap-3 p-2">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-gray-900 text-base mb-1">Sign In Required</div>
                  <div className="text-sm text-gray-600">Please sign in to add items to your cart</div>
                </div>
              </div>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  router.push("/auth");
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In to Continue
              </button>
            </div>
          ),
          { 
            id: "addToCart",
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
      } else if (cartError?.data) {
        // Other errors (like insufficient stock)
        toast.error(cartError?.data?.description, { id: "addToCart" });
      } else {
        toast.error("Failed to add to cart", { id: "addToCart" });
      }
    }
  }, [addingToCart, cartData, cartError, router]);

  // Handle add to cart - just call the API, let useEffect handle errors
  const handleAddToCart = () => {
    console.log("User state:", user); // Debug log
    addToCart({ product: product._id, quantity: qty });
  };

  return (
    <section className="flex flex-row items-center gap-x-4">
      <div className="flex flex-row gap-x-2 items-center border px-1 py-0.5 rounded-secondary h-full">
        <button
          className="border border-black/30 disabled:border-zinc-100 p-1.5 rounded-secondary"
          onClick={() => setQty(qty - 1)}
          disabled={qty === 1}
        >
          <AiOutlineMinus className="w-4 h-4" />
        </button>
        <span className="px-2 py-0.5 rounded-primary border w-12 inline-block text-center">
          {qty}
        </span>
        <button
          className="border border-black/30 disabled:border-zinc-100 p-1.5 rounded-secondary"
          onClick={() => setQty(qty + 1)}
        >
          <AiOutlinePlus className="w-4 h-4" />
        </button>
      </div>
      <button
        className="px-8 py-2 border border-black rounded-secondary bg-black hover:bg-black/90 text-white transition-colors drop-shadow w-fit flex flex-row gap-x-2 items-center"
        disabled={qty === 0 || addingToCart}
        onClick={handleAddToCart} // 🆕 Use new handler
      >
        {addingToCart ? (
          <Spinner />
        ) : (
          <>
            <Bag /> Add to Cart
          </>
        )}
      </button>
    </section>
  );
};

export default CartButton;
