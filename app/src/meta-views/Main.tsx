import {
    AppBar,
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    DialogContent,
    DialogTitle,
    Divider,
    Dialog,
    Fade,
    IconButton, LinearProgress,
    List,
    ListItem,
    ListItemText,
    Menu,
    MenuItem, Paper,
    Popover,
    Slide,
    Switch,
    TextField,
    Theme,
    Toolbar,
    Tooltip,
    Typography,
    useMediaQuery,
    DialogActions, linearProgressClasses
} from "@mui/material"
import Browser from "../routes/Browser"
import { createStyles, makeStyles, withStyles } from "@mui/styles"
import {
    AccountBoxTwoTone as AccountIcon,
    CommentTwoTone as CommentIcon,
    MoreVertTwoTone as MoreIcon,
    OpenInNewTwoTone as OpenIcon,
    PlaylistPlayTwoTone as PlaylistIcon,
    RefreshTwoTone,
    ReportTwoTone as ReportIcon,
    SettingsTwoTone as SettingsIcon, SettingsRemote,
    ShareTwoTone as ShareIcon,
    ThumbUpTwoTone as LikeIcon,
    Tv,
    VolumeMuteTwoTone as VolMuteIcon,
    VolumeUpTwoTone as VolIcon,
    PlayCircleTwoTone as PlayIcon,
    PauseCircleTwoTone as PauseIcon,
    FastRewindTwoTone as RewindIcon,
    FastForwardTwoTone as ForwardIcon,
    MenuTwoTone as MenuIcon, ExpandLess, ExpandMore
} from "@mui/icons-material"
import moment from "moment"
import React, { useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useHistory } from "react-router"
import { Link, NavLink, Switch as SwitchRouter, useLocation } from "react-router-dom"
import { CommentModel, FileModel } from "../models"
import { ApplicationState } from "../store"
import { actionCreators, FileServiceState } from "../store/FileService"
import { actionCreators as prefCreators, PreferencesState } from "../store/Preferences"
import Commenter from "../components/Commenter"
import MediaPlayer from "../components/MediaPlayer"
import Settings from "../components/Settings"
import Report from "../components/Report"
import PlaylistThumbnail from "../components/extended/PlaylistThumbnail"
import MarginedToolbarIconButton from "../components/extended/MarginedToolbarIconButton"
import ToolbarVolumeSlider from "../components/extended/ToolbarVolumeSlider"
import ToolbarCaption from "../components/extended/ToolbarCaption"
import { audioExt, checkFile, displayFilename, imgExt, mediaExt, truncate, viewable } from "../utils"
import clsx from "clsx"


import { LightTooltip } from "../utils"

const useStyles = makeStyles((theme: Theme) => createStyles({
    playerFlex: {
        flex: 1,
        //display: 'flex',
        transition: theme.transitions.create(["all"])
    },
    tvContainer: {
        bottom: 0,
        right: 0,
        height: "100vh",
        position: "fixed",
        width: "100%",
        transition: theme.transitions.create(["all"])
    },
    tvHide: {
        opacity: 0.25,
        pointerEvents: "none"
    },
    routeFlex: {
        display: "inline-flex",
        flexDirection: "column",
        height: `calc(100vh - ${TOOLBAR_SIZE}px)`,
        transition: theme.transitions.create(["all"])
    },
    closeFlex: {
        flex: 0
    },
    toggleIcon: {
        transition: theme.transitions.create(["all"])
    },
    dokiBrand: {
        position: "fixed",
        bottom: theme.spacing(1),
        left: theme.spacing(2),
        textShadow: "4px 4px 0px rgba(0,0,0,1)"
    },
    appbar: {
        top: "initial",
        bottom: 0,
        opacity: 0.05,
        transition: theme.transitions.create(["all"]),
        "& > * > * > .unique-icon": {
            opacity: 0,
            maxWidth: 0,
            margin: 0,
            padding: 0
        },
        borderBottom: "none",
        borderTop: "1px solid rgba(255,255,255,.12)"
    },
    appbarHover: {
        opacity: 1,
        "& > * > * > .unique-icon": {
            opacity: 1,
            maxWidth: 24,
            margin: "initial",
            padding: "initial"
        },
        background: theme.palette.mode === "light" ? "rgba(255,255,255,.95)" : "rgba(0,0,0,.95)"
    },
    player: {
        width: "100%",
        height: "100vh",
        border: "none",
        "& > * > * > video": {
            transition: theme.transitions.create(["all"])
        }
    },
    inactivePlayer: {
        height: 100
    },
    inactivePlayerTV: {
        filter: "brightness(25%)"
    },
    toolbar: {
        minHeight: TOOLBAR_SIZE,
        padding: theme.spacing(0, 1)
    },
    mini: {
        pointerEvents: "none",
        position: "fixed",
        opacity: 0
    },
    miniPadding: {
    },
    hiddenPanel: {
        maxHeight: "0 !important",
        opacity: "0 !important",
        flex: "0 !important",
        margin: "0 !important",
        padding: "0 !important",
        pointerEvents: "none"
    },
    hidden: {
        maxWidth: "0 !important",
        opacity: "0 !important",
        flex: "0 !important",
        margin: "0 !important",
        padding: "0 !important",
        pointerEvents: "none"
    },
    button: {
        color: theme.palette.primary.contrastText,
        margin: theme.spacing(0, 0.5),
        "&:first-child": {
            margin: 0
        },
        "&:last-child": {
            margin: 0
        }
    },
    divider: {
        margin: theme.spacing(0, 1),
        height: theme.spacing(6)
    },
    status: {
        margin: theme.spacing(0, 1),
        transition: theme.transitions.create(["all"])
    },
    visible: {
        opacity: 1
    },
    visibleTV: {},
    seeker: {
        width: "100%",
        padding: 0,
        margin: 0,
        marginBottom: -2,
        display: "block"
    },
    visualizer: {
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0
    },
    fullTrigger: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: `calc(100% - ${theme.mixins.toolbar.minHeight as number}px - ${theme.spacing(8)}px)`
    },
    gif: {
        position: "absolute",
        backgroundColor: "black",
        top: 0,
        left: 0,
        height: "100%",
        width: "100%"
    },
    tvIcon: {
        fontWeight: 700,
        margin: theme.spacing(0, 1),
        marginTop: 4,
        transition: theme.transitions.create(["all"]),
        fontFamily: "'Josefin Sans', sans-serif",
    },
    spinner: {
        width: 20,
        transition: theme.transitions.create(["all"])
    },
    reminder: {
        margin: theme.spacing(0, 3),
        color: theme.palette.text.secondary
    },
    rainbowPaper: {
        background: `linear-gradient(to right, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
        animation: "rainbow_animation 30s ease-in-out infinite",
        backgroundSize: "400% 100%",
        height: "100vh"
    },
    rainbow: {
        background: "linear-gradient(to right, #6666ff, #0099ff , #00ff00, #ff3399, #6666ff)",
        "-webkit-background-clip": "text",
        backgroundClip: "text",
        color: "transparent",
        animation: "rainbow_animation 6s ease-in-out infinite",
        backgroundSize: "400% 100%",
        opacity: "1 !important",
        whiteSpace: "nowrap",
        lineHeight: "normal",
    },
    plainbow: {
        opacity: "1 !important",
        whiteSpace: "nowrap",
        lineHeight: "normal",
        transition: theme.transitions.create(["all"])
    },
    moreControl: {
        display: "inline-flex",
        transition: theme.transitions.create(["all"])
    },
    subtitle: {
        whiteSpace: "nowrap"
    },
    drawer: {
        width: DRAWER_WIDTH,
        flexShrink: 0,
    },
    drawerPaper: {
        width: DRAWER_WIDTH,
    },
    drawerHeader: {
        display: "flex",
        alignItems: "center",
        padding: theme.spacing(0, 2),
        // necessary for content to be below app bar
        ...theme.mixins.toolbar,
        justifyContent: "flex-start",
    },
    volume: {
        maxWidth: theme.spacing(12),
        flex: 1,
        transition: theme.transitions.create(["all"]),
        marginRight: theme.spacing(1)
    },
    volumeIcon: {
        margin: theme.spacing(0, 0.5),
        color: "white"
    },
    binaryCard: {
        padding: theme.spacing(2),
        margin: "auto"
    },
    image: {
        width: "100%",
        height: `calc(100vh - ${TOOLBAR_SIZE}px)`,
        objectFit: "contain"
    },
    binaryFileText: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(50%, 25%)",
        fontWeight: 700,
        textShadow: "0 6px 12px rgba(0,0,0,.5)",
        background: "linear-gradient(to right, #777, #888 , #fff, #eee, #aaa)",
        "-webkit-background-clip": "text",
        backgroundClip: "text",
        animation: "rainbow_animation 6s ease-in-out infinite",
    },
    playlistThumbnail: {
        width: 100,
        height: 75,
        marginRight: theme.spacing(1)
    },
    uiToggle: {
        color: theme.palette.primary.main
    },
    loadingbar: {
        height: 1,
        position: "fixed",
        bottom: TOOLBAR_SIZE,
        width: "100%"
    },
    loadingbarglow: {
        height: 16,
        filter: "blur(20px)",
        position: "fixed",
        width: "100%",
        transform: "scale(1.2)",
        pointerEvents: "none",
        bottom: 0
    },
    loadingbarglowHUGE: {
        height: 100,
        filter: "blur(50px)",
        position: "fixed",
        width: "100%",
        transform: "scale(1.4)",
        pointerEvents: "none",
        bottom: 0
    },
    ptv: {
        height: "100vh !important",
    },
    pcov: {
        height: "100vh !important",
        "& > * > * > video": {
            objectFit: "cover"
        }
    }
}))

const TOOLBAR_SIZE = 47
const DRAWER_WIDTH = 300

const Main = ({ children }: React.PropsWithChildren<any>) => {
    const classes = useStyles()
    const notMobile = useMediaQuery("(min-width:900px)")
    const history = useHistory()
    const location = useLocation()

    const tvMode = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).tvMode)

    const files = useSelector((state: ApplicationState) => (state.files as FileServiceState).files)
    const commentsX = useSelector((state: ApplicationState) => (state.files as FileServiceState).comments)
    const success = useSelector((state: ApplicationState) => (state.files as FileServiceState).success)
    const isLoading = useSelector((state: ApplicationState) => (state.files as FileServiceState).isLoading)
    const currentFile = useSelector((state: ApplicationState) => (state.files as FileServiceState).currentFile)
    const lastVolume = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).playbackVolume)
    const lastMute = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).willMute)
    const lastContinuous = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).continuous)
    const watchFilter = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).watchFilter)
    const hasInteracted = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).interacted)
    const willAllowAds = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).allowAds)
    const prepareNewFile = useSelector((state: ApplicationState) => (state.files as FileServiceState).preparingNewFile)
    const isUploading = useSelector((state: ApplicationState) => (state.files as FileServiceState).isUploading)

    const dispatch = useDispatch()

    const [showFiles, setShowFiles] = useState(!history.location.pathname.startsWith("/watch/"))
    const [continuous, setContinuous] = useState(lastContinuous)
    const [fmtCover, setFmtCover] = useState(false)
    const [fullTitle, showFullTitle] = useState(false)

    const [barOnFocus, setBarOnFocus] = useState(true)
    const [currentDate, setCurrentDate] = useState<Date | null>(new Date())

    const [allowAds, setAllowAds] = useState(willAllowAds)
    const [willPlayAd, setWillPlayAd] = useState(false)
    const [videoCounter, setVideoCounter] = useState(0)

    const [interacted, setInteracted] = useState(hasInteracted)
    const [playing, setPlaying] = useState(false)
    const [loading, setLoading] = useState(isLoading)
    const [muted, setMuted] = useState(lastMute)
    const [volume, setVolume] = useState(lastVolume)
    const [duration, setDuration] = useState(0)
    const [progress, setProgress] = useState({ played: 0, playedSeconds: 0, loaded: 0, loadedSeconds: 0 })
    const [played, setPlayed] = useState(progress.playedSeconds)

    const [scrolling, setScrolling] = useState(false)
    const [scrollTop, setScrollTop] = useState(0)
    const commentsButtonRef = useRef<HTMLButtonElement | null>(null)

    const [showShare, setShowShare] = useState<HTMLElement | null>(null)
    const [showComments, setShowComments] = useState<HTMLElement | null>(null)
    const [showUpdates, setShowUpdates] = useState(false)
    const [showSettings, setShowSettings] = useState(false)
    const [showMore, setShowMore] = useState<HTMLElement | null>(null)
    const [showReport, setShowReport] = useState(false)
    const [showPlaylist, setShowPlaylist] = useState<HTMLElement | null>(null)
    const [showControlPanel, setShowControlPanel] = useState<HTMLElement | null>(null)
    const [comments, setComments] = useState<CommentModel[]>([])

    const [firstTime, setFirstTime] = useState(!window.localStorage.getItem("first_time"))

    const [previouslySeen, setPreviouslySeen] = useState<number[]>([])

    const randomNewVideo = () => {
        if (currentFile)
            setPreviouslySeen(s => [...s, currentFile.id])
        const videos = files.filter(x => !watchFilter.includes(x.folder)).filter(x => x.id !== (currentFile ? currentFile.id : 0)).filter(x => mediaExt.includes(x.fileURL.split(".")[x.fileURL.split(".").length - 1].toUpperCase()))
        if (previouslySeen.length === videos.length) {
            setPreviouslySeen([])
            return videos[~~(Math.random() * videos.length)]
        }
        const newVideos = videos.filter(x => !previouslySeen.includes(x.id))
        return newVideos[~~(Math.random() * newVideos.length)]
    }

    const newVideo = async () => {
        setLoading(true)
        if (videoCounter >= 15 && allowAds) {
            setWillPlayAd(true)
            setContinuous(true)
            setVideoCounter(0)
            return
        }

        const video = randomNewVideo()

        if (video === undefined && continuous) {
            setContinuous(false)
            return
        }

        if (continuous && showFiles) {
            dispatch(actionCreators.requestFile(video.id.toString()))
        } else {
            history.push(`/watch/${video.id}`)
        }
        setVideoCounter(counter => counter + 1)
    }

    const newVideoBack = async () => {
        setLoading(true)
        if (videoCounter >= 15 && allowAds) {
            setWillPlayAd(true)
            setContinuous(true)
            setVideoCounter(0)
            return
        }

        const video = previouslySeen.pop()
        if (video) {

            if (continuous && showFiles) {
                dispatch(actionCreators.requestFile(video.toString()))
            } else {
                history.push(`/watch/${video}`)
            }
            setVideoCounter(counter => counter - 1)

        }
    }

    React.useEffect(() => {
        if (currentFile && !checkFile(viewable, currentFile)) {
            setLoading(false)
        }
        if (currentFile && playing) {
            setLoading(false)
        }
        if (currentFile) {
            refreshComments()
        }
        if (currentFile === null && showFiles) setLoading(false)
    }, [currentFile])

    React.useEffect(() => {
        if (location.pathname.startsWith("/watch/")) {
            setPlaying(true)
            setShowFiles(false)
            registerView()
        } else {
            setShowFiles(true)
            setPlaying(false)
        }
    }, [location])

    React.useEffect(() => {
        dispatch(prefCreators.setPlaybackVolume(volume))
    }, [volume])

    React.useEffect(() => {
        dispatch(prefCreators.setContinuous(continuous))
    }, [continuous])

    React.useEffect(() => {
        dispatch(prefCreators.setMute(muted))
    }, [muted])

    const registerView = () => {
        if (currentFile) {
            const updateForm = new FormData()
            updateForm.append("id", currentFile.id.toString())
            dispatch(actionCreators.giveViewToFile(currentFile.id, updateForm))
        }
    }

    const refreshComments = () => {
        if (currentFile) {
            dispatch(actionCreators.requestComments(currentFile.id.toString()))
            setComments(commentsX)
        }
    }

    React.useEffect(() => {
        if (currentFile) {
            setComments(commentsX)
        }
    }, [commentsX])

    React.useEffect(() => {
        dispatch(prefCreators.setInteracted(interacted))
    }, [interacted])

    React.useEffect(() => {
        setInterval(() => {
            setCurrentDate(new Date())
        }, 30000)
    }, [])


    const willShowFiles = () => {
        setShowFiles(true)
        history.push("/browse")
    }

    const willNotShowFiles = () => {
        setShowFiles(false)
        history.push(`/${currentFile ? "watch/" + currentFile.id : ""}`)
    }

    const toggleShowFiles = () => {
        if (showFiles) willNotShowFiles()
        else willShowFiles()
    }
    const handleVolumeChange = (event: any, newValue: number | number[]) => setVolume(newValue as number)

    const handleContinuousSwitch = (event: any) => {
        setContinuous(event.target.checked)
    }

    const handleObjectFit = (event: any) => {
        setFmtCover(event.target.checked)
        setBarOnFocus(!event.target.checked)
    }

    const handleEndOfAd = () => {
        setWillPlayAd(false)
        newVideo()
        setContinuous(lastContinuous)
    }

    const handleBarHover = () => {
        setBarOnFocus(true)
    }

    const handleBarLeave = () => {
        if (!checkFile(audioExt, currentFile))
            setBarOnFocus(false)
    }

    const onDuration = (n: number) => setDuration(n)

    const onProgress = (p: { played: number, playedSeconds: number, loaded: number, loadedSeconds: number }) => {
        setPlayed(p.playedSeconds)
        setProgress(p)
    }


    return (
        <>
            {!tvMode && <Slide direction="up" in={showFiles} timeout={200}>
                <Box sx={{
                    display: "inline-flex",
                    flexDirection: "column",
                    height: "100vh",
                    transition: (theme: Theme) => theme.transitions.create(["all"]),
                    overflow: "hidden"
                }}>
                    <Browser>
                        {children}
                    </Browser>
                    <Toolbar />
                </Box>
            </Slide>}
            <Box
                style={{ display: !currentFile ? "flex" : !checkFile(viewable, currentFile) ? "flex" : undefined }}
                className={clsx(classes.playerFlex, classes.tvContainer, showFiles && tvMode && classes.tvHide, showFiles && !tvMode && classes.mini)}
                onClick={() => {
                    if (currentFile && !checkFile(viewable, currentFile)) {
                        return
                    }
                    if (interacted) {
                        if (willPlayAd) { } else {
                            if (files.length > 1 && !showFiles) {
                                newVideo()
                            }
                            if (showFiles && currentFile) {
                                history.push(`/watch/${currentFile.id}`)
                            }
                        }
                    } else {
                        setInteracted(true)
                    }
                }}>
                {checkFile(viewable, currentFile) ? <>
                    {checkFile(mediaExt, currentFile) &&
                        <MediaPlayer
                            className={showFiles && currentFile ? tvMode ? classes.inactivePlayerTV : classes.inactivePlayer : clsx(classes.player, prepareNewFile && classes.inactivePlayer, fmtCover ? classes.pcov : undefined)}
                            url={currentFile ? currentFile.fileURL : undefined}
                            width="100%"
                            onDuration={onDuration}
                            onProgress={onProgress}
                            light={(checkFile(audioExt, currentFile) && !interacted) || (!interacted && (currentFile as FileModel && (currentFile as FileModel).thumbnail as string))}
                            height="100%" loop={!continuous} playing={playing} muted={muted}
                            onReady={() => setLoading(false)}
                            onEnded={() => willPlayAd ? handleEndOfAd() : continuous && newVideo()}
                            volume={volume} />}
                    {checkFile(imgExt, currentFile) &&
                        <img onLoad={() => setLoading(false)} alt="" src={currentFile ? currentFile.fileURL : undefined}
                            style={showFiles ? {
                                width: "100%",
                                height: "100vh",
                                objectFit: fmtCover ? "cover" : "contain",
                                filter: "brightness(25%)"
                            } : {
                                width: "100%",
                                height: "100vh",
                                objectFit: fmtCover ? "cover" : "contain"
                            }} />}
                </> :
                    <>
                        {!showFiles && <Box sx={{ margin: "auto", display: "inline-flex", flexDirection: "row" }}>
                            <>
                            <Typography
                                variant="h3"
                                    sx={{ fontWeight: 600, color: "primary.main", fontFamily: "doublewide", transform: "rotate(-90deg) translateX(-100px)", margin: "auto", width: "100px", height: 0 }}>BINARY</Typography>
                                <Typography
                                    variant="h1"
                                    sx={{ fontWeight: 600, zIndex: -1, margin: "auto", color: "text.primary", fontFamily: "doublewide", transform: "translateY(-242px)", width: 0, height: 0 }}>{currentFile && currentFile.fileURL.split(".")[currentFile.fileURL.split(".").length - 1].toUpperCase()}</Typography>
                                <Typography
                                    sx={{ fontWeight: 600, zIndex: -1, margin: "auto", color: "primary.main", fontFamily: "'Zen Kaku Gothic Antique'", transform: "translateY(150px)", width: 0, whiteSpace: "nowrap", height: 0 }}>アップロードされたバイナリデータ</Typography>
                            </>
                            <Card sx={{
                            padding: (theme: Theme) => theme.spacing(2),
                            background: (theme) => theme.palette.primary.main
                        }} elevation={24}>
                            {files.length > 0 && currentFile ? <><CardContent sx={{ minWidth: 400 }}>
                                <Typography
                                    variant="h5"
                                    sx={{ fontWeight: 600, color: "primary.contrastText" }}>{currentFile ? currentFile.fileURL.replace("files/", "") : ""}</Typography>
                                <Typography sx={{ background: (theme) => theme.palette.primary.contrastText, fontWeight: 600, padding: 0.25 }} variant="caption">Size</Typography>
                                    <Typography sx={{ fontWeight: 600,color: "primary.contrastText" }}>{currentFile ? (currentFile.size / 1024 / 1024).toFixed(2) + " MB" : ""}</Typography>
                                    <Typography sx={{ background: (theme) => theme.palette.primary.contrastText, fontWeight: 600, padding: 0.25 }} variant="caption">Date</Typography>
                                    <Typography sx={{ fontWeight: 600, color: "primary.contrastText" }}>{currentFile ? moment(currentFile.unixTime * 1e3).fromNow() : ""}</Typography>
                                    <Typography sx={{ background: (theme) => theme.palette.primary.contrastText, fontWeight: 600, padding: 0.25 }} variant="caption">Uploader</Typography>
                                    <Typography sx={{ fontWeight: 600, color: "primary.contrastText" }}>{currentFile ? currentFile.author.name : ""}</Typography>
                            </CardContent>
                                <CardActions>
                                    <Button color="secondary" sx={{ width: "100%", color: "secondary.main", background: (theme) => theme.palette.primary.contrastText }} onClick={() => newVideo()} variant="contained">
                                        Jump ahead
                                    </Button>
                                    <Button sx={{ width: "100%", color: "primary.main", background: (theme) => theme.palette.primary.contrastText }} onClick={() => {
                                        window.open(currentFile ? currentFile.fileURL as string : "")
                                    }} variant="contained">
                                        Download
                                    </Button>
                                </CardActions>
                            </> : files.length > 0 ?
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        style={{ textAlign: "center" , color: "primary.contrastText"}}>404: File not found</Typography>
                                    <Typography>Sure the link is correct?</Typography>
                                </CardContent>
                                :
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        style={{ textAlign: "center" }}>There's no files!</Typography>
                                    <Typography>Click on the Doki button to bring up the file browser. You can upload
                                        there.</Typography>
                                </CardContent>}
                        </Card></Box>}
                    </>}
            </Box>
            <>

                <Box sx={{
                    left: (theme: Theme) => theme.spacing(2),
                    top: (theme: Theme) => theme.spacing(2),
                    position: "fixed",
                    display: {
                        xs: "inline-flex",
                        sm: "inline-flex",
                        md: "none",
                        lg: "none",
                        xl: "none"
                    },
                    flexDirection: "column"
                }}>
                    <Typography sx={{
                        background: "linear-gradient(to right, #6666ff, #0099ff , #00ff00, #ff3399, #6666ff)",
                        backgroundClip: "text",
                        color: "transparent",
                        animation: "rainbow_animation 20s ease-in-out infinite",
                        backgroundSize: "400% 100%",
                        opacity: "1 !important",
                        whiteSpace: "nowrap",
                        lineHeight: "normal",
                        fontWeight: 700,
                        transition: (theme: Theme) => theme.transitions.create(["all"]),
                    }}
                        variant="h6" onMouseLeave={() => showFullTitle(false)} onMouseEnter={() => showFullTitle(true)}>{currentFile && truncate(currentFile.fileURL.replace("files/", "").split(".")[0], fullTitle ? 100 : 20)}</Typography>
                    {currentFile && currentFile.folder && <Typography
                        variant="caption" sx={{ whiteSpace: "nowrap", color: "text.secondary", fontSize: 12 }}>{currentFile && currentFile.folder}</Typography>}
                </Box>
                <AppBar onMouseEnter={() => setBarOnFocus(true)} onMouseLeave={() => setBarOnFocus(false)} sx={{
                    top: "initial",
                    left: 0,
                    bottom: 0,
                    transition: (theme: Theme) => theme.transitions.create(["all"], { duration: 200 }),
                    width: "100%",
                    background: (theme: Theme) => barOnFocus || showFiles ? theme.palette.background.paper : "transparent",
                    overflow: "hidden",
                    position: "fixed",
                    borderBottom: 0,
                    borderTop: 0,
                    boxShadow: (theme: Theme) => barOnFocus || showFiles ? theme.shadows[8] : 0
                }}>
                    {checkFile(mediaExt, currentFile) && <LinearProgress sx={{ opacity: 0.5, transition: (theme) => theme.transitions.create(["all"]), position: "fixed", bottom: (theme) => barOnFocus || showFiles ? theme.spacing(8) : 0, width: "100%" }} variant="buffer" value={progress.played * 100} valueBuffer={progress.loaded * 100} />}
                    <Toolbar>
                        <Typography variant="h6" sx={{ fontFamily: "'doublewide', sans-serif", lineHeight: "normal", marginTop: "5px", marginRight: (theme) => barOnFocus || showFiles ? 0 : theme.spacing(4), fontWeight: 700, maxWidth: barOnFocus || showFiles ? 0 : 72, transition: (theme) => theme.transitions.create(["all"]), opacity: barOnFocus || showFiles ? 0 : 1 }}>{process.env.REACT_APP_NAME}</Typography>
                        <Toolbar disableGutters sx={{ minWidth: currentFile === null ? 0 : barOnFocus || showFiles ? checkFile(mediaExt, currentFile) ? 150 : 32 : 0, transition: (theme) => theme.transitions.create(["all"]), opacity: barOnFocus || showFiles ? 1 : 0, flex: currentFile === null ? 0 : barOnFocus || showFiles ? checkFile(mediaExt, currentFile) ? 0.2 : 0.01 : 0 }}>
                            {files.length > 0 && currentFile !== null && <LightTooltip title={!showFiles ? "Open file browser" : "Close file browser"}>
                                <IconButton
                                    color="inherit"
                                    onClick={showFiles ? willNotShowFiles : willShowFiles}
                                    className={clsx(classes.uiToggle, showFiles && checkFile(viewable, currentFile) ? classes.miniPadding : undefined, "unique-icon")}
                                >
                                    {showFiles ? <ExpandMore /> : <ExpandLess />}
                                </IconButton>
                            </LightTooltip>}
                            {checkFile(mediaExt, currentFile) && <>
                                <IconButton sx={{
                                    color: "primary.main",
                                    display: {
                                        xs: "none",
                                        sm: "none",
                                        md: "inherit",
                                        lg: "inherit",
                                        xl: "inherit"
                                    }
                                }} disabled={previouslySeen.length === 0} onClick={() => newVideoBack()}>
                                    <RewindIcon />
                                </IconButton>
                                <IconButton sx={{
                                    color: "primary.main",
                                    display: {
                                        xs: "none",
                                        sm: "none",
                                        md: "inherit",
                                        lg: "inherit",
                                        xl: "inherit"
                                    }
                                }} onClick={() => {
                                    if (playing)
                                        setPlaying(false)
                                    else {
                                        setPlaying(true)
                                        willNotShowFiles()
                                    }
                                }}>
                                    {!playing ? <PlayIcon fontSize="large" /> : <PauseIcon fontSize="large" />}
                                </IconButton>
                                <IconButton sx={{
                                    color: "primary.main",
                                    display: {
                                        xs: "none",
                                        sm: "none",
                                        md: "inherit",
                                        lg: "inherit",
                                        xl: "inherit"
                                    }
                                }} onClick={() => newVideo()}>
                                    <ForwardIcon />
                                </IconButton>
                            </>}</Toolbar>
                        <Box sx={{
                            margin: (theme: Theme) => currentFile === null ? 0 : barOnFocus || showFiles ? theme.spacing(0, 2) : 0,
                            transition: (theme: Theme) => theme.transitions.create(["all"]),
                            display: "inline-flex",
                            flexDirection: "column",
                            lineHeight: "0.05em",
                            ...(loading && {
                                maxWidth: "0 !important",
                                opacity: "0 !important",
                                flex: "0 !important",
                                margin: "0 !important",
                                padding: "0 !important",
                                pointerEvents: "none"
                            })
                        }}>
                            <Typography sx={{
                                background: (theme) => barOnFocus || showFiles ?
                                    `linear-gradient(to right, ${theme.palette.text.primary}, ${theme.palette.text.primary})` : "linear-gradient(to right, #6666ff, #0099ff , #00ff00, #ff3399, #6666ff)",
                                backgroundClip: "text",
                                color: "transparent",
                                animation: "rainbow_animation 30s ease-in-out infinite",
                                backgroundSize: "400% 100%",
                                opacity: "1 !important",
                                whiteSpace: "nowrap",
                                lineHeight: "normal",
                                textShadow: barOnFocus || showFiles ? "none" : "1px 2px 6px rgba(0,0,0,.4)",
                                fontWeight: 700,
                                transition: (theme: Theme) => theme.transitions.create(["all"]),
                                marginLeft: (theme: Theme) => theme.spacing(2),
                                display: {
                                    xs: "none",
                                    sm: "none",
                                    md: "initial",
                                    lg: "initial",
                                    xl: "initial"
                                },
                            }}
                                variant="h6">{currentFile ? truncate(displayFilename(currentFile.fileURL), 100) : "Currently not viewing a file"}</Typography>
                            {currentFile && <Box sx={{ flexFlow: "row wrap", width: "100%" }}>
                                {currentFile.folder && <Typography
                                    variant="caption" sx={{
                                        whiteSpace: "nowrap", color: barOnFocus || showFiles ? "text.primary" : "text.disabled", fontSize: 12, marginLeft: (theme: Theme) => theme.spacing(2), display: {
                                            xs: "none",
                                            sm: "none",
                                            md: "initial",
                                            lg: "initial",
                                            xl: "initial"
                                        }
                                    }}>{currentFile && currentFile.folder.replaceAll(".", "/")} ∙ </Typography>}
                                <Typography
                                    variant="caption" sx={{
                                        whiteSpace: "nowrap", color: barOnFocus || showFiles ? "text.primary" : "text.disabled", fontSize: 12, marginLeft: (theme: Theme) => currentFile.folder ? theme.spacing(0) : theme.spacing(2), display: {
                                            xs: "none",
                                            sm: "none",
                                            md: "initial",
                                            lg: "initial",
                                            xl: "initial"
                                        }
                                    }}>{currentFile.views} views ∙ {(currentFile.size / 1024 / 1024).toFixed(2)} MB ∙ </Typography>
                                <Typography
                                    variant="caption" sx={{
                                        whiteSpace: "nowrap", color: barOnFocus || showFiles ? "text.primary" : "text.disabled", fontSize: 12,
                                        display: {
                                            xs: "none",
                                            sm: "none",
                                            md: "initial",
                                            lg: "initial",
                                            xl: "initial"
                                        }
                                    }}>{currentFile.fileURL.split(".")[currentFile.fileURL.split(".").length - 1].toUpperCase()}</Typography>
                            </Box>}
                        </Box>
                        <div style={{ flex: 1 }} />
                        {process.env.NODE_ENV === "development" && <Typography variant="caption" sx={{
                            margin: (theme: Theme) => theme.spacing(0, 3),
                            color: "text.primary"
                        }}>
                            Development mode
                        </Typography>}
                        <Toolbar disableGutters sx={{ transition: (theme) => theme.transitions.create(["all"]), opacity: barOnFocus || showFiles ? 1 : 0, pointerEvents: barOnFocus || showFiles ? "initial" : "none" }}>
                            <LightTooltip sx={{
                                display: {
                                    xs: "none",
                                    sm: "none",
                                    md: "inherit",
                                    lg: "inherit",
                                    xl: "inherit",
                                }
                            }} title="Toggle sound"><MarginedToolbarIconButton
                                onClick={() => {
                                    setMuted(!muted)
                                }}>{muted ?
                                    <VolMuteIcon /> : <VolIcon />}</MarginedToolbarIconButton></LightTooltip>
                            <ToolbarVolumeSlider sx={{
                                display: {
                                    xs: "none",
                                    sm: "none",
                                    md: "initial",
                                    lg: "initial",
                                    xl: "initial",
                                },
                                minWidth: muted ? 0 : 100,
                                maxWidth: 100
                            }} size="small" muted={muted} max={0.9999} min={0}
                                value={volume} step={0.001} onChange={handleVolumeChange} />
                            {currentFile && <><LightTooltip title="Like this file"><Button sx={{ color: "primary.main" }} color="inherit" startIcon={<LikeIcon />}
                                onClick={() => {
                                    if (currentFile) {
                                        const updateForm = new FormData()
                                        updateForm.append("id", currentFile.id.toString())
                                        dispatch(actionCreators.giveLikeToFile(currentFile.id, updateForm))
                                    }
                                }}>{currentFile && currentFile.likes}</Button></LightTooltip>
                                <LightTooltip title="Share"><MarginedToolbarIconButton
                                    onClick={(e) => {
                                        setShowShare(e.currentTarget)
                                    }}><ShareIcon /></MarginedToolbarIconButton></LightTooltip></>}
                            {currentFile && currentFile.folder && <LightTooltip title="Folder playlist"><MarginedToolbarIconButton
                                onClick={(e) => {
                                    setShowPlaylist(e.currentTarget)
                                }}><PlaylistIcon /></MarginedToolbarIconButton></LightTooltip>}
                            {process.env.REACT_APP_TYPE === "PUBLIC" && <LightTooltip title="Report file"><MarginedToolbarIconButton
                                onClick={() => {
                                    setShowReport(true)
                                }}><ReportIcon /></MarginedToolbarIconButton></LightTooltip>}
                            {currentFile && <LightTooltip title="Show comments"><MarginedToolbarIconButton
                                ref={commentsButtonRef}
                                onClick={(e) => {
                                    setShowComments(e.currentTarget)
                                    if (showComments) {
                                        refreshComments()
                                    }
                                }}><CommentIcon /></MarginedToolbarIconButton></LightTooltip>}
                            <LightTooltip title="Control Panel"><MarginedToolbarIconButton
                                onClick={(e) => {
                                    setShowControlPanel(e.currentTarget)
                                }}><SettingsRemote /></MarginedToolbarIconButton></LightTooltip>
                            <LightTooltip title="Settings"><MarginedToolbarIconButton
                                onClick={(e) => {
                                    setShowSettings(true)
                                }}><SettingsIcon /></MarginedToolbarIconButton></LightTooltip>
                        </Toolbar>
                    </Toolbar>
                </AppBar>
                <LinearProgress color="primary" className={clsx(classes.loadingbarglow, !loading && classes.hidden)} />
                <LinearProgress color="primary" className={clsx(classes.loadingbarglow, !isUploading && classes.hidden)} />
            </>
            <Report open={showReport} close={() => {
                setShowReport(false)
            }} />
            <Settings open={showSettings} close={() => {
                setShowSettings(false)
            }} />
            <Popover anchorEl={showComments} anchorOrigin={{
                vertical: "top",
                horizontal: "center",
            }} PaperProps={{
                style: {
                    padding: 0,
                    maxWidth: 600,
                    minWidth: DRAWER_WIDTH,
                    maxHeight: 600
                }
            }} TransitionComponent={Fade}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }} open={Boolean(showComments)} onClose={() => setShowComments(null)}>
                <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0, 2), background: (theme) => theme.palette.background.paper }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 14 }}>Comments</Typography>
                    <div style={{ flex: 1 }} />
                    <Tooltip title="Refresh comments"><IconButton
                        onClick={refreshComments}><RefreshTwoTone /></IconButton></Tooltip>
                </Toolbar>
                <Divider />
                {currentFile && <Paper sx={{ margin: (theme) => theme.spacing(1), marginBottom: (theme) => theme.spacing(0) }}>
                    <Commenter file={currentFile.id.toString()} />
                </Paper>}
                <List>
                    {comments && comments.length > 0 ? comments.sort((a, b) => b.date - a.date).map((c, i) =>
                        <Paper key={i} sx={{ margin: (theme) => theme.spacing(1) }}>
                            <ListItem>
                                <Tooltip title={moment(c.date * 1e3).fromNow()}><ListItemText primary={c.author.name}
                                    secondary={c.content} /></Tooltip>
                            </ListItem></Paper>
                    ) : <ListItem>
                        <ListItemText style={{ opacity: 0.5 }} primary={"O.O No comments!"} />
                    </ListItem>}
                </List>
            </Popover>
            <Menu anchorOrigin={{ vertical: "top", horizontal: "center" }}
                transformOrigin={{ horizontal: "center", vertical: "bottom" }} anchorEl={showMore}
                TransitionComponent={Fade}
                open={Boolean(showMore)} onClose={() => {
                    setShowMore(null)
                }}>
                <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0, 2), background: (theme) => theme.palette.background.paper }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 14 }}>Build {process.env.REACT_APP_BUILD}.{process.env.REACT_APP_MINOR_VERSION} {process.env.REACT_APP_TYPE}</Typography>
                    <div style={{ flex: 1 }} />
                </Toolbar>
                <Divider />
                <MenuItem onClick={() => {
                    setShowUpdates(true)
                    setShowMore(null)
                }}>Updates</MenuItem>
                <MenuItem component={Link} to="/apidesc" onClick={() => {
                    setShowMore(null)
                }}>API</MenuItem>
                <MenuItem component={Link} to="/privacy" onClick={() => {
                    setShowMore(null)
                }}>Privacy Policy</MenuItem>
                <MenuItem component={Link} to="/about" onClick={() => {
                    setShowMore(null)
                }}>About</MenuItem>
                <MenuItem component={Link} to="/special" onClick={() => {
                    setShowMore(null)
                }}>o.o</MenuItem>
                <Divider />
                <Toolbar disableGutters variant="dense" sx={{ width: 250, padding: (theme) => theme.spacing(0, 2), background: (theme) => theme.palette.background.paper }}>
                    <Typography variant="h6" sx={{ fontFamily: "'Josefin Sans', sans-serif", flex: 1, lineHeight: "normal", marginTop: "5px", fontWeight: 700 }}>{process.env.REACT_APP_NAME}</Typography>
                    <LightTooltip title="My profile"><IconButton sx={{
                        margin: (theme: Theme) => theme.spacing(0, 0.5),
                        "&:first-of-type": {
                            margin: 0
                        },
                        "&:last-of-type": {
                            margin: 0
                        }
                    }} component={Link}
                        to="/me" ><AccountIcon
                            fontSize="small" /></IconButton></LightTooltip>
                    <LightTooltip title="Settings"><MarginedToolbarIconButton
                        onClick={() => {
                            setShowSettings(true)
                        }}><SettingsIcon
                            fontSize="small" /></MarginedToolbarIconButton></LightTooltip>
                </Toolbar>
            </Menu>
            <Menu anchorOrigin={{ vertical: "top", horizontal: "center" }}
                transformOrigin={{ horizontal: "center", vertical: "bottom" }} PaperProps={{
                    style: {
                        maxHeight: 500,
                        maxWidth: 400,
                        padding: 0,
                        paddingTop: 0,
                        paddingBottom: 0
                    },
                }} TransitionComponent={Fade}
                anchorEl={showPlaylist} open={Boolean(showPlaylist)} onClose={() => {
                    setShowPlaylist(null)
                }}>
                <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0, 2), background: (theme) => theme.palette.background.paper }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 14 }}>{currentFile && currentFile.folder}</Typography>
                    <div style={{ flex: 1 }} />
                </Toolbar>
                <Divider />
                {files.length > 0 && currentFile && files.filter(x => currentFile.folder ? x.folder === currentFile.folder : x.folder).map((x, i) =>
                    <MenuItem key={i} onClick={() => {
                        setShowPlaylist(null)
                    }} component={Link} to={"/watch/" + x.id}><PlaylistThumbnail src={x.thumbnail} alt="" />{x.fileURL.replace("files/", "")}
                    </MenuItem>)}
            </Menu>
            <Popover anchorEl={showShare} anchorOrigin={{
                vertical: "top",
                horizontal: "center",
            }} PaperProps={{
                style: {
                    padding: 0,
                    maxWidth: 600
                }
            }} TransitionComponent={Fade}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }} open={Boolean(showShare)} onClose={() => setShowShare(null)}>
                <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0, 2), background: (theme) => theme.palette.background.paper }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 14 }}>Share</Typography>
                    <div style={{ flex: 1 }} />
                    <Button size="small" variant="contained" onClick={() => navigator.clipboard.writeText(currentFile ? `https://${window.location.hostname}/watch/${currentFile.id}` : "")}>Copy to clipboard</Button>
                </Toolbar>
                <Divider />
                <Box sx={{ display: "inline-flex", flexDirection: "column", padding: (theme) => theme.spacing(2) }}>
                    <Paper sx={{ padding: (theme) => theme.spacing(1), marginBottom: (theme) => theme.spacing(1) }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>Doki link</Typography>
                        <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0) }}>
                            <TextField size="small" InputProps={{ style: { fontSize: 12 } }} fullWidth sx={{ paddingTop: (theme) => theme.spacing(1) }} style={{ width: 300 }} value={currentFile && `https://${window.location.hostname}/watch/${currentFile.id}`} />
                        </Toolbar>
                    </Paper>
                    <Paper sx={{ padding: (theme) => theme.spacing(1) }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>Direct link</Typography>
                        <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0) }}>
                            <TextField size="small" InputProps={{ style: { fontSize: 12 } }} fullWidth sx={{ paddingTop: (theme) => theme.spacing(1) }} style={{ width: 300 }} value={currentFile && `https://${window.location.hostname}/${currentFile.fileURL}`} />
                        </Toolbar>
                    </Paper>
                </Box>
            </Popover>
            <Popover anchorEl={showControlPanel} anchorOrigin={{
                vertical: "top",
                horizontal: "center",
            }} PaperProps={{
                style: {
                    padding: 0,
                    minWidth: 300
                },
                onMouseLeave: () => setShowControlPanel(null)
            }} TransitionComponent={Fade}
                transformOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }} open={Boolean(showControlPanel)} onClose={() => setShowControlPanel(null)}>
                <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0, 2), background: (theme) => theme.palette.background.paper }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 14 }}>Control Panel</Typography>
                    <div style={{ flex: 1 }} />
                </Toolbar>
                <Divider />
                <Box sx={{ padding: (theme) => theme.spacing(2) }}>
                    <Paper sx={{
                        padding: (theme) => theme.spacing(1),
                        marginBottom: (theme) => theme.spacing(1),
                        display: {
                            xs: "inline-flex",
                            sm: "inline-flex",
                            md: "none",
                            lg: "none",
                            xl: "none"
                        },
                        flexDirection: "column",
                        width: "100%"
                    }} className={clsx(currentFile && !checkFile(mediaExt, currentFile) && classes.hiddenPanel)}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>Playback control</Typography>
                        <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0) }}>
                            <div style={{ flex: 1 }} />
                            <IconButton disabled={previouslySeen.length === 0} onClick={() => newVideoBack()}>
                                <RewindIcon />
                            </IconButton>
                            <IconButton onClick={() => playing ? setPlaying(false) : setPlaying(true)}>
                                {!playing ? <PlayIcon /> : <PauseIcon />}
                            </IconButton>
                            <IconButton onClick={() => newVideo()}>
                                <ForwardIcon />
                            </IconButton>
                            <div style={{ flex: 1 }} />
                        </Toolbar>
                    </Paper>
                    <Paper className={clsx(currentFile && !checkFile(mediaExt, currentFile) && classes.hiddenPanel)} sx={{ padding: (theme) => theme.spacing(1), marginBottom: (theme) => theme.spacing(1) }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>Playback mode</Typography>
                        <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0) }}>
                            <ToolbarCaption variant="caption" style={{ flex: 1 }}>{continuous ? "Find a new one when the current file ends" : "Loop the currently playing file"}</ToolbarCaption>
                            <Switch checked={continuous} onChange={handleContinuousSwitch} />
                        </Toolbar>
                    </Paper>
                    <Paper sx={{ padding: (theme) => theme.spacing(1), marginBottom: (theme) => theme.spacing(1) }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>Media scale</Typography>
                        <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0) }}>
                            <ToolbarCaption variant="caption" style={{ flex: 1 }}>{fmtCover ? "Cover the entire screen" : "Make all of it visible"}</ToolbarCaption>
                            <Switch checked={fmtCover} onChange={handleObjectFit} />
                        </Toolbar>
                    </Paper>
                    <Paper sx={{
                        padding: (theme) => theme.spacing(1), display: {
                            xs: "inline-flex",
                            sm: "inline-flex",
                            md: "none",
                            lg: "none",
                            xl: "none"
                        },
                        flexDirection: "column",
                        width: "100%"
                    }
                    }>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>Volume control</Typography>
                        <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0) }}>
                            <LightTooltip title="Toggle sound"><MarginedToolbarIconButton
                                onClick={() => {
                                    setMuted(!muted)
                                }}>{muted ?
                                    <VolMuteIcon fontSize="small" /> : <VolIcon fontSize="small" />}</MarginedToolbarIconButton></LightTooltip>
                            <ToolbarVolumeSlider size="small" muted={muted} max={0.9999} min={0}
                                value={volume} step={0.001} onChange={handleVolumeChange} />
                        </Toolbar>
                    </Paper>
                </Box>
            </Popover>
            <Dialog open={firstTime} onClose={() => {
                setFirstTime(false)
                window.localStorage.setItem("first_time", "false")
            }}>
                <DialogTitle>
                    What's new
                </DialogTitle>
                <DialogContent dividers>
                    General<br />
                    - Gone back to the old bar layout but patched it up a bit<br />
                    - Backend now uses .NET 6, faster file handling.<br />
                    - More active alert management<br />
                    - Super hidden exclusive snow effect with optional raytracing mode in the settings<br />
                    Browser<br />
                    - File management from "My Files" have migrated over to the browser and completely removed its purpose<br />
                    - Minor adjustments to UI, you can now right click files to delete or change their folders<br />
                    Player<br />
                    - Common media playback control added<br />
                    - Autoplay is now default<br />
                    Settings<br />
                    - Now holds your Doki ID info<br />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setFirstTime(false)
                        window.localStorage.setItem("first_time", "false")
                    }}>
                        Very cool
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default Main
