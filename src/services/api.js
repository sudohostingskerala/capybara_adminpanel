import axios from "axios";

const API_BASE_URL =
  "https://api.capybarababy.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});


// =========================================================
// TOKEN REFRESH STATE
// =========================================================

let isRefreshing = false;

let refreshSubscribers = [];


// Add requests that are waiting for a new token
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};


// Send the new token to waiting requests
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => {
    callback(newToken);
  });

  refreshSubscribers = [];
};


// =========================================================
// REFRESH ACCESS TOKEN
// =========================================================

const refreshAccessToken = async () => {
  const refreshToken =
    localStorage.getItem("refresh_token");

  if (!refreshToken) {
    throw new Error(
      "No refresh token available."
    );
  }

  const response = await axios.post(
    `${API_BASE_URL}/accounts/refresh/`,
    {
      refresh: refreshToken,
    }
  );

  const newAccessToken =
    response.data.access;

  if (!newAccessToken) {
    throw new Error(
      "No access token returned."
    );
  }

  localStorage.setItem(
    "access_token",
    newAccessToken
  );

  return newAccessToken;
};


// =========================================================
// REQUEST INTERCEPTOR
// =========================================================

api.interceptors.request.use(
  (config) => {
    const accessToken =
      localStorage.getItem(
        "access_token"
      );

    if (accessToken) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// =========================================================
// RESPONSE INTERCEPTOR
// =========================================================

api.interceptors.response.use(

  // Normal successful response
  (response) => {
    return response;
  },

  // Error response
  async (error) => {

    const originalRequest =
      error.config;

    // No response from server
    if (!error.response) {
      return Promise.reject(error);
    }

    // Only handle 401
    if (
      error.response.status !== 401
    ) {
      return Promise.reject(error);
    }

    // No original request
    if (!originalRequest) {
      return Promise.reject(error);
    }


    // -------------------------------------------------------
    // Don't refresh these endpoints
    // -------------------------------------------------------

    if (
      originalRequest.url?.includes(
        "/accounts/admin/login/"
      ) ||
      originalRequest.url?.includes(
        "/accounts/refresh/"
      )
    ) {
      return Promise.reject(error);
    }


    // -------------------------------------------------------
    // Prevent infinite retry
    // -------------------------------------------------------

    if (originalRequest._retry) {

      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "refresh_token"
      );

      localStorage.removeItem(
        "admin_user"
      );

      window.location.href =
        "/admin/login";

      return Promise.reject(error);
    }


    originalRequest._retry = true;


    // -------------------------------------------------------
    // Another request is already refreshing
    // -------------------------------------------------------

    if (isRefreshing) {

      return new Promise(
        (resolve, reject) => {

          subscribeTokenRefresh(
            (newToken) => {

              originalRequest.headers =
                originalRequest.headers ||
                {};

              originalRequest.headers.Authorization =
                `Bearer ${newToken}`;

              resolve(
                api(originalRequest)
              );
            }
          );

        }
      );
    }


    // -------------------------------------------------------
    // Start token refresh
    // -------------------------------------------------------

    isRefreshing = true;

    try {

      const newToken =
        await refreshAccessToken();

      isRefreshing = false;

      // Notify waiting requests
      onRefreshed(newToken);


      // Retry original request
      originalRequest.headers =
        originalRequest.headers ||
        {};

      originalRequest.headers.Authorization =
        `Bearer ${newToken}`;

      return api(originalRequest);

    } catch (refreshError) {

      isRefreshing = false;

      refreshSubscribers = [];


      // Clear authentication
      localStorage.removeItem(
        "access_token"
      );

      localStorage.removeItem(
        "refresh_token"
      );

      localStorage.removeItem(
        "admin_user"
      );


      // Send admin back to login
      window.location.href =
        "/admin/login";

      return Promise.reject(
        refreshError
      );
    }
  }
);


// =========================================================
// ADMIN AUTHENTICATION
// =========================================================

export const adminAuthApi = {

  login: (email, password) =>
    api.post(
      "/accounts/admin/login/",
      {
        email,
        password,
      }
    ),
};


// =========================================================
// PUBLIC PRODUCT API
// =========================================================

export const productApi = {

  list: (params) =>
    api.get(
      "/products/",
      {
        params,
      }
    ),

  featured: () =>
    api.get(
      "/products/featured/"
    ),

  create: (data) =>
    api.post(
      "/products/",
      data
    ),

  update: (id, data) =>
    api.patch(
      `/products/${id}/`,
      data
    ),

  remove: (id) =>
    api.delete(
      `/products/${id}/`
    ),
};


// =========================================================
// ADMIN PRODUCT API
// =========================================================

export const productAdminApi = {

  list: (params) =>
    api.get(
      "/products/admin/",
      {
        params,
      }
    ),

  detail: (id) =>
    api.get(
      `/products/admin/${id}/`
    ),

  create: (data) =>
    api.post(
      "/products/admin/",
      data
    ),

  update: (id, data) =>
    api.patch(
      `/products/admin/${id}/`,
      data
    ),

  remove: (id) =>
    api.delete(
      `/products/admin/${id}/`
    ),
};

export const colorApi = {
  list: () =>
    api.get("/products/admin/colors/"),
};

export const sizeApi = {
  list: () =>
    api.get("/products/admin/sizes/"),
};


// =========================================================
// CATEGORY API
// =========================================================

export const categoryApi = {
  list: () =>
    api.get("/categories/admin/"),

  detail: (id) =>
    api.get(`/categories/admin/${id}/`),

  create: (data) =>
    api.post("/categories/admin/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  update: (id, data) =>
    api.patch(
      `/categories/admin/${id}/`,
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    ),

  remove: (id) =>
    api.delete(
      `/categories/admin/${id}/`
    ),
};


// =========================================================
// BANNER API
// =========================================================

export const bannerApi = {
  list: () =>
    api.get("/banners/admin/"),

  detail: (id) =>
    api.get(`/banners/admin/${id}/`),

  create: (data) =>
    api.post("/banners/admin/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  update: (id, data) =>
    api.patch(`/banners/admin/${id}/`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  remove: (id) =>
    api.delete(`/banners/admin/${id}/`),
};


// =========================================================
// ADMIN ORDER API
// =========================================================

export const orderApi = {

  list: (params) =>
    api.get(
      "/orders/admin/",
      {
        params,
      }
    ),

  detail: (id) =>
    api.get(
      `/orders/admin/${id}/`
    ),

  updateStatus: (id, status) =>
    api.patch(
      `/orders/admin/${id}/`,
      {
        status,
      }
    ),
};

// Inventory
export const inventoryApi = {

  list: () =>
    api.get(
      "/products/admin/inventory/"
    ),

  update: (
    id,
    data
  ) =>
    api.patch(
      `/products/admin/inventory/${id}/`,
      data
    ),
};

export default api;