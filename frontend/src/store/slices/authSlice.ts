import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

// Match the shape of the user from the backend
interface User { 
    id: number
    email: string
    password: string
}

// Create a structure to set initial state
interface authState {
    user: User | null
    isAuth: boolean
    isLoading: boolean
}

// Set the initial state to pass into slice
const initialState: authState = {
    user: null,
    isAuth: false,
    isLoading: true
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Actions to update the state
        setCredentials: (state, action: PayloadAction<User>) =>{
            state.user = action.payload;
            state.isAuth = true;
            state.isLoading = false;
        },
        clearCredentials: (state) =>{
            state.user = null;
            state.isAuth = false;
            state.isLoading = true;
        },
        setLoading: (state, action: PayloadAction<boolean>) =>{
            state.isLoading = action.payload;
        }
    }
})
export const {setCredentials, clearCredentials, setLoading} = authSlice.actions
export default authSlice.reducer;