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
const fetchJobsApi = async (apiBaseUrl: string) => {
    const response = await fetch(`${apiBaseUrl}/api/jobs`);

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch jobs');
    }

    return response.json();
};

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
const fetchJobApi = async (apiBaseUrl: string, jobId: string) => {
    const response = await fetch(`${apiBaseUrl}/api/jobs/${jobId}`);

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch job');
    }

    return response.json();
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
const createJobApi = async (apiBaseUrl: string, payload: any, token: string) => {
    const response = await fetch(`${apiBaseUrl}/api/jobs`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create job');
    }

    return response.json();
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
const updateJobApi = async (apiBaseUrl: string, jobId: string, payload: any, token: string) => {
    const response = await fetch(`${apiBaseUrl}/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update job');
    }

    return response.json();
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
const deleteJobApi = async (apiBaseUrl: string, jobId: string, token: string) => {
    const response = await fetch(`${apiBaseUrl}/api/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete job');
    }

    return response.json();
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
