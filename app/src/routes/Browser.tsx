import * as React from "react"
import {useCallback, useEffect, useState} from "react"
import {actionCreators as fileActions, FileServiceState} from "../store/FileService"
import {useHistory} from "react-router-dom"
import {useDispatch, useSelector} from "react-redux"
import {
    alpha,
    AppBar,
    Button,
    ButtonBase,
    Checkbox,
    CircularProgress,
    Divider,
    Fab,
    Fade,
    Grid,
    IconButton,
    Menu,
    MenuItem,
    Slider,
    Theme,
    Toolbar,
    Typography,
    useMediaQuery,
} from "@mui/material"
import createStyles from "@mui/styles/createStyles"
import makeStyles from "@mui/styles/makeStyles"
import {ApplicationState} from "../store"
import {ArrowBack, RefreshTwoTone, SortTwoTone, UploadFile, UploadFileTwoTone} from "@mui/icons-material"
import Uploader from "../components/Uploader"
import {useDropzone} from "react-dropzone"
import {FileModel} from "../models"
import {sessionActions, SessionState} from "../store/Session"
import {actionCreators, PreferencesState} from "../store/Preferences"
import LightTooltip from "../components/extended/LightTooltip"
import GridView from "../components/GridView"
import clsx from "clsx"
import {LoadingButton} from "@mui/lab"
import {DRAWER_WIDTH} from "../utils"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        img: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            background: theme.palette.primary.dark
        },
        imgItemBar: {
            margin: 0,
            background: "transparent"
        },
        imgItemBarTitle: {
            fontSize: "0.75em",
            background: "rgba(0,0,0,.7)",
            paddingLeft: theme.spacing(1)
        },
        imgItemBarSubtitle: {
            fontSize: "0.7em",
            background: "rgba(0,0,0,.7)",
            padding: theme.spacing(1)
        },
        imgItemBarWrap: {
            margin: theme.spacing(1)
        },
        folderIcon: {
            position: "absolute",
            bottom: theme.spacing(0.5),
            right: theme.spacing(0.5),
            opacity: 0.3,
            color: theme.palette.mode === "dark" ? "black" : theme.palette.text.primary
        },
        fab: {
            position: "fixed",
            bottom: theme.spacing(2),
            right: theme.spacing(2),
            [theme.breakpoints.down("md")]: {
                bottom: theme.spacing(8)
            }
        },
        dropzone: {
            position: "absolute",
            width: "100%",
            height: "100%",
            transition: theme.transitions.create(["all"]),
            marginTop: -((theme.mixins.toolbar.minHeight as number) + theme.spacing(1))
        },
        dropzoneActive: {
            backgroundColor: theme.palette.secondary.main,
            opacity: 0.5,
            zIndex: 1000,
        },
        uploadIndication: {
            top: "50%",
            left: "50%",
            transform: "translateX(-50%) translateY(-50%)",
            position: "absolute",
            textAlign: "center",
            zIndex: 5000,
            color: "rgba(255,255,255,0.85)",
            opacity: 0,
            pointerEvents: "none"
        },
        uploadIndicationVisible: {
            opacity: 1
        },
        imageListContainer: {
            display: "flex",
            backgroundColor: theme.palette.background.paper,
            borderRadius: theme.shape.borderRadius,
            overflow: "hidden"
        },
        imageList: {
            flex: 1,
            overflow: "scroll"
        },
        container: {
            [theme.breakpoints.down("lg")]: {
                paddingBottom: theme.spacing(8)
            }
        },
        fileGrid: {
            marginTop: 16,
            marginBottom: 16,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gridAutoFlow: "dense",
            gap: "20px 1px",
            [theme.breakpoints.down("md")]: {
                gap: "4px 1px",
                gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
            }
        },
        appBar: {
            background: "transparent",
            boxShadow: "none",
            transition: theme.transitions.create(["all"]),
            willChange: "auto",
            borderBottom: "none"
        },
        transparentAppBar: {
            background: "transparent",
            transition: theme.transitions.create(["all"]),
            boxShadow: "none",
            willChange: "auto",
            borderBottom: "1px solid rgba(255,255,255,0.5)",
        },
        hideAppBar: {
            height: 0,
            opacity: 0,
            top: -48
        },
        title: {
            margin: theme.spacing(0, 2),
            marginLeft: 0,
            textTransform: "initial",
            fontSize: theme.typography.h6.fontSize,
            color: theme.palette.text.primary,
            fontWeight: 600,
            transition: theme.transitions.create(["all"])
        },
        chevron: {
            animation: "fadein 0.3s ease"
        },
        folderTitle: {
            margin: theme.spacing(0, 2),
            animation: "fadein 0.3s ease",
            "& > .MuiButton-label": {
                textTransform: "initial",
                fontSize: theme.typography.h6.fontSize
            }
        },
        search: {
            position: "relative",
            borderRadius: theme.shape.borderRadius,
            backgroundColor: alpha(theme.palette.common.white, 0.15),
            "&:hover": {
                backgroundColor: alpha(theme.palette.common.white, 0.25),
            },
            margin: 0,
            width: "100%",
            [theme.breakpoints.up("sm")]: {
                width: "auto",
            },
            flex: 1,
        },
        searchIcon: {
            padding: theme.spacing(0, 2),
            height: "100%",
            position: "absolute",
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        inputRoot: {
            color: "inherit",
            fontSize: 14
        },
        inputInput: {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)})`,
            transition: theme.transitions.create("width"),
            width: "100%",
            [theme.breakpoints.up("md")]: {
                width: "15ch",
            },
        },
        leftPane: {
            transition: theme.transitions.create(["all"]),
            borderRight: `1px solid ${theme.palette.primary.dark}`,
            borderBottom: `1px solid ${theme.palette.primary.dark}`,
            maxWidth: DRAWER_WIDTH
        },
        leftPaneNoBorder: {
            borderRight: "none"
        }
    }),
)


const Browser = ({ children }: { children: React.PropsWithChildren<any> }) => {
    const L = useMediaQuery("(min-width:1400px)")
    const history = useHistory()
    const classes = useStyles()
    const tvMode = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).tvMode)
    const files = useSelector((state: ApplicationState) => (state.files as FileServiceState).files)
    const success = useSelector((state: ApplicationState) => (state.files as FileServiceState).success)
    const isLoading = useSelector((state: ApplicationState) => (state.files as FileServiceState).isLoading)
    const isUploading = useSelector((state: ApplicationState) => (state.files as FileServiceState).isUploading)
    const prefOrder = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).order)
    const id = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).id)

    const isAdmin = useSelector((state: ApplicationState) => (state.session as SessionState).adminPowers)
    
        const lastScale = useSelector((state: ApplicationState) => (state.session as SessionState).gridScale)

    const [orderMode, setOrderMode] = useState(prefOrder)
    const [orderMenuOpen, setOrderMenuOpen] = useState<null | HTMLElement>(null)

    const [scale, setScale] = useState(lastScale)
    const [onlyUser, setOnlyUser] = useState(false)

    const [currentFolder, setCurrentFolder] = useState<string | null>(null)
    const [searchVal, setSearchVal] = useState("")
    const [searchRes, setSearchRes] = useState([])

    const dispatch = useDispatch()
    const [willUpload, setWillUpload] = useState(false)
    const [droppedFiles, setDroppedFiles] = useState([])
    const onDrop = useCallback((accepted) => {
        setDroppedFiles(accepted)
        setWillUpload(true)
    }, [])
    // TODO: Bring back drag-and-drop to the view itself, not just the upload dialog.
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    useEffect(() => {
        const query = new URLSearchParams(window.location.search).get("f")
        setCurrentFolder(query)
    }, [window.location.search])

    useEffect(() => {
        dispatch(sessionActions.setGridScale(scale))
    }, [scale])

    const handleOpenOrderMenu = (event: React.MouseEvent<HTMLElement>) => {
        setOrderMenuOpen(event.currentTarget)
    }

    const selectOrderByLikes = () => {
        handleCloseMenu()
        setOrderMode("likes")
        dispatch(actionCreators.setOrder("likes"))
        localStorage.setItem("order", "likes")
    }

    const selectOrderByViews = () => {
        handleCloseMenu()
        setOrderMode("views")
        dispatch(actionCreators.setOrder("views"))
        localStorage.setItem("order", "views")
    }

    const selectOrderByTime = () => {
        handleCloseMenu()
        setOrderMode("time")
        dispatch(actionCreators.setOrder("time"))
        localStorage.setItem("order", "time")
    }

    const selectOrderByName = () => {
        handleCloseMenu()
        setOrderMode("name")
        dispatch(actionCreators.setOrder("name"))
        localStorage.setItem("order", "name")
    }

    const selectOrderBySize = () => {
        handleCloseMenu()
        setOrderMode("size")
        dispatch(actionCreators.setOrder("size"))
        localStorage.setItem("order", "size")
    }


    const handleCloseMenu = () => {
        setOrderMenuOpen(null)
    }

    const handleSort = (A: FileModel, B: FileModel): number => {
        switch (orderMode) {
            case "likes":
                return B.likes - A.likes
            case "views":
                return B.views - A.views
            case "time":
                return B.unixTime - A.unixTime
            case "name": {
                if (A.fileURL < B.fileURL) {
                    return -1
                }
                if (A.fileURL > B.fileURL) {
                    return 0
                }
                return 0
            }
            case "size":
                return B.size - A.size
            default:
                return 0
        }
    }

    const handleOpenFolder = (folder: string) => {
        history.push(`/browse?f=${folder}`)
    }

    const handleRootFolder = () => {
        history.push("/browse")
    }

    const handleUpFolder = () => {
        if (currentFolder) {
            const folders = currentFolder.split(".")
            if (folders.length === 1) handleRootFolder()
            else if (folders.length === 2) history.push(`/browse?f=${folders[0]}`) 
            else history.push(`/browse?f=${folders.slice(0, folders.length - 2).join(".") + "." + folders[folders.length - 2]}`)
        }
    }


    const handleOpenFile = (file: FileModel) => {
        history.push(`/watch/${file.id}`)
    }

    const handleSearchSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const req = await fetch(`api/all/search/${searchVal}`)
        const result = await req.json()
        setSearchRes(result)
    }

    return <>
        <AppBar position="relative" color="default" className={clsx(classes.appBar, tvMode && classes.transparentAppBar)}>
            <Toolbar disableGutters variant="dense" sx={{ height: tvMode ? 72 : undefined }}>
                <Grid container style={{ flex: 1 }}>
                    <Grid item xs={2} className={classes.leftPane}>
                        <ButtonBase onClick={handleRootFolder} component={Toolbar} disableGutters variant="dense" sx={{ padding: (theme: Theme) => theme.spacing(0, 2), background: (theme) => theme.palette.primary.main, justifyContent: "initial" }}>
                            <Typography variant="h6" sx={{ fontFamily: "'doublewide', sans-serif", lineHeight: "normal", marginTop: "5px", marginRight: (theme) => theme.spacing(4), fontWeight: 700, color: (theme) => theme.palette.primary.contrastText }}>{process.env.REACT_APP_NAME}</Typography>
                            {/*<div style={{ flex: 1 }} />
                            {L && <Typography variant="caption" sx={{ color: (theme) => theme.palette.primary.contrastText }}>Version {process.env.REACT_APP_BUILD}.{process.env.REACT_APP_MINOR_VERSION}</Typography>}*/}
                        </ButtonBase>
                    </Grid>
                    <Grid item xs>
                        <Toolbar disableGutters variant="dense" sx={{ padding: (theme: Theme) => theme.spacing(0, 2), borderBottom: (theme) => `1px solid ${theme.palette.divider}` }}>
                            {location.pathname.startsWith("/browse") ? <><Fade in={Boolean(currentFolder)}><IconButton sx={{ marginRight: currentFolder ? 1 : -4, transition: (theme) => theme.transitions.create(["all"]) }} onClick={handleUpFolder}>
                                <ArrowBack />
                            </IconButton></Fade>
                                {!currentFolder && <Typography variant="h6" className={classes.title}>All files{files.length === 0 && "?"}</Typography>}
                                {currentFolder && <Typography variant="h6" className={classes.title}>
                                    /{currentFolder.split(".").join("/")}
                                </Typography>}</> : <>
                                <IconButton sx={{ marginRight: 1, transition: (theme) => theme.transitions.create(["all"]) }} onClick={() => history.push("/browse")}>
                                    <ArrowBack />
                                </IconButton>
                                <Typography variant="h6" className={classes.title}>
                                    {location.pathname}
                                </Typography>
                            </>}
                            <div style={{ flex: 1 }} />
                             {isAdmin && <Typography sx={{fontWeight: 600, color: "error.main"}} variant="caption">ADMIN MODE</Typography>}

                            <LightTooltip title={"Reload files"}><IconButton sx={{
                                marginLeft: 1, marginRight: 1
                            }} onClick={() => dispatch(fileActions.requestAllFiles())}><RefreshTwoTone /></IconButton></LightTooltip>
                            {id && <><Typography variant="caption">Show only my uploads</Typography>
                                <Checkbox sx={{ marginRight: 1 }} checked={onlyUser} onChange={e => setOnlyUser(e.target.checked)} /></>}
                            <Typography variant="caption" sx={{ marginRight: 1 }}>Scale</Typography>
                            <Slider size="small" sx={{ maxWidth: 150 }} value={scale} step={1} 
                                marks onChange={(e, n) => setScale(n as number)} min={2} max={12} />
                            <LightTooltip title={"Sort files"}><Button sx={{
                                marginLeft: (theme: Theme) => theme.spacing(1), marginRight: 1
                            }} onClick={handleOpenOrderMenu} startIcon={<SortTwoTone />} size="large">{orderMode}</Button></LightTooltip>
                            <LoadingButton
                                onClick={() => !isLoading && setWillUpload(true)}
                                endIcon={<UploadFileTwoTone />}
                                loading={isUploading}
                                loadingPosition="end"
                                variant="contained"
                                color="primary"
                                sx={{
                                    color: "primary.contrastText",
                                    margin: "-16px -16px -16px 0px",
                                    height: 48,
                                    padding: (theme) => theme.spacing(0, 4)
                                }}
                            >
                                Upload
                            </LoadingButton>
                        </Toolbar>
                    </Grid>
                </Grid>
            </Toolbar>
        </AppBar>
        <GridView scale={scale} onListClick={(f) => handleOpenFolder(f)} onGridClick={(f) => handleOpenFile(f)} currentFolder={currentFolder} files={files.sort(handleSort).filter(x => onlyUser ? x.author.authorId == id : x).filter(x => x.folder === currentFolder || x.folder === null || x.folder.match(searchVal) || x.fileURL.match(searchVal))}>
            {children}
        </GridView>
        {tvMode && <Fab color={tvMode ? "inherit" : "primary"} disabled={isUploading} variant="extended"
            sx={{
                ...(tvMode && {
                    bottom: undefined,
                    top: (theme) => theme.spacing(14),
                    right: (theme) => theme.spacing(8),
                    background: "black",
                    "&:hover": {
                        background: "black"
                    },
                }),
                position: "fixed",
            }}
            onClick={() => !isLoading && setWillUpload(true)}
            size="medium">
            {isUploading ? <CircularProgress variant="indeterminate" color="inherit" style={{ width: 24, height: 24 }} sx={{ mr: 1 }} /> : <UploadFile sx={{ mr: 1 }} />}
            {isUploading ? "Uploading..." : "Upload"}
        </Fab>}
        <Menu
            MenuListProps={{ dense: true }}
            id="order-menu"
            anchorEl={orderMenuOpen}
            open={Boolean(orderMenuOpen)}
            onClose={handleCloseMenu}
            PaperProps={{
                style: {
                    width: "20ch",
                },
            }}
        >
            <Toolbar sx={{ background: (theme) => theme.palette.background.default, padding: (theme) => theme.spacing(0, 2) }} variant="dense" disableGutters>
                <Typography sx={{ fontWeight: 600 }}>Sort files by...</Typography>
            </Toolbar>
            <Divider />
            <MenuItem onClick={selectOrderByViews}>Views</MenuItem>
            <MenuItem onClick={selectOrderByLikes}>Likes</MenuItem>
            <MenuItem onClick={selectOrderByTime}>Time</MenuItem>
            <MenuItem onClick={selectOrderByName}>Name</MenuItem>
            <MenuItem onClick={selectOrderBySize}>Size</MenuItem>
        </Menu>
        <Uploader inFolder={currentFolder ? currentFolder : undefined} open={willUpload} close={() => {
            setWillUpload(false)
        }}
            droppedFiles={droppedFiles} />
    </>
}

export default Browser