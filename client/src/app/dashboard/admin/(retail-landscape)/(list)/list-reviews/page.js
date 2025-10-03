/**
 * Title: Admin Reviews Management
 * Author: China Gate Team
 * Date: 26, September 2025
 */

"use client";

import Dashboard from "@/components/shared/layouts/Dashboard";
import { useGetReviewsQuery, useDeleteReviewMutation } from "@/services/review/reviewApi";
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";

const ListReviews = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRating, setFilterRating] = useState("");

  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useGetReviewsQuery();

  const [deleteReview, { isLoading: deletingReview }] = useDeleteReviewMutation();

  const reviews = useMemo(() => reviewsData?.data || [], [reviewsData]);

  // Filter reviews based on search and rating
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const matchesSearch = !searchTerm || 
        review.reviewer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.product?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRating = !filterRating || review.rating.toString() === filterRating;
      
      return matchesSearch && matchesRating;
    });
  }, [reviews, searchTerm, filterRating]);

  useEffect(() => {
    if (reviewsLoading) {
      toast.loading("Fetching Reviews...", { id: "reviews" });
    }

    if (reviewsData) {
      toast.success(reviewsData?.description, { id: "reviews" });
    }

    if (reviewsError?.data) {
      toast.error(reviewsError?.data?.description, { id: "reviews" });
    }
  }, [reviewsLoading, reviewsData, reviewsError]);

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await deleteReview(reviewId);
        toast.success("Review deleted successfully");
      } catch (error) {
        toast.error("Failed to delete review");
      }
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`text-lg ${
          index < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      >
        ⭐
      </span>
    ));
  };

  return (
    <Dashboard>
      <section className="w-full space-y-6">
        {/* Header */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">All Reviews</h1>
          <div className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
            Total: {filteredReviews.length} reviews
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Reviews
              </label>
              <input
                type="text"
                placeholder="Search by reviewer, product, or comment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Rating
              </label>
              <select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviewsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading reviews...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Found</h3>
              <p className="text-gray-500">
                {searchTerm || filterRating ? "Try adjusting your filters" : "No reviews have been submitted yet"}
              </p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review._id} className="bg-white p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Product Info */}
                  <div className="flex-shrink-0">
                    {review.product?.thumbnail?.url && (
                      <Image
                        src={review.product.thumbnail.url}
                        alt={review.product.title}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="flex-grow space-y-3">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {review.product?.title || "Product"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          by {review.reviewer?.name || "Anonymous"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-gray-600">
                          ({review.rating}/5)
                        </span>
                      </div>
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          "{review.comment}"
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        Submitted on {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          disabled={deletingReview}
                          className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          {deletingReview ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {filteredReviews.length > 0 && (
          <div className="bg-white p-6 rounded-lg border shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Review Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = filteredReviews.filter(r => r.rating === rating).length;
                const percentage = filteredReviews.length > 0 ? ((count / filteredReviews.length) * 100).toFixed(1) : 0;
                
                return (
                  <div key={rating} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600">{rating} Star{rating !== 1 ? 's' : ''}</div>
                    <div className="text-xs text-gray-500">({percentage}%)</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </Dashboard>
  );
};

export default ListReviews;
