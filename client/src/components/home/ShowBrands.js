"use client";

import React, { useRef, useState, useEffect } from "react";
import Container from "../shared/Container";
import Image from "next/image";
import Link from "next/link";
import { useGetBrandsQuery } from "@/services/brand/brandApi";

// Custom Arrow Icons
const ChevronLeftIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ShowBrands = () => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false); // Add this line

  const {
    data: brandsData,
    isLoading: brandsLoading,
  } = useGetBrandsQuery();

  const brands = brandsData?.data || [];

  // Duplicate brands for continuous scroll if less than 6 brands
  const displayBrands = brands.length < 6 ? [...brands, ...brands, ...brands] : brands;

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Smooth scroll function
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      const currentScroll = scrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;

      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });

      setTimeout(checkScrollPosition, 300);
    }
  };

  // Fixed continuous auto-scroll with pause functionality
  useEffect(() => {
    if (displayBrands.length === 0) return;

    const interval = setInterval(() => {
      if (scrollRef.current && !isPaused) { // Check if not paused
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        
        if (scrollLeft >= scrollWidth - clientWidth - 50) {
          // Reset to beginning smoothly
          scrollRef.current.scrollTo({ left: 0, behavior: 'auto' });
        } else {
          // Continue scrolling slower and smoother
          scrollRef.current.scrollBy({ left: 0.5, behavior: 'auto' });
        }
        checkScrollPosition();
      }
    }, 50); // Slower interval for smoother movement

    return () => clearInterval(interval);
  }, [displayBrands.length, isPaused]); // Add isPaused dependency

  useEffect(() => {
    checkScrollPosition();
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScrollPosition);
      return () => scrollContainer.removeEventListener('scroll', checkScrollPosition);
    }
  }, [displayBrands]);

  if (brandsLoading || brands.length === 0) return null;

  return (
    <section className="py-16 relative overflow-hidden">
      <Container>
        <div className="relative">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 px-8 py-4 bg-black rounded-full text-lg font-bold mb-6 shadow-lg">
              <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
              <span className="text-white tracking-wide" style={{ color: '#ffffff !important' }}>TRUSTED BY LEADING BRANDS</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Shop by <span className="text-slate-600">Brand</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Discover premium products from the world's most trusted brands
            </p>
          </div>

          {/* Brands Carousel Container */}
          <div 
            className="relative group"
            onMouseEnter={() => setIsPaused(true)} // Pause on hover
            onMouseLeave={() => setIsPaused(false)} // Resume on leave
          >
            {/* Left Arrow */}
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-300 hover:bg-gray-50 hover:shadow-xl ${
                !canScrollLeft && 'opacity-50 cursor-not-allowed'
              }`}
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-300 hover:bg-gray-50 hover:shadow-xl ${
                !canScrollRight && 'opacity-50 cursor-not-allowed'
              }`}
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-700" />
            </button>

            {/* Brands Scroll Container */}
            <div
              ref={scrollRef}
              className="flex space-x-8 overflow-x-auto scrollbar-hide pb-4 px-16"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {displayBrands.map((brand, index) => (
                <Link
                  key={`${brand._id}-${index}`}
                  href={`/collections/all?brand=${brand._id}`}
                  className="flex-shrink-0 group/brand"
                >
                  <div className="relative">
                    {/* Brand Card - Fixed animations */}
                    <div className="w-48 h-40 bg-transparent border-2 border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center transition-all duration-300 hover:border-gray-400 hover:-translate-y-1 hover:shadow-lg group-hover/brand:bg-white/30 group-hover/brand:backdrop-blur-sm">
                      {/* Brand Logo - Smoother animation */}
                      <div className="relative w-28 h-24 mb-2 flex items-center justify-center group-hover/brand:scale-105 transition-transform duration-300">
                        <Image
                          src={brand.logo?.url}
                          alt={brand.title}
                          width={112}
                          height={96}
                          className="object-contain w-full h-full transition-all duration-300"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Brand Name */}
                      <h3 className="text-sm font-semibold text-slate-600 text-center line-clamp-1 group-hover/brand:text-gray-800 transition-colors duration-300">
                        {brand.title}
                      </h3>
                    </div>

                    {/* Smoother Hover Glow Effect */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-gray-200/30 to-gray-300/30 opacity-0 group-hover/brand:opacity-100 transition-opacity duration-300 -z-10 blur-lg"></div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Gradient Overlays for smooth edges */}
            <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-white to-transparent pointer-events-none z-5"></div>
            <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-white to-transparent pointer-events-none z-5"></div>
          </div>
        </div>
      </Container>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default ShowBrands;
