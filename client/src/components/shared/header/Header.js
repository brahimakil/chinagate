

"use client";

import React, { useState } from "react";
import Container from "../Container";
import Image from "next/image";
import Link from "next/link";
import Auth from "./Auth";
import Dashboard from "@/components/icons/Dashboard";
import SearchFilter from "./SearchFilter";
import MyCart from "./MyCart";
import { useSelector } from "react-redux";
import { useGetCategoriesQuery } from "@/services/category/categoryApi";
import { useGetBrandsQuery } from "@/services/brand/brandApi";
import { useGetStoresQuery } from "@/services/store/storeApi";
import { useGetProductsQuery } from "@/services/product/productApi";
import { useGetSectionsQuery } from "@/services/section/sectionApi";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

const Header = () => {
  const user = useSelector((state) => state?.auth?.user);
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  // Fetch data for dropdowns
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();
  const { data: storesData } = useGetStoresQuery();
  const { data: productsData } = useGetProductsQuery();
  const { data: sectionsData } = useGetSectionsQuery();

  const categories = useMemo(() => categoriesData?.data || [], [categoriesData]);
  const brands = useMemo(() => brandsData?.data || [], [brandsData]);
  const stores = useMemo(() => storesData?.data || [], [storesData]);
  const products = useMemo(() => productsData?.data || [], [productsData]);
  const sections = useMemo(() => sectionsData?.data || [], [sectionsData]);

  const categoriesWithProductCount = useMemo(() => {
    return categories.map(category => ({
      ...category,
      productCount: products.filter(product => product.category?._id === category._id && !product.isHidden).length
    }));
  }, [categories, products]);

  const brandsWithProductCount = useMemo(() => {
    return brands.map(brand => ({
      ...brand,
      productCount: products.filter(product => product.brand?._id === brand._id && !product.isHidden).length
    }));
  }, [brands, products]);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <>
      <header className="bg-white shadow-md sticky top-0 z-50">
        <Container>
          {/* MOBILE HEADER - Logo + Hamburger */}
          <div className="lg:hidden flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 bg-slate-200 rounded-lg"></div>
                  <div className="absolute inset-1 bg-slate-700 rounded-md"></div>
                  <div className="absolute inset-2 bg-slate-100 rounded-sm flex items-center justify-center">
                    <div className="w-1.5 h-3 bg-slate-700 rounded-full"></div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="text-base font-bold text-slate-800 leading-tight">CHINA GATE</div>
                  <div className="text-[9px] text-slate-500 font-medium">E-COMMERCE</div>
                </div>
              </div>
            </Link>

            {/* Right Icons - Sidebar Toggle, Auth, Cart */}
            <div className="flex items-center gap-2">
              <Auth />
              <MyCart />
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* DESKTOP HEADER - Full Navigation */}
          <div className="hidden lg:flex items-center justify-between h-20">
            {/* Left Side - Logo & Navigation */}
            <div className="flex items-center space-x-8">
              {/* China Gate Logo */}
              <Link href="/" className="flex-shrink-0 group">
                <div className="flex items-center space-x-3">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 bg-slate-200 rounded-lg"></div>
                    <div className="absolute inset-1 bg-slate-700 rounded-md"></div>
                    <div className="absolute inset-2 bg-slate-100 rounded-sm flex items-center justify-center">
                      <div className="w-2 h-4 bg-slate-700 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <div className="text-xl font-bold text-slate-800 leading-tight">CHINA GATE</div>
                    <div className="text-xs text-slate-500 font-medium">E-COMMERCE</div>
                  </div>
                </div>
              </Link>

              {/* Desktop Navigation */}
              <nav className="flex items-center space-x-8">
                <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">Home</Link>
                
                {/* Categories Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200" onClick={() => router.push('/categories')}>
                    <span>Categories</span>
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Categories Dropdown Menu */}
                  <div className={`absolute left-0 mt-2 bg-white rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 ${
                    categoriesWithProductCount.slice(0, 8).length > 3 ? 'w-[600px]' : 'w-80'
                  }`}>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Browse Categories</h3>
                      <div className={`grid gap-2 max-h-80 overflow-y-auto ${
                        categoriesWithProductCount.slice(0, 8).length > 3 ? 'grid-cols-2' : 'grid-cols-1'
                      }`}>
                        {categoriesWithProductCount.slice(0, 8).map((category) => (
                          <button
                            key={category._id}
                            onClick={() => router.push(`/collections/all?category=${category._id}`)} // CORRECT: Individual category filter
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left w-full"
                          >
                            <Image
                              src={category.thumbnail?.url}
                              alt={category.title}
                              width={32}
                              height={32}
                              className="w-8 h-8 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{category.title}</p>
                              <p className="text-xs text-gray-500">{category.productCount || 0} products</p>
                            </div>
                          </button>
                        ))}
                        {categories.length > 8 && (
                          <button
                            onClick={() => router.push('/categories')} // FIXED: Go to categories page
                            className={`text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium ${
                              categoriesWithProductCount.slice(0, 8).length > 3 ? 'col-span-2' : ''
                            }`}
                          >
                            View All Categories →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Brands Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200" onClick={() => router.push('/brands')}>
                    <span>Brands</span>
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Brands Dropdown Menu */}
                  <div className={`absolute left-0 mt-2 bg-white rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 ${
                    brandsWithProductCount.slice(0, 8).length > 3 ? 'w-[600px]' : 'w-80'
                  }`}>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Popular Brands</h3>
                      <div className={`grid gap-2 max-h-80 overflow-y-auto ${
                        brandsWithProductCount.slice(0, 8).length > 3 ? 'grid-cols-2' : 'grid-cols-1'
                      }`}>
                        {brandsWithProductCount.slice(0, 8).map((brand) => (
                          <button
                            key={brand._id}
                            onClick={() => router.push(`/collections/all?brand=${brand._id}`)} // CORRECT: Individual brand filter
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left w-full"
                          >
                            <Image
                              src={brand.logo?.url}
                              alt={brand.title}
                              width={32}
                              height={32}
                              className="w-8 h-8 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{brand.title}</p>
                              <p className="text-xs text-gray-500">{brand.productCount} products</p>
                            </div>
                          </button>
                        ))}
                        {brandsWithProductCount.length > 8 && (
                          <button
                            onClick={() => router.push('/brands')} // FIXED: Go to brands page
                            className={`text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium ${
                              brandsWithProductCount.slice(0, 8).length > 3 ? 'col-span-2' : ''
                            }`}
                          >
                            View All Brands →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                      
                {/* Shop by Dropdown */}
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200" onClick={() => router.push('/collections/all')}>
                    <span>Shop by</span>
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Shop by Dropdown Menu */}
                  <div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 z-50">
                    <div className="p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Shop by Collection</h3>
                      <div className="space-y-2">
                        {/* Dynamic Sections from Database */}
                        {sections
                          .filter(section => section.isActive && section.sectionCategory === "product")
                          .sort((a, b) => a.order - b.order)
                          .map((section) => {
                            // Calculate product count for this section
                            const productCount = products.filter(product => {
                              if (product.isHidden) return false;
                              
                              // Handle seasonal sections
                              if (section.filterKey === "seasonal" && section.seasons && section.seasons.length > 0) {
                                if (Array.isArray(product.season)) {
                                  return product.season.some(productSeason => section.seasons.includes(productSeason));
                                } else {
                                  return section.seasons.includes(product.season);
                                }
                              }
                              
                              // Handle other sections (featured, trending, etc.)
                              if (Array.isArray(product.productStatus)) {
                                return product.productStatus.includes(section.filterKey);
                              } else {
                                return product.productStatus === section.filterKey;
                              }
                            }).length;
                            
                            // Only show section if it has products
                            if (productCount === 0) return null;
                            
                            return (
                              <button
                                key={section._id}
                                onClick={() => router.push(`/collections/${section.filterKey}`)}
                                className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                                style={{ 
                                  backgroundColor: `${section.color}10`,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = `${section.color}20`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = `${section.color}10`;
                                }}
                              >
                                <div className="flex items-center space-x-3">
                                  <span className="text-2xl">{section.icon || '📦'}</span>
                                  <span className="text-gray-700">{section.displayName}</span>
                                </div>
                                <span 
                                  className="text-xs px-2 py-1 rounded-full font-medium"
                                  style={{ 
                                    backgroundColor: `${section.color}30`,
                                    color: section.color
                                  }}
                                >
                                  {productCount}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </div>
              </nav>
            </div>

            {/* Right Side - Search, Auth, Cart */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:block"><SearchFilter /></div>
              {user && Object?.keys(user)?.length > 0 && (
                <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => router.push("/dashboard")} title="Dashboard">
                  <Dashboard className="h-6 w-6 text-gray-700" />
            </button>
          )}
          <Auth />
          <MyCart />
            </div>
          </div>
        </Container>
      </header>

      {/* MOBILE SIDEBAR */}
      {sidebarOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/50 z-[60] lg:hidden" onClick={() => setSidebarOpen(false)} />
          
          {/* Sidebar */}
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-[70] transform transition-transform duration-300 lg:hidden overflow-y-auto">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">Menu</h2>
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="p-4 space-y-2">
              {/* Home */}
              <button onClick={() => { router.push('/'); setSidebarOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left">
                <span className="text-xl">🏠</span>
                <span className="font-medium text-gray-900">Home</span>
              </button>

              {/* Search */}
              <div className="px-3 py-2">
                <SearchFilter />
              </div>

              {/* Categories - Expandable with Direct Link */}
              <div>
                <div className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <button 
                    onClick={() => { 
                      toggleSection('categories'); 
                      router.push('/categories'); 
                    }} 
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <span className="text-xl">📂</span>
                    <span className="font-medium text-gray-900">Categories</span>
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      toggleSection('categories'); 
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <svg className={`w-5 h-5 transition-transform ${expandedSection === 'categories' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {expandedSection === 'categories' && (
                  <div className="ml-10 mt-2 space-y-1">
                    {categories.map((category) => (
                      <button key={category._id} onClick={() => { router.push(`/collections/all?category=${category._id}`); setSidebarOpen(false); }} className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm text-gray-700">
                        {category.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Brands - Expandable with Direct Link */}
              <div>
                <div className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <button 
                    onClick={() => { 
                      toggleSection('brands'); 
                      router.push('/brands'); 
                    }} 
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <span className="text-xl">🏷️</span>
                    <span className="font-medium text-gray-900">Brands</span>
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      toggleSection('brands'); 
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <svg className={`w-5 h-5 transition-transform ${expandedSection === 'brands' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {expandedSection === 'brands' && (
                  <div className="ml-10 mt-2 space-y-1">
                    {brands.map((brand) => (
                      <button key={brand._id} onClick={() => { router.push(`/collections/all?brand=${brand._id}`); setSidebarOpen(false); }} className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm text-gray-700">
                        {brand.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Shop by - Expandable with Direct Link */}
              <div>
                <div className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors">
                  <button 
                    onClick={() => { 
                      toggleSection('shop'); 
                      router.push('/collections/all'); 
                    }} 
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <span className="text-xl">🛍️</span>
                    <span className="font-medium text-gray-900">Shop by</span>
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      toggleSection('shop'); 
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <svg className={`w-5 h-5 transition-transform ${expandedSection === 'shop' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {expandedSection === 'shop' && (
                  <div className="ml-10 mt-2 space-y-1">
                    <button onClick={() => { router.push('/collections/seasonal'); setSidebarOpen(false); }} className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm text-gray-700">🌍 Seasonal</button>
                    <button onClick={() => { router.push('/collections/featured'); setSidebarOpen(false); }} className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm text-gray-700">⭐ Featured</button>
                    <button onClick={() => { router.push('/collections/trending'); setSidebarOpen(false); }} className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm text-gray-700">🔥 Trending</button>
                    <button onClick={() => { router.push('/collections/best-sellers'); setSidebarOpen(false); }} className="w-full text-left p-2 rounded hover:bg-gray-50 text-sm text-gray-700">🏆 Best Sellers</button>
                  </div>
                )}
              </div>

              {/* Dashboard (if logged in) */}
              {user && Object?.keys(user)?.length > 0 && (
                <button onClick={() => { router.push('/dashboard'); setSidebarOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left">
                  <Dashboard className="h-5 w-5 text-gray-700" />
                  <span className="font-medium text-gray-900">Dashboard</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

    </>
  );
};

export default Header;
