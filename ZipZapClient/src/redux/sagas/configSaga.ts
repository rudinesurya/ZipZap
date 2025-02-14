import { call, put, takeLatest } from 'redux-saga/effects';
import {
    fetchConfigSuccess,
    fetchConfigFailure,
} from '../slices/configSlice';
import { fetchConfigRequest } from '../actions/configAction';

function* fetchConfigSaga() {
    try {
        // In a real-world scenario you might fetch this from an endpoint.
        // Here we simply read the value from the environment.
        const apiBaseUrl: string = import.meta.env.VITE_API_BASE_URL;
        yield put(fetchConfigSuccess({ apiBaseUrl }));
    } catch (error: any) {
        yield put(fetchConfigFailure(error.message));
    }
}

export function* configSaga() {
    yield takeLatest(fetchConfigRequest.type, fetchConfigSaga);
}
