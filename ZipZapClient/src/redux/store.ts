import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import configReducer from './slices/configSlice';
import authReducer from './slices/authSlice';
import jobsReducer from './slices/jobsSlice';
import usersReducer from './slices/usersSlice';
import { configSaga } from './sagas/configSaga';
import { authSaga } from './sagas/authSaga';
import { jobsSaga } from './sagas/jobsSaga';
import { usersSaga } from './sagas/usersSaga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
    reducer: {
        auth: authReducer,
        config: configReducer,
        jobs: jobsReducer,
        users: usersReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(sagaMiddleware),
});

sagaMiddleware.run(authSaga);
sagaMiddleware.run(configSaga);
sagaMiddleware.run(jobsSaga);
sagaMiddleware.run(usersSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

