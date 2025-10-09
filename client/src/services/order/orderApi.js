


const { canimApi } = require("../canim");

const orderApi = canimApi.injectEndpoints({
  endpoints: (build) => ({
    createOrder: build.mutation({
      query: (body) => ({
        url: "/order/create-order",
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body,
      }),
      invalidatesTags: ["Cart", "User", "Product"],
    }),
  }),
});

export const { useCreateOrderMutation } = orderApi;