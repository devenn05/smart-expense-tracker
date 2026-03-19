import api from "./api";

export const financeServce = {

    // Fetch all categories (income + expense)
    getCategories: async () => {
        const response = await api.get('/categories');
        return response.data;
    },

    // Create a new category
    createCategories: async (categoryData: { name: string; type: 'income' | 'expense'; color?: string }) => {
        const response = await api.post('/categories', categoryData);
        return response.data;
    },

    // Update category name/color
    updateCategory: async (id: string, categoryData: { name: string; color?: string }) => {
        const response = await api.put(`/categories/${id}`, categoryData);
        return response.data;
    },

    // Delete a category
    deleteCategories: async (id: string) => {
        const response = await api.delete(`/categories/${id}`);
        return response.data;
    },
    
    // Fetch all budgets
    getBudgets: async () => {
        const response = await api.get('/budget');
        return response.data;
    },

    // Create or update budget (upsert behavior)
    upsertBudget: async (budgetData: { category: string; amount: number }) => {
        const response = await api.post('/budget', budgetData);
        return response.data;
    },

    // Delete a budget entry
    deleteBudget: async (id: string) => {
        const response = await api.delete(`/budget/${id}`);
        return response.data;
    }
}