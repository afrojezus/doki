import {AppThunkAction} from "./index"
import {CommentModel, FileModel} from "../models"
import {Action, Reducer} from "redux"

export interface FileServiceState {
    isLoading: boolean;
    files: FileModel[];
    currentFile: FileModel | null;
    success: boolean;
    error: string;
    identification: string;
    responseType: string;
    freeSpace: number;
    comments: CommentModel[];
    preparingNewFile: boolean;
    isUploading: boolean;
    inWatchMode: boolean;
}

interface RequestFiles {
    type: "REQUEST_FILES";
}

interface ReceiveFile {
    type: "RECEIVE_FILE";
    currentFile: FileModel;
    preparingNewFile: boolean;
}

interface ReceiveFiles {
    type: "RECEIVE_FILES";
    files: FileModel[];
}

interface SenFileModel {
    type: "SEND_FILE";
    files: FileModel[];
    isUploading: boolean;
}

interface FileHandlingSuccessful {
    type: "OPERATION_SUCCESSFUL";
}

interface FileHandlingBegin {
    type: "OPERATION_BEGIN";
}

interface DeleteFile {
    type: "DELETE_FILE";
    files: FileModel[];
}

interface UpdateFile {
    type: "UPDATE_FILE";
    files: FileModel[];
}

interface RequestFreeSpace {
    type: "REQUEST_SPACE";
    freeSpace: number;
}

interface ReceiveComments {
    type: "RECEIVE_COMMENTS";
    comments: CommentModel[];
}

interface PreparingNewFile {
    type: "PREPARING_NEW_FILE";
    preparingNewFile: boolean;
}

interface WillUpload {
    type: "WILL_UPLOAD";
    isUploading: boolean;
}

interface TVon {
    type: "ENABLE_TV_MODE";
}

interface TVoff {
    type: "DISABLE_TV_MODE";
}

interface ResetCurrent {
    type: "RESET_CURRENT_FILE";
}

type KnownAction =
    UpdateFile |
    RequestFreeSpace |
    FileHandlingBegin
    | FileHandlingSuccessful
    | DeleteFile
    | SenFileModel
    | ReceiveFile
    | RequestFiles
    | ReceiveFiles | ReceiveComments | PreparingNewFile | WillUpload | TVon | TVoff | ResetCurrent;

export const actionCreators = {
    requestAllFiles: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files) {
            fetch("api/all")
                .then(response => response.json() as Promise<FileModel[]>)
                .then(data => {
                    dispatch({ type: "RECEIVE_FILES", files: data })
                })

            dispatch({ type: "REQUEST_FILES" })
        }
    },
    requestNewRandomFile: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files) {
            fetch("api/random")
                .then(response => response.json() as Promise<FileModel>)
                .then(data => {
                    if ((data as any)["status"]) {
                        dispatch({ type: "RESET_CURRENT_FILE" })
                    } else {
                        dispatch({ type: "RECEIVE_FILE", currentFile: data, preparingNewFile: false })
                    }
                })

            dispatch({ type: "REQUEST_FILES" })
        }
    },
    requestNewRandomMedia: (random: { FileId: number, Filter: string[] }): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files) {
            fetch("api/random/media", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(random)
            })
                .then(response => response.json() as Promise<FileModel>)
                .then(data => {
                    if ((data as any)["status"]) {
                        dispatch({ type: "RESET_CURRENT_FILE" })
                    } else {
                        dispatch({ type: "RECEIVE_FILE", currentFile: data, preparingNewFile: false })
                    }
                })

            dispatch({ type: "REQUEST_FILES" })
            dispatch({ type: "PREPARING_NEW_FILE", preparingNewFile: true })
        }
    },
    requestProfileRemoval: (removal: { Id: number }): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files) {
            fetch("api/delete/authors", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(removal)
            })
                .then(response => response.json() as Promise<FileModel[]>)
                .then(data => {
                    dispatch({
                        type: "DELETE_FILE",
                        files: data
                    })
                    if (appState.files?.currentFile && appState.files.currentFile.author.authorId === removal.Id.toString()) {
                        dispatch({ type: "RESET_CURRENT_FILE" })
                    }
                })

            dispatch({ type: "OPERATION_BEGIN" })
        }
    },
    requestFile: (id: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files && id) {
            fetch(`api/file/${id}`)
                .then(response => response.json() as Promise<FileModel>)
                .then(data => {
                    if ((data as any)["status"]) {
                        dispatch({ type: "RESET_CURRENT_FILE" })
                    } else {
                        dispatch({ type: "RECEIVE_FILE", currentFile: data, preparingNewFile: false })
                    }
                })
            dispatch({ type: "REQUEST_FILES" })
            dispatch({ type: "PREPARING_NEW_FILE", preparingNewFile: true })
        }
    },
    requestComments: (id: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files && id) {
            fetch(`api/comments/${id}/all`)
                .then(response => response.json() as Promise<CommentModel[]>)
                .then(data => {
                    dispatch({ type: "RECEIVE_COMMENTS", comments: data })
                })
        }
    },
    requestFreeSpace: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files) {
            fetch("api/server/space")
                .then(response => response.json() as Promise<number>)
                .then(data => {
                    dispatch({ type: "REQUEST_SPACE", freeSpace: data })
                })
        }
    },
    requestAllFilesInFolder: (name: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files && name) {
            fetch(`api/folder/${name}`)
                .then(response => response.json() as Promise<FileModel[]>)
                .then(data => {
                    dispatch({ type: "RECEIVE_FILES", files: data })
                })
            dispatch({ type: "REQUEST_FILES" })
        }
    },
    requestAllFilesBy: (author: string): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files && author) {
            fetch(`api/files/by/${author}`)
                .then(response => response.json() as Promise<FileModel[]>)
                .then(data => {
                    dispatch({ type: "RECEIVE_FILES", files: data })
                })
            dispatch({ type: "REQUEST_FILES" })
        }
    },
    senFileModel: (file: FormData): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files && file) {
            fetch("api/upload", {
                method: "POST",
                body: file
            })
                .then(response => response.json() as Promise<any>)
                .then(data => {
                    dispatch({ type: "SEND_FILE", files: data, isUploading: false })
                }).catch(e => console.error(e))
            dispatch({ type: "WILL_UPLOAD", isUploading: true })
        }
    },
    senCommentModel: (id: string, comment: FormData): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files && id && comment) {
            fetch(`api/comments/${id}`, {
                method: "POST",
                body: comment
            })
                .then(response => response.json() as Promise<any>)
                .then(data => {
                    dispatch({ type: "RECEIVE_COMMENTS", comments: data })
                }).catch(e => console.error(e))
        }
    },
    deleteComment: (id: string, comment: FormData): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files && id && comment) {
            fetch(`api/comments/${id}/delete`, {
                method: "POST",
                body: comment
            })
                .then(response => response.json() as Promise<any>)
                .then(data => {
                    dispatch({ type: "RECEIVE_COMMENTS", comments: data })
                }).catch(e => console.error(e))
        }
    },
    deleteFile: (id: number, validation: FormData): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files && id && validation) {
            fetch(`api/delete/${id}`, {
                method: "POST",
                body: validation
            })
                .then(response => response.json() as Promise<FileModel[]>)
                .then(data => {
                    dispatch({
                        type: "DELETE_FILE",
                        files: data
                    })
                    if (appState.files?.currentFile && appState.files.currentFile.id === id) {
                        dispatch({ type: "RESET_CURRENT_FILE" })
                    }
                }).catch(e => console.error(e))
            dispatch({ type: "OPERATION_BEGIN" })
        }
    },
    updateFile: (id: number, validation: FormData): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files && id && validation) {
            fetch(`api/update/${id}`, {
                method: "POST",
                body: validation
            })
                .then(response => response.json() as Promise<FileModel[]>)
                .then(data => {
                    dispatch({
                        type: "UPDATE_FILE",
                        files: data
                    })
                }).catch(e => console.error(e))
            dispatch({ type: "OPERATION_BEGIN" })
        }
    },
    giveLikeToFile: (id: number, validation: FormData): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files && id && validation) {
            fetch(`api/update/like/${id}`, {
                method: "POST",
                body: validation
            })
                .then(response => response.json() as Promise<FileModel[]>)
                .then(data => {
                    dispatch({
                        type: "UPDATE_FILE",
                        files: data
                    })
                }).catch(e => console.error(e))
            dispatch({ type: "OPERATION_BEGIN" })
        }
    },
    giveViewToFile: (id: number, validation: FormData): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files && id && validation) {
            fetch(`api/update/views/${id}`, {
                method: "POST",
                body: validation
            })
                .then(response => response.json() as Promise<FileModel[]>)
                .then(data => {
                    dispatch({
                        type: "UPDATE_FILE",
                        files: data
                    })
                }).catch(e => console.error(e))
            dispatch({ type: "OPERATION_BEGIN" })
        }
    },
    prepareForNewFile: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files) {
            dispatch({ type: "PREPARING_NEW_FILE", preparingNewFile: true })
        }
    },
    stopPreparingForNewFile: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files) {
            dispatch({ type: "PREPARING_NEW_FILE", preparingNewFile: false })
        }
    },
    TVon: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files) {
            dispatch({ type: "ENABLE_TV_MODE" })
        }
    },
    TVoff: (): AppThunkAction<KnownAction> => (dispatch, getState) => {
        const appState = getState()
        if (appState && appState.files) {
            dispatch({ type: "DISABLE_TV_MODE" })
        }
    }
}

const unloadedState: FileServiceState = {
    files: [],
    currentFile: null,
    success: false,
    error: "",
    identification: "",
    isLoading: true,
    responseType: "",
    freeSpace: 0,
    comments: [],
    isUploading: false,
    preparingNewFile: false,
    inWatchMode: true
}

export const reducer: Reducer<FileServiceState> = (state: FileServiceState | undefined, incomingAction: Action): FileServiceState => {
    if (state === undefined) {
        return unloadedState
    }

    const action = incomingAction as KnownAction
    switch (action.type) {
        case "REQUEST_FILES":
            return {
                files: state.files,
                currentFile: state.currentFile,
                isLoading: true,
                success: false,
                error: "",
                identification: state.identification,
                responseType: action.type,
                freeSpace: state.freeSpace,
                comments: state.comments,
                isUploading: state.isUploading,
                preparingNewFile: state.preparingNewFile,
                inWatchMode: state.inWatchMode
            }
        case "RECEIVE_FILES":
            return {
                files: action.files,
                currentFile: state.currentFile,
                isLoading: false,
                error: "",
                success: true,
                identification: state.identification,
                responseType: action.type,
                freeSpace: state.freeSpace,
                comments: state.comments,
                isUploading: state.isUploading,
                preparingNewFile: state.preparingNewFile,
                inWatchMode: state.inWatchMode
            }
        case "RECEIVE_FILE":
            return {
                files: state.files,
                currentFile: action.currentFile,
                isLoading: false,
                error: "",
                success: true,
                identification: state.identification,
                responseType: action.type,
                freeSpace: state.freeSpace,
                comments: state.comments,
                isUploading: state.isUploading,
                preparingNewFile: action.preparingNewFile,
                inWatchMode: state.inWatchMode
            }
        case "SEND_FILE":
            return {
                files: action.files,
                currentFile: state.currentFile,
                isLoading: false,
                success: true,
                error: "",
                identification: state.identification,
                responseType: action.type,
                freeSpace: state.freeSpace,
                comments: state.comments,
                isUploading: action.isUploading,
                preparingNewFile: state.preparingNewFile,
                inWatchMode: state.inWatchMode
            }
        case "DELETE_FILE":
            return {
                files: action.files,
                currentFile: state.currentFile,
                isLoading: false,
                success: true,
                error: "",
                identification: state.identification,
                responseType: action.type,
                freeSpace: state.freeSpace,
                comments: state.comments,
                isUploading: state.isUploading,
                preparingNewFile: state.preparingNewFile,
                inWatchMode: state.inWatchMode
            }
        case "UPDATE_FILE":
            return {
                files: action.files,
                currentFile: state.currentFile,
                isLoading: false,
                success: true,
                error: "",
                identification: state.identification,
                responseType: action.type,
                freeSpace: state.freeSpace,
                comments: state.comments,
                isUploading: state.isUploading,
                preparingNewFile: state.preparingNewFile,
                inWatchMode: state.inWatchMode
            }
        case "OPERATION_BEGIN":
            return {
                files: state.files,
                currentFile: state.currentFile,
                isLoading: true,
                success: false,
                error: "",
                identification: state.identification,
                responseType: action.type,
                freeSpace: state.freeSpace,
                comments: state.comments,
                isUploading: state.isUploading,
                preparingNewFile: state.preparingNewFile,
                inWatchMode: state.inWatchMode
            }
        case "REQUEST_SPACE":
            return {
                files: state.files,
                currentFile: state.currentFile,
                isLoading: false,
                success: true,
                error: "",
                identification: state.identification,
                responseType: action.type,
                freeSpace: action.freeSpace,
                comments: state.comments,
                isUploading: state.isUploading,
                preparingNewFile: state.preparingNewFile,
                inWatchMode: state.inWatchMode
            }
        case "RECEIVE_COMMENTS":
            return {
                files: state.files,
                currentFile: state.currentFile,
                isLoading: false,
                success: true,
                error: "",
                identification: state.identification,
                responseType: action.type,
                freeSpace: state.freeSpace,
                comments: action.comments,
                isUploading: state.isUploading,
                preparingNewFile: state.preparingNewFile,
                inWatchMode: state.inWatchMode
            }
        case "PREPARING_NEW_FILE":
            return {
                files: state.files,
                currentFile: state.currentFile,
                isLoading: state.isLoading,
                success: state.success,
                error: state.error,
                identification: state.identification,
                responseType: action.type,
                freeSpace: state.freeSpace,
                comments: state.comments,
                isUploading: state.isUploading,
                preparingNewFile: action.preparingNewFile,
                inWatchMode: state.inWatchMode
            }
        case "WILL_UPLOAD":
            return {
                files: state.files,
                currentFile: state.currentFile,
                isLoading: state.isLoading,
                success: false,
                error: state.error,
                identification: state.identification,
                responseType: action.type,
                freeSpace: state.freeSpace,
                comments: state.comments,
                isUploading: action.isUploading,
                preparingNewFile: state.preparingNewFile,
                inWatchMode: state.inWatchMode
            }
        case "ENABLE_TV_MODE":
            return {
                files: state.files,
                currentFile: state.currentFile,
                isLoading: state.isLoading,
                success: state.success,
                error: state.error,
                identification: state.identification,
                responseType: action.type,
                freeSpace: state.freeSpace,
                comments: state.comments,
                isUploading: state.isUploading,
                preparingNewFile: state.preparingNewFile,
                inWatchMode: true
            }
        case "DISABLE_TV_MODE":
            return {
                files: state.files,
                currentFile: state.currentFile,
                isLoading: state.isLoading,
                success: state.success,
                error: state.error,
                identification: state.identification,
                responseType: action.type,
                freeSpace: state.freeSpace,
                comments: state.comments,
                isUploading: state.isUploading,
                preparingNewFile: state.preparingNewFile,
                inWatchMode: false
            }
        case "RESET_CURRENT_FILE":
            return {
                files: state.files,
                currentFile: null,
                isLoading: false,
                success: true,
                error: "",
                identification: state.identification,
                responseType: action.type,
                freeSpace: state.freeSpace,
                comments: state.comments,
                isUploading: state.isUploading,
                preparingNewFile: false,
                inWatchMode: state.inWatchMode
            }
    }

    return state
}
