import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import { financeServce } from "../../services/financeService";
import { da } from "zod/locales";

export interface Category {
    _id: string;
    name: string;
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

const initialState: FinanceState = {
    categories: [],
    budgets: [],
    isLoading: true,
    error: null
}

export const fetchCategories = createAsyncThunk('finance/fetchCategories', async(_, thunkAPI)=>{
    try{
        return await financeServce.getCategories();
    }catch(error: any){
        return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Failed to fetch Categories');
    }
});

export const addCategory = createAsyncThunk('finance/addCategory', async(data: {name: string, color?: string}, thunkAPI)=>{
    try{
        return await financeServce.createCategories(data);
    }catch(error: any){
        return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Failed to add Category');
    }
});

export const fetchBudget = createAsyncThunk('finance/fetchBudget', async(_, thunkAPI)=>{
    try{
        return financeServce.getBudgets();
    }catch(error: any){
        return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Failed to fetch Budgets');
    }
});

export const setBudget = createAsyncThunk('finance/setBudget', async(data: {category: string, amount: number}, thunkAPI)=>{
    try{
        return await financeServce.upsertBudget(data);
    }catch(error: any){
        return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Failed to set Budget');
    }
})

const financeSlice = createSlice({
    name: 'finance',
    initialState,
    reducers:{
        clearFinanceError: (state)=>{
            state.error = null;
        }
    },
    extraReducers:(builder) => {
        // Handling Fetch Categories
        builder.addCase(fetchCategories.pending, (state) => { state.isLoading = true; });
        builder.addCase(fetchCategories.fulfilled, (state, action) => {
            state.isLoading = false;
            state.categories = action.payload;
        });
        builder.addCase(fetchCategories.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Handling Add Category
        builder.addCase(addCategory.fulfilled, (state, action)=>{
            state.categories.push(action.payload);
        })

        // Handling Fetch Budgets
        builder.addCase(fetchBudget.pending, (state)=> {state.isLoading = true;});
        builder.addCase(fetchBudget.fulfilled, (state, action)=>{
            state.isLoading = false;
            state.budgets = action.payload;
        });

        // Handling set Budgets
        builder.addCase(setBudget.fulfilled, (state, action)=>{
            // If the budget already exists in state, update it. If not, add it!
            const existingIndex = state.budgets.findIndex(b=> b._id === action.payload._id);
            if (existingIndex >= 0 ){
                state.budgets[existingIndex] = action.payload
            } else {
                // Because the payload might just return the category ID string instead of populated object, 
                // a simple way to keep the UI perfectly synced is to force a re-fetch of budgets or map the category:
                const catObj = state.categories.find(c => c._id === (action.payload.category as any));
                state.budgets.push({ ...action.payload, category: catObj || action.payload.category });
            }
        })

    }
})

export const { clearFinanceError } = financeSlice.actions;
export default financeSlice.reducer;