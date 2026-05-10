// axiosInstance.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Create Axios instance
const api = axios.create({
  baseURL: "https://towrides.in/api", // Production backend URL
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Public endpoints that don't require authentication
    const publicEndpoints = ['/get_tows', '/calculate_fair', '/user/login', '/user/register', '/user/send-otp', '/user/verify-otp', '/driver/login', '/driver/register', '/driver/send-otp', '/driver/verify-otp'];

    // Only attach token for protected endpoints
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));

    if (!isPublicEndpoint) {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    console.log("Request:", config.url, config.method);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("Response:", response);
    return response;
  },
  (error) => {
    // Handle errors globally
    if (error.response?.status === 401) {
      console.log("Unauthorized, redirect to login!");
      // Example: navigate to login or refresh token
    }
    return Promise.reject(error);
  }
);

export default api;
