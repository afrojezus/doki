import {AppThunkAction} from "./index"
import {Action, Reducer} from "redux"

export interface SessionState {
    previouslySeen: number[];
    adminPowers: boolean;
    gridScale: number;
}

export interface PrevSeenAdd {
    type: "SESSION_PREV_SEEN_ADD"
    previouslySeen: number[];
}

export interface PrevSeenReset {
    type: "SESSION_PREV_SEEN_RESET"
    previouslySeen: number[];
}

export interface AdminPowersChange {
    type: "SESSION_ADMIN_CHANGE"
    adminPowers: boolean;
}

export interface GridScaleChange {
    type: "SESSION_GRID_SCALE_CHANGE"
    gridScale: number;
}


type KnownAction = PrevSeenAdd | PrevSeenReset | AdminPowersChange | GridScaleChange;

export const sessionActions = {
    checkFileAsSeen: (id: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.session) {
            dispatch({ type: "SESSION_PREV_SEEN_ADD", previouslySeen: [...appState.session.previouslySeen, id] })
        }
    },
    resetPreviouslySeen: (id: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.session) {
            dispatch({ type: "SESSION_PREV_SEEN_RESET", previouslySeen: [] })
        }
    },
    setAdminPowers: (adminPowers: boolean): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.session) {
            dispatch({ type: "SESSION_ADMIN_CHANGE", adminPowers })
        }
    },
    setGridScale: (gridScale: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.session) {
            dispatch({ type: "SESSION_GRID_SCALE_CHANGE", gridScale })
        }
    },
}

const unloadedState: SessionState = {
    previouslySeen: [],
    adminPowers: false,
    gridScale: 4
}

export const reducer: Reducer<SessionState> = (state: SessionState | undefined, incomingAction: Action): SessionState => {
    if (state === undefined) {
        return unloadedState
    }

    const action = incomingAction as KnownAction
    switch (action.type) {
        case "SESSION_PREV_SEEN_ADD":
            return {
                previouslySeen: action.previouslySeen,
                adminPowers: state.adminPowers,
                gridScale: state.gridScale
            }

        case "SESSION_PREV_SEEN_RESET":
            return {
                previouslySeen: action.previouslySeen,
                adminPowers: state.adminPowers,
                gridScale: state.gridScale
            }
        
        case "SESSION_ADMIN_CHANGE":
            return {
                previouslySeen: state.previouslySeen,
                adminPowers: action.adminPowers,
                gridScale: state.gridScale
            }
        case "SESSION_GRID_SCALE_CHANGE":
            return {
                previouslySeen: state.previouslySeen,
                adminPowers: state.adminPowers,
                gridScale: action.gridScale
            }
    }
    
    return state
}