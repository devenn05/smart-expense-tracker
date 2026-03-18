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

const initialState: FinanceState = {
    categories: [],
    budgets: [],
    isLoading: false,
    error: null
}

export const fetchCategories = createAsyncThunk('finance/fetchCategories', async(_, thunkAPI)=>{
    try{
        const res =  await financeServce.getCategories();
        return res.data;
    }catch(error: any){
        return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Failed to fetch Categories');
    }
});

export const addCategory = createAsyncThunk('finance/addCategory', async(data: {name: string, type: 'income' | 'expense', color?: string}, thunkAPI)=>{
    try { 
        const res = await financeServce.createCategories(data); return res.data; 
    }catch(error: any) { 
        return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Failed to add Category'); 
    }
});

export const updateCategory = createAsyncThunk('finance/updateCategory', async(args: { id: string, data: { name: string, color?: string } }, thunkAPI)=>{
    try { 
        const res = await financeServce.updateCategory(args.id, args.data); return res.data; 
    }catch(error: any) { 
        return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Failed to update Category'); 
    }
});

export const deleteCategory = createAsyncThunk('finance/deleteCategory', async(id: string, thunkAPI)=>{
    try { 
        await financeServce.deleteCategories(id); return id; 
    }catch(error: any) { 
        return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Failed to delete Category'); 
    }
});

export const fetchBudget = createAsyncThunk('finance/fetchBudget', async(_, thunkAPI)=>{
    try{
        const res = await financeServce.getBudgets();
        return res.data;
    }catch(error: any){
        return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Failed to fetch Budgets');
    }
});

export const setBudget = createAsyncThunk('finance/setBudget', async(data: {category: string, amount: number}, thunkAPI)=>{
    try{
        const res = await financeServce.upsertBudget(data);
        return res.data;
    }catch(error: any){
        return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Failed to set Budget');
    }
})

export const deleteBudget = createAsyncThunk('finance/deleteBudget', async(id: string, thunkAPI)=>{
    try{
        await financeServce.deleteBudget(id); return id;
    }catch(error: any){
        return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Failed to delete Budget');
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

        // // Handling update Category
        builder.addCase(updateCategory.fulfilled, (state, action)=>{
            const index = state.categories.findIndex(c => c._id === action.payload._id);
            if(index >= 0) state.categories[index] = action.payload;
        });

        builder.addCase(deleteCategory.fulfilled, (state, action)=>{
            state.categories = state.categories.filter(c => c._id !== action.payload);
            // we immediately delete the budget if a user forces deletion of a category!
            state.budgets = state.budgets.filter(b => b.category?._id !== action.payload);
        });


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
                // Appends mapped values directly to objects!
                state.budgets.push(action.payload);
            }
        })

        // Handles deletion of budgets
        builder.addCase(deleteBudget.fulfilled, (state, action)=>{
            state.budgets = state.budgets.filter((b: any) => b._id !== action.payload);
        })
    }
})

export const { clearFinanceError } = financeSlice.actions;
export default financeSlice.reducer;