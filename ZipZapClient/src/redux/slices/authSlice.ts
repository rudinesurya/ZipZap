import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

interface AuthState {
    token: string | null;
    error?: string;
}

const initialState: AuthState = {
    token: Cookies.get('token') || null,
    error: undefined,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginRequest(state, action: PayloadAction<{ email: string; password: string }>) {
            state.error = undefined;
        },
        // Action dispatched when login succeeds
        loginSuccess(state, action: PayloadAction<{ token: string }>) {
            state.token = action.payload.token;
            state.error = undefined;
        },
        // Action dispatched when login fails
        loginFailure(state, action: PayloadAction<string>) {
            state.error = action.payload;
        },
        registerRequest(state, action: PayloadAction<{ name: string; email: string; password: string }>) {
            state.error = undefined;
        },
        registerSuccess(state, action: PayloadAction<{ token: string }>) {
            state.token = action.payload.token;
            state.error = undefined;
        },
        registerFailure(state, action: PayloadAction<string>) {
            state.error = action.payload;
        },
        // Action to log out
        logoutRequest(state) {
            state.error = undefined;
        },
        logout(state) {
            state.token = null;
            state.error = undefined;
        },
        // Clear any existing error (optional)
        clearError(state) {
            state.error = undefined;
        },
    },
});

export const { loginRequest, loginSuccess, loginFailure, registerRequest, registerSuccess, registerFailure, logoutRequest, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
