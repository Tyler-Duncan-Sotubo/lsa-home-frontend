import Axios from "axios";
import { isAxiosError } from "axios";

export const axiosInstance = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    if (typeof window === "undefined") return config;

    // ---- 1️⃣ Guest token (cart ownership) ----
    const guestToken = localStorage.getItem("guest_token");
    if (guestToken) {
      config.headers["X-Guest-Token"] = guestToken;
    }

    // ---- 2️⃣ Customer auth token (if logged in) ----
    const { getSession } = await import("next-auth/react");
    const session = await getSession();

    const accessToken = session?.backendTokens.accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export { isAxiosError };
