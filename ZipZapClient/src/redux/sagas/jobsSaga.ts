import { call, put, takeLatest, select } from 'redux-saga/effects';
import {
    fetchJobsSuccess,
    fetchJobsFailure,
    fetchJobSuccess,
    fetchJobFailure,
    createJobSuccess,
    createJobFailure,
    updateJobSuccess,
    updateJobFailure,
    deleteJobSuccess,
    deleteJobFailure,
    createJobRequest,
    deleteJobRequest,
    fetchJobRequest,
    fetchJobsRequest,
    updateJobRequest,
} from '../slices/jobsSlice';
import { RootState } from '../store';

// Selector to get API base URL from config slice
const selectApiBaseUrl = (state: RootState) => state.config.apiBaseUrl;

// Fetch all jobs API call
function fetchJobsApi(apiBaseUrl: string) {
    return fetch(`${apiBaseUrl}/api/jobs`).then((res) => {
        if (!res.ok) {
            return res.json().then((data) => {
                throw new Error(data.message || 'Failed to fetch jobs');
            });
        }
        return res.json();
    });
}

function* fetchJobsSaga() {
    try {
        const apiBaseUrl: string = yield select(selectApiBaseUrl);
        const jobs = yield call(fetchJobsApi, apiBaseUrl);
        yield put(fetchJobsSuccess(jobs));
    } catch (error: any) {
        yield put(fetchJobsFailure(error.message));
    }
}

// Fetch single job API call
function fetchJobApi(apiBaseUrl: string, jobId: string) {
    return fetch(`${apiBaseUrl}/api/jobs/${jobId}`).then((res) => {
        if (!res.ok) {
            return res.json().then((data) => {
                throw new Error(data.message || 'Failed to fetch job');
            });
        }
        return res.json();
    });
}

function* fetchJobSaga(action: { payload: string; type: string }) {
    try {
        const apiBaseUrl: string = yield select(selectApiBaseUrl);
        const job = yield call(fetchJobApi, apiBaseUrl, action.payload);
        yield put(fetchJobSuccess(job));
    } catch (error: any) {
        yield put(fetchJobFailure(error.message));
    }
}

// Create job API call
function createJobApi(apiBaseUrl: string, payload: any, token: string) {
    return fetch(`${apiBaseUrl}/api/jobs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    }).then((res) => {
        if (!res.ok) {
            return res.json().then((data) => {
                throw new Error(data.message || 'Failed to create job');
            });
        }
        return res.json();
    });
}

function* createJobSaga(action: { payload: { data: any; token: string }; type: string }) {
    try {
        const apiBaseUrl: string = yield select(selectApiBaseUrl);
        const job = yield call(createJobApi, apiBaseUrl, action.payload.data, action.payload.token);
        yield put(createJobSuccess(job));
    } catch (error: any) {
        yield put(createJobFailure(error.message));
    }
}

// Update job API call
function updateJobApi(apiBaseUrl: string, jobId: string, payload: any, token: string) {
    return fetch(`${apiBaseUrl}/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    }).then((res) => {
        if (!res.ok) {
            return res.json().then((data) => {
                throw new Error(data.message || 'Failed to update job');
            });
        }
        return res.json();
    });
}

function* updateJobSaga(action: { payload: { jobId: string; data: any; token: string }; type: string }) {
    try {
        const apiBaseUrl: string = yield select(selectApiBaseUrl);
        const job = yield call(updateJobApi, apiBaseUrl, action.payload.jobId, action.payload.data, action.payload.token);
        yield put(updateJobSuccess(job));
    } catch (error: any) {
        yield put(updateJobFailure(error.message));
    }
}

// Delete job API call
function deleteJobApi(apiBaseUrl: string, jobId: string, token: string) {
    return fetch(`${apiBaseUrl}/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }).then((res) => {
        if (!res.ok) {
            return res.json().then((data) => {
                throw new Error(data.message || 'Failed to delete job');
            });
        }
        return res.json();
    });
}

function* deleteJobSaga(action: { payload: { jobId: string; token: string }; type: string }) {
    try {
        const apiBaseUrl: string = yield select(selectApiBaseUrl);
        yield call(deleteJobApi, apiBaseUrl, action.payload.jobId, action.payload.token);
        yield put(deleteJobSuccess(action.payload.jobId));
    } catch (error: any) {
        yield put(deleteJobFailure(error.message));
    }
}

export function* jobsSaga() {
    yield takeLatest(fetchJobsRequest.type, fetchJobsSaga);
    yield takeLatest(fetchJobRequest.type, fetchJobSaga);
    yield takeLatest(createJobRequest.type, createJobSaga);
    yield takeLatest(updateJobRequest.type, updateJobSaga);
    yield takeLatest(deleteJobRequest.type, deleteJobSaga);
}
