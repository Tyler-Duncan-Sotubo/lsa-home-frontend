import Axios from "axios";

export const storefrontAxios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

storefrontAxios.interceptors.request.use(
  (config) => {
    const apiKey = process.env.NEXT_PUBLIC_STOREFRONT_KEY;

    if (!apiKey) {
      throw new Error("NEXT_PUBLIC_STOREFRONT_KEY is not set");
    }

    config.headers["X-API-Key"] = apiKey;

    return config;
  },
  (error) => Promise.reject(error)
);
