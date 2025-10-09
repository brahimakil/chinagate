const { canimApi } = require("../canim");

const systemApi = canimApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemSettings: builder.query({
      query: () => ({
        url: "/system/get-settings",
        method: "GET",
      }),
      providesTags: ["System"],
    }),
    updateSystemSettings: builder.mutation({
      query: (body) => ({
        url: "/system/update-settings",
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body,
      }),
      invalidatesTags: ["System"],
    }),
  }),
});

export const { useGetSystemSettingsQuery, useUpdateSystemSettingsMutation } = systemApi;