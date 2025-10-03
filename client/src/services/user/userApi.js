/**
 * Title: Write a program using JavaScript on UserApi
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
 * Date: 12, November 2023
 */

const { canimApi } = require("../canim");

const userApi = canimApi.injectEndpoints({
  endpoints: (builder) => ({
    // get all users
    getUsers: builder.query({
      query: () => ({
        url: "/user/all-users",
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }),

      providesTags: ["User"],
    }),

    // get user
    getUser: builder.query({
      query: (id) => ({
        url: `/user/get-user/${id}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }),

      providesTags: ["User"],
    }),

    // update user
    updateUser: builder.mutation({
      query: (body) => ({
        url: `/user/update-information`,
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body,
      }),

      invalidatesTags: ["User"],
    }),

    // user single user
    updateUserInfo: builder.mutation({
      query: ({ id, body }) => ({
        url: `/user/update-user/${id}`,
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body,
      }),

      invalidatesTags: ["User"],
    }),

    // delete user
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/user/delete-user/${id}`,
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }),

      invalidatesTags: ["User"],
    }),

    // get seller request
    getSellerRequest: builder.query({
      query: () => ({
        url: "/user/seller-review",
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }),

      providesTags: ["User"],
    }),

    // review seller
    reviewSeller: builder.mutation({
      query: ({ id, body }) => ({
        url: `/user/seller-review?id=${id}`,
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body,
      }),

      invalidatesTags: ["User"],
    }),

    // add user by admin
    addUser: builder.mutation({
      query: (body) => ({
        url: "/user/add-user",
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body,
      }),

      invalidatesTags: ["User"],
    }),

    // get dashboard statistics
    getDashboardStats: builder.query({
      query: () => ({
        url: "/user/dashboard-stats",
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }),
      providesTags: ["User"],
    }),

    // export data
    exportData: builder.mutation({
      query: (type) => ({
        url: `/user/export/${type}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useUpdateUserInfoMutation,
  useDeleteUserMutation,
  useAddUserMutation,
  useGetSellerRequestQuery,
  useReviewSellerMutation,
  useGetDashboardStatsQuery,
  useExportDataMutation,
} = userApi;
