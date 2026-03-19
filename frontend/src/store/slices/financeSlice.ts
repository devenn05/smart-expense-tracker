import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { financeServce } from "../../services/financeService";

export interface Category {
    _id: string;
    name: string;
    type: 'income' | 'expense';
    color: string;
    isPredefined: boolean
}

export interface Budget{
    _id: string;
    category: Category;
    amount: number;
}

interface FinanceState{
    categories: Category[];
    budgets: Budget[];
    isLoading: boolean;
    error: string | null
}

// Global finance state (categories + budgets)
const initialState: FinanceState = {
    categories: [],
    budgets: [],
    isLoading: false,
    error: null
}

// Fetch all categories
export const fetchCategories = createAsyncThunk('finance/fetchCategories', async(_, thunkAPI)=>{
    try{
        const res =  await financeServce.getCategories();
        return res.data;
    }catch(error: any){
        return thunkAPI.rejectWithValue(
            error?.response?.data?.message || 'Failed to fetch Categories'
        );
    }
});

// Add new category
export const addCategory = createAsyncThunk(
    'finance/addCategory',
    async(data: {name: string, type: 'income' | 'expense', color?: string}, thunkAPI)=>{
        try { 
            const res = await financeServce.createCategories(data);
            return res.data; 
        }catch(error: any) { 
            return thunkAPI.rejectWithValue(
                error?.response?.data?.message || 'Failed to add Category'
            ); 
        }
});

// Update existing category
export const updateCategory = createAsyncThunk(
    'finance/updateCategory',
    async(args: { id: string, data: { name: string, color?: string } }, thunkAPI)=>{
        try { 
            const res = await financeServce.updateCategory(args.id, args.data);
            return res.data; 
        }catch(error: any) { 
            return thunkAPI.rejectWithValue(
                error?.response?.data?.message || 'Failed to update Category'
            ); 
        }
});

// Delete category by id
export const deleteCategory = createAsyncThunk(
    'finance/deleteCategory',
    async(id: string, thunkAPI)=>{
        try { 
            await financeServce.deleteCategories(id);
            return id; 
        }catch(error: any) { 
            return thunkAPI.rejectWithValue(
                error?.response?.data?.message || 'Failed to delete Category'
            ); 
        }
});

// Fetch budgets
export const fetchBudget = createAsyncThunk('finance/fetchBudget', async(_, thunkAPI)=>{
    try{
        const res = await financeServce.getBudgets();
        return res.data;
    }catch(error: any){
        return thunkAPI.rejectWithValue(
            error?.response?.data?.message || 'Failed to fetch Budgets'
        );
    }
});

// Create or update budget
export const setBudget = createAsyncThunk(
    'finance/setBudget',
    async(data: {category: string, amount: number}, thunkAPI)=>{
        try{
            const res = await financeServce.upsertBudget(data);
            return res.data;
        }catch(error: any){
            return thunkAPI.rejectWithValue(
                error?.response?.data?.message || 'Failed to set Budget'
            );
        }
});

// Delete budget
export const deleteBudget = createAsyncThunk(
    'finance/deleteBudget',
    async(id: string, thunkAPI)=>{
        try{
            await financeServce.deleteBudget(id);
            return id;
        }catch(error: any){
            return thunkAPI.rejectWithValue(
                error?.response?.data?.message || 'Failed to delete Budget'
            );
        }
});

const financeSlice = createSlice({
    name: 'finance',
    initialState,
    reducers:{
        // Reset error state manually (used in UI)
        clearFinanceError: (state)=>{
            state.error = null;
        }
    },
    extraReducers:(builder) => {

        // Fetch categories
        builder.addCase(fetchCategories.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchCategories.fulfilled, (state, action) => {
            state.isLoading = false;
            state.categories = action.payload;
        });
        builder.addCase(fetchCategories.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Add category (append locally)
        builder.addCase(addCategory.fulfilled, (state, action)=>{
            state.categories.push(action.payload);
        });

        // Update category in-place
        builder.addCase(updateCategory.fulfilled, (state, action)=>{
            const index = state.categories.findIndex(c => c._id === action.payload._id);
            if(index >= 0) state.categories[index] = action.payload;
        });

        // Delete category + remove related budgets
        builder.addCase(deleteCategory.fulfilled, (state, action)=>{
            state.categories = state.categories.filter(c => c._id !== action.payload);
            state.budgets = state.budgets.filter(b => b.category?._id !== action.payload);
        });

        // Fetch budgets
        builder.addCase(fetchBudget.pending, (state)=>{
            state.isLoading = true;
        });
        builder.addCase(fetchBudget.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.budgets = action.payload;
        });

        // Upsert budget (update if exists, else insert)
        builder.addCase(setBudget.fulfilled, (state, action)=>{
            const existingIndex = state.budgets.findIndex(b => b._id === action.payload._id);
            if (existingIndex >= 0 ){
                state.budgets[existingIndex] = action.payload
            } else {
                state.budgets.push(action.payload);
            }
        });

        // Delete budget
        builder.addCase(deleteBudget.fulfilled, (state, action)=>{
            state.budgets = state.budgets.filter((b: any) => b._id !== action.payload);
        });
    }
})

export const { clearFinanceError } = financeSlice.actions;
export default financeSlice.reducer;