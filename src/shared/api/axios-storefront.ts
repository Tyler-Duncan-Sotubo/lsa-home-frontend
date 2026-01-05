import Axios from "axios";

export const storefrontAxios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

storefrontAxios.interceptors.request.use(
  (config) => {
    const apiKey = process.env.STOREFRONT_API_KEY;
    console.log("Using STOREFRONT_API_KEY:", apiKey);

    if (!apiKey) {
      throw new Error("STOREFRONT_API_KEY is not set");
    }

    config.headers["X-API-Key"] = apiKey;

    return config;
  },
  (error) => Promise.reject(error)
);
