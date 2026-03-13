import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { transactionService } from "../../services/transactionService";

export interface CategoryPopulated {
    _id: string;
    name: string;
    color: string;
}

export interface Transaction {
    _id: string;
    amount: number;
    category: CategoryPopulated;
    type: 'income' | 'expense';
    description: string;
    date: string;
}

interface TransactionState {
    transactions: Transaction[];
    isLoading: boolean;
    error: string | null;
}

const initialState: TransactionState = {
    transactions: [],
    isLoading: true,
    error: null
}

// We allow passing filters like { type: 'expense', category: '...' } directly into the thunk
export const fetchTransactions = createAsyncThunk('transactions/fetchAll', async(filters: any = {}, thunkAPI)=>{
    try{
        const res = await transactionService.getTransaction(filters);
        return res.data;
    } catch(error: any){
        return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Failed to fetch Transactions.');
    }
})

export const addTransaction = createAsyncThunk('transactions/addTransaction', async(data: any, thunkAPI)=>{
    try {
        const res = await transactionService.createTransaction(data);
        return res.data;
    } catch (error: any){
        return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Failed to add a Transaction.');
    }
})

export const deleteTransaction = createAsyncThunk('transaction/deleteTransaction', async(id: string, thunkAPI)=>{
    try{
        await transactionService.deleteTransaction(id);
        return id;
    } catch (error: any){
        return thunkAPI.rejectWithValue(error?.response?.data?.message || 'Failed to delete a Transaction.');
    }
})

const transactionSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {},
    extraReducers: (builder)=>{
        // Handling Fetch Transactions
        builder.addCase(fetchTransactions.pending, (state)=> {state.isLoading =  true})
        builder.addCase(fetchTransactions.fulfilled, (state, action)=>{
            state.transactions = action.payload;
            state.isLoading = false;
        })
        // Handling add Transaction
        // Put the newest transaction at the top of the list in real-time
        builder.addCase(addTransaction.fulfilled, (state, action)=>{
            state.transactions.unshift(action.payload);
            state.isLoading = false;
        })
        // Cleanly remove from memory via the ID
        builder.addCase(deleteTransaction.fulfilled, (state, action)=>{
            state.transactions = state.transactions.filter(t=> t._id !== action.payload);
        })
    }
})

export default transactionSlice.reducer;