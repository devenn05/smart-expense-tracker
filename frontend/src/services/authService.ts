import api from "./api";

export const authService = {

    // Login with email/password
    login: async (credentials: any) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    // Initial registration (before OTP verification)
    register: async (userData: any) => {
        const response = await api.post('/auth/initialRegister', userData);
        return response.data;
    },

    // Verify OTP (email + optional WhatsApp)
    verifyOtp: async (data: { email: string; emailOtp: string; whatsappOtp?: string }) => {
        const response = await api.post('/auth/verify-otp', data);
        return response.data;
    },

    // Logout and clear session (cookie invalidation)
    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    // Get current logged-in user
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    // Update password (authenticated user)
    updatePassword: async (data: any) => {
        const response = await api.patch('/auth/update-password', data);
        return response.data;
    },

    // Trigger forgot password flow (send OTP)
    forgotPassword: async (data: any) => {
        const response = await api.post('/auth/forgot-password', data);
        return response.data;
    },

    // Reset password using OTP
    resetPassword: async (data: any) => {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    },
}