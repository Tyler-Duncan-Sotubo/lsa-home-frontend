// lib/routes.ts
export const DEFAULT_REDIRECT = "/account"; // where to go after login
export const LOGIN_ROUTE = "/account/login";

export const PUBLIC_ROUTES: string[] = [
  "/", // home
  "/shop", // example
  "/wishlist", // guests allowed
  "/checkout", // guests allowed
  LOGIN_ROUTE, // login page itself
  "/account/register", // if you have a register page
];

// Routes that should NOT be accessible when logged in
export const AUTH_ROUTES: string[] = [LOGIN_ROUTE, "/account/register"];

// Optional: if you still want ROOT
export const ROOT = "/"; // or not used anymore in middleware
