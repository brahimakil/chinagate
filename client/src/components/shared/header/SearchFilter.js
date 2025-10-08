/**
 * Title: Professional Search Filter Component
 * Redesigned for Better UX
 */

import Search from "@/components/icons/Search";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useGetProductsQuery } from "@/services/product/productApi";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Inform from "@/components/icons/Inform";

const SearchFilter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchRef = useRef(null);
  const {
    data: productsData,
    error: productsError,
    isLoading: productsLoading,
  } = useGetProductsQuery();
  const products = useMemo(() => productsData?.data || [], [productsData]);
  const router = useRouter();

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (productsError) {
      toast.error(productsError?.data?.description, { id: "search-filter" });
    }
  }, [productsError]);

  const handleSearch = (event) => {
    setSearchTerm(event?.target?.value?.toLowerCase());
  };

  const filteredProducts = searchTerm?.length
    ? products.filter(({ title, summary, brand, category }) => {
        const lowerTitle = title?.toLowerCase();
        const lowerSummary = summary?.toLowerCase();
        const lowerBrand = brand?.title?.toLowerCase();
        const lowerCategory = category?.title?.toLowerCase();

        return (
          lowerTitle?.includes(searchTerm) || 
          lowerSummary?.includes(searchTerm) ||
          lowerBrand?.includes(searchTerm) ||
          lowerCategory?.includes(searchTerm)
        );
      })
    : [];

  const highlightMatch = (text, keyword) => {
    if (!keyword || !text) return text;

    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/gi, "\\$&");
    const regex = new RegExp(`(${escapedKeyword})`, "gi");
    
    return text.replace(regex, '<mark class="bg-yellow-200 text-black px-0.5">$1</mark>');
  };

  const handleProductClick = (product) => {
    router.push(
      `/product?product_id=${product?._id}&product_title=${product?.title
        .replace(/ /g, "-")
        .toLowerCase()}`
    );
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Search Input with Icon on Left */}
      <div className="flex items-center gap-2">
        {/* Search Icon - Outside */}
        <div className="flex-shrink-0">
          <Search className="h-5 w-5 text-gray-600" />
        </div>
        
        {/* Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            onFocus={() => setIsOpen(true)}
            className="w-64 lg:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          
          {/* Clear button */}
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full lg:w-[32rem] right-0 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[32rem] overflow-hidden z-[100]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">
                {searchTerm ? (
                  <>
                    {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} for "<span className="text-blue-600">{searchTerm}</span>"
                  </>
                ) : (
                  "Start typing to search..."
                )}
              </p>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="overflow-y-auto max-h-[28rem] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {!searchTerm ? (
              <div className="px-4 py-12 text-center">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Type to search for products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <Inform className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-900 font-medium mb-1">No products found</p>
                <p className="text-xs text-gray-500">Try different keywords or check spelling</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredProducts.slice(0, 20).map((product) => (
                  <div
                    key={product?._id}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors group"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <Image
                          src={product?.thumbnail?.url}
                          alt={product?.title}
                          width={60}
                          height={60}
                          className="rounded-lg h-16 w-16 object-cover border border-gray-200 group-hover:border-blue-300 transition-colors"
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-1 line-clamp-1"
                          dangerouslySetInnerHTML={{
                            __html: highlightMatch(product?.title, searchTerm),
                          }}
                        />
                        <p
                          className="text-xs text-gray-600 line-clamp-2 mb-2"
                          dangerouslySetInnerHTML={{
                            __html: highlightMatch(product?.summary, searchTerm),
                          }}
                        />
                        
                        {/* Tags and Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {product?.brand && (
                              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                {product?.brand?.title}
                              </span>
                            )}
                            {product?.category && (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                {product?.category?.title}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-bold text-gray-900">
                            ${product?.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - View All Results */}
          {filteredProducts.length > 20 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  router.push(`/collections/all?search=${encodeURIComponent(searchTerm)}`);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View all {filteredProducts.length} results →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
