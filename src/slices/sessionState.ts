import { createSlice } from "@reduxjs/toolkit";
import { File } from "@server/models";
import { AppState } from "@src/store";
import { HYDRATE } from "next-redux-wrapper";

export interface SessionState {
    authenticated: boolean;
    interacted: boolean;
    currentFile?: File;
    volume: number;
}

const initialState: SessionState = {
    authenticated: false,
    interacted: false,
    currentFile: null,
    volume: 0.25
};

export const sessionState = createSlice({
    name: "session",
    initialState,
    reducers: {
        setAuthenticated(state, action) {
            state.authenticated = action.payload;
        },
        setInteracted(state, action) {
            state.interacted = action.payload;
        },
        setCurrentFile(state, action) {
            state.currentFile = action.payload;
        },
        cacheVolume(state, action) {
            state.volume = action.payload;
        }
    },
    extraReducers: {
        [HYDRATE]: (state, action) => {
            return {
                ...state,
                ...action.payload.authenticated,
                ...action.payload.interacted,
                ...action.payload.volume
            };
        }
    }
});

export const { setAuthenticated, setInteracted, setCurrentFile, cacheVolume } = sessionState.actions;

export const useSessionState = (state: AppState) => state.session;

export default sessionState.reducer;