/**
 * Title: Promotional Banner Component
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import React from "react";
import Container from "../shared/Container";
import Link from "next/link";

const PromoBanner = () => {
  // Smooth scroll to All Products section
  const scrollToAllProducts = (e) => {
    e.preventDefault();
    const allProductsSection = document.getElementById('all-products-section');
    if (allProductsSection) {
      allProductsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-slate-50 via-gray-50 to-slate-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.1)_25%,rgba(0,0,0,0.1)_50%,transparent_50%,transparent_75%,rgba(0,0,0,0.1)_75%)] bg-[size:30px_30px]"></div>
      </div>

      <Container>
        <div className="relative z-10">
          {/* Main Content */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-black rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span className="text-white font-medium" style={{ color: '#ffffff !important' }}>SPECIAL OFFER</span>
            </div>
            
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Discover Amazing <span className="text-slate-600">Deals</span>
            </h2>
            
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Shop our curated selection of premium products with exclusive discounts. 
              Quality meets affordability in every purchase.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={scrollToAllProducts}
                className="px-8 py-4 bg-black text-white rounded-full hover:bg-gray-800 transition-all duration-300 font-medium hover:scale-105 transform"
              >
                Browse All Products ↓
              </button>
              <Link 
                href="/collections/all"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-full hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-medium"
              >
                Shop by Category
              </Link>
            </div>
          </div>

          {/* Stats/Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">🚚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Free Shipping</h3>
              <p className="text-slate-600">Free delivery on orders over $50. Fast and reliable shipping worldwide.</p>
            </div>

            <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">🔒</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure Payment</h3>
              <p className="text-slate-600">Your payment information is encrypted and secure. Shop with confidence.</p>
            </div>

            <div className="text-center p-6 bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">⭐</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-slate-600">Carefully curated products from trusted brands. Quality guaranteed.</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default PromoBanner;
