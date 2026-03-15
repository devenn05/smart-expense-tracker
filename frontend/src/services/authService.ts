import api from "./api";

export const authService = {
    login: async (credentials: any) =>{
        const response = await api.post('/auth/login', credentials);
        return response.data
    },
    register: async (userData: any) =>{
        const response = await api.post('/auth/initialRegister', userData);
        return response.data
    },
    verifyOtp: async (data: { email: string; emailOtp: string; whatsappOtp?: string }) => {
        const response = await api.post('/auth/verify-otp', data);
        return response.data;
    },
    logout: async () =>{
        const response = await api.post('/auth/logout');
        return response.data
    },
    getMe: async () =>{
        const response = await api.get('/auth/me');
        return response.data
    }
}