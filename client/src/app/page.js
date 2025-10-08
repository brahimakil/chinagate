/**
 * Title: Write a program using JavaScript on Page
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import ShowBrands from "@/components/home/ShowBrands";
import AllProducts from "@/components/home/AllProducts";
import Main from "@/components/shared/layouts/Main";
import DynamicSection from "@/components/home/DynamicSection";
import Container from "@/components/shared/Container";
import { useGetSectionsQuery } from "@/services/section/sectionApi";
import { useGetSystemSettingsQuery } from "@/services/system/systemApi";
import React from "react";

export default function Home() {
  const { data: sectionsData, isLoading, error: sectionsError } = useGetSectionsQuery();
  const { data: settingsData } = useGetSystemSettingsQuery();
  
  const sections = sectionsData?.data || [];
  const settings = settingsData?.data;
  const homeBanner = settings?.homePageBanner;

  // Sort sections by order and filter active ones
  const activeSections = sections
    .filter((section) => section.isActive)
    .sort((a, b) => a.order - b.order);

  // 🔍 DEBUG: Log sections data
  console.log('🏠 HOME PAGE DEBUG:');
  console.log('📦 Raw sectionsData:', sectionsData);
  console.log('📊 All sections:', sections);
  console.log('✅ Active sections:', activeSections);
  console.log('⏳ Is loading:', isLoading);
  console.log('❌ Error:', sectionsError);
  
  if (activeSections.length > 0) {
    console.log('🎯 Sections to render:');
    activeSections.forEach((section, index) => {
      console.log(`  ${index + 1}. ${section.displayName}`, {
        id: section._id,
        category: section.sectionCategory,
        isActive: section.isActive,
        order: section.order,
        hasAdImage: !!section.adImage?.url,
        adText: section.adText,
      });
    });
  } else {
    console.log('⚠️ No active sections found!');
    console.log('Total sections in DB:', sections.length);
  }

  return (
      <Main>
        <main className="flex flex-col gap-y-20 w-full">
        {/* Home Page Banner with Dynamic Text */}
        {homeBanner && (
          <div className="relative w-full py-16 md:py-24 overflow-hidden">
            {/* Background Image or Gradient */}
            {homeBanner.image?.url ? (
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${homeBanner.image.url})`,
                }}
              ></div>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.1),transparent_50%)]"></div>
              </>
            )}
            
            {/* Overlay */}
            <div 
              className="absolute inset-0"
              style={{ 
                backgroundColor: homeBanner.overlayColor || 'rgba(0, 0, 0, 0.5)'
              }}
            ></div>

            {/* Floating Elements (only if no custom banner) */}
            {!homeBanner.image?.url && (
              <>
                <div className="absolute top-10 left-10 w-20 h-20 bg-cyan-200/30 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute top-32 right-20 w-16 h-16 bg-blue-300/20 rounded-full blur-lg animate-bounce"></div>
                <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-cyan-300/25 rounded-full blur-md animate-pulse"></div>
              </>
            )}

            <Container>
              <div className="relative text-center z-10">
                <div 
                  className="inline-flex items-center space-x-3 px-6 md:px-8 py-3 md:py-4 bg-black/90 backdrop-blur-sm rounded-full text-xs md:text-sm font-bold mb-6 md:mb-8 shadow-xl border border-white/10"
                  style={{ color: homeBanner.textColor || '#FFFFFF' }}
                >
                  <span className="w-2 h-2 bg-current rounded-full animate-pulse"></span>
                  <span className="tracking-wider">{homeBanner.badge || "WELCOME TO OUR STORE"}</span>
                </div>

                <h1 
                  className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight px-4"
                  style={{ color: homeBanner.textColor || '#111827' }}
                >
                  {homeBanner.title || "🏪 Welcome to China Gate"}
                </h1>
                
                <p 
                  className="text-lg md:text-2xl mb-2 md:mb-4 font-light px-4 opacity-90"
                  style={{ color: homeBanner.textColor || '#64748b' }}
                >
                  {homeBanner.subtitle || "Your One-Stop Shop for Quality Products"}
                </p>
                <p 
                  className="text-sm md:text-lg max-w-3xl mx-auto mb-8 md:mb-12 leading-relaxed px-4 opacity-80"
                  style={{ color: homeBanner.textColor || '#64748b' }}
                >
                  {homeBanner.description || "Discover amazing products curated just for you. Shop with confidence!"}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 px-4">
                  <a
                    href="#sections"
                    className="group bg-white/90 backdrop-blur-sm text-gray-900 px-6 md:px-8 py-3 md:py-4 rounded-full hover:bg-white transition-all duration-300 shadow-lg border border-white/20 font-medium text-sm md:text-base"
                    onClick={(e) => {
                      e.preventDefault();
                      const firstSection = document.querySelector('[data-section]');
                      if (firstSection) {
                        firstSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    <span className="mr-2">🛍️</span>
                    <span>Start Shopping</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300 inline-block">→</span>
                  </a>
                </div>
              </div>
            </Container>
          </div>
        )}
        
        {/* 🆕 DYNAMIC SECTIONS - Render based on admin configuration */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : activeSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Sections Available</h2>
            <p className="text-gray-600 text-center">
              Go to the admin panel to create and activate homepage sections
            </p>
          </div>
        ) : (
          activeSections.map((section, index) => (
            <React.Fragment key={section._id}>
              {/* 🆕 Render Advertisement OR Product Section */}
              {section.sectionCategory === 'advertisement' ? (
                /* Advertisement Banner */
                <Container>
                  <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl group cursor-pointer transition-transform hover:scale-[1.02] duration-300">
                    {/* Background Image */}
                    {section.adImage?.url && (
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform group-hover:scale-110 duration-700"
                        style={{
                          backgroundImage: `url(${section.adImage.url})`,
                        }}
                      />
                    )}
                    
                    {/* Overlay */}
                    <div 
                      className="absolute inset-0 transition-opacity group-hover:opacity-90"
                      style={{ backgroundColor: section.adOverlayColor || 'rgba(0, 0, 0, 0.5)' }}
                    />
                    
                    {/* Content */}
                    <div className="relative z-10 flex flex-col px-6 py-16 md:py-24 lg:py-32 h-full min-h-[400px] md:min-h-[500px]">
                      {/* Text - Top/Center area */}
                      {section.adText && (
                        <h2 
                          className="text-2xl md:text-4xl lg:text-5xl font-bold mb-auto leading-tight max-w-4xl"
                          style={{ color: section.adTextColor || '#FFFFFF' }}
                        >
                          {section.adText}
                        </h2>
                      )}
                      
                      {/* Button - Bottom Right */}
                      {section.adButtonText && section.adButtonLink && (
                        <div className="flex justify-end mt-auto">
                          <a
                            href={section.adButtonLink}
                            className="inline-flex items-center px-5 py-2.5 text-sm md:text-base font-semibold rounded-lg transition-all hover:scale-105 shadow-lg"
                            style={{
                              backgroundColor: section.adButtonBackgroundColor || '#FFFFFF',
                              color: section.adButtonTextColor || '#000000',
                            }}
                          >
                            {section.adButtonText}
                            <svg 
                              className="ml-2 w-4 h-4" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M13 7l5 5m0 0l-5 5m5-5H6" 
                              />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </Container>
              ) : (
                /* Product Section */
                <DynamicSection section={section} />
              )}
              
              {/* Insert ShowBrands after first section */}
              {index === 0 && <ShowBrands />}
            </React.Fragment>
          ))
        )}
        
        {/* All Products Section - Always at the end */}
        <AllProducts />
        </main>
      </Main>
  );
}
