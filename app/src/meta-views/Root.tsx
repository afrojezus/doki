import React, { useState } from "react"
import { Alert, Fade, Snackbar, Theme, Typography, Box, Slide, SlideProps, CircularProgress } from "@mui/material"
import { useHistory } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { actionCreators, FileServiceState } from "../store/FileService"
import { ApplicationState } from "../store"
import Main from "./Main"
import { PreferencesState } from "../store/Preferences"
import Snow from "../components/Snow"

type TransitionProps = Omit<SlideProps, "direction">

function TransitionLeft(props: TransitionProps) {
    return <Slide {...props} direction="left" />
}

function TransitionDown(props: TransitionProps) {
    return <Slide {...props} direction="down" />
}


export default function Root({ children }: React.PropsWithChildren<any>) {
    const history = useHistory()
    const files = useSelector((state: ApplicationState) => (state.files as FileServiceState).files)
    const success = useSelector((state: ApplicationState) => (state.files as FileServiceState).success)
    const type = useSelector((state: ApplicationState) => (state.files as FileServiceState).responseType)
    const currentFile = useSelector((state: ApplicationState) => (state.files as FileServiceState).currentFile as any)
    const isUploading = useSelector((state: ApplicationState) => (state.files as FileServiceState).isUploading)
    const prefChange = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).lastChange)
    const isLoading = useSelector((state: ApplicationState) => (state.files as FileServiceState).isLoading)
    const cont = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).continuous)
    const tvMode = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).tvMode)
    const snow = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).snow)
    const dispatch = useDispatch()
    const [snackOpen, setSnackOpen] = React.useState<boolean>(false)
    const [snackMessage, setSnackMessage] = React.useState<string>("")
    const [snackType, setSnackType] = React.useState<"info" | "error" | "success" | "warning" | undefined>("info")
    const [loading, setLoading] = useState(true)
    const [showTitle, setShowTitle] = useState(true)

    React.useEffect(() => {
        dispatch(actionCreators.requestAllFiles())
    }, [])

    const handleSnackClose = () => {
        setSnackOpen(false)
    }

    React.useEffect(() => {
        switch (type) {
            case "REQUEST_FILES":
                setTimeout(() => {
                    if (files.length === 0) {
                        setSnackMessage("Fetching files...")
                        setSnackType("info")
                        setSnackOpen(true)
                    }
                }, 1000) // After the intro animation, inform the user the client is currently loading.
                setTimeout(() => {
                    if (files.length === 0) {
                        setSnackMessage("The server might be unavailable.")
                        setSnackType("error")
                        setSnackOpen(true)
                        setShowTitle(false)
                        setLoading(false)
                    }
                }, 15000) // If 15 seconds have gone, inform that the server might not be available.
                break
            case "SEND_FILE":
                if (currentFile != null) {
                    if (currentFile["errors"]) {
                        setSnackMessage(currentFile["errors"][""][0])
                        setSnackType("error")
                    }
                }
                if (!isUploading) {
                    setSnackMessage("Finished uploading!")
                    setSnackType("success")
                }
                setSnackOpen(true)
                break
            case "RECEIVE_FILES":
                setSnackMessage("Received all files")
                setSnackType("success")
                setSnackOpen(true)
                setShowTitle(false)
                setLoading(false)
                break
            case "DELETE_FILE":
                setSnackMessage("File deleted!")
                setSnackType("success")
                setSnackOpen(true)
                break
            case "WILL_UPLOAD":
                setSnackMessage("Uploading...")
                setSnackType("info")
                setSnackOpen(true)
                break
        }
    }, [success])

    React.useEffect(() => {
        switch (prefChange) {
            case "PREF_TV_MODE_CHANGE":
                setSnackMessage(tvMode ? "Changed to TV mode" : "Changed to default mode")
                setSnackType("info")
                setSnackOpen(true)
                break
            case "PREF_CONTINUOUS_CHANGE":
                setSnackMessage(cont ? "Autoplay enabled!" : "Autoplay disabled!")
                setSnackType("info")
                setSnackOpen(true)
                break
            case "PREF_ID_CHANGE":
                setSnackMessage("Registered new Doki ID")
                setSnackType("info")
                setSnackOpen(true)
                break
        }
    }, [prefChange])

    return (
        <>
            {snow && <Snow />}
            <Fade in={showTitle}><Box sx={{
                //animation: 'bg_intro 0.7s ease',
                position: "fixed",
                width: "100%",
                height: "100vh",
                zIndex: -1,
                opacity: 1,
                transition: (theme: Theme) => theme.transitions.create(["all"]),
            }}>
                <Typography sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: (theme) => `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                    backgroundClip: "text",
                    backgroundSize: "400% 100%",
                    color: "transparent",
                    animation: "rainbow_animation 11s ease-in-out infinite",
                    fontWeight: 700,
                    fontSize: "3em",
                    fontFamily: "doublewide, sans-serif",
                    transition: (theme: Theme) => theme.transitions.create(["all"]),
                }}
                    variant="h6">{process.env.REACT_APP_NAME?.toUpperCase()}</Typography></Box></Fade>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                transition: (theme: Theme) => theme.transitions.create(["all"]),
                opacity: 1,
                overflow: "hidden",
                transform: "initial",
                ...(loading && {
                    opacity: 0,
                    transform: "scale(1.1)"
                })
            }}>
                <Main children={children} />
                <Snackbar TransitionComponent={TransitionDown} anchorOrigin={{ vertical: "top", horizontal: "center" }} open={snackOpen} autoHideDuration={3000}
                    onClose={handleSnackClose}>
                    <Alert variant="filled" action={<></>} onClose={handleSnackClose}
                        severity={snackType}>
                        {snackMessage}
                    </Alert>
                </Snackbar>
                {isLoading && <CircularProgress sx={{ position: "fixed", width: 24, right: "50%", left: "50%", transform: "translate(-50%)", bottom: (theme) => theme.spacing(1.5) }} variant="indeterminate" />}
            </Box>
        </>
    )
}