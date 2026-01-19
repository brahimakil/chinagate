/**
 * Title: Brands Ecosystem Page
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Main from "@/components/shared/layouts/Main";
import Container from "@/components/shared/Container";
import Image from "next/image";
import { useGetBrandsQuery } from "@/services/brand/brandApi";
import { useGetCategoriesQuery } from "@/services/category/categoryApi";
import { useGetProductsQuery } from "@/services/product/productApi";
import { BsBoxSeam, BsGrid3X3Gap } from "react-icons/bs";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Niche from "@/components/shared/skeletonLoading/Niche";
import { useGetSystemSettingsQuery } from "@/services/system/systemApi";

const BrandsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("ecosystem"); // ecosystem, grid
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const {
    data: brandsData,
    error: brandsError,
    isLoading: fetchingBrands,
  } = useGetBrandsQuery();

  const {
    data: categoriesData,
    isLoading: fetchingCategories,
  } = useGetCategoriesQuery();

  const {
    data: productsData,
    isLoading: fetchingProducts,
  } = useGetProductsQuery();

  const { data: settingsData } = useGetSystemSettingsQuery();
  const banner = settingsData?.data?.brandsPageBanner;

  const brands = useMemo(() => brandsData?.data || [], [brandsData]);
  const categories = useMemo(() => categoriesData?.data || [], [categoriesData]);
  const products = useMemo(() => productsData?.data || [], [productsData]);

  // Create brand-category connections
  const brandCategoryConnections = useMemo(() => {
    return brands.map(brand => {
      const brandProducts = products.filter(product => product.brand?._id === brand._id);
      const brandCategories = [...new Set(brandProducts.map(product => product.category?._id))];
      const categoriesWithProducts = brandCategories.map(categoryId => {
        const category = categories.find(cat => cat._id === categoryId);
        const categoryProductCount = brandProducts.filter(product => product.category?._id === categoryId).length;
        return {
          ...category,
          productCount: categoryProductCount
        };
      }).filter(Boolean);

      return {
        ...brand,
        categories: categoriesWithProducts,
        totalProducts: brandProducts.length
      };
    });
  }, [brands, categories, products]);

  // Filter brands
  const filteredBrands = useMemo(() => {
    let filtered = brandCategoryConnections.filter((brand) => {
      const matchesSearch = brand.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === "all" || 
        brand.categories.some(cat => cat._id === selectedCategory);
      
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => b.totalProducts - a.totalProducts);
  }, [brandCategoryConnections, searchTerm, selectedCategory]);

  useEffect(() => {
    if (brandsError) {
      toast.error(brandsError?.data?.description, {
        id: "brands-error",
      });
    }
  }, [brandsError]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleBrandClick = (brandId) => {
    router.push(`/collections/all?brand=${brandId}`);
  };

  const handleCategoryClick = (brandId, categoryId) => {
    router.push(`/collections/all?brand=${brandId}&category=${categoryId}`);
  };

  if (fetchingBrands || fetchingCategories || fetchingProducts) {
    return (
      <Main>
        <div className="min-h-screen bg-white">
          <Container>
            <div className="py-20">
              <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8">
                {[1, 2, 3, 4, 5, 6].map((_, index) => (
                  <Niche key={index} />
                ))}
              </div>
            </div>
          </Container>
        </div>
      </Main>
    );
  }

  return (
    <Main>
      <div className="min-h-screen">
        {/* Banner */}
        {banner && (
          <div className="relative w-full py-10 sm:py-14 md:py-20 lg:py-24 overflow-hidden">
            {banner.image?.url ? (
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${banner.image.url})` }}></div>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-100"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%)]"></div>
              </>
            )}
            <div className="absolute inset-0" style={{ backgroundColor: banner.overlayColor || 'rgba(0, 0, 0, 0.5)' }}></div>
            {!banner.image?.url && (
              <>
                <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-200/30 rounded-full blur-xl animate-pulse hidden sm:block"></div>
                <div className="absolute top-32 right-20 w-16 h-16 bg-green-300/20 rounded-full blur-lg animate-bounce hidden sm:block"></div>
              </>
            )}
            <Container>
              <div className="relative text-center z-10 px-2">
                <div className="inline-flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 bg-black/90 backdrop-blur-sm rounded-full text-[10px] sm:text-xs md:text-sm font-bold mb-4 sm:mb-6 md:mb-8 shadow-xl border border-white/10" style={{ color: '#FFFFFF' }}>
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></span>
                  <span className="tracking-wider">{banner.badge || "SHOP BY BRAND"}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 sm:mb-4 md:mb-6 leading-tight px-2 sm:px-4" style={{ color: banner.textColor || '#111827' }}>
                  {banner.title || "🏷️ Browse Brands"}
                </h1>
                <p className="text-sm sm:text-base md:text-xl lg:text-2xl mb-1 sm:mb-2 md:mb-4 font-light px-2 sm:px-4 opacity-90" style={{ color: banner.textColor || '#64748b' }}>
                  {banner.subtitle || "Shop Your Favorite Brands"}
                </p>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl mx-auto mb-4 sm:mb-6 md:mb-10 lg:mb-12 leading-relaxed px-2 sm:px-4 opacity-80" style={{ color: banner.textColor || '#64748b' }}>
                  {banner.description || "Discover products from the world's leading brands"}
                </p>
              </div>
            </Container>
          </div>
        )}

        <Container>
          <div className="py-12">
            {/* Controls Section */}
            <div 
              className={`mb-12 transform transition-all duration-1000 delay-200 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="bg-neutral-100/70 rounded-primary shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
                <div className="flex flex-col gap-4 sm:gap-6">
                  {/* Search Bar - Full width on mobile */}
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder=" Search brands..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-secondary leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 text-center"
                    />
                  </div>

                  {/* Category Filter and View Mode - Row on larger screens */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                    {/* Category Filter */}
                    <div className="flex items-center space-x-2 sm:space-x-4 flex-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">Category:</label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-secondary px-2 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center space-x-2 bg-white rounded-secondary p-1 border">
                      <button
                        onClick={() => setViewMode("ecosystem")}
                        className={`px-3 sm:px-4 py-2 rounded-secondary text-xs sm:text-sm font-medium transition-all duration-300 ${
                          viewMode === "ecosystem" 
                            ? "bg-black text-white" 
                            : "text-gray-600 hover:text-black"
                        }`}
                      >
                        Ecosystem
                      </button>
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`px-3 sm:px-4 py-2 rounded-secondary text-xs sm:text-sm font-medium transition-all duration-300 ${
                          viewMode === "grid" 
                            ? "bg-black text-white" 
                            : "text-gray-600 hover:text-black"
                        }`}
                      >
                        <BsGrid3X3Gap className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Results Count */}
                  <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
                    {filteredBrands.length} brand{filteredBrands.length === 1 ? '' : 's'} found
                  </div>
                </div>
              </div>
            </div>

            {/* Brands Display */}
            <div 
              className={`transform transition-all duration-1000 delay-400 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              {filteredBrands.length > 0 ? (
                viewMode === "ecosystem" ? (
                  <EcosystemView brands={filteredBrands} onBrandClick={handleBrandClick} onCategoryClick={handleCategoryClick} />
                ) : (
                  <GridView brands={filteredBrands} onBrandClick={handleBrandClick} />
                )
              ) : (
                <div className="text-center py-20">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <BsBoxSeam className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-black mb-2">No brands found</h3>
                  <p className="text-slate-600">Try adjusting your search terms or filters.</p>
                </div>
              )}
            </div>

            {/* Call to Action */}
            {filteredBrands.length > 0 && (
              <div 
                className={`text-center mt-20 transform transition-all duration-1000 delay-600 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
              >
                <div 
                  className="bg-[#f8f0ea] rounded-primary p-8 text-black relative"
                  style={{ backgroundImage: "url(/assets/home/banner/dots.svg)" }}
                >
                  <h2 className="text-3xl font-bold mb-4">Discover More Amazing Brands</h2>
                  <p className="text-lg mb-6 text-slate-600">
                    Explore our complete product catalog and find your perfect match across all categories.
                  </p>
                  <button
                    onClick={() => router.push('/collections/all')}
                    className="px-8 py-4 border border-black rounded-secondary bg-black hover:bg-black/90 text-white transition-colors drop-shadow w-fit"
                  >
                    Browse All Products
                  </button>
                </div>
              </div>
            )}
          </div>
        </Container>
      </div>
    </Main>
  );
};

