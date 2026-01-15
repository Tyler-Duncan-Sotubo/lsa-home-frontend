import Axios from "axios";

export const storefrontAxios = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
});

storefrontAxios.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const host = window.location.host;

      if (host) {
        config.headers["X-Store-Host"] = host;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);
