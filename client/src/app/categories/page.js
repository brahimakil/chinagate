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
import { BsBoxSeam, BsSearch } from "react-icons/bs";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Niche from "@/components/shared/skeletonLoading/Niche";

const CategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: fetchingCategories,
  } = useGetCategoriesQuery();

  const {
    data: productsData,
    isLoading: fetchingProducts,
  } = useGetProductsQuery();

  const categories = useMemo(
    () => categoriesData?.data || [],
    [categoriesData]
  );

  const products = useMemo(() => productsData?.data || [], [productsData]);

  // Calculate product count for each category
  const categoriesWithProductCount = useMemo(() => {
    return categories.map(category => ({
      ...category,
      productCount: products.filter(product => product.category?._id === category._id).length
    }));
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
      toast.error(categoriesError?.data?.description, {
        id: "categories-error",
      });
    }
  }, [categoriesError]);

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleCategoryClick = (categoryId) => {
    router.push(`/collections/all?category=${categoryId}`);
  };

  return (
    <Main>
      <div className="min-h-screen bg-white">
        <Container>
          <div className="py-20">
            {/* Header Section */}
            <div 
              className={`text-center mb-16 transform transition-all duration-1000 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <h1 className="text-5xl font-bold text-black mb-4">
                Explore <span className="text-black">Categories</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Discover amazing products across all our categories. Find exactly what you're looking for.
              </p>
              <div className="mt-8 w-24 h-1 bg-black mx-auto rounded-full"></div>
            </div>

            {/* Search and Filter Section */}
            <div 
              className={`mb-12 transform transition-all duration-1000 delay-200 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="bg-neutral-100/70 rounded-primary shadow-lg p-8 border border-gray-100">
                <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                  {/* Search Bar */}
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder=" Search categories..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-secondary leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 text-center"
                    />
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700">Sort by:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 rounded-secondary px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
                    >
                      <option value="name">Name (A-Z)</option>
                      <option value="products">Most Products</option>
                      <option value="newest">Newest First</option>
                    </select>
                  </div>

                  {/* Results Count */}
                  <div className="text-sm text-gray-600">
                    {filteredAndSortedCategories.length} categor{filteredAndSortedCategories.length === 1 ? 'y' : 'ies'} found
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Grid */}
            <div 
              className={`transform transition-all duration-1000 delay-400 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              {fetchingCategories ? (
                <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((_, index) => (
                    <Niche key={index} />
                  ))}
                </div>
              ) : filteredAndSortedCategories.length > 0 ? (
                <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-8">
                  {filteredAndSortedCategories.map((category, index) => (
                    <div
                      key={category._id}
                      className={`group bg-white border border-gray-200 rounded-lg p-6 hover:border-black hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 animate-fade-in-up`}
                      style={{ animationDelay: `${index * 100}ms` }}
                      onClick={() => handleCategoryClick(category._id)}
                    >
                      {/* Category Image */}
                      <div className="relative mb-6 overflow-hidden rounded">
                        <Image
                          src={category?.thumbnail?.url}
                          alt={category?.title}
                          width={200}
                          height={150}
                          className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>

                      {/* Category Info */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-black group-hover:text-black transition-colors duration-300">
                            {category?.title}
                          </h3>
                          <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                            {category?.description}
                          </p>
                        </div>

                        {/* Product Count */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-indigo-500">
                            <BsBoxSeam className="w-4 h-4" />
                            <span className="text-sm font-medium group-hover:text-indigo-500">
                              {category?.productCount || 0} Products
                            </span>
                          </div>
                          <div className="text-black group-hover:translate-x-1 transition-transform duration-300">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>

                        {/* Tags */}
                        {category?.tags && category.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 overflow-x-auto scrollbar-hide">
                            {category.tags.slice(0, 3).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="border text-xs px-1 py-0.5 rounded whitespace-nowrap"
                              >
                                {tag}
                              </span>
                            ))}
                            {category.tags.length > 3 && (
                              <span className="border text-xs px-1 py-0.5 rounded whitespace-nowrap text-gray-600">
                                +{category.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Hover Effect Overlay */}
                      <div className="absolute inset-0 border-2 border-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <BsSearch className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-black mb-2">No categories found</h3>
                  <p className="text-slate-600">Try adjusting your search terms or filters.</p>
                </div>
              )}
            </div>

            {/* Call to Action */}
            {!fetchingCategories && filteredAndSortedCategories.length > 0 && (
              <div 
                className={`text-center mt-20 transform transition-all duration-1000 delay-600 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
              >
                <div 
                  className="bg-[#f8f0ea] rounded-primary p-8 text-black relative"
                  style={{ backgroundImage: "url(/assets/home/banner/dots.svg)" }}
                >
                  <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
                  <p className="text-lg mb-6 text-slate-600">
                    Explore all our products or contact us for personalized recommendations.
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

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </Main>
  );
};

export default CategoriesPage;
