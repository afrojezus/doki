import { Action, Reducer } from "redux"
import { AppThunkAction } from "."
import Cookies from "js-cookie"

export interface PreferencesState {
    id: string;
    colorScheme: string;
    playbackVolume: number;
    willMute: boolean;
    interacted: boolean;
    light: string;
    order: string;
    continuous: boolean;
    watchFilter: string[];
    allowAds: boolean;
    tvMode: boolean;
    lastChange: string;
    snow: boolean;
}

export interface IDChange {
    type: "PREF_ID_CHANGE"
    id: string;
}

export interface ColorSchemeChange {
    type: "PREF_COLORSCHEME_CHANGE"
    colorScheme: string;
}

export interface LightChange {
    type: "PREF_LIGHT_CHANGE"
    light: string;
}

export interface PlaybackVolumeChange {
    type: "PREF_PLAYBACKVOLUME_CHANGE"
    playbackVolume: number;
}

export interface OrderChange {
    type: "PREF_ORDER_CHANGE";
    order: string;
}

export interface MuteChange {
    type: "PREF_MUTE_CHANGE";
    willMute: boolean;
}

export interface ContinuousChange {
    type: "PREF_CONTINUOUS_CHANGE";
    continuous: boolean;
}

export interface FilterChange {
    type: "PREF_FILTER_CHANGE";
    watchFilter: string[];
}

export interface InteractionChange {
    type: "PREF_INTERACTION_CHANGE";
    interacted: boolean;
}

export interface AllowAdsChange {
    type: "PREF_ALLOW_ADS_CHANGE";
    allowAds: boolean;
}

export interface TVModeChange {
    type: "PREF_TV_MODE_CHANGE";
    tvMode: boolean;
}

export interface SnowChange {
    type: "PREF_SNOW_CHANGE";
    snow: boolean;
}

export type KnownAction =
    IDChange
    | ColorSchemeChange
    | PlaybackVolumeChange
    | LightChange
    | OrderChange
    | MuteChange
    | ContinuousChange
    | FilterChange | InteractionChange | AllowAdsChange | TVModeChange | SnowChange;


export const actionCreators = {
    setID: (id: string) => ({ type: "PREF_ID_CHANGE", id } as IDChange),
    setColorScheme: (colorScheme: string) => ({ type: "PREF_COLORSCHEME_CHANGE", colorScheme } as ColorSchemeChange),
    setLight: (light: string) => ({ type: "PREF_LIGHT_CHANGE", light } as LightChange),
    setPlaybackVolume: (playbackVolume: number): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.prefs) {
            localStorage.setItem("playback_volume", playbackVolume.toString())
            dispatch({ type: "PREF_PLAYBACKVOLUME_CHANGE", playbackVolume })
        }
    },
    setOrder: (order: string) => ({ type: "PREF_ORDER_CHANGE", order } as OrderChange),
    setMute: (willMute: boolean) => ({ type: "PREF_MUTE_CHANGE", willMute } as MuteChange),
    setInteracted: (interacted: boolean) => ({ type: "PREF_INTERACTION_CHANGE", interacted } as InteractionChange),
    setContinuous: (continuous: boolean) => ({ type: "PREF_CONTINUOUS_CHANGE", continuous } as ContinuousChange),
    setAdPreference: (allowAds: boolean) => ({ type: "PREF_ALLOW_ADS_CHANGE", allowAds } as AllowAdsChange),
    setWatchFilter: (watchFilter: string[]): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.prefs) {
            localStorage.setItem("watch_filter", watchFilter.join(","))
            dispatch({ type: "PREF_FILTER_CHANGE", watchFilter })
        }
    },
    setTVMode: (tvMode: boolean) => ({ type: "PREF_TV_MODE_CHANGE", tvMode } as TVModeChange),
    setSnowMode: (snow: boolean) => ({ type: "PREF_SNOW_CHANGE", snow } as SnowChange)
}

const unloadedState: PreferencesState = {
    id: Cookies.get("DokiIdentification") ? Cookies.get("DokiIdentification") as string : "",
    colorScheme: localStorage.getItem("color_scheme") ? localStorage.getItem("color_scheme") as string : "aka",
    playbackVolume: localStorage.getItem("playback_volume") ? parseFloat(localStorage.getItem("playback_volume") as string) : 0.35,
    light: localStorage.getItem("light") ? localStorage.getItem("light") as string : "dark",
    order: "time",
    willMute: false,
    continuous: true,
    interacted: false,
    allowAds: localStorage.getItem("ads") ? (localStorage.getItem("ads") as string) === "true" : false,
    watchFilter: localStorage.getItem("watch_filter") ? (localStorage.getItem("watch_filter") as string).split(",") as string[] : [],
    tvMode: localStorage.getItem("tv_mode") ? (localStorage.getItem("tv_mode") as string) === "true" : false,
    lastChange: "",
    snow: localStorage.getItem("snow") ? (localStorage.getItem("snow") as string) === "true" : true,
}

export const reducer: Reducer<PreferencesState> = (state: PreferencesState | undefined, incomingAction: Action): PreferencesState => {
    if (state === undefined) {
        return unloadedState
    }

    const action = incomingAction as KnownAction
    switch (action.type) {
        case "PREF_ID_CHANGE":
            return {
                colorScheme: state.colorScheme,
                id: action.id,
                playbackVolume: state.playbackVolume,
                light: state.light,
                order: state.order,
                willMute: state.willMute,
                continuous: state.continuous,
                watchFilter: state.watchFilter,
                interacted: state.interacted,
                allowAds: state.allowAds,
                tvMode: state.tvMode,
                lastChange: action.type,
                snow: state.snow,
            }
        case "PREF_COLORSCHEME_CHANGE":
            return {
                colorScheme: action.colorScheme,
                id: state.id,
                playbackVolume: state.playbackVolume,
                light: state.light,
                order: state.order,
                willMute: state.willMute,
                continuous: state.continuous,
                watchFilter: state.watchFilter,
                interacted: state.interacted,
                allowAds: state.allowAds,
                tvMode: state.tvMode,
                lastChange: action.type,
                snow: state.snow,
            }
        case "PREF_PLAYBACKVOLUME_CHANGE":
            return {
                colorScheme: state.colorScheme,
                id: state.id,
                playbackVolume: action.playbackVolume,
                light: state.light,
                order: state.order,
                willMute: state.willMute,
                continuous: state.continuous,
                watchFilter: state.watchFilter,
                interacted: state.interacted,
                allowAds: state.allowAds,
                tvMode: state.tvMode,
                lastChange: action.type,
                snow: state.snow,
            }
        case "PREF_LIGHT_CHANGE":
            return {
                colorScheme: state.colorScheme,
                id: state.id,
                playbackVolume: state.playbackVolume,
                light: action.light,
                order: state.order,
                willMute: state.willMute,
                continuous: state.continuous,
                watchFilter: state.watchFilter,
                interacted: state.interacted,
                allowAds: state.allowAds,
                tvMode: state.tvMode,
                lastChange: action.type,
                snow: state.snow,
            }
        case "PREF_ORDER_CHANGE":
            return {
                colorScheme: state.colorScheme,
                id: state.id,
                playbackVolume: state.playbackVolume,
                light: state.light,
                order: action.order,
                willMute: state.willMute,
                continuous: state.continuous,
                watchFilter: state.watchFilter,
                interacted: state.interacted,
                allowAds: state.allowAds,
                tvMode: state.tvMode,
                lastChange: action.type,
                snow: state.snow,
            }
        case "PREF_MUTE_CHANGE":
            return {
                colorScheme: state.colorScheme,
                id: state.id,
                playbackVolume: state.playbackVolume,
                light: state.light,
                order: state.order,
                willMute: action.willMute,
                continuous: state.continuous,
                watchFilter: state.watchFilter,
                interacted: state.interacted,
                allowAds: state.allowAds,
                tvMode: state.tvMode,
                lastChange: action.type,
                snow: state.snow,
            }
        case "PREF_CONTINUOUS_CHANGE":
            return {
                colorScheme: state.colorScheme,
                id: state.id,
                playbackVolume: state.playbackVolume,
                light: state.light,
                order: state.order,
                willMute: state.willMute,
                continuous: action.continuous,
                watchFilter: state.watchFilter,
                interacted: state.interacted,
                allowAds: state.allowAds,
                tvMode: state.tvMode,
                lastChange: action.type,
                snow: state.snow,
            }
        case "PREF_FILTER_CHANGE":
            return {
                colorScheme: state.colorScheme,
                id: state.id,
                playbackVolume: state.playbackVolume,
                light: state.light,
                order: state.order,
                willMute: state.willMute,
                continuous: state.continuous,
                watchFilter: action.watchFilter,
                interacted: state.interacted,
                allowAds: state.allowAds,
                tvMode: state.tvMode,
                lastChange: action.type,
                snow: state.snow,
            }
        case "PREF_INTERACTION_CHANGE":
            return {
                colorScheme: state.colorScheme,
                id: state.id,
                playbackVolume: state.playbackVolume,
                light: state.light,
                order: state.order,
                willMute: state.willMute,
                continuous: state.continuous,
                watchFilter: state.watchFilter,
                interacted: action.interacted,
                allowAds: state.allowAds,
                tvMode: state.tvMode,
                lastChange: action.type,
                snow: state.snow,
            }
        case "PREF_ALLOW_ADS_CHANGE":
            return {
                colorScheme: state.colorScheme,
                id: state.id,
                playbackVolume: state.playbackVolume,
                light: state.light,
                order: state.order,
                willMute: state.willMute,
                continuous: state.continuous,
                watchFilter: state.watchFilter,
                interacted: state.interacted,
                allowAds: action.allowAds,
                tvMode: state.tvMode,
                lastChange: action.type,
                snow: state.snow,
            }
        case "PREF_TV_MODE_CHANGE":
            return {
                colorScheme: state.colorScheme,
                id: state.id,
                playbackVolume: state.playbackVolume,
                light: state.light,
                order: state.order,
                willMute: state.willMute,
                continuous: state.continuous,
                watchFilter: state.watchFilter,
                interacted: state.interacted,
                allowAds: state.allowAds,
                tvMode: action.tvMode,
                lastChange: action.type,
                snow: state.snow,
            }
        case "PREF_SNOW_CHANGE":
            return {
                colorScheme: state.colorScheme,
                id: state.id,
                playbackVolume: state.playbackVolume,
                light: state.light,
                order: state.order,
                willMute: state.willMute,
                continuous: state.continuous,
                watchFilter: state.watchFilter,
                interacted: state.interacted,
                allowAds: state.allowAds,
                tvMode: state.tvMode,
                lastChange: action.type,
                snow: action.snow,
            }
        default:
            return state
    }
}