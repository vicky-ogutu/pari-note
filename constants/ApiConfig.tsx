export const getEndpoint = (path: string) => `${BASE_URL}${path}`;
//export const BASE_URL = "http://localhost:3000";
export const BASE_URL = "http://pari.scaletech.co.ke";

// Alternatively, with environment detection
export const API_CONFIG = {
  BASE_URL: __DEV__ ? "http://pari.scaletech.co.ke" : "http://localhost:3000",

  //add other API-related constants
  ENDPOINTS: {
    LOGIN: "/auth/login",
    NOTIFICATIONS: "/notifications",
    PATIENTS: "/patients",
    // Add more endpoints as needed
  },

  // Headers
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },

  // Timeout
  TIMEOUT: 10000, // 10 seconds
};
