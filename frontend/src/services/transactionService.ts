import api from "./api";

export const transactionService = {
    getTransaction: async (params = {}) =>{
        const res = await api.get('/transactions', {params})
        return res.data;
    },
    createTransaction: async (data: any) =>{
        const res = await api.post('/transactions', data);
        return res.data;
    },
    deleteTransaction: async (id: string) =>{
        const res = await api.delete(`/transactions/${id}`)
        return res.data;
    }
}