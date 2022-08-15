import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { createWrapper } from 'next-redux-wrapper';
import { sessionState } from './slices/sessionState';
import { settingsState } from './slices/settingsState';

const makeStore = () => configureStore({
    reducer: {
        [sessionState.name]: sessionState.reducer,
        [settingsState.name]: settingsState.reducer
    },
    devTools: true
});

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType,
    AppState, unknown, Action>;

export const wrapper = createWrapper<AppStore>(makeStore);