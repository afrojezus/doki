import React from "react"
import { styled } from "@mui/material/styles"
import { makeStyles, createStyles } from "@mui/styles"
import { connect } from "react-redux"
import { RouteComponentProps } from "react-router"
import Cookies from "js-cookie"
import * as FileServiceStore from "../store/FileService"
import { ApplicationState } from "../store"
import moment from "moment"
import {
    AppBar,
    Accordion,
    AccordionActions,
    AccordionDetails,
    AccordionSummary,
    Button,
    Box,
    Tabs,
    Tab,
    IconButton,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    LinearProgress,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Toolbar,
    Theme,
    Typography,
    Container, Grid,
} from "@mui/material"
import { useDispatch, useSelector } from "react-redux"
import { Add, MusicNote as MusicIcon, FilePresent as FileIcon, ExpandMore as ExpandIcon } from "@mui/icons-material"
import Uploader from "../components/Uploader"
import { AuthorModel, FileModel } from "../models"
import { FileServiceState } from "../store/FileService"
import { retrieveAuthorInfo, LightTooltip, viewable, mediaExt, imgExt, audioExt, checkFile, truncate, readURL } from "../utils"
import clsx from "clsx"
import { actionCreators } from "../store/Preferences"

const Input = styled("input")({
    display: "none",
})

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        appBar: {
            height: "initial",
            transition: theme.transitions.create(["all"])
        },
        container: {
            paddingBottom: theme.spacing(8),
            margin: theme.spacing(4),
            width: `calc(100% - ${theme.spacing(8)}px)`,
            flex: 1,
        },
        hidden: {
            transform: "translateY(-25%)",
            opacity: 0
        },
        table: {
            overflow: "overlay"
        },
        img: {
            backgroundColor: "gray",
            width: 64,
            height: 64,
            objectFit: "cover"
        },
        button: {
            margin: theme.spacing(1)
        },
        none: {
            color: theme.palette.text.secondary
        },
        modal: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        paper: {
            backgroundColor: theme.palette.background.paper,
            border: "2px solid #000",
            boxShadow: theme.shadows[5],
            padding: theme.spacing(2, 4, 3),
            maxHeight: 600,
            width: 500,
            overflow: "auto"
        },
        username: {
            fontSize: "2.5em",
            fontWeight: 700
        }
    }))


interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    )
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    }
}

type MeProps = FileServiceStore.FileServiceState // ... state we've requested from the Redux store
    & typeof FileServiceStore.actionCreators // ... plus action creators we've requested
    & RouteComponentProps; // ... plus incoming routing parameters

const Me = (props: MeProps) => {
    const classes = useStyles()
    const dispatch = useDispatch()
    const isLoading = useSelector((state: ApplicationState) => (state.files as FileServiceState).isLoading)
    const [id, setId] = React.useState("")
    const [user, setUser] = React.useState<AuthorModel>({ name: "Anonymous", creationDate: 0, authorId: "0" })
    const [loadingUser, setLoadingUser] = React.useState(true)
    const [openFolderPrompt, setOpenFolderPrompt] = React.useState(false)
    const [changeFolderSelection, setChangeFolderSelection] = React.useState<FileModel | null>(null)
    const [newFolderName, setNewFolderName] = React.useState("")
    const [deleted, setDeleted] = React.useState<FileModel[]>([])
    const [willUpload, setWillUpload] = React.useState(false)
    const [tab, setTab] = React.useState(0)
    const [tmpImport, setTmpImport] = React.useState<FileList | null>(null)

    const [deleteDialog, setDeleteDialog] = React.useState(false)

    const fetchUser = async (_id: string) => {
        setLoadingUser(true)
        const _user = await retrieveAuthorInfo(parseInt(_id))
        setUser(_user)
        setLoadingUser(false)
    }

    React.useEffect(() => {
        if (props.files.length === 0) {
            props.requestAllFiles()
            setLoadingUser(false)
        }
    }, [])
    React.useEffect(() => {
        let i = Cookies.get("DokiIdentification")
        if (i && props.files.length > 0) {
            setId(i)
            fetchUser(i)
        }
    }, [props.files.length])
    React.useEffect(() => {
        fetchUser(id)
    }, [id])
    const handleDelete = (v: FileModel) => {
        const deleteForm = new FormData()
        deleteForm.append("id", id)
        props.deleteFile(v.id, deleteForm)
        setDeleted(d => [...d, v])
    }
    const handleFolderChange = (v: FileModel) => {
        setOpenFolderPrompt(true)
        setChangeFolderSelection(v)
    }
    const changeFolder = (v: FileModel | null) => {
        if (v) {
            const updateForm = new FormData()
            updateForm.append("id", id)
            updateForm.append("folder", newFolderName)
            props.updateFile(v.id, updateForm)
            setOpenFolderPrompt(false)
        }
    }
    const handleDownloadProfile = () => {
        const profileExport = {
            DokiIdentification: id,
            watch_filter: window.localStorage.getItem("watch_filter"),
            color_scheme: window.localStorage.getItem("color_scheme"),
            ads: window.localStorage.getItem("ads"),
            light: window.localStorage.getItem("light"),
            order: window.localStorage.getItem("order"),
            playback_volume: window.localStorage.getItem("playback_volume")
        }
        const profileExportRAW = JSON.stringify(profileExport)
        var a = document.createElement("a")
        a.setAttribute("href", "data:application/json;charset=utf-8," + profileExportRAW)
        a.setAttribute("download", "doki_profile.json")
        a.click()
    }
    const handleImportProfile = async (e: FileList | null) => {
        if (e !== null && e.length > 0) {
            setLoadingUser(true)
            setTmpImport(e)
            const file = await readURL(e.item(0) as File)
            const importDetails = JSON.parse(file as string) as any
            console.log("PROFILE IMPORT DETAILS", importDetails)
            window.localStorage.setItem("watch_filter", importDetails.watch_filter)
            dispatch(actionCreators.setColorScheme(importDetails.color_scheme))
            dispatch(actionCreators.setAdPreference(importDetails.ads))
            dispatch(actionCreators.setLight(importDetails.light))
            dispatch(actionCreators.setPlaybackVolume(importDetails.playback_volume))
            dispatch(actionCreators.setID(importDetails.DokiIdentification))
            Cookies.set("DokiIdentification", importDetails.DokiIdentification)
            setId(importDetails.DokiIdentification)
            setLoadingUser(false)
            setTmpImport(null)
        }
    }
    const handleProfileDelete = () => {
        setDeleteDialog(false)
        props.requestProfileRemoval({ Id: parseInt(id) })
        setId("")
        setUser({ name: "Anonymous", creationDate: 0, authorId: "0" })
        setTab(0)
        Cookies.remove("DokiIdentification")
    }
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue)
    }
    return (
        <>
            <AppBar position="relative" color="default" className={clsx(classes.appBar)}>
                    <Toolbar>
                        <LightTooltip title="Your name on Doki. It cannot be changed.">
                            <Typography variant="h6" className={classes.username}>
                                {user.name}
                            </Typography>
                        </LightTooltip>
                        <div style={{ flex: 1 }} />
                        <Button
                            disabled={user.name === "Anonymous"}
                            variant="contained"
                            color="primary"
                            onClick={handleDownloadProfile}>
                            Download your profile
                        </Button>
                    </Toolbar>
                    <Toolbar variant="dense" sx={{ maxHeight: 24 }}>
                        {user.name === "Anonymous" ? <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Haven't uploaded yet
                        </Typography> : <Typography variant="caption">
                            Joined {moment(user.creationDate * 1e3).format("Do MMMM YYYY")} ・ {moment(user.creationDate * 1e3).fromNow()}
                        </Typography>}
                        <div style={{ flex: 1 }} />
                        <label htmlFor="import-profile">
                            {props.files.length > 0 && <Input id="import-profile" type="file" onChange={(e) => { handleImportProfile(e.target.files as FileList) }} />}
                            <Button disabled={props.files.length === 0} component="span">
                                Import profile
                            </Button>
                        </label>
                        <Button onClick={() => setWillUpload(true)}>
                            Upload files
                        </Button>
                        <LightTooltip title="This will delete every file you've uploaded.">
                            <Button onClick={() => setDeleteDialog(true)} disabled={user.name === "Anonymous"} color="error">
                                Delete profile
                            </Button>
                        </LightTooltip>
                    </Toolbar>
                <Tabs value={tab} onChange={handleChange} aria-label="tabs" centered variant="fullWidth">
                    <Tab disabled={user.name === "Anonymous"} label="Activity" {...a11yProps(1)} />
                    <Tab disabled={user.name === "Anonymous"} label="Files" {...a11yProps(2)} />
                    <Tab disabled={user.name === "Anonymous"} label="Folders" {...a11yProps(3)} />
                </Tabs>
            </AppBar>
            <Box sx={{ flex: 1, overflowY: "auto"}}>
                <TabPanel value={tab} index={0}>
                    {id && props.files && props.files.filter(x => Number.parseInt(x.author.authorId) === Number.parseInt(id)).filter(x => !deleted.includes(x)).map((v, i) =>
                        <Box key={i} sx={{ marginBottom: (theme) => theme.spacing(8) }}>
                            <Toolbar variant="dense">
                                <Typography variant="caption" sx={{ marginRight: (theme) => theme.spacing(2) }}>{moment(v.unixTime * 1e3).fromNow()}</Typography><Typography variant="caption" sx={{ color: "text.secondary" }}> {moment(v.unixTime * 1e3).format("hh:ss A Do MMMM YYYY")}</Typography>
                            </Toolbar>
                            <Paper>
                                <Toolbar variant="dense" sx={{ padding: 0 }}>
                                    <Typography sx={{ marginRight: (theme) => theme.spacing(2) }}>You uploaded</Typography>
                                    <Typography sx={{ fontWeight: 500, marginRight: (theme) => theme.spacing(2) }}>
                                        {v.fileURL.replace("files/", "")}
                                    </Typography>
                                    {v.folder && <>
                                        <Typography sx={{ marginRight: (theme) => theme.spacing(2) }}>to the folder</Typography>
                                        <Typography sx={{ fontWeight: 500, marginRight: (theme) => theme.spacing(2) }}>
                                            {v.folder}
                                        </Typography>
                                    </>}
                                </Toolbar>
                            </Paper>
                        </Box>
                    )}
                </TabPanel>
                <TabPanel value={tab} index={1}>
                    <Toolbar variant="dense" sx={{ width: "100%" }}>
                        <Typography variant="h6" sx={{ flex: 1 }}>
                            {id && props.files && props.files.filter(x => Number.parseInt(x.author.authorId) === Number.parseInt(id)).filter(x => !deleted.includes(x)).length} file{id && props.files && props.files.filter(x => Number.parseInt(x.author.authorId) === Number.parseInt(id)).filter(x => !deleted.includes(x)).length > 1 ? "s" : ""} uploaded by you
                        </Typography>
                    </Toolbar>
                    <Grid container spacing={1}>
                    {id && props.files && props.files.filter(x => Number.parseInt(x.author.authorId) === Number.parseInt(id)).filter(x => !deleted.includes(x)).map((v, i) =>
                        <Grid item xs={3} key={i}>
                        <Accordion TransitionProps={{ unmountOnExit: true }}>
                            <AccordionSummary expandIcon={<ExpandIcon />}>
                                <Toolbar disableGutters variant="dense" sx={{ width: "100%", padding: 0 }}>
                                    <Box>
                                    {viewable.includes(v.fileURL.split(".")[v.fileURL.split(".").length - 1].toUpperCase()) ? audioExt.includes(v.fileURL.split(".")[v.fileURL.split(".").length - 1].toUpperCase()) ? <MusicIcon style={{ marginRight: 56 }} /> : <img alt="" src={v.thumbnail} style={{ width: 64, height: 64, marginRight: 16 }} /> : <FileIcon style={{ marginRight: 56 }} />}
                                    <Typography sx={{ flex: 1, fontWeight: 700 }}>
                                        {truncate(v.fileURL.replace("files/", ""), 25)}
                                    </Typography>
                                    <Typography sx={{ flex: 1 }}>
                                        {moment(v.unixTime * 1e3).format("hh:ss Do MMMM YYYY")}
                                    </Typography>
                                        <Typography variant="caption">
                                            {moment(v.unixTime * 1e3).fromNow()}
                                        </Typography>
                                    <Typography sx={{ flex: 1 }}>
                                        {viewable.includes(v.fileURL.split(".")[v.fileURL.split(".").length - 1].toUpperCase()) ?
                                            audioExt.includes(v.fileURL.split(".")[v.fileURL.split(".").length - 1].toUpperCase()) ? "Audio" :
                                                imgExt.includes(v.fileURL.split(".")[v.fileURL.split(".").length - 1].toUpperCase()) ? "Image" :
                                                    "Video" : "Binary"}
                                    </Typography>

                                        {changeFolderSelection && changeFolderSelection === v && newFolderName !== "" ? newFolderName : v.folder ? <Typography variant="body1" className={classes.none}>{v.folder}</Typography> :
                                            <Typography variant="body1" className={classes.none}>Not in a
                                                folder</Typography>}
                                    </Box>
                                </Toolbar>
                            </AccordionSummary>
                            <AccordionDetails sx={{ position: "relative", display: "inline-flex" }}>
                                {viewable.includes(v.fileURL.split(".")[v.fileURL.split(".").length - 1].toUpperCase()) ? <>
                                    {audioExt.includes(v.fileURL.split(".")[v.fileURL.split(".").length - 1].toUpperCase()) ? <audio style={{ width: "25%" }} controls src={v.fileURL} /> :
                                        imgExt.includes(v.fileURL.split(".")[v.fileURL.split(".").length - 1].toUpperCase()) ? <img style={{ width: 300, height: 150, objectFit: "contain", background: "black" }} src={v.fileURL} alt="" /> :
                                            <video controls style={{ width: 300, height: 150, objectFit: "contain", background: "black" }} src={v.fileURL} />}
                                </> : <Typography>This is a binary file</Typography>}
                            </AccordionDetails>
                            <AccordionActions>
                                <Button className={classes.button}
                                    onClick={(e) => handleFolderChange(v)}
                                    variant="contained">Change Folder</Button>
                                <Button
                                    className={classes.button}
                                    onClick={(e) => handleDelete(v)}
                                    color="error"
                                    variant="contained">Delete</Button>
                            </AccordionActions>
                        </Accordion>
                        </Grid>
                    )}
                    </Grid>
                </TabPanel>
                <TabPanel value={tab} index={2}>
                    <Toolbar variant="dense" sx={{ width: "100%" }}>
                        <Typography variant="h6" sx={{ flex: 1 }}>
                            Folders you dominate (based on the amount of files uploaded to these folders)
                        </Typography>
                    </Toolbar>
                    {id && props.files && props.files.filter(x => x.folder !== null).filter(f => {
                        const usersFiles = props.files.filter(x => Number.parseInt(x.author.authorId) === Number.parseInt(id)).filter(x => !deleted.includes(x))

                        return usersFiles.filter(x => x.author.authorId === f.author.authorId)

                    }).map(x => x.folder).filter((value, index, self) => self.indexOf(value) === index).filter(x => x !== null).sort((a, b) => b.toLowerCase() > a.toLowerCase() ? -1 : 0).map((f, i) =>
                        <Accordion key={i}>
                            <AccordionSummary expandIcon={<ExpandIcon />}>
                                <Typography>{f}</Typography>
                            </AccordionSummary>
                            <AccordionDetails sx={{ position: "relative", display: "inline-flex", flexDirection: "column" }}>
                                <Toolbar disableGutters>
                                <Typography>
                                    Every file uploaded by you in this folder
                                </Typography>
                                </Toolbar>
                                <Grid container spacing={1}>
                                    {id && props.files && props.files.filter(x => Number.parseInt(x.author.authorId) === Number.parseInt(id)).filter(x => !deleted.includes(x)).filter(x => x.folder === f).map((v, i) =>
                                        <Grid item xs key={i}>
                                            <Accordion TransitionProps={{ unmountOnExit: true }}>
                                                <AccordionSummary expandIcon={<ExpandIcon />}>
                                                    <Toolbar disableGutters variant="dense" sx={{ width: "100%", padding: 0 }}>
                                                        <Box>
                                                            {viewable.includes(v.fileURL.split(".")[v.fileURL.split(".").length - 1].toUpperCase()) ? audioExt.includes(v.fileURL.split(".")[v.fileURL.split(".").length - 1].toUpperCase()) ? <MusicIcon style={{ marginRight: 56 }} /> : <img alt="" src={v.thumbnail} style={{ width: 64, height: 64, marginRight: 16 }} /> : <FileIcon style={{ marginRight: 56 }} />}
                                                            <Typography sx={{ flex: 1, fontWeight: 700 }}>
                                                                {truncate(v.fileURL.replace("files/", ""), 25)}
                                                            </Typography>
                                                            <Typography sx={{ flex: 1 }}>
                                                                {moment(v.unixTime * 1e3).format("hh:ss Do MMMM YYYY")}
                                                            </Typography>
                                                            <Typography variant="caption">
                                                                {moment(v.unixTime * 1e3).fromNow()}
                                                            </Typography>
                                                            <Typography sx={{ flex: 1 }}>
                                                                {viewable.includes(v.fileURL.split(".")[v.fileURL.split(".").length - 1].toUpperCase()) ?
                                                                    audioExt.includes(v.fileURL.split(".")[v.fileURL.split(".").length - 1].toUpperCase()) ? "Audio" :
                                                                        imgExt.includes(v.fileURL.split(".")[v.fileURL.split(".").length - 1].toUpperCase()) ? "Image" :
                                                                            "Video" : "Binary"}
                                                            </Typography>

                                                            {changeFolderSelection && changeFolderSelection === v && newFolderName !== "" ? newFolderName : v.folder ? <Typography variant="body1" className={classes.none}>{v.folder}</Typography> :
                                                                <Typography variant="body1" className={classes.none}>Not in a
                                                                    folder</Typography>}
                                                        </Box>
                                                    </Toolbar>
                                                </AccordionSummary>
                                                <AccordionDetails sx={{ position: "relative", display: "inline-flex" }}>
                                                    {viewable.includes(v.fileURL.split(".")[v.fileURL.split(".").length - 1].toUpperCase()) ? <>
                                                        {audioExt.includes(v.fileURL.split(".")[v.fileURL.split(".").length - 1].toUpperCase()) ? <audio style={{ width: "25%" }} controls src={v.fileURL} /> :
                                                            imgExt.includes(v.fileURL.split(".")[v.fileURL.split(".").length - 1].toUpperCase()) ? <img style={{ width: 300, height: 150, objectFit: "contain", background: "black" }} src={v.fileURL} alt="" /> :
                                                                <video controls style={{ width: 300, height: 150, objectFit: "contain", background: "black" }} src={v.fileURL} />}
                                                    </> : <Typography>This is a binary file</Typography>}
                                                </AccordionDetails>
                                                <AccordionActions>
                                                    <Button className={classes.button}
                                                            onClick={(e) => handleFolderChange(v)}
                                                            variant="contained">Change Folder</Button>
                                                    <Button
                                                        className={classes.button}
                                                        onClick={(e) => handleDelete(v)}
                                                        color="error"
                                                        variant="contained">Delete</Button>
                                                </AccordionActions>
                                            </Accordion>
                                        </Grid>
                                    )}
                                </Grid>
                            </AccordionDetails>
                            <AccordionActions>

                            </AccordionActions>
                        </Accordion>
                    )}
                </TabPanel>
            </Box>
            <Uploader open={willUpload} close={() => {
                setWillUpload(false)
            }} />
            <Dialog
                aria-labelledby="transition-modal-folder"
                className={classes.modal}
                open={openFolderPrompt}
                onClose={() => {
                    setOpenFolderPrompt(false)
                    setChangeFolderSelection(null)
                }}
                closeAfterTransition
            >
                <DialogTitle id="transition-modal-folder">Changing folder for
                    file {changeFolderSelection && changeFolderSelection.fileURL.replace("files/", "")}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Type in the folder you want to place this file in
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Folder name"
                        fullWidth
                        onChange={(v) => setNewFolderName(v.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setOpenFolderPrompt(false)
                        setChangeFolderSelection(null)
                    }} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => changeFolder(changeFolderSelection)} color="primary">
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>
                    Are you sure?
                </DialogTitle>
                <DialogContent>
                    Deleting your profile means deleting all of your files on the server, are you sure you want to do that?
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={() => setDeleteDialog(false)}>
                        On a second thought...
                    </Button>
                    <Button color="error" variant="contained" onClick={handleProfileDelete}>
                        Yes.
                    </Button>
                </DialogActions>

            </Dialog>
        </>
    )
}


export default connect(
    (state: ApplicationState) => state.files, // Selects which state properties are merged into the component's props
    FileServiceStore.actionCreators
)(Me as any) // eslint-disable-line @typescript-eslint/no-explicit-any