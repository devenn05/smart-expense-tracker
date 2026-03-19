import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"

interface User { 
    _id: number
    name: string
    email: string
}

interface authState {
    user: User | null
    isAuth: boolean
    isLoading: boolean
}

const initialState: authState = {
    user: null,
    isAuth: false,
    isLoading: true
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Sync user session to state after login/verification
        setCredentials: (state, action: PayloadAction<User>) =>{
            state.user = action.payload;
            state.isAuth = true;
            state.isLoading = false;
        },
        // Wipe session data on logout
        clearCredentials: (state) =>{
            state.user = null;
            state.isAuth = false;
            state.isLoading = false;
        },
        setLoading: (state, action: PayloadAction<boolean>) =>{
            state.isLoading = action.payload;
        }
    }
})

export const {setCredentials, clearCredentials, setLoading} = authSlice.actions
export default authSlice.reducer;