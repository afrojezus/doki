import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "@src/store";
import { HYDRATE } from "next-redux-wrapper";

// @ts-ignore

export interface SessionState {
    authenticated: boolean;
}

const initialState: SessionState = {
    authenticated: false
};

export const sessionState = createSlice({
    name: "session",
    initialState,
    reducers: {
        setAuthenticated(state, action) {
            state.authenticated = action.payload;
        },
    },
    extraReducers: {
        [HYDRATE]: (state, action) => {
            return {
                ...state,
                ...action.payload.authenticated
            };
        }
    }
});

export const { setAuthenticated } = sessionState.actions;

export const selectAuthenticatedState = (state: AppState) => state.session.authenticated;

export default sessionState.reducer;