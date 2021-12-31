import {AppThunkAction} from "./index"
import {Action, Reducer} from "redux"

export interface SessionState {
    previouslySeen: number[]
}

export interface PrevSeenAdd {
    type: "SESSION_PREV_SEEN_ADD"
    previouslySeen: number[];
}

export interface PrevSeenReset {
    type: "SESSION_PREV_SEEN_RESET"
    previouslySeen: number[];
}


type KnownAction = PrevSeenAdd | PrevSeenReset;

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
}

const unloadedState: SessionState = {
    previouslySeen: []
}

export const reducer: Reducer<SessionState> = (state: SessionState | undefined, incomingAction: Action): SessionState => {
    if (state === undefined) {
        return unloadedState
    }

    const action = incomingAction as KnownAction
    switch (action.type) {
        case "SESSION_PREV_SEEN_ADD":
            return {
                previouslySeen: action.previouslySeen
            }

        case "SESSION_PREV_SEEN_RESET":
            return {
                previouslySeen: action.previouslySeen
            }
    }
    
    return state
}