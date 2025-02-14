import { createAction } from '@reduxjs/toolkit';

export const loginRequest = createAction<{ email: string; password: string }>('auth/loginRequest');
export const registerRequest = createAction<{ name: string; email: string; password: string }>('auth/registerRequest');
export const logoutRequest = createAction('auth/logoutRequest');