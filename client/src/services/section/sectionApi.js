const { canimApi } = require("../canim");

const sectionApi = canimApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all sections
    getSections: builder.query({
      query: () => ({
        url: "/section/get-sections",
        method: "GET",
      }),
      providesTags: ["Section"],
      transformResponse: (response) => {
        console.log("🔍 Section API Response:", response);
        return response;
      },
      transformErrorResponse: (response) => {
        console.error("❌ Section API Error:", response);
        return response;
      },
    }),

    // Get a single section
    getSection: builder.query({
      query: (id) => ({
        url: `/section/get-section/${id}`,
        method: "GET",
      }),
      providesTags: ["Section"],
    }),

    // Add new section - UPDATED FOR FORMDATA
    addSection: builder.mutation({
      query: (formData) => ({
        url: "/section/add-section",
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: formData, // FormData will be sent directly
      }),
      invalidatesTags: ["Section"],
    }),

    // Update section - UPDATED FOR FORMDATA
    updateSection: builder.mutation({
      query: ({ id, data }) => ({
        url: `/section/update-section/${id}`,
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: data, // FormData will be sent directly
      }),
      invalidatesTags: ["Section"],
    }),

    // Delete section
    deleteSection: builder.mutation({
      query: (id) => ({
        url: `/section/delete-section/${id}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }),
      invalidatesTags: ["Section"],
    }),

    // Reorder sections
    reorderSections: builder.mutation({
      query: (sections) => ({
        url: "/section/reorder-sections",
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: { sections },
      }),
      invalidatesTags: ["Section"],
    }),
  }),
});

export const {
  useGetSectionsQuery,
  useGetSectionQuery,
  useAddSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useReorderSectionsMutation,
} = sectionApi;
