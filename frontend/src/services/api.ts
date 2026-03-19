import axios from "axios";
import { store } from "../store/store";
import { clearCredentials } from "../store/slices/authSlice";

// Central axios instance used across the app
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true, // allows cookies (JWT) to be sent automatically
    headers: {
        'Content-Type': 'application/json',
    }
})

// Prevent multiple refresh calls firing at the same time
let isRefreshing = false;

// Queue to hold requests while token refresh is in progress
let failedQueue: any[] = [];

// Resolves or rejects all queued requests once refresh completes
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
        
        // Handle expired access token (401)
        // Avoid retry loops and skip auth endpoints
        if (
            error.response?.status === 401 && 
            !originalRequest._retry && 
            originalRequest.url !== '/auth/refresh' &&
            originalRequest.url !== '/auth/login'
        ) {
            
            // If refresh already in progress, queue the request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then(() => api(originalRequest))
                .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh session (cookie-based JWT)
                await api.post('/auth/refresh');

                // Retry all queued requests
                processQueue(null);
                
                // Retry original failed request
                return api(originalRequest);

            } catch (refreshError: any) {
                // If refresh fails → force logout
                processQueue(refreshError);
                store.dispatch(clearCredentials());
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        // Forward all other errors
        return Promise.reject(error);
    }
);

export default api;