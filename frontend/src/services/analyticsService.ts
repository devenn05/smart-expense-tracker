import api from "./api";

export const analyticsService = { 
    // Fetches complete analytics snapshot (totals, breakdowns, predictions, etc.)
    getAnalysis: async () => {
        const response = await api.get('/analytics');
        return response.data;
    }
}