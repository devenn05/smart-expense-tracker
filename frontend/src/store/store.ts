import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice'
import financeReducer from './slices/financeSlice'
import transactionReducer from './slices/transactionSlice'
import analyticsReducer from './slices/analyticsSlice' 

export const store = configureStore({
    reducer: {
        auth: authReducer,
        finance: financeReducer,
        transaction: transactionReducer,
        analytics: analyticsReducer 
    }
})

// Global types for use in hooks and selectors
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;