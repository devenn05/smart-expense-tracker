import api from "./api";

export const analyticsService = { 
    getAnalysis: async ()=>{
        const response = await api.get('/analytics');
        return response.data;
    }
}