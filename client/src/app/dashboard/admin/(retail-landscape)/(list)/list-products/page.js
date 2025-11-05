/**
 * Title: Write a program using JavaScript on Page
 * Author: Hasibul Islam
 * Portfolio: https://devhasibulislam.vercel.app
 * Linkedin: https://linkedin.com/in/devhasibulislam
 * GitHub: https://github.com/devhasibulislam
 * Facebook: https://facebook.com/devhasibulislam
 * Instagram: https://instagram.com/devhasibulislam
 * Twitter: https://twitter.com/devhasibulislam
 * Pinterest: https://pinterest.com/devhasibulislam
 * WhatsApp: https://wa.me/8801906315901
 * Telegram: devhasibulislam
 * Date: 10, November 2023
 */

"use client";

import DemoteProduct from "@/components/dashboard/DemoteProduct";
import Inform from "@/components/icons/Inform";
import Pencil from "@/components/icons/Pencil";
import Trash from "@/components/icons/Trash";
import User from "@/components/icons/User";
import Modal from "@/components/shared/Modal";
import Dashboard from "@/components/shared/layouts/Dashboard";
import DashboardLading from "@/components/shared/skeletonLoading/DashboardLading";
import { setProduct, setProducts } from "@/features/product/productSlice";
import {
  useDeleteProductMutation,
  useGetProductsQuery,
} from "@/services/product/productApi";
import { useRemoveReviewMutation } from "@/services/review/reviewApi";
import { useGetCategoriesQuery } from "@/services/category/categoryApi";
import { useGetBrandsQuery } from "@/services/brand/brandApi";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";

const ListProducts = () => {
  const {
    data: productsData,
    error: productsError,
    isLoading: productsLoading,
  } = useGetProductsQuery();
  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: brandsData } = useGetBrandsQuery();
  
  const products = useMemo(() => productsData?.data || [], [productsData]);
  const categories = useMemo(() => categoriesData?.data || [], [categoriesData]);
  const brands = useMemo(() => brandsData?.data || [], [brandsData]);
  const dispatch = useDispatch();

  // Search and Pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (productsLoading) {
      toast.loading("Fetching Products...", { id: "productsData" });
    }

    if (productsData) {
      toast.success(productsData?.description, { id: "productsData" });
    }

    if (productsError) {
      toast.error(productsError?.data?.description, { id: "productsData" });
    }

    dispatch(setProducts(products));
  }, [productsError, productsData, productsLoading, dispatch, products]);

  // Filter products based on search query, category, and brand
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.title?.toLowerCase().includes(query) ||
        product.category?.title?.toLowerCase().includes(query) ||
        product.brand?.title?.toLowerCase().includes(query) ||
        product.store?.title?.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category?._id === selectedCategory);
    }
    
    // Apply brand filter
    if (selectedBrand) {
      filtered = filtered.filter(product => product.brand?._id === selectedBrand);
    }
    
    return filtered;
  }, [products, searchQuery, selectedCategory, selectedBrand]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedBrand]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedBrand("");
  };

  const hasActiveFilters = searchQuery || selectedCategory || selectedBrand;

  return (
    <Dashboard>
      <section className="w-full h-full space-y-4">
        {/* Header with Add Product Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Products List</h1>
            <p className="text-sm text-gray-600 mt-1">Manage all products in your store</p>
          </div>
          <Link
            href="/dashboard/admin/add-product"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search by title, category, brand, or store..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  title="Clear search"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="w-full lg:w-56">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div className="w-full lg:w-56">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand._id} value={brand._id}>
                    {brand.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
            <div>
              Showing <span className="font-semibold">{currentProducts.length}</span> of <span className="font-semibold">{filteredProducts.length}</span> products
              {hasActiveFilters && <span className="text-blue-600"> (filtered from {products.length} total)</span>}
            </div>
            {hasActiveFilters && (
              <div className="flex gap-2 flex-wrap">
                {searchQuery && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    Search: "{searchQuery}"
                  </span>
                )}
                {selectedCategory && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                    {categories.find(c => c._id === selectedCategory)?.title}
                  </span>
                )}
                {selectedBrand && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    {brands.find(b => b._id === selectedBrand)?.title}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {filteredProducts?.length === 0 ? (
          <p className="text-sm flex flex-row gap-x-1 items-center justify-center py-8">
            <Inform /> {searchQuery ? `No products found matching "${searchQuery}"` : 'No Products Found!'}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-100">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap"
                  >
                    Thumbnail
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap"
                  >
                    Price ($)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap"
                  >
                    Gallery
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap"
                  >
                    Brand
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap"
                  >
                    Store
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase whitespace-nowrap"
                  >
                    Buyers
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase whitespace-nowrap"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.map((product) => (
                  <tr
                    key={product?._id}
                    className="odd:bg-white even:bg-gray-100 hover:odd:bg-gray-100"
                  >
                    <td className="px-6 py-4">
                      <Image
                        src={product?.thumbnail?.url}
                        alt={product?.thumbnail?.public_id}
                        height={30}
                        width={30}
                        className="h-[30px] w-[30px] rounded-secondary border border-green-500/50 object-cover"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="whitespace-nowrap w-60 overflow-x-auto block scrollbar-hide text-sm">
                        {product?.title}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="whitespace-nowrap scrollbar-hide text-sm">
                        {product?.price}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-4">
                        {product?.gallery && product.gallery.length > 0 ? (
                          product.gallery.map((thumbnail) => (
                            <Image
                              key={thumbnail?._id}
                              src={thumbnail?.url}
                              alt={thumbnail?.public_id}
                              height={30}
                              width={30}
                              className="h-[30px] w-[30px] rounded-secondary border border-green-500/50 object-cover"
                            />
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No gallery</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="whitespace-nowrap scrollbar-hide text-sm">
                        {product?.category?.title}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="whitespace-nowrap scrollbar-hide text-sm">
                        {product?.brand?.title}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="whitespace-nowrap scrollbar-hide text-sm">
                        {product?.store?.title}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="whitespace-nowrap scrollbar-hide text-sm">
                        {product?.buyers?.length}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-row gap-x-2 justify-end">
                        <DeleteProduct product={product} />
                        <ViewProduct product={product} />
                        <Link
                          href={`/dashboard/admin/update-product?id=${product?._id}`}
                          className="bg-green-50 border border-green-900 p-0.5 rounded-secondary text-green-900"
                        >
                          <Pencil />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="hidden sm:flex items-center gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    // Show first, last, current, and adjacent pages
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 text-sm border rounded ${
                            currentPage === pageNum
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return <span key={pageNum} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
          </>
        )}
      </section>
    </Dashboard>
  );
};

function DeleteProduct({ product }) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteProduct, { isLoading, data, error }] =
    useDeleteProductMutation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (isLoading) {
      toast.loading("Deleting Product...", { id: "deleteProduct" });
    }

    if (data) {
      toast.success(data?.description, { id: "deleteProduct" });
      setIsOpen(false);
    }

    if (error?.data) {
      toast.error(error?.data?.description, { id: "deleteProduct" });
    }
  }, [isLoading, data, error]);

  return (
    <>
      <button
        type="submit"
        className="bg-red-50 border border-red-900 p-0.5 rounded-secondary text-red-900"
        onClick={() => {
          setIsOpen(true);
          dispatch(setProduct(product));
        }}
      >
        <Trash />
      </button>

      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          className="p-4 lg:w-1/5"
        >
          <article className="flex flex-col gap-y-4">
            <p className="text-xs bg-yellow-500/50 text-black px-2 py-0.5 rounded-sm text-center">
              Product will be deleted permanently!
            </p>
            <div className="flex flex-col items-start gap-y-2">
              <h1 className="text-xl">Are you sure?</h1>
              <p className="text-sm flex flex-col gap-y-2">
                You are about to unlisted from:
                <p className="flex flex-col gap-y-1.5">
                  <span className="flex flex-row gap-x-1 items-center text-xs">
                    <Inform /> Brand: {product?.brand?.title}
                  </span>
                  <span className="flex flex-row gap-x-1 items-center text-xs">
                    <Inform /> Store: {product?.store?.title}
                  </span>
                  <span className="flex flex-row gap-x-1 items-center text-xs">
                    <Inform /> Store: {product?.store?.title}
                  </span>
                  <span className="flex flex-row gap-x-1 items-center text-xs">
                    <Inform /> Lost {product?.buyers?.length} buyers
                  </span>
                  <span className="flex flex-row gap-x-1 items-center text-xs">
                    <Inform /> Lost {product?.reviews?.length} reviews
                  </span>
                </p>
              </p>
            </div>
            <div className="flex flex-row gap-x-4">
              <button
                className="text-white bg-slate-500 px-3 py-1.5 rounded text-sm"
                onClick={() => setIsOpen(false)}
              >
                No, cancel
              </button>
              <button
                className="flex flex-row gap-x-2 items-center text-white bg-red-500 px-3 py-1.5 rounded text-sm"
                onClick={() => deleteProduct(product?._id)}
              >
                <Trash /> Yes, delete
              </button>
            </div>
          </article>
        </Modal>
      )}
    </>
  );
}

function ViewProduct({ product }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState("buyers");

  return (
    <>
      <button
        type="submit"
        className="bg-purple-50 border border-purple-900 p-0.5 rounded-secondary text-purple-900"
        onClick={() => setIsOpen(true)}
      >
        <User />
      </button>

      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          className="lg:w-1/3 md:w-3/4 w-full h-96 md:mx-0 mx-4 z-50 bg-white p-6 drop-shadow-2xl"
        >
          <section className="flex flex-col gap-y-6 h-full">
            <div className="flex flex-row gap-x-2 justify-start">
              <button
                className={`bg-purple-50 border border-purple-900 text-sm py-1 rounded-secondary text-purple-900 px-4 ${
                  tab === "buyers" ? "bg-purple-900 !text-white" : ""
                }`}
                onClick={() => setTab("buyers")}
              >
                Buyers
              </button>
              <button
                className={`bg-orange-50 border border-orange-900 text-sm py-1 rounded-secondary text-orange-900 px-4 ${
                  tab === "reviews" ? "bg-orange-900 !text-white" : ""
                }`}
                onClick={() => setTab("reviews")}
              >
                Reviews
              </button>
            </div>

            {tab === "buyers" && <ProductBuyers product={product} />}
            {tab === "reviews" && <ProductReviews product={product} />}
          </section>
        </Modal>
      )}
    </>
  );
}

function ProductBuyers({ product }) {
  return (
    <>
      {product?.buyers?.length > 0 ? (
        <div className="h-full overflow-y-auto scrollbar-hide text-left">
          <div className="grid grid-cols-2 gap-4">
            {product?.buyers?.map((buyer) => (
              <div
                key={buyer?._id}
                className="flex flex-col gap-y-4 border rounded p-4"
              >
                <div className="flex flex-row gap-x-2 overflow-hidden">
                  <Image
                    src={buyer?.avatar?.url}
                    alt={buyer?.avatar?.public_id}
                    width={40}
                    height={40}
                    className="h-[40px] w-[40px] object-cover rounded-secondary"
                  />
                  <div className="flex flex-col gap-y-0.5">
                    <h1 className="text-lg">{buyer?.name}</h1>
                    <p className="text-sm">{buyer?.email}</p>
                    <p className="text-xs">{buyer?.phone}</p>
                  </div>
                </div>

                <p className="flex flex-row flex-wrap gap-2">
                  <span className="text-xs border rounded px-1 py-0.5">
                    Cart {buyer?.cart?.length}
                  </span>
                  <span className="text-xs border rounded px-1 py-0.5">
                    Favorites {buyer?.favorites?.length}
                  </span>
                  <span className="text-xs border rounded px-1 py-0.5">
                    Purchases {buyer?.purchases?.length}
                  </span>
                  <span className="text-xs border rounded px-1 py-0.5">
                    Reviews Given {buyer?.reviews?.length}
                  </span>
                  <span className="text-xs border rounded px-1 py-0.5">
                    Products Buy {buyer?.products?.length}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-left">No-one buy this yet!</p>
      )}
    </>
  );
}

function ProductReviews({ product }) {
  const [removeReview, { isLoading, error, data }] = useRemoveReviewMutation();

  useEffect(() => {
    if (isLoading) {
      toast.loading("Deleting Review...", { id: "deleteReview" });
    }

    if (data) {
      toast.success(data?.description, { id: "deleteReview" });
    }

    if (error?.data) {
      toast.error(error?.data?.description, { id: "deleteReview" });
    }
  }, [isLoading, data, error]);

  return (
    <>
      {product?.reviews?.length > 0 ? (
        <div className="h-full overflow-y-auto scrollbar-hide text-left flex flex-col gap-y-4">
          {product?.reviews?.map((review, index) => (
            <article
              key={index}
              className="flex flex-col gap-y-2 p-4 bg-slate-50 rounded relative group"
            >
              <div className="flex flex-row gap-x-2">
                <Image
                  src={review?.reviewer?.avatar?.url}
                  alt={review?.reviewer?.avatar?.public_id}
                  width={40}
                  height={40}
                  className="rounded object-cover h-[40px] w-[40px]"
                />
                <div className="flex flex-col gap-y-1">
                  <h2 className="text-base">{review?.reviewer?.name}</h2>
                  <p className="text-xs whitespace-normal">
                    {review?.reviewer?.email}
                  </p>
                  <p className="text-xs">
                    {new Date(review?.createdAt).toLocaleDateString("en-GB")} •
                    ⭐ {review?.rating}
                  </p>
                </div>
              </div>
              <p className="text-sm whitespace-normal">{review?.comment}</p>

              <button
                type="button"
                className="absolute top-2 right-2 bg-red-50 border border-red-900 p-1 rounded-secondary text-red-900 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => removeReview(review?._id)}
              >
                <Trash />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-left">No reviews found yet!</p>
      )}
    </>
  );
}

export default ListProducts;
