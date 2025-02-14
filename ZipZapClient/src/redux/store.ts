import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import configReducer from './slices/configSlice';
import authReducer from './slices/authSlice';
import { configSaga } from './sagas/configSaga';
import { authSaga } from './sagas/authSaga';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
    reducer: {
        auth: authReducer,
        config: configReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(sagaMiddleware),
});

sagaMiddleware.run(authSaga);
sagaMiddleware.run(configSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

