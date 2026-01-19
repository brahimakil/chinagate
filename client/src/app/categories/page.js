/**
 * Title: Categories Page
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Main from "@/components/shared/layouts/Main";
import Container from "@/components/shared/Container";
import Image from "next/image";
import { useGetCategoriesQuery } from "@/services/category/categoryApi";
import { useGetProductsQuery } from "@/services/product/productApi";
import { useGetSystemSettingsQuery } from "@/services/system/systemApi";
import { BsBoxSeam, BsSearch } from "react-icons/bs";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Niche from "@/components/shared/skeletonLoading/Niche";

const CategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const { data: categoriesData, error: categoriesError, isLoading: fetchingCategories } = useGetCategoriesQuery();
  const { data: productsData, isLoading: fetchingProducts } = useGetProductsQuery();
  const { data: settingsData } = useGetSystemSettingsQuery();

  const categories = useMemo(() => categoriesData?.data || [], [categoriesData]);
  const products = useMemo(() => productsData?.data || [], [productsData]);
  const banner = settingsData?.data?.categoriesPageBanner;

  // 🔍 DEBUG: Check products data
  console.log('📦 Products API data:', {
    totalProducts: products.length,
    productIds: products.map(p => ({ id: p._id, title: p.title, category: p.category?.title, isHidden: p.isHidden }))
  });

  // Calculate product count for each category (only visible, non-hidden products)
  const categoriesWithProductCount = useMemo(() => {
    console.log('🔢 Calculating counts...');
    return categories.map(category => {
      const visibleProducts = products.filter(product => 
        product.category?._id === category._id && 
        !product.isHidden // Exclude hidden products
      );
      
      console.log(`Category "${category.title}" (${category._id}):`, {
        count: visibleProducts.length,
        products: visibleProducts.map(p => p.title)
      });
      
      return {
        ...category,
        productCount: visibleProducts.length
      };
    });
  }, [categories, products]);

  // Filter and sort categories
  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categoriesWithProductCount.filter((category) =>
      category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    switch (sortBy) {
      case "name":
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      case "products":
        return filtered.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
      case "newest":
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return filtered;
    }
  }, [categoriesWithProductCount, searchTerm, sortBy]);

  useEffect(() => {
    if (categoriesError) {
      toast.error(categoriesError?.data?.description, { id: "categories-error" });
    }
  }, [categoriesError]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleCategoryClick = (categoryId) => {
    router.push(`/collections/all?category=${categoryId}`);
  };

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
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.1),transparent_50%)]"></div>
              </>
            )}
            <div className="absolute inset-0" style={{ backgroundColor: banner.overlayColor || 'rgba(0, 0, 0, 0.5)' }}></div>
            {!banner.image?.url && (
              <>
                <div className="absolute top-10 left-10 w-20 h-20 bg-purple-200/30 rounded-full blur-xl animate-pulse hidden sm:block"></div>
                <div className="absolute top-32 right-20 w-16 h-16 bg-pink-300/20 rounded-full blur-lg animate-bounce hidden sm:block"></div>
              </>
            )}
            <Container>
              <div className="relative text-center z-10 px-2">
                <div className="inline-flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 bg-black/90 backdrop-blur-sm rounded-full text-[10px] sm:text-xs md:text-sm font-bold mb-4 sm:mb-6 md:mb-8 shadow-xl border border-white/10" style={{ color: '#FFFFFF' }}>
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"></span>
                  <span className="tracking-wider">{banner.badge || "SHOP BY CATEGORY"}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-2 sm:mb-4 md:mb-6 leading-tight px-2 sm:px-4" style={{ color: banner.textColor || '#111827' }}>
                  {banner.title || "📂 Browse Categories"}
                </h1>
                <p className="text-sm sm:text-base md:text-xl lg:text-2xl mb-1 sm:mb-2 md:mb-4 font-light px-2 sm:px-4 opacity-90" style={{ color: banner.textColor || '#64748b' }}>
                  {banner.subtitle || "Explore Our Product Categories"}
                </p>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg max-w-3xl mx-auto mb-4 sm:mb-6 md:mb-10 lg:mb-12 leading-relaxed px-2 sm:px-4 opacity-80" style={{ color: banner.textColor || '#64748b' }}>
                  {banner.description || "Find exactly what you're looking for"}
                </p>
              </div>
            </Container>
          </div>
        )}

        <Container>
          <div className="py-6 sm:py-8 md:py-12">
            {/* Search and Sort */}
            <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-12 transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="relative flex-1">
                <BsSearch className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="products">Sort by Products</option>
                <option value="newest">Sort by Newest</option>
              </select>
            </div>

            {/* Categories Grid */}
            {fetchingCategories || fetchingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {[...Array(8)].map((_, i) => <Niche key={i} />)}
              </div>
            ) : filteredAndSortedCategories.length === 0 ? (
              <div className="text-center py-12 sm:py-20">
                <BsBoxSeam className="text-4xl sm:text-6xl text-gray-300 mx-auto mb-4" />
                <p className="text-lg sm:text-xl text-gray-500">No categories found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {filteredAndSortedCategories.map((category, index) => {
                  const count = category.productCount || 0;
                  console.log(`🎨 Rendering "${category.title}": count = ${count}`);
                  return (
                  <div
                    key={`cat-${category._id}-count-${count}-${Date.now()}`}
                    onClick={() => handleCategoryClick(category._id)}
                    className={`group cursor-pointer bg-white rounded-lg sm:rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <div className="relative h-32 sm:h-40 md:h-48 overflow-hidden">
                      <Image
                        src={category.thumbnail?.url}
                        alt={category.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4 text-white">
                        <h3 className="text-sm sm:text-base md:text-xl font-bold line-clamp-1">{category.title}</h3>
                        <p className="text-xs sm:text-sm opacity-90">{count} Product{count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="p-2 sm:p-3 md:p-4">
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{category.description}</p>
                    </div>
                  </div>
                )})}

              </div>
            )}
          </div>
        </Container>
      </div>
    </Main>
  );
};

export default CategoriesPage;
