import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ConfigState {
    apiBaseUrl: string;
    error?: string;
}

const initialState: ConfigState = {
    apiBaseUrl: '', // initially empty
};

const configSlice = createSlice({
    name: 'config',
    initialState,
    reducers: {
        fetchConfigRequest(state) {
            state.error = undefined;
        },
        fetchConfigSuccess(state, action: PayloadAction<{ apiBaseUrl: string }>) {
            state.apiBaseUrl = action.payload.apiBaseUrl;
            state.error = undefined;
        },
        fetchConfigFailure(state, action: PayloadAction<string>) {
            state.error = action.payload;
        },
    },
});

export const {
    fetchConfigRequest,
    fetchConfigSuccess,
    fetchConfigFailure,
} = configSlice.actions;

export default configSlice.reducer;
