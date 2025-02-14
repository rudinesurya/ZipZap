import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    user: { name: string } | null;
    token: string | null;
    error?: string;
}

const initialState: AuthState = {
    user: null,
    token: null,
    error: undefined,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Action dispatched when login succeeds
        loginSuccess(state, action: PayloadAction<{ user: { name: string }, token: string }>) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = undefined;
        },
        // Action dispatched when login fails
        loginFailure(state, action: PayloadAction<string>) {
            state.error = action.payload;
        },
        registerSuccess(state, action: PayloadAction<{ user: { name: string }; token: string }>) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = undefined;
        },
        registerFailure(state, action: PayloadAction<string>) {
            state.error = action.payload;
        },
        // Action to log out
        logout(state) {
            state.user = null;
            state.token = null;
            state.error = undefined;
        },
        // Clear any existing error (optional)
        clearError(state) {
            state.error = undefined;
        },
    },
});

export const { loginSuccess, loginFailure, registerSuccess, registerFailure, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
