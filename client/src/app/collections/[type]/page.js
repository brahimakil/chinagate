/**
 * Title: Dynamic Collections Filter Page - Redesigned
 * Author: China Gate Team  
 * Date: 27, September 2025
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Container from "@/components/shared/Container";
import Card from "@/components/shared/Card";
import { useGetProductsQuery } from "@/services/product/productApi";
import { useGetCategoriesQuery } from "@/services/category/categoryApi";
import { useGetBrandsQuery } from "@/services/brand/brandApi";
import ProductCard from "@/components/shared/skeletonLoading/ProductCard";
import { toast } from "react-hot-toast";
import Main from "@/components/shared/layouts/Main";

const CollectionPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { type } = params; // seasonal, featured, trending, best-sellers, all
  
  // Get URL parameters
  const categoryFilter = searchParams.get('category');
  const brandFilter = searchParams.get('brand'); 
  const storeFilter = searchParams.get('store');
  
  // State for filters
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedCustomSpecs, setSelectedCustomSpecs] = useState({});
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const [colorSearchTerm, setColorSearchTerm] = useState('');
  
  // API calls
  const { data: productsData, error: productsError, isLoading: productsLoading } = useGetProductsQuery();
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();

  const products = useMemo(() => productsData?.data || [], [productsData]);
  const categories = useMemo(() => categoriesData?.data || [], [categoriesData]);
  const brands = useMemo(() => brandsData?.data || [], [brandsData]);

  // Extract all unique colors from products
  const availableColors = useMemo(() => {
    const colorSet = new Set();
    const colorObjects = [];
    
    products.forEach(product => {
      // Check both colors array and variations.colors
      const productColors = product.colors || product.variations?.colors || [];
      
      productColors.forEach(color => {
        if (typeof color === 'string') {
          // Handle old string format
          if (!colorSet.has(color)) {
            colorSet.add(color);
            colorObjects.push({
              name: color,
              hex: '#000000', // Default color
              count: 1
            });
          }
        } else if (color && color.name) {
          // Handle new object format
          const colorKey = `${color.name}-${color.hex || '#000000'}`;
          if (!colorSet.has(colorKey)) {
            colorSet.add(colorKey);
            colorObjects.push({
              name: color.name,
              hex: color.hex || '#000000',
              theme: color.theme,
              group: color.group,
              count: 1
            });
          }
        }
      });
    });
    
    return colorObjects.sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  // Extract all unique custom specifications from products
  const availableCustomSpecs = useMemo(() => {
    const specsMap = new Map();
    
    products.forEach(product => {
      const customAttributes = product.variations?.customAttributes || [];
      
      customAttributes.forEach(attr => {
        if (attr && attr.name && attr.value) {
          const specName = attr.name;
          const specValue = `${attr.value}${attr.unit ? ` ${attr.unit}` : ''}`;
          
          if (!specsMap.has(specName)) {
            specsMap.set(specName, new Set());
          }
          specsMap.get(specName).add(specValue);
        }
      });
    });
    
    // Convert to array format
    const specsArray = [];
    specsMap.forEach((values, name) => {
      specsArray.push({
        name,
        values: Array.from(values).sort()
      });
    });
    
    return specsArray.sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  // Initialize filters from URL parameters
  useEffect(() => {
    console.log('=== URL PARAMETERS DEBUG ===');
    console.log('Category filter from URL:', categoryFilter);
    console.log('Brand filter from URL:', brandFilter);
    console.log('Store filter from URL:', storeFilter);
    
    const newSelectedCategories = [];
    const newSelectedBrands = [];
    
    if (categoryFilter) {
      newSelectedCategories.push(categoryFilter);
    }
    
    if (brandFilter) {
      newSelectedBrands.push(brandFilter);
    }
    
    console.log('Setting selected categories:', newSelectedCategories);
    console.log('Setting selected brands:', newSelectedBrands);
    
    setSelectedCategories(newSelectedCategories);
    setSelectedBrands(newSelectedBrands);
  }, [categoryFilter, brandFilter, storeFilter]);

  // Get collection info
  const getCollectionInfo = () => {
    // If we have URL filters, customize the title
    if (categoryFilter || brandFilter || storeFilter) {
      const categoryName = categories.find(cat => cat._id === categoryFilter)?.title;
      const brandName = brands.find(brand => brand._id === brandFilter)?.title;
      
      let title = 'Filtered Products';
      let subtitle = 'Custom Selection';
      
      if (categoryName && brandName) {
        title = `${brandName} in ${categoryName}`;
        subtitle = 'Brand & Category Filter';
      } else if (categoryName) {
        title = `${categoryName} Products`;
        subtitle = 'Category Collection';
      } else if (brandName) {
        title = `${brandName} Products`;
        subtitle = 'Brand Collection';
      }
      
      return {
        title,
        subtitle,
        description: 'Products filtered based on your selection.',
        icon: '🎯',
        badge: 'FILTERED',
        accentColor: 'purple'
      };
    }

    switch (type) {
      case 'seasonal':
        return {
          title: 'Seasonal Collection',
          subtitle: 'Perfect Products for Every Season',
          description: 'Discover products curated for the current season and weather.',
          icon: '🌍',
          badge: 'SEASONAL',
          accentColor: 'slate'
        };
      case 'featured':
        return {
          title: 'Featured Products',
          subtitle: 'Handpicked Premium Selection',
          description: 'Our carefully selected featured products that stand out.',
          icon: '⭐',
          badge: 'FEATURED',
          accentColor: 'blue'
        };
      case 'trending':
        return {
          title: 'Trending Products',
          subtitle: 'What\'s Hot Right Now',
          description: 'The most popular products that everyone is talking about.',
          icon: '🔥',
          badge: 'TRENDING',
          accentColor: 'green'
        };
      case 'best-sellers':
        return {
          title: 'Best Sellers',
          subtitle: 'Top Performing Products',
          description: 'Our highest-rated and most purchased products.',
          icon: '🏆',
          badge: 'BEST SELLERS',
          accentColor: 'red'
        };
      case 'all':
      default:
        return {
          title: 'All Products',
          subtitle: 'Complete Collection',
          description: 'Browse our entire product catalog.',
          icon: '📦',
          badge: 'ALL PRODUCTS',
          accentColor: 'gray'
        };
    }
  };

  // Filter products based on type and filters
  const filteredProducts = useMemo(() => {
    console.log('=== FILTERING DEBUG ===');
    console.log('Total products:', products.length);
    console.log('Selected categories:', selectedCategories);
    console.log('Selected brands:', selectedBrands);
    console.log('Selected colors:', selectedColors);
    console.log('Selected custom specs:', selectedCustomSpecs);
    
    let filtered = products.filter(product => {
      // Skip hidden products
      if (product.isHidden) return false;

      // Filter by collection type
      switch (type) {
        case 'seasonal':
          const savedSeasons = typeof window !== 'undefined' ? localStorage.getItem('homePageSeasons') : null;
          const selectedSeasons = savedSeasons ? JSON.parse(savedSeasons) : ['winter'];
          
          if (Array.isArray(product.season)) {
            return product.season.some(productSeason => selectedSeasons.includes(productSeason));
          } else {
            return selectedSeasons.includes(product.season) || product.season === "all-season";
          }
          
        case 'featured':
          if (Array.isArray(product.productStatus)) {
            return product.productStatus.includes("featured");
          } else {
            return product.productStatus === "featured";
          }
          
        case 'trending':
          if (Array.isArray(product.productStatus)) {
            return product.productStatus.includes("trending");
          } else {
            return product.productStatus === "trending";
          }
          
        case 'best-sellers':
          if (Array.isArray(product.productStatus)) {
            return product.productStatus.includes("best-seller");
          } else {
            return product.productStatus === "best-seller";
          }
          
        case 'all':
        default:
          return true;
      }
    });

    console.log('After collection type filter:', filtered.length);

    // Apply URL parameter filters (these take precedence)
    if (categoryFilter) {
      filtered = filtered.filter(product => product.category?._id === categoryFilter);
      console.log('After URL category filter:', filtered.length);
    }
    
    if (brandFilter) {
      filtered = filtered.filter(product => product.brand?._id === brandFilter);
      console.log('After URL brand filter:', filtered.length);
    }
    
    if (storeFilter) {
      filtered = filtered.filter(product => product.store?._id === storeFilter);
      console.log('After URL store filter:', filtered.length);
    }

    // Apply additional sidebar filters (only if no URL filters)
    if (!categoryFilter && selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.includes(product.category?._id)
      );
      console.log('After sidebar category filter:', filtered.length);
    }

    if (!brandFilter && selectedBrands.length > 0) {
      filtered = filtered.filter(product => 
        selectedBrands.includes(product.brand?._id)
      );
      console.log('After sidebar brand filter:', filtered.length);
    }

    // Apply color filter
    if (selectedColors.length > 0) {
      filtered = filtered.filter(product => {
        const productColors = product.colors || product.variations?.colors || [];
        return selectedColors.some(selectedColor => {
          return productColors.some(productColor => {
            if (typeof productColor === 'string') {
              return productColor === selectedColor;
            } else if (productColor && productColor.name) {
              return productColor.name === selectedColor;
            }
            return false;
          });
        });
      });
      console.log('After color filter:', filtered.length);
    }

    // Apply custom specifications filter
    if (Object.keys(selectedCustomSpecs).length > 0) {
      filtered = filtered.filter(product => {
        const customAttributes = product.variations?.customAttributes || [];
        
        return Object.entries(selectedCustomSpecs).every(([specName, selectedValues]) => {
          if (selectedValues.length === 0) return true;
          
          return selectedValues.some(selectedValue => {
            return customAttributes.some(attr => {
              if (attr && attr.name === specName) {
                const attrValue = `${attr.value}${attr.unit ? ` ${attr.unit}` : ''}`;
                return attrValue === selectedValue;
              }
              return false;
            });
          });
        });
      });
      console.log('After custom specs filter:', filtered.length);
    }

    // Apply price filter
    filtered = filtered.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    );
    console.log('After price filter:', filtered.length);

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    console.log('Final filtered products:', filtered.length);
    return filtered;
  }, [products, type, categoryFilter, brandFilter, storeFilter, selectedCategories, selectedBrands, selectedColors, selectedCustomSpecs, priceRange, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle filter changes
  const handleCategoryChange = (categoryId) => {
    if (categoryFilter) return;
    
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
    setCurrentPage(1);
  };

  const handleBrandChange = (brandId) => {
    if (brandFilter) return;
    
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
    setCurrentPage(1);
  };

  const handleColorChange = (colorName) => {
    setSelectedColors(prev => 
      prev.includes(colorName) 
        ? prev.filter(color => color !== colorName)
        : [...prev, colorName]
    );
    setCurrentPage(1);
  };

  const handleCustomSpecChange = (specName, specValue) => {
    setSelectedCustomSpecs(prev => {
      const newSpecs = { ...prev };
      
      if (!newSpecs[specName]) {
        newSpecs[specName] = [];
      }
      
      if (newSpecs[specName].includes(specValue)) {
        newSpecs[specName] = newSpecs[specName].filter(value => value !== specValue);
        if (newSpecs[specName].length === 0) {
          delete newSpecs[specName];
        }
      } else {
        newSpecs[specName] = [...newSpecs[specName], specValue];
      }
      
      return newSpecs;
    });
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    router.push(`/collections/${type}`);
    setSelectedColors([]);
    setSelectedCustomSpecs({});
    setColorSearchTerm('');
  };

  const collectionInfo = getCollectionInfo();

  useEffect(() => {
    if (productsError) {
      toast.error(productsError?.data?.description, {
        id: "collection-products",
      });
    }
  }, [productsError]);

  return (
    <Main>
      <div className="min-h-screen">
        {/* Beautiful Hero Section - Same as before */}
        <div className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)] bg-[radial-gradient(circle_at_70%_80%,rgba(120,119,198,0.08),transparent_50%)]"></div>
          
          <div className="absolute top-10 left-10 w-20 h-20 bg-slate-200/30 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-gray-300/20 rounded-full blur-lg animate-bounce"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-slate-300/25 rounded-full blur-md animate-pulse delay-1000"></div>

          <Container>
            <div className="relative text-center">
              <div className="inline-flex items-center space-x-3 px-8 py-4 bg-black/90 backdrop-blur-sm rounded-full text-sm font-bold mb-8 shadow-xl border border-white/10">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                <span className="text-white tracking-wider">{collectionInfo.badge}</span>
              </div>

              <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                {collectionInfo.icon} <span className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 bg-clip-text text-transparent">{collectionInfo.title}</span>
              </h1>
              
              <p className="text-2xl text-slate-600 mb-4 font-light">{collectionInfo.subtitle}</p>
              <p className="text-lg text-slate-500 max-w-3xl mx-auto mb-12 leading-relaxed">{collectionInfo.description}</p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="bg-white/80 backdrop-blur-sm px-8 py-4 rounded-full shadow-lg border border-white/20">
                  <span className="text-2xl font-bold text-gray-900">{filteredProducts.length}</span>
                  <span className="text-slate-600 ml-2">Products Available</span>
                </div>
                
                <button
                  onClick={() => router.push('/')}
                  className="group bg-white/90 backdrop-blur-sm text-gray-900 px-8 py-4 rounded-full hover:bg-white transition-all duration-300 shadow-lg border border-white/20 font-medium"
                >
                  <span className="group-hover:-translate-x-1 transition-transform duration-300 inline-block">←</span>
                  <span className="ml-2">Back to Home</span>
                </button>
              </div>

              {/* Active Filters Display */}
              {(categoryFilter || brandFilter || storeFilter || selectedColors.length > 0 || Object.keys(selectedCustomSpecs).length > 0) && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <span className="text-sm text-slate-600">Active filters:</span>
                  {categoryFilter && (
                    <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                      📂 {categories.find(cat => cat._id === categoryFilter)?.title || 'Category'}
                    </span>
                  )}
                  {brandFilter && (
                    <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                      🏷️ {brands.find(brand => brand._id === brandFilter)?.title || 'Brand'}
                    </span>
                  )}
                  {selectedColors.map(color => (
                    <span key={color} className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                      🎨 {color}
                    </span>
                  ))}
                  {Object.entries(selectedCustomSpecs).map(([specName, values]) => 
                    values.map(value => (
                      <span key={`${specName}-${value}`} className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                        🔧 {specName}: {value}
                      </span>
                    ))
                  )}
                  <button
                    onClick={clearAllFilters}
                    className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    ✕ Clear Filters
                  </button>
                </div>
              )}
            </div>
          </Container>
        </div>

        <Container className="pb-20">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Enhanced Filters Sidebar */}
            <div className="lg:w-1/4">
              <div className="lg:hidden mb-6">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full bg-white/90 backdrop-blur-sm text-gray-900 px-6 py-4 rounded-2xl shadow-lg border border-white/20 font-medium flex items-center justify-between"
                >
                  <span>🔍 Filters & Sort</span>
                  <span className={`transform transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>
              </div>

              <div className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 sticky top-6 ${showFilters || 'max-lg:hidden'}`}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="mr-3">🎛️</span>
                    Filters
                  </h3>
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-red-500 hover:text-red-700 transition-colors bg-red-50 px-4 py-2 rounded-full hover:bg-red-100"
                  >
                    Clear All
                  </button>
                </div>

                {/* Sort By */}
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">📊</span>
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-4 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-300 text-gray-900 shadow-sm"
                  >
                    <option value="newest">✨ Newest First</option>
                    <option value="price-low">💰 Price: Low to High</option>
                    <option value="price-high">💎 Price: High to Low</option>
                    <option value="name">🔤 Name: A to Z</option>
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-8">
                  <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center">
                    <span className="mr-2">💵</span>
                    Price Range
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          placeholder="Min Price"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                          className="w-full p-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                      <span className="text-slate-500 font-medium">to</span>
                      <div className="flex-1">
                        <input
                          type="number"
                          placeholder="Max Price"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                          className="w-full p-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Colors Filter - WITH SEARCH BAR */}
                {availableColors.length > 0 && (
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">🎨</span>
                      Colors ({availableColors.filter(color => 
                        color.name.toLowerCase().includes(colorSearchTerm.toLowerCase())
                      ).length})
                    </label>
                    
                    {/* Color Search Bar */}
                    <div className="relative mb-4">
                      <input
                        type="text"
                        placeholder="Search colors..."
                        value={colorSearchTerm}
                        onChange={(e) => setColorSearchTerm(e.target.value)}
                        className="w-full p-3 pl-10 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl text-sm focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-300"
                      />
                     
                      {colorSearchTerm && (
                        <button
                          onClick={() => setColorSearchTerm('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 max-h-64 overflow-y-auto custom-scrollbar p-2">
                      {availableColors
                        .filter(color => 
                          color.name.toLowerCase().includes(colorSearchTerm.toLowerCase())
                        )
                        .map((color, index) => (
                        <button
                          key={`${color.name}-${index}`}
                          onClick={() => handleColorChange(color.name)}
                          className={`relative flex flex-col items-center p-4 rounded-2xl transition-all duration-300 border-2 ${
                            selectedColors.includes(color.name) 
                              ? 'border-slate-600 bg-slate-50 shadow-lg' 
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                          title={color.name}
                        >
                          {/* Color Circle */}
                          <div 
                            className="w-12 h-12 rounded-full shadow-lg border-4 border-white mb-3 flex-shrink-0"
                            style={{ 
                              backgroundColor: color.hex && color.hex.startsWith('#') ? color.hex : '#' + (color.hex || '000000').replace('#', ''),
                              boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)'
                            }}
                          ></div>
                          
                          {/* Color Name */}
                          <span className="text-xs font-medium text-gray-800 text-center leading-tight max-w-full break-words">
                            {color.name}
                          </span>
                          
                          {/* Selected Indicator */}
                          {selectedColors.includes(color.name) && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-slate-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg">
                              ✓
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* No Colors Found Message */}
                    {availableColors.filter(color => 
                      color.name.toLowerCase().includes(colorSearchTerm.toLowerCase())
                    ).length === 0 && colorSearchTerm && (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-2xl mb-2">🎨</div>
                        <p className="text-sm">No colors found matching "{colorSearchTerm}"</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Custom Specifications Filter */}
                {availableCustomSpecs.length > 0 && (
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">🔧</span>
                      Specifications
                    </label>
                    <div className="space-y-6 max-h-96 overflow-y-auto custom-scrollbar">
                      {availableCustomSpecs.map((spec) => (
                        <div key={spec.name} className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-800 flex items-center">
                            <span className="w-2 h-2 bg-slate-400 rounded-full mr-2"></span>
                            {spec.name}
                          </h4>
                          <div className="pl-4 space-y-2">
                            {spec.values.map((value) => (
                              <label key={`${spec.name}-${value}`} className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50/80 p-2 rounded-lg transition-all duration-300 group">
                                <input
                                  type="checkbox"
                                  checked={selectedCustomSpecs[spec.name]?.includes(value) || false}
                                  onChange={() => handleCustomSpecChange(spec.name, value)}
                                  className="rounded text-slate-600 focus:ring-slate-500 w-4 h-4"
                                />
                                <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors font-medium">
                                  {value}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Categories Filter */}
                {!categoryFilter && (
                  <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">📂</span>
                      Categories
                    </label>
                    <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                      {categories.map((category) => (
                        <label key={category._id} className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50/80 p-3 rounded-xl transition-all duration-300 group">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(category._id)}
                            onChange={() => handleCategoryChange(category._id)}
                            className="rounded-lg text-slate-600 focus:ring-slate-500 w-5 h-5"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors font-medium">{category.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Brands Filter */}
                {!brandFilter && (
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center">
                      <span className="mr-2">🏷️</span>
                      Brands
                    </label>
                    <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                      {brands.map((brand) => (
                        <label key={brand._id} className="flex items-center space-x-3 cursor-pointer hover:bg-slate-50/80 p-3 rounded-xl transition-all duration-300 group">
                          <input
                            type="checkbox"
                            checked={selectedBrands.includes(brand._id)}
                            onChange={() => handleBrandChange(brand._id)}
                            className="rounded-lg text-slate-600 focus:ring-slate-500 w-5 h-5"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors font-medium">{brand.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Products Section - Same as before */}
            <div className="lg:w-3/4">
              {/* Results Header */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8 mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      {filteredProducts.length} Products Found
                    </h2>
                    <p className="text-slate-600">
                      Showing <span className="font-semibold">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredProducts.length)}</span> - <span className="font-semibold">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> of <span className="font-semibold">{filteredProducts.length}</span> results
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="bg-slate-100 p-1 rounded-xl">
                      <button className="bg-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-gray-900">
                        🔲 Grid
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 mb-12">
                {productsLoading ? (
                  <>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((_, index) => (
                      <div key={index} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden">
                        <ProductCard />
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {paginatedProducts.map((product) => (
                      <div key={product._id} className="transform hover:scale-105 transition-all duration-300">
                        <Card product={product} />
                      </div>
                    ))}
                  </>
                )}
              </div>

              {/* No Products State */}
              {!productsLoading && filteredProducts.length === 0 && (
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-16 text-center">
                  <div className="text-8xl mb-6">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No products found</h3>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto">
                    We couldn't find any products matching your current filters. Try adjusting your search criteria or browse our other collections.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={clearAllFilters}
                      className="bg-black text-white px-8 py-4 rounded-2xl hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg"
                    >
                      Clear All Filters
                    </button>
                    <button
                      onClick={() => router.push('/')}
                      className="bg-white text-gray-900 px-8 py-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-medium shadow-lg border border-gray-200"
                    >
                      Browse All Products
                    </button>
                  </div>
                </div>
              )}

              {/* Pagination - Same as before */}
              {totalPages > 1 && (
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-6 py-3 rounded-2xl transition-all duration-300 font-medium ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200 hover:shadow-md'
                      }`}
                    >
                      ← Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-4 py-3 rounded-2xl transition-all duration-300 font-medium min-w-[3rem] ${
                              currentPage === pageNum
                                ? 'bg-black text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200 hover:shadow-md'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return <span key={pageNum} className="px-2 text-slate-400 font-medium">...</span>;
                      }
                      return null;
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-6 py-3 rounded-2xl transition-all duration-300 font-medium ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200 hover:shadow-md'
                      }`}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Custom Scrollbar & Line Clamp Styles */}
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.5) transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(148, 163, 184, 0.5);
          border-radius: 20px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(148, 163, 184, 0.8);
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </Main>
  );
};

export default CollectionPage;
