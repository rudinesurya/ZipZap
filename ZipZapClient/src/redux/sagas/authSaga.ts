import { call, put, select, takeLatest } from 'redux-saga/effects';
import { loginSuccess, loginFailure, logoutRequest, registerFailure, registerSuccess, loginRequest, registerRequest, logout } from '../slices/authSlice';
import { RootState } from '../store';

interface LoginPayload {
    email: string;
    password: string;
}

interface RegisterPayload {
    name: string;
    email: string;
    password: string;
}

const selectApiBaseUrl = (state: RootState) => state.config.apiBaseUrl;

const loginApi = async (baseUrl: string, payload: { email: string; password: string }) => {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
    }

    return response.json();
};

const registerApi = async (baseUrl: string, payload: { name: string; email: string; password: string }) => {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
    }

    return response.json();
};

function* loginSaga(action: { payload: LoginPayload; type: string }) {
    try {
        const apiBaseUrl: string = yield select(selectApiBaseUrl);
        const data: { access_token: string } = yield call(loginApi, apiBaseUrl, action.payload);
        // For simplicity, we use the email as the user's name.
        yield put(loginSuccess({ user: { name: action.payload.email }, token: data.access_token }));
    } catch (error: any) {
        yield put(loginFailure(error.message));
    }
}

function* registerSaga(action: { payload: RegisterPayload; type: string }) {
    try {
        const apiBaseUrl: string = yield select(selectApiBaseUrl);
        const data: { access_token: string } = yield call(registerApi, apiBaseUrl, action.payload);
        yield put(registerSuccess({ user: { name: action.payload.name }, token: data.access_token }));
    } catch (error: any) {
        yield put(registerFailure(error.message));
    }
}

function* logoutSaga() {
    yield put(logout());
}

export function* authSaga() {
    yield takeLatest(loginRequest.type, loginSaga);
    yield takeLatest(registerRequest.type, registerSaga);
    yield takeLatest(logoutRequest.type, logoutSaga);
}
