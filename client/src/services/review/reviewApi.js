

const { canimApi } = require("../canim");

const reviewApi = canimApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get All Reviews
    getReviews: builder.query({
      query: () => ({
        url: "/review/get-reviews",
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }),
      providesTags: ["Review"],
    }),

    // Get Single Review
    getReview: builder.query({
      query: (id) => ({
        url: `/review/get-review/${id}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }),
      providesTags: ["Review"],
    }),

    // Add Review
    addReview: builder.mutation({
      query: (body) => ({
        url: "/review/add-review",
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body,
      }),
      invalidatesTags: ["Review", "Product", "User"],
    }),

    // Delete Review (renamed from removeReview for consistency)
    deleteReview: builder.mutation({
      query: (id) => ({
        url: `/review/delete-review/${id}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }),
      invalidatesTags: ["Review", "Product", "User"],
    }),

    // Update Review
    updateReview: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/review/update-review/${id}`,
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body,
      }),
      invalidatesTags: ["Review", "Product", "User"],
    }),
  }),
});

export const { 
  useGetReviewsQuery,
  useGetReviewQuery,
  useAddReviewMutation, 
  useDeleteReviewMutation,
  useUpdateReviewMutation,
} = reviewApi;

// Keep the old export for backward compatibility (separate export to avoid conflict)
export const useRemoveReviewMutation = useDeleteReviewMutation;
