import api from "./api";

export const financeServce = {
    getCategories: async() =>{
        const response = await api.get('/categories');
        return response.data;
    },
    createCategories: async(categoryData: { name: string; type: 'income' | 'expense'; color?: string })=>{
        const response = await api.post('/categories', categoryData);
        return response.data;
    },
    updateCategory: async(id: string, categoryData: { name: string; color?: string })=>{
        const response = await api.put(`/categories/${id}`, categoryData);
        return response.data;
    },
    deleteCategories: async(id: string) =>{
        const response = await api.delete(`/categories/${id}`);
        return response.data
    },
    
    getBudgets: async()=>{
        const response = await api.get('/budget');
        return response.data;
    },
    upsertBudget: async(budgetData: {category: string; amount: number })=>{
        const response = await api.post('/budget', budgetData);
        return response.data;
    }
}