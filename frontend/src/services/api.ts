import axios from "axios";
import { store } from "../store/store";
import { clearCredentials } from "../store/slices/authSlice";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true,
    headers:{
        'Content-Type': 'application/json',
    }
})

// Variable to prevent infinite refresh loops
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};


api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Check if the error is 401, not a retry request, and not the refresh token endpoint itself
        if (
            error.response?.status === 401 && 
            !originalRequest._retry && 
            originalRequest.url !== '/auth/refresh' &&
            originalRequest.url !== '/auth/login'
        ) {
            
            if (isRefreshing) {
                // If we are already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Call the refresh endpoint
                await api.post('/auth/refresh');

                // The browser has now automatically received the new 'jwt' cookie
                processQueue(null);
                
                // Retry the original request
                return api(originalRequest);

            } catch (refreshError: any) {
                // If refresh fails, log everyone out
                processQueue(refreshError);
                store.dispatch(clearCredentials());
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        // For any other errors, just pass them on
        return Promise.reject(error);
    }
);

export default api;