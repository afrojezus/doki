import { ColorScheme } from "@mantine/core";
import { createSlice } from "@reduxjs/toolkit";
import { AppState } from "@src/store";
import { HYDRATE } from "next-redux-wrapper";

export interface SettingsState {
    colorScheme: ColorScheme | 'auto';
}

const initialState: SettingsState = {
    colorScheme: 'auto'
};

export const settingsState = createSlice({
    name: "settings",
    initialState,
    reducers: {
        setColorScheme(state, action) {
            state.colorScheme = action.payload;
        },
    },
    extraReducers: {
        [HYDRATE]: (state, action) => {
            return {
                ...state,
                ...action.payload.colorScheme
            };
        }
    }
});

export const { setColorScheme } = settingsState.actions;

export const useSettingsState = (state: AppState) => state.settings;

export default settingsState.reducer;