// Ecosystem View Component
const EcosystemView = ({ brands, onBrandClick, onCategoryClick }) => {
  return (
    <div className="space-y-12">
      {brands.map((brand, index) => (
        <div
          key={brand._id}
          className={`group bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-black hover:shadow-2xl transition-all duration-500 animate-fade-in-up`}
          style={{ animationDelay: `${index * 200}ms` }}
        >
          {/* Brand Header */}
          <div 
            className="p-4 sm:p-6 md:p-8 bg-gradient-to-r from-gray-50 to-white cursor-pointer"
            onClick={() => onBrandClick(brand._id)}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              {/* Brand Logo */}
              <div className="flex-shrink-0">
                <Image
                  src={brand?.logo?.url}
                  alt={brand?.title}
                  width={80}
                  height={80}
                  className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 object-cover rounded-lg border-2 border-white shadow-lg group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Brand Info */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black group-hover:text-black transition-colors duration-300">
                      {brand.title}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2 line-clamp-2">
                      {brand.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-black">{brand.totalProducts}</div>
                      <div className="text-slate-600">Products</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl md:text-2xl font-bold text-black">{brand.categories.length}</div>
                      <div className="text-slate-600">Categories</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Network */}
          {brand.categories.length > 0 && (
            <div className="p-4 sm:p-6 md:p-8 bg-white">
              <h3 className="text-sm sm:text-base md:text-lg font-semibold text-black mb-4 sm:mb-6 flex items-center">
                <BsGrid3X3Gap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Category Specializations
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {brand.categories.map((category, categoryIndex) => (
                  <div
                    key={category._id}
                    className="group/category bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-200 hover:border-black hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                    onClick={() => onCategoryClick(brand._id, category._id)}
                    style={{ animationDelay: `${categoryIndex * 100}ms` }}
                  >
                    <div className="flex items-center space-x-3">
                      <Image
                        src={category?.thumbnail?.url}
                        alt={category?.title}
                        width={40}
                        height={40}
                        className="w-10 h-10 object-cover rounded group-hover/category:scale-110 transition-transform duration-300"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-black group-hover/category:text-black transition-colors">
                          {category.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <BsBoxSeam className="w-3 h-3 text-indigo-500" />
                          <span className="text-xs text-indigo-500 font-medium">
                            {category.productCount} products
                          </span>
                        </div>
                      </div>
                      <div className="text-black group-hover/category:translate-x-1 transition-transform duration-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brand Tags */}
          {brand.tags && brand.tags.length > 0 && (
            <div className="px-8 pb-6">
              <div className="flex flex-wrap gap-2">
                {brand.tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="border text-xs px-2 py-1 rounded whitespace-nowrap bg-white hover:bg-gray-50 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Grid View Component
const GridView = ({ brands, onBrandClick }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
      {brands.map((brand, index) => (
        <div
          key={brand._id}
          className={`group bg-white border border-gray-200 rounded-lg p-3 sm:p-4 md:p-6 hover:border-black hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 animate-fade-in-up`}
          style={{ animationDelay: `${index * 100}ms` }}
          onClick={() => onBrandClick(brand._id)}
        >
          {/* Brand Image */}
          <div className="relative mb-3 sm:mb-4 md:mb-6 overflow-hidden rounded">
            <Image
              src={brand?.logo?.url}
              alt={brand?.title}
              width={200}
              height={150}
              className="w-full h-20 sm:h-24 md:h-32 object-cover group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          {/* Brand Info */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <div>
              <h3 className="text-sm sm:text-base md:text-xl font-bold text-black group-hover:text-black transition-colors duration-300 line-clamp-1">
                {brand?.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2 line-clamp-2">
                {brand?.description}
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 md:space-x-4 text-xs sm:text-sm gap-1 sm:gap-0">
                <div className="flex items-center space-x-1">
                  <BsBoxSeam className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500" />
                  <span className="text-indigo-500 font-medium">
                    {brand.totalProducts}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <BsGrid3X3Gap className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                  <span className="text-purple-500 font-medium">
                    {brand.categories.length}
                  </span>
                </div>
              </div>
              <div className="text-black group-hover:translate-x-1 transition-transform duration-300 hidden sm:block">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Top Categories */}
            {brand.categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {brand.categories.slice(0, 2).map((category, categoryIndex) => (
                  <span
                    key={categoryIndex}
                    className="border text-xs px-2 py-1 rounded whitespace-nowrap bg-gray-50"
                  >
                    {category.title}
                  </span>
                ))}
                {brand.categories.length > 2 && (
                  <span className="border text-xs px-2 py-1 rounded whitespace-nowrap text-gray-600">
                    +{brand.categories.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BrandsPage;
