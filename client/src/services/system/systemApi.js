const { canimApi } = require("../canim");

const systemApi = canimApi.injectEndpoints({
  endpoints: (builder) => ({
    getSystemSettings: builder.query({
      query: () => ({
        url: "/system/get-settings",
        method: "GET",
      }),
      providesTags: ["User"], // reuse tags; not critical here
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
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useGetSystemSettingsQuery, useUpdateSystemSettingsMutation } = systemApi;