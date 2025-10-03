

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
import { useRouter } from "next/navigation";
import { useMemo } from "react";

const Header = () => {
  const user = useSelector((state) => state?.auth?.user);
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch data for dropdowns
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();
  const { data: storesData } = useGetStoresQuery();
  const { data: productsData } = useGetProductsQuery();

  const categories = useMemo(() => categoriesData?.data || [], [categoriesData]);
  const brands = useMemo(() => brandsData?.data || [], [brandsData]);
  const stores = useMemo(() => storesData?.data || [], [storesData]);
  const products = useMemo(() => productsData?.data || [], [productsData]);

  // Calculate product count for each brand
  const brandsWithProductCount = useMemo(() => {
    return brands.map(brand => ({
      ...brand,
      productCount: products.filter(product => product.brand?._id === brand._id).length
    }));
  }, [brands, products]);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <Container>
        {/* Main Header */}
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Left Side - Logo & Navigation */}
          <div className="flex items-center space-x-8">
            {/* China Gate Logo - Professional */}
            <Link href="/" className="flex-shrink-0 group">
              <div className="flex items-center space-x-3">
                {/* Geometric Gate Symbol */}
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 bg-slate-200 rounded-lg"></div>
                  <div className="absolute inset-1 bg-slate-700 rounded-md"></div>
                  <div className="absolute inset-2 bg-slate-100 rounded-sm flex items-center justify-center">
                    <div className="w-2 h-4 bg-slate-700 rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <div className="text-xl font-bold text-slate-800 leading-tight">
                    CHINA GATE
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    E-COMMERCE
                  </div>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {/* Home */}
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Home
              </Link>

              {/* Categories Dropdown - FIXED */}
              <div className="relative group">
                <button 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  onClick={() => router.push('/categories')} // FIXED: Go to categories page
                >
                  <span>Categories</span>
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Categories Dropdown Menu */}
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Browse Categories</h3>
                    <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                      {categories.slice(0, 8).map((category) => (
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
                            <p className="text-xs text-gray-500">{category.products?.length || 0} products</p>
                          </div>
                        </button>
                      ))}
                      {categories.length > 8 && (
                        <button
                          onClick={() => router.push('/categories')} // FIXED: Go to categories page
                          className="text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View All Categories →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Brands Dropdown - FIXED */}
              <div className="relative group">
                <button 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  onClick={() => router.push('/brands')} // FIXED: Go to brands page
                >
                  <span>Brands</span>
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Brands Dropdown Menu */}
                <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Popular Brands</h3>
                    <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
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
                          className="text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View All Brands →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
                      
              {/* Shop by Dropdown - UPDATED */}
              <div className="relative group">
                <button 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
                  onClick={() => router.push('/collections/all')}
                >
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
                      {/* Seasonal Products - FIXED */}
                      {(() => {
                        const savedSeasons = typeof window !== 'undefined' ? localStorage.getItem('homePageSeasons') : null;
                        const selectedSeasons = savedSeasons ? JSON.parse(savedSeasons) : ['winter'];
                        const seasonalCount = products.filter(product => {
                          if (!product.isHidden) {
                            if (Array.isArray(product.season)) {
                              return product.season.some(productSeason => selectedSeasons.includes(productSeason));
                            } else {
                              return selectedSeasons.includes(product.season) || product.season === "all-season";
                            }
                          }
                          return false;
                        }).length;
                        
                        if (seasonalCount > 0) {
                          return (
                            <button
                              onClick={() => router.push('/collections/seasonal')}
                              className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">🌍</span>
                                <span className="text-gray-700">Seasonal Collection</span>
                              </div>
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{seasonalCount}</span>
                            </button>
                          );
                        }
                        return null;
                      })()}

                      {/* Featured Products - FIXED */}
                      {(() => {
                        const featuredCount = products.filter(product => {
                          if (!product.isHidden) {
                            if (Array.isArray(product.productStatus)) {
                              return product.productStatus.includes("featured");
                            } else {
                              return product.productStatus === "featured";
                            }
                          }
                          return false;
                        }).length;
                        
                        if (featuredCount > 0) {
                          return (
                            <button
                              onClick={() => router.push('/collections/featured')}
                              className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-blue-50 transition-colors text-left"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">⭐</span>
                                <span className="text-gray-700">Featured Products</span>
                              </div>
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">{featuredCount}</span>
                            </button>
                          );
                        }
                        return null;
                      })()}

                      {/* Trending Products - FIXED */}
                      {(() => {
                        const trendingCount = products.filter(product => {
                          if (!product.isHidden) {
                            if (Array.isArray(product.productStatus)) {
                              return product.productStatus.includes("trending");
                            } else {
                              return product.productStatus === "trending";
                            }
                          }
                          return false;
                        }).length;
                        
                        if (trendingCount > 0) {
                          return (
                            <button
                              onClick={() => router.push('/collections/trending')}
                              className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-green-50 transition-colors text-left"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">🔥</span>
                                <span className="text-gray-700">Trending Products</span>
                              </div>
                              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">{trendingCount}</span>
                            </button>
                          );
                        }
                        return null;
                      })()}

                      {/* Best Sellers - FIXED */}
                      {(() => {
                        const bestSellerCount = products.filter(product => {
                          if (!product.isHidden) {
                            if (Array.isArray(product.productStatus)) {
                              return product.productStatus.includes("best-seller");
                            } else {
                              return product.productStatus === "best-seller";
                            }
                          }
                          return false;
                        }).length;
                        
                        if (bestSellerCount > 0) {
                          return (
                            <button
                              onClick={() => router.push('/collections/best-sellers')}
                              className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-red-50 transition-colors text-left"
                            >
                              <div className="flex items-center space-x-3">
                                <span className="text-2xl">🏆</span>
                                <span className="text-gray-700">Best Sellers</span>
                              </div>
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">{bestSellerCount}</span>
                            </button>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* Right Side - Search, Auth, Cart */}
          <div className="flex items-center space-x-4">
            {/* Search - Hidden on small screens */}
            <div className="hidden md:block">
              <SearchFilter />
            </div>

            {/* Dashboard Button */}
            {user && Object?.keys(user)?.length > 0 && (
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => router.push("/dashboard")}
                title="Dashboard"
              >
                <Dashboard className="h-6 w-6 text-gray-700" />
              </button>
            )}

            {/* Auth */}
            <Auth />

            {/* Cart */}
            <MyCart />

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <SearchFilter />
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t shadow-lg">
            <div className="px-4 py-6 space-y-6">
              <Link
                href="/"
                className="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                🏠 Home
              </Link>
              
              {/* Mobile Categories */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 text-lg">📂 Categories</h3>
                  <button
                    onClick={() => {
                      router.push('/collections/all');
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All →
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {categories.slice(0, 6).map((category) => (
                    <button
                      key={category._id}
                      onClick={() => {
                        router.push(`/collections/all?category=${category._id}`);
                        setMobileMenuOpen(false);
                      }}
                      className="text-left p-3 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all group"
                    >
                      <div className="flex items-center space-x-2">
                        <Image
                          src={category.thumbnail?.url}
                          alt={category.title}
                          width={24}
                          height={24}
                          className="w-6 h-6 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium text-sm group-hover:text-blue-600">{category.title}</div>
                          <div className="text-xs text-gray-600">{category.products?.length || 0} products</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Brands */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 text-lg">🏷️ Brands</h3>
                  <button
                    onClick={() => {
                      router.push('/collections/all');
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All →
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {brands.slice(0, 9).map((brand) => (
                    <button
                      key={brand._id}
                      onClick={() => {
                        router.push(`/collections/all?brand=${brand._id}`);
                        setMobileMenuOpen(false);
                      }}
                      className="text-center p-3 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all group"
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <Image
                          src={brand.logo?.url}
                          alt={brand.title}
                          width={32}
                          height={32}
                          className="w-8 h-8 object-cover rounded"
                        />
                        <div className="font-medium text-xs group-hover:text-blue-600 text-center">{brand.title}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Stores */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 text-lg">🏪 Stores</h3>
                  <button
                    onClick={() => {
                      router.push('/collections/all');
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    View All →
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {stores.slice(0, 4).map((store) => (
                    <button
                      key={store._id}
                      onClick={() => {
                        router.push(`/collections/all?store=${store._id}`);
                        setMobileMenuOpen(false);
                      }}
                      className="text-left p-3 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all group"
                    >
                      <div className="flex items-center space-x-2">
                        <Image
                          src={store.thumbnail?.url}
                          alt={store.title}
                          width={24}
                          height={24}
                          className="w-6 h-6 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium text-sm group-hover:text-blue-600">{store.title}</div>
                          <div className="text-xs text-gray-600">{store.products?.length || 0} products</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Quick Actions */}
              <div className="pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      router.push('/collections/all');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center space-x-2 p-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span className="font-medium">All Products</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Add contact functionality or page
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">Contact</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
};

export default Header;
