import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { logout } from './authSlice'; // Import the logout action from your auth slice

export interface UserProfile {
    _id: string;
    name: string;
    email: string;
    handle?: string;
    // Add any other fields you expect from the profile
}

interface UserState {
    profile: UserProfile | null;
    loading: boolean;
    error?: string;
}

const initialState: UserState = {
    profile: null,
    loading: false,
    error: undefined,
};

const usersSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        fetchUserProfileRequest(state) {
            state.loading = true;
            state.error = undefined;
        },
        fetchUserProfileSuccess(state, action: PayloadAction<UserProfile>) {
            state.profile = action.payload;
            state.loading = false;
        },
        fetchUserProfileFailure(state, action: PayloadAction<string>) {
            state.loading = false;
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        // When the auth logout action is dispatched, also clear the user profile
        builder.addCase(logout, (state) => {
            state.profile = null;
        });
    },
});

export const { fetchUserProfileRequest, fetchUserProfileSuccess, fetchUserProfileFailure } =
    usersSlice.actions;
export default usersSlice.reducer;
