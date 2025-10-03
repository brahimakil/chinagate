/**
 * Title: Write a program using JavaScript on Page
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import Banner1 from "@/components/home/Banner1";
import SeasonalProducts from "@/components/home/SeasonalProducts";
import ShowBrands from "@/components/home/ShowBrands";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import TrendingProducts from "@/components/home/TrendingProducts";
import PromoBanner from "@/components/home/PromoBanner";
import BestSellers from "@/components/home/BestSellers";
import AllProducts from "@/components/home/AllProducts";
import Steps from "@/components/home/Steps";
import Banner2 from "@/components/home/Banner2";
import Main from "@/components/shared/layouts/Main";

export default function Home() {
  return (
    <>
      <Main>
        <main className="flex flex-col gap-y-20 w-full">
          {/* Hero Banner */}
          <Banner1 />
          
          {/* Steps/How it works */}
          <Steps />
          
          {/* 🌟 Seasonal Products Section */}
          <SeasonalProducts />
          
          {/* 🔥 Professional Brands Showcase */}
          <ShowBrands />
          
          {/* Featured Products */}
          <FeaturedProducts />
          
          {/* Banner 2 */}
          <Banner2 />
          
          {/* Trending Products */}
          <TrendingProducts />
          
          {/* 🎯 NEW: Promotional Banner */}
          <PromoBanner />
          
          {/* Best Sellers */}
          <BestSellers />
          
          {/* 🆕 All Products Section */}
          <AllProducts />
        </main>
      </Main>
    </>
  );
}
