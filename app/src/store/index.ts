import * as FileService from "./FileService"
import * as Preferences from "./Preferences"
import * as Session from "./Session"

export interface ApplicationState {
    files: FileService.FileServiceState | undefined;
    prefs: Preferences.PreferencesState | undefined;
    session: Session.SessionState | undefined;
}

export const reducers = {
    files: FileService.reducer,
    prefs: Preferences.reducer,
    session: Session.reducer
}

export interface AppThunkAction<TAction> {
    (dispatch: (action: TAction) => void, getState: () => ApplicationState): void;
}
