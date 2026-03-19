import api from "./api";

export const transactionService = {

    // Fetch transactions (supports query params like filters, pagination)
    getTransaction: async (params = {}) => {
        const res = await api.get('/transactions', { params });
        return res.data;
    },

    // Create a new transaction
    createTransaction: async (data: any) => {
        const res = await api.post('/transactions', data);
        return res.data;
    },

    // Update existing transaction
    updateTransaction: async (id: string, data: any) => {
        const res = await api.put(`/transactions/${id}`, data);
        return res.data;
    },

    // Delete a transaction
    deleteTransaction: async (id: string) => {
        const res = await api.delete(`/transactions/${id}`);
        return res.data;
    }
}