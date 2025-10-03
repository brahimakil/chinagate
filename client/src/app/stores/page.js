/**
 * Title: Stores Marketplace Directory
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Main from "@/components/shared/layouts/Main";
import Container from "@/components/shared/Container";
import Image from "next/image";
import { useGetStoresQuery } from "@/services/store/storeApi";
import { useGetCategoriesQuery } from "@/services/category/categoryApi";
import { useGetProductsQuery } from "@/services/product/productApi";
import { BsBoxSeam, BsShop, BsStar, BsEye, BsHeart } from "react-icons/bs";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Niche from "@/components/shared/skeletonLoading/Niche";

const StoresPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("directory"); // directory, cards, list
  const [sortBy, setSortBy] = useState("popular");
  const [isVisible, setIsVisible] = useState(false);
  const [featuredStore, setFeaturedStore] = useState(null);
  const router = useRouter();

  const {
    data: storesData,
    error: storesError,
    isLoading: fetchingStores,
  } = useGetStoresQuery();

  const {
    data: categoriesData,
    isLoading: fetchingCategories,
  } = useGetCategoriesQuery();

  const {
    data: productsData,
    isLoading: fetchingProducts,
  } = useGetProductsQuery();

  const stores = useMemo(() => storesData?.data || [], [storesData]);
  const categories = useMemo(() => categoriesData?.data || [], [categoriesData]);
  const products = useMemo(() => productsData?.data || [], [productsData]);

  // Enhance stores with additional data
  const enhancedStores = useMemo(() => {
    return stores.map(store => {
      const storeProducts = products.filter(product => product.store?._id === store._id);
      const storeCategories = [...new Set(storeProducts.map(product => product.category?._id))];
      const rating = Math.random() * 2 + 3; // Mock rating between 3-5
      const reviews = Math.floor(Math.random() * 500) + 50; // Mock reviews
      const followers = Math.floor(Math.random() * 10000) + 100; // Mock followers
      
      return {
        ...store,
        productCount: storeProducts.length,
        categoryCount: storeCategories.length,
        rating: rating.toFixed(1),
        reviews,
        followers,
        isVerified: Math.random() > 0.3, // 70% chance of being verified
        isOnline: Math.random() > 0.2, // 80% chance of being online
      };
    });
  }, [stores, products]);

  // Filter and sort stores
  const filteredStores = useMemo(() => {
    let filtered = enhancedStores.filter((store) => {
      const matchesSearch = store.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (selectedCategory === "all") return matchesSearch;
      
      // Check if store has products in selected category
      const storeProducts = products.filter(product => product.store?._id === store._id);
      const hasCategory = storeProducts.some(product => product.category?._id === selectedCategory);
      
      return matchesSearch && hasCategory;
    });

    // Sort stores
    switch (sortBy) {
      case "popular":
        return filtered.sort((a, b) => b.followers - a.followers);
      case "rating":
        return filtered.sort((a, b) => b.rating - a.rating);
      case "products":
        return filtered.sort((a, b) => b.productCount - a.productCount);
      case "name":
        return filtered.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return filtered;
    }
  }, [enhancedStores, searchTerm, selectedCategory, products, sortBy]);

  useEffect(() => {
    if (storesError) {
      toast.error(storesError?.data?.description, {
        id: "stores-error",
      });
    }
  }, [storesError]);

  useEffect(() => {
    setIsVisible(true);
    // Set first store as featured by default
    if (filteredStores.length > 0 && !featuredStore) {
      setFeaturedStore(filteredStores[0]);
    }
  }, [filteredStores, featuredStore]);

  const handleStoreClick = (storeId) => {
    router.push(`/collections/all?store=${storeId}`);
  };

  if (fetchingStores || fetchingCategories || fetchingProducts) {
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
        <Container>
          <div className="py-20">
            {/* Header Section */}
            <div 
              className={`text-center mb-16 transform transition-all duration-1000 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <h1 className="text-5xl font-bold text-black mb-4">
                Store <span className="text-black">Directory</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Discover amazing stores, connect with sellers, and find your next favorite shop in our marketplace.
              </p>
              <div className="mt-8 w-24 h-1 bg-black mx-auto rounded-full"></div>
            </div>

            {/* Controls */}
            <div 
              className={`mb-12 transform transition-all duration-1000 delay-200 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              <div className="bg-white rounded-primary shadow-lg p-8 border border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Search */}
                  <div className="lg:col-span-1">
                    <input
                      type="text"
                      placeholder=" Search stores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-secondary bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300 text-center"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="lg:col-span-1">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-secondary px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="lg:col-span-1">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full border border-gray-300 rounded-secondary px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-300"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="rating">Highest Rated</option>
                      <option value="products">Most Products</option>
                      <option value="name">Name (A-Z)</option>
                    </select>
                  </div>

                  {/* View Mode */}
                  <div className="lg:col-span-1">
                    <div className="flex bg-gray-100 rounded-secondary p-1">
                      <button
                        onClick={() => setViewMode("directory")}
                        className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all duration-300 ${
                          viewMode === "directory" 
                            ? "bg-black text-white" 
                            : "text-gray-600 hover:text-black"
                        }`}
                      >
                        Directory
                      </button>
                      <button
                        onClick={() => setViewMode("cards")}
                        className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all duration-300 ${
                          viewMode === "cards" 
                            ? "bg-black text-white" 
                            : "text-gray-600 hover:text-black"
                        }`}
                      >
                        Cards
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-all duration-300 ${
                          viewMode === "list" 
                            ? "bg-black text-white" 
                            : "text-gray-600 hover:text-black"
                        }`}
                      >
                        List
                      </button>
                    </div>
                  </div>
                </div>

                {/* Results Info */}
                <div className="mt-4 text-center text-sm text-gray-600">
                  {filteredStores.length} store{filteredStores.length === 1 ? '' : 's'} found
                </div>
              </div>
            </div>

            {/* Stores Display */}
            <div 
              className={`transform transition-all duration-1000 delay-400 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              {filteredStores.length > 0 ? (
                <>
                  {viewMode === "directory" && (
                    <DirectoryView 
                      stores={filteredStores} 
                      featuredStore={featuredStore}
                      onStoreSelect={setFeaturedStore}
                      onStoreClick={handleStoreClick}
                    />
                  )}
                  {viewMode === "cards" && (
                    <CardsView stores={filteredStores} onStoreClick={handleStoreClick} />
                  )}
                  {viewMode === "list" && (
                    <ListView stores={filteredStores} onStoreClick={handleStoreClick} />
                  )}
                </>
              ) : (
                <div className="text-center py-20">
                  <div className="mx-auto w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                    <BsShop className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-black mb-2">No stores found</h3>
                  <p className="text-slate-600">Try adjusting your search terms or filters.</p>
                </div>
              )}
            </div>

            {/* CTA Section */}
            {filteredStores.length > 0 && (
              <div 
                className={`text-center mt-20 transform transition-all duration-1000 delay-600 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
              >
                <div 
                  className="bg-yellow-50 rounded-primary p-8 text-black relative"
                  style={{ backgroundImage: "url(/assets/home/banner/dots.svg)" }}
                >
                  <h2 className="text-3xl font-bold mb-4">Want to Open Your Own Store?</h2>
                  <p className="text-lg mb-6 text-slate-600">
                    Join our marketplace and start selling your products to thousands of customers worldwide.
                  </p>
                  <button
                    onClick={() => router.push('/auth/signup')}
                    className="px-8 py-4 border border-black rounded-secondary bg-black hover:bg-black/90 text-white transition-colors drop-shadow w-fit"
                  >
                    Start Selling Today
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

// Directory View - Split screen with store list and featured store
const DirectoryView = ({ stores, featuredStore, onStoreSelect, onStoreClick }) => {
  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Store List */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-primary shadow-lg p-6 max-h-[800px] overflow-y-auto">
          <h3 className="text-xl font-bold mb-6 flex items-center">
            <BsShop className="w-5 h-5 mr-2" />
            All Stores ({stores.length})
          </h3>
          <div className="space-y-4">
            {stores.map((store, index) => (
              <div
                key={store._id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                  featuredStore?._id === store._id 
                    ? "border-black bg-gray-50" 
                    : "border-gray-200 hover:border-gray-400"
                }`}
                onClick={() => onStoreSelect(store)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Image
                      src={store.thumbnail?.url}
                      alt={store.title}
                      width={48}
                      height={48}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    {store.isOnline && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-black truncate">{store.title}</h4>
                      {store.isVerified && (
                        <div className="text-blue-500">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                      <div className="flex items-center">
                        <BsStar className="w-3 h-3 text-yellow-500 mr-1" />
                        {store.rating}
                      </div>
                      <div>{store.productCount} products</div>
                      <div>{store.followers} followers</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Store */}
      <div className="lg:col-span-3">
        {featuredStore && (
          <div className="bg-white rounded-primary shadow-lg overflow-hidden">
            {/* Store Header */}
            <div className="relative h-48 bg-gradient-to-r from-gray-800 to-gray-600">
              <Image
                src={featuredStore.thumbnail?.url}
                alt={featuredStore.title}
                fill
                className="object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <div className="flex items-center space-x-3 mb-2">
                  <Image
                    src={featuredStore.thumbnail?.url}
                    alt={featuredStore.title}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded-lg border-2 border-white"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-2xl font-bold">{featuredStore.title}</h2>
                      {featuredStore.isVerified && (
                        <div className="text-blue-400">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {featuredStore.isOnline && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Online</span>
                      )}
                    </div>
                    <p className="text-gray-200 text-sm">{featuredStore.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Store Stats */}
            <div className="p-6">
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{featuredStore.productCount}</div>
                  <div className="text-sm text-gray-600">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{featuredStore.rating}</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{featuredStore.reviews}</div>
                  <div className="text-sm text-gray-600">Reviews</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-black">{featuredStore.followers}</div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => onStoreClick(featuredStore._id)}
                  className="flex-1 px-6 py-3 bg-black text-white rounded-secondary hover:bg-gray-800 transition-colors font-medium"
                >
                  <BsEye className="w-4 h-4 inline mr-2" />
                  Visit Store
                </button>
                <button className="px-6 py-3 border border-gray-300 rounded-secondary hover:bg-gray-50 transition-colors">
                  <BsHeart className="w-4 h-4" />
                </button>
              </div>

              {/* Store Tags */}
              {featuredStore.tags && featuredStore.tags.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Store Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {featuredStore.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Cards View - Traditional card grid
const CardsView = ({ stores, onStoreClick }) => {
  return (
    <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8">
      {stores.map((store, index) => (
        <div
          key={store._id}
          className={`bg-white rounded-primary shadow-lg overflow-hidden hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2 animate-fade-in-up`}
          style={{ animationDelay: `${index * 100}ms` }}
          onClick={() => onStoreClick(store._id)}
        >
          <div className="relative h-48">
            <Image
              src={store.thumbnail?.url}
              alt={store.title}
              fill
              className="object-cover"
            />
            <div className="absolute top-4 right-4 flex space-x-2">
              {store.isOnline && (
                <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">Online</span>
              )}
              {store.isVerified && (
                <div className="text-blue-500 bg-white rounded-full p-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <h3 className="text-xl font-bold text-black mb-2">{store.title}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{store.description}</p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <BsStar className="w-4 h-4 text-yellow-500 mr-1" />
                  {store.rating}
                </div>
                <div className="flex items-center">
                  <BsBoxSeam className="w-4 h-4 text-blue-500 mr-1" />
                  {store.productCount}
                </div>
              </div>
              <div className="text-sm text-gray-500">{store.followers} followers</div>
            </div>
            
            {store.tags && store.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {store.tags.slice(0, 2).map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
                {store.tags.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    +{store.tags.length - 2}
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

// List View - Detailed list format
const ListView = ({ stores, onStoreClick }) => {
  return (
    <div className="bg-white rounded-primary shadow-lg overflow-hidden">
      <div className="divide-y divide-gray-200">
        {stores.map((store, index) => (
          <div
            key={store._id}
            className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer animate-fade-in-up`}
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => onStoreClick(store._id)}
          >
            <div className="flex items-center space-x-6">
              <div className="relative flex-shrink-0">
                <Image
                  src={store.thumbnail?.url}
                  alt={store.title}
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                {store.isOnline && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-black">{store.title}</h3>
                      {store.isVerified && (
                        <div className="text-blue-500">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2 line-clamp-1">{store.description}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <BsStar className="w-4 h-4 text-yellow-500 mr-1" />
                        {store.rating} ({store.reviews} reviews)
                      </div>
                      <div className="flex items-center">
                        <BsBoxSeam className="w-4 h-4 text-blue-500 mr-1" />
                        {store.productCount} products
                      </div>
                      <div>{store.followers} followers</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {store.isOnline && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        Online
                      </span>
                    )}
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoresPage;
