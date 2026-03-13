import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice'
import financeReducer from './slices/financeSlice'
import transactionReducer from './slices/transactionSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        finance: financeReducer,
        transaction: transactionReducer
    }
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;