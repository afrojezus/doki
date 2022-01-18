import { Action, Reducer } from 'redux';
import { AppThunkAction } from './index';

interface Progress {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
}

export interface SessionState {
    previouslySeen: number[];
    adminPowers: boolean;
    gridScale: number;
    currentFolder: string | null;
    currentTag: string | null;

    showNavigationPane: boolean;
    showOptionsPane: boolean;
    showPlayer: boolean;
    showUploader: boolean;

  playing: boolean;
  progress: Progress;
  duration: number;
  tmpSeek: number;

}

export interface PrevSeenAdd {
    type: 'SESSION_PREV_SEEN_ADD'
    previouslySeen: number[];
}

export interface PrevSeenReset {
    type: 'SESSION_PREV_SEEN_RESET'
    previouslySeen: number[];
}

export interface AdminPowersChange {
    type: 'SESSION_ADMIN_CHANGE'
    adminPowers: boolean;
}

export interface GridScaleChange {
    type: 'SESSION_GRID_SCALE_CHANGE'
    gridScale: number;
}

export interface CurrentFolderChange {
    type: 'SESSION_CURRENT_FOLDER_CHANGE'
    currentFolder: string | null;
}

export interface CurrentTagChange {
  type: 'SESSION_CURRENT_TAG_CHANGE'
  currentTag: string | null;
}

export interface NavigationPaneChange {
    type: 'SESSION_NAVIGATION_PANE_CHANGE'
    showNavigationPane: boolean;
}

export interface OptionsPaneChange {
    type: 'SESSION_OPTIONS_PANE_CHANGE'
    showOptionsPane: boolean;
}

export interface PlayerChange {
    type: 'SESSION_PLAYER_CHANGE'
    showPlayer: boolean;
}

export interface UploaderChange {
  type: 'SESSION_UPLOADER_CHANGE'
  showUploader: boolean;
}

export interface ControlPlayingChange {
  type: 'SESSION_CONTROL_PLAYING_CHANGE'
  playing: boolean;
}

export interface ControlProgressChange {
  type: 'SESSION_CONTROL_PROGRESS_CHANGE'
  progress: Progress;
}

export interface ControlDurationChange {
  type: 'SESSION_CONTROL_DURATION_CHANGE'
  duration: number;
}

export interface ControlSeekChange {
  type: 'SESSION_CONTROL_SEEK_CHANGE'
  tmpSeek: number;
}

type KnownAction = PrevSeenAdd | PrevSeenReset | AdminPowersChange | GridScaleChange | CurrentFolderChange | CurrentTagChange | NavigationPaneChange | OptionsPaneChange | PlayerChange | UploaderChange | ControlPlayingChange | ControlProgressChange| ControlDurationChange | ControlSeekChange;

export const sessionActions = {
  checkFileAsSeen: (id: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const appState = getState();
    if (appState && appState.session) {
      dispatch({ type: 'SESSION_PREV_SEEN_ADD', previouslySeen: [...appState.session.previouslySeen, id] });
    }
  },
  resetPreviouslySeen: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const appState = getState();
    if (appState && appState.session) {
      dispatch({ type: 'SESSION_PREV_SEEN_RESET', previouslySeen: [] });
    }
  },
  setAdminPowers: (adminPowers: boolean): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const appState = getState();
    if (appState && appState.session) {
      dispatch({ type: 'SESSION_ADMIN_CHANGE', adminPowers });
    }
  },
  setGridScale: (gridScale: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const appState = getState();
    if (appState && appState.session) {
      dispatch({ type: 'SESSION_GRID_SCALE_CHANGE', gridScale });
    }
  },
  setCurrentFolder: (currentFolder: string | null): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const appState = getState();
    if (appState && appState.session) {
      dispatch({ type: 'SESSION_CURRENT_FOLDER_CHANGE', currentFolder });
    }
  },
  setCurrentTag: (currentTag: string | null): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const appState = getState();
    if (appState && appState.session) {
      dispatch({ type: 'SESSION_CURRENT_TAG_CHANGE', currentTag });
    }
  },
  setNavigationPane: (showNavigationPane: boolean): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const appState = getState();
    if (appState && appState.session) {
      dispatch({ type: 'SESSION_NAVIGATION_PANE_CHANGE', showNavigationPane });
    }
  },
  setOptionsPane: (showOptionsPane: boolean): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const appState = getState();
    if (appState && appState.session) {
      dispatch({ type: 'SESSION_OPTIONS_PANE_CHANGE', showOptionsPane });
    }
  },
  setPlayer: (showPlayer: boolean): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const appState = getState();
    if (appState && appState.session) {
      dispatch({ type: 'SESSION_PLAYER_CHANGE', showPlayer });
    }
  },
  setUploader: (showUploader: boolean): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const appState = getState();
    if (appState && appState.session) {
      dispatch({ type: 'SESSION_UPLOADER_CHANGE', showUploader });
    }
  },
  setControlPlaying: (playing: boolean): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const appState = getState();
    if (appState && appState.session) {
      dispatch({ type: 'SESSION_CONTROL_PLAYING_CHANGE', playing });
    }
  },
  setControlProgress: (progress: Progress): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const appState = getState();
    if (appState && appState.session) {
      dispatch({ type: 'SESSION_CONTROL_PROGRESS_CHANGE', progress });
    }
  },
  setControlDuration: (duration: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const appState = getState();
    if (appState && appState.session) {
      dispatch({ type: 'SESSION_CONTROL_DURATION_CHANGE', duration });
    }
  },
  setControlSeek: (tmpSeek: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
    const appState = getState();
    if (appState && appState.session) {
      dispatch({ type: 'SESSION_CONTROL_SEEK_CHANGE', tmpSeek });
    }
  },
};

const unloadedState: SessionState = {
  previouslySeen: [],
  adminPowers: false,
  gridScale: 5,
  showPlayer: true,
  showUploader: false,
  showNavigationPane: true,
  showOptionsPane: false,
  currentFolder: null,
  currentTag: null,
  playing: true,
  progress: {
    played: 0, playedSeconds: 0, loaded: 0, loadedSeconds: 0,
  },
  duration: 0,
  tmpSeek: 0,
};

export const reducer: Reducer<SessionState> = (state: SessionState | undefined, incomingAction: Action): SessionState => {
  if (state === undefined) {
    return unloadedState;
  }

  const action = incomingAction as KnownAction;
  // eslint-disable-next-line default-case
  switch (action.type) {
    case 'SESSION_PREV_SEEN_ADD':
      return {
        previouslySeen: action.previouslySeen,
        adminPowers: state.adminPowers,
        gridScale: state.gridScale,
        currentFolder: state.currentFolder,
        currentTag: state.currentTag,
        showNavigationPane: state.showNavigationPane,
        showOptionsPane: state.showOptionsPane,
        showPlayer: state.showPlayer,
        showUploader: state.showUploader,
        playing: state.playing,
        progress: state.progress,
        duration: state.duration,
        tmpSeek: state.tmpSeek,
      };

    case 'SESSION_PREV_SEEN_RESET':
      return {
        previouslySeen: action.previouslySeen,
        adminPowers: state.adminPowers,
        gridScale: state.gridScale,
        currentFolder: state.currentFolder,
        currentTag: state.currentTag,
        showNavigationPane: state.showNavigationPane,
        showOptionsPane: state.showOptionsPane,
        showPlayer: state.showPlayer,
        showUploader: state.showUploader,
        playing: state.playing,
        progress: state.progress,
        duration: state.duration,
        tmpSeek: state.tmpSeek,
      };

    case 'SESSION_ADMIN_CHANGE':
      return {
        previouslySeen: state.previouslySeen,
        adminPowers: action.adminPowers,
        gridScale: state.gridScale,
        currentFolder: state.currentFolder,
        currentTag: state.currentTag,
        showNavigationPane: state.showNavigationPane,
        showOptionsPane: state.showOptionsPane,
        showPlayer: state.showPlayer,
        showUploader: state.showUploader,
        playing: state.playing,
        progress: state.progress,
        duration: state.duration,
        tmpSeek: state.tmpSeek,
      };
    case 'SESSION_GRID_SCALE_CHANGE':
      return {
        previouslySeen: state.previouslySeen,
        adminPowers: state.adminPowers,
        gridScale: action.gridScale,
        currentFolder: state.currentFolder,
        currentTag: state.currentTag,
        showNavigationPane: state.showNavigationPane,
        showOptionsPane: state.showOptionsPane,
        showPlayer: state.showPlayer,
        showUploader: state.showUploader,
        playing: state.playing,
        progress: state.progress,
        duration: state.duration,
        tmpSeek: state.tmpSeek,
      };
    case 'SESSION_CURRENT_FOLDER_CHANGE':
      return {
        previouslySeen: state.previouslySeen,
        adminPowers: state.adminPowers,
        gridScale: state.gridScale,
        currentFolder: action.currentFolder,
        currentTag: state.currentTag,
        showNavigationPane: state.showNavigationPane,
        showOptionsPane: state.showOptionsPane,
        showPlayer: state.showPlayer,
        showUploader: state.showUploader,
        playing: state.playing,
        progress: state.progress,
        duration: state.duration,
        tmpSeek: state.tmpSeek,
      };
    case 'SESSION_CURRENT_TAG_CHANGE':
      return {
        previouslySeen: state.previouslySeen,
        adminPowers: state.adminPowers,
        gridScale: state.gridScale,
        currentFolder: state.currentFolder,
        currentTag: action.currentTag,
        showNavigationPane: state.showNavigationPane,
        showOptionsPane: state.showOptionsPane,
        showPlayer: state.showPlayer,
        showUploader: state.showUploader,
        playing: state.playing,
        progress: state.progress,
        duration: state.duration,
        tmpSeek: state.tmpSeek,
      };
    case 'SESSION_NAVIGATION_PANE_CHANGE':
      return {
        previouslySeen: state.previouslySeen,
        adminPowers: state.adminPowers,
        gridScale: state.gridScale,
        currentFolder: state.currentFolder,
        currentTag: state.currentTag,
        showNavigationPane: action.showNavigationPane,
        showOptionsPane: state.showOptionsPane,
        showPlayer: state.showPlayer,
        showUploader: state.showUploader,
        playing: state.playing,
        progress: state.progress,
        duration: state.duration,
        tmpSeek: state.tmpSeek,
      };
    case 'SESSION_OPTIONS_PANE_CHANGE':
      return {
        previouslySeen: state.previouslySeen,
        adminPowers: state.adminPowers,
        gridScale: state.gridScale,
        currentFolder: state.currentFolder,
        currentTag: state.currentTag,
        showNavigationPane: state.showNavigationPane,
        showOptionsPane: action.showOptionsPane,
        showPlayer: state.showPlayer,
        showUploader: state.showUploader,
        playing: state.playing,
        progress: state.progress,
        duration: state.duration,
        tmpSeek: state.tmpSeek,
      };
    case 'SESSION_PLAYER_CHANGE':
      return {
        previouslySeen: state.previouslySeen,
        adminPowers: state.adminPowers,
        gridScale: state.gridScale,
        currentFolder: state.currentFolder,
        currentTag: state.currentTag,
        showNavigationPane: state.showNavigationPane,
        showOptionsPane: state.showOptionsPane,
        showPlayer: action.showPlayer,
        showUploader: state.showUploader,
        playing: state.playing,
        progress: state.progress,
        duration: state.duration,
        tmpSeek: state.tmpSeek,
      };
    case 'SESSION_UPLOADER_CHANGE':
      return {
        previouslySeen: state.previouslySeen,
        adminPowers: state.adminPowers,
        gridScale: state.gridScale,
        currentFolder: state.currentFolder,
        currentTag: state.currentTag,
        showNavigationPane: state.showNavigationPane,
        showOptionsPane: state.showOptionsPane,
        showPlayer: state.showPlayer,
        showUploader: action.showUploader,
        playing: state.playing,
        progress: state.progress,
        duration: state.duration,
        tmpSeek: state.tmpSeek,
      };
    case 'SESSION_CONTROL_PLAYING_CHANGE':
      return {
        previouslySeen: state.previouslySeen,
        adminPowers: state.adminPowers,
        gridScale: state.gridScale,
        currentFolder: state.currentFolder,
        currentTag: state.currentTag,
        showNavigationPane: state.showNavigationPane,
        showOptionsPane: state.showOptionsPane,
        showPlayer: state.showPlayer,
        showUploader: state.showUploader,
        playing: action.playing,
        progress: state.progress,
        duration: state.duration,
        tmpSeek: state.tmpSeek,
      };
    case 'SESSION_CONTROL_PROGRESS_CHANGE':
      return {
        previouslySeen: state.previouslySeen,
        adminPowers: state.adminPowers,
        gridScale: state.gridScale,
        currentFolder: state.currentFolder,
        currentTag: state.currentTag,
        showNavigationPane: state.showNavigationPane,
        showOptionsPane: state.showOptionsPane,
        showPlayer: state.showPlayer,
        showUploader: state.showUploader,
        playing: state.playing,
        progress: action.progress,
        duration: state.duration,
        tmpSeek: state.tmpSeek,
      };
    case 'SESSION_CONTROL_DURATION_CHANGE':
      return {
        previouslySeen: state.previouslySeen,
        adminPowers: state.adminPowers,
        gridScale: state.gridScale,
        currentFolder: state.currentFolder,
        currentTag: state.currentTag,
        showNavigationPane: state.showNavigationPane,
        showOptionsPane: state.showOptionsPane,
        showPlayer: state.showPlayer,
        showUploader: state.showUploader,
        playing: state.playing,
        progress: state.progress,
        duration: action.duration,
        tmpSeek: state.tmpSeek,
      };
    case 'SESSION_CONTROL_SEEK_CHANGE':
      return {
        previouslySeen: state.previouslySeen,
        adminPowers: state.adminPowers,
        gridScale: state.gridScale,
        currentFolder: state.currentFolder,
        currentTag: state.currentTag,
        showNavigationPane: state.showNavigationPane,
        showOptionsPane: state.showOptionsPane,
        showPlayer: state.showPlayer,
        showUploader: state.showUploader,
        playing: state.playing,
        progress: state.progress,
        duration: state.duration,
        tmpSeek: action.tmpSeek,
      };
  }

  return state;
};
