import React, {useState} from "react"
import {
    Avatar,
    Button,
    Card,
    CardHeader,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Slider,
    Switch,
    Theme,
    Toolbar,
    Typography,
} from "@mui/material"
import createStyles from "@mui/styles/createStyles"
import makeStyles from "@mui/styles/makeStyles"
import {useDispatch, useSelector} from "react-redux"
import {ApplicationState} from "../store"
import {sessionActions, SessionState} from "../store/Session"
import {actionCreators, PreferencesState} from "../store/Preferences"
import {actionCreators as fileActions, FileServiceState} from "../store/FileService"
import {AuthorModel} from "../models"
import {LightTooltip, readURL, retrieveAuthorInfo} from "../utils"
import Cookies from "js-cookie"
import {yellow} from "@mui/material/colors"
import moment from "moment"
import {styled} from "@mui/material/styles"

const Input = styled("input")({
    display: "none",
})

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            margin: theme.spacing(1, 0),
            minWidth: 300,
            width: "100%",
            marginTop: theme.spacing(2)
        },
        selectEmpty: {
            marginTop: theme.spacing(2),
        },
        heading: {
            marginBottom: theme.spacing(1)
        },
        previewChip: {
            minWidth: 160,
            maxWidth: 210
        },
        folderInput: {
            marginTop: theme.spacing(1),
            width: "100%",
            padding: theme.spacing(1, 2),
        },
        folderLabel: {
            marginTop: theme.spacing(2)
        }
    }),
)


const Settings = ({ open, close }: { open: boolean, close: () => void }) => {
    const classes = useStyles()
    const files = useSelector((state: ApplicationState) => (state.files as FileServiceState).files)
    const colorScheme = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).colorScheme)
    const prevLight = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).light)
    const prevWatchFilter = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).watchFilter)
    const hasAllowedAds = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).allowAds)
    const hasTVmode = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).tvMode)
    const hasSnow = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).snow)
     const hasBorderRadius = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).borderRadius)
    const id = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).id)
    const isAdmin = useSelector((state: ApplicationState) => (state.session as SessionState).adminPowers)
    const dispatch = useDispatch()
    const [color, setColor] = useState<string>(colorScheme)
    const [light, setLight] = useState(prevLight)
    const [watchFilter, setWatchFilter] = useState(prevWatchFilter)
    const [allowAds, setAllowAds] = useState(hasAllowedAds)
    const [tvMode, setTVmode] = useState(hasTVmode)
    const [snow, setSnow] = useState(hasSnow)
    const [raytracing, setRaytracing] = useState(false)
    const [br, setBr] = useState(hasBorderRadius)
    const [admin, setAdmin] = useState(isAdmin)

    // User management
    const [user, setUser] = React.useState<AuthorModel>({ name: "Anonymous", creationDate: 0, authorId: "0" })
    const [loadingUser, setLoadingUser] = React.useState(true)

    const [tmpImport, setTmpImport] = React.useState<FileList | null>(null)
    const [deleteDialog, setDeleteDialog] = React.useState(false)

    const fetchUser = async (_id: string) => {
        setLoadingUser(true)
        const _user = await retrieveAuthorInfo(parseInt(_id))
        setUser(_user)
        setLoadingUser(false)
    }

    React.useEffect(() => {
        let i = Cookies.get("DokiIdentification")
        if (i) {
            fetchUser(i)
        }
    }, [])

    React.useEffect(() => {
        if (id) {
            fetchUser(id)
        }
    }, [id])

    const handleColor = (event: SelectChangeEvent<string>, child: React.ReactNode) => {
        setColor(event.target.value as string)
    }
    const handleLight = (event: SelectChangeEvent<string>, child: React.ReactNode) => {
        setLight(event.target.value as string)
    }
    const handleAds = (event: any) => {
        setAllowAds(event.target.checked)
    }
    const handleTVmode = (event: any) => {
        setTVmode(event.target.checked)
    }
    const handleSnow = (event: any) => setSnow(event.target.checked)
    const handleRaytracing = (event: any) => setRaytracing(event.target.checked)
    const handleRemoveFilter = (e: string) => setWatchFilter(watchFilter.filter(x => x !== e))

    const handleBR = (event: Event, value: number | number[], activeThumb: number) => setBr(value as number)

    const handleAdmin = (event: any) => setAdmin(event.target.checked)
    React.useEffect(() => {
        localStorage.setItem("color_scheme", color)
        dispatch(actionCreators.setColorScheme(color))
    }, [color])
    React.useEffect(() => {
        localStorage.setItem("light", light)
        dispatch(actionCreators.setLight(light))
    }, [light])
    React.useEffect(() => {
        localStorage.setItem("ads", allowAds.toString())
        dispatch(actionCreators.setAdPreference(allowAds))
    }, [allowAds])
    React.useEffect(() => {
        localStorage.setItem("tv_mode", tvMode.toString())
        dispatch(actionCreators.setTVMode(tvMode))
    }, [tvMode])
    React.useEffect(() => {
        localStorage.setItem("snow", snow.toString())
        dispatch(actionCreators.setSnowMode(snow))
    }, [snow])
    React.useEffect(() => {
        dispatch(actionCreators.setWatchFilter(watchFilter))
    }, [watchFilter])
    React.useEffect(() => {
        if (raytracing) {
            document.body.style.filter = "drop-shadow(0 0 10px white)"
        } else {
            document.body.style.filter = "none"
        }
    }, [raytracing])
    React.useEffect(() => {
        dispatch(actionCreators.setBorderRadius(br))
    }, [br])
    React.useEffect(() => {
        dispatch(sessionActions.setAdminPowers(admin))
    }, [admin])


    const handleDownloadProfile = () => {
        const profileExport = {
            DokiIdentification: user.authorId,
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
            fetchUser(importDetails.DokiIdentification)
            setTmpImport(null)
        }
    }
    const handleProfileDelete = () => {
        setDeleteDialog(false)
        dispatch(fileActions.requestProfileRemoval({ Id: parseInt(user.authorId) }))
        setUser({ name: "Anonymous", creationDate: 0, authorId: "0" })
        Cookies.remove("DokiIdentification")
    }

    return (
        <Dialog open={open} onClose={close}>
            <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0, 2), background: (theme) => theme.palette.background.paper }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 14 }}>Settings</Typography>
                <div style={{ flex: 1 }} />
                <Card sx={{ margin: (theme) => theme.spacing(1), marginRight: 0 }}>
                    <CardHeader avatar={user.name === "Anonymous" ? undefined : <Avatar sx={{ fontSize: 14, fontWeight: 700, textAlign: "left", paddingLeft: "2px", bgcolor: yellow[500], color: "black" }} variant="rounded">DOKI ID</Avatar>} titleTypographyProps={{ style: { fontSize: 14 } }} title={user.name} subheader={user.name === "Anonymous" ? undefined : `Joined ${moment(user.creationDate * 1e3).format("Do MMMM yyyy")}`}>
                    </CardHeader>
                </Card>
            </Toolbar>
            <Divider />
            <DialogContent>
                <Toolbar variant="dense" disableGutters>
                    <Typography variant="caption" gutterBottom>Administrator mode</Typography>
                    <div style={{ flex: 1 }} />
                    <Switch checked={admin} disabled={process.env.REACT_APP_TYPE === "PUBLIC"} onChange={handleAdmin} />
                </Toolbar>
                <Toolbar variant="dense" disableGutters>
                    <Typography variant="caption">
                        Doki ID management
                    </Typography>
                    <div style={{ flex: 1 }} />
                    <Button
                        disabled={user.name === "Anonymous"}
                        color="inherit"
                        onClick={handleDownloadProfile}>
                        Download profile
                    </Button>
                    <label htmlFor="import-profile">
                        {files.length > 0 && <Input id="import-profile" type="file" onChange={(e) => { handleImportProfile(e.target.files as FileList) }} />}
                        <Button color="inherit" disabled={files.length === 0} component="span">
                            Import profile
                        </Button>
                    </label>
                    <LightTooltip title="This will delete every file you've uploaded.">
                        <Button onClick={() => setDeleteDialog(true)} disabled={user.name === "Anonymous"} color="error">
                            Delete profile
                        </Button>
                    </LightTooltip>
                </Toolbar>
                <Divider />
                <FormControl variant="outlined" className={classes.formControl}>
                    <InputLabel id="color-label">Color scheme</InputLabel>
                    <Select labelId="color-label" label="Color scheme" value={color} onChange={handleColor}>
                        <MenuItem value={"midori"}>Midori</MenuItem>
                        <MenuItem value={"umi"}>Umi</MenuItem>
                        <MenuItem value={"aka"}>Aka</MenuItem>
                        <MenuItem value={"gure"}>Gure</MenuItem>
                        <MenuItem value={"chairo"}>Chairo</MenuItem>
                        <MenuItem value={"anba"}>Anba</MenuItem>
                        <MenuItem value={"raimu"}>Raimu</MenuItem>
                    </Select>
                </FormControl>
                {/*<FormControl variant="outlined" className={classes.formControl}>
                    <InputLabel id="light-label">Light</InputLabel>
                    <Select labelId="light-label" label="Light" value={light} onChange={handleLight}>
                        <MenuItem value={'auto'}>System</MenuItem>
                        <MenuItem value={'light'}>Light</MenuItem>
                        <MenuItem value={'dark'}>Dark</MenuItem>
                    </Select>
    </FormControl>*/}
                <FormControl variant="outlined" className={classes.formControl}>
                    <InputLabel id="filter-label">Select which folders you don't want to see at all</InputLabel>
                    <Select labelId="filter-label" label="Select which folders you don't want to see at all" value={light}
                        onChange={(e) => setWatchFilter([...watchFilter, e.target.value as string])}>
                        {files && files.length > 0 && files.map(x => x.folder).filter(x => !watchFilter.includes(x)).filter((value, index, self) => self.indexOf(value) === index).filter(x => x !== null).map((v, index) =>
                            <MenuItem value={v} key={index}>{v}</MenuItem>)}
                    </Select>
                    <Grid container>{watchFilter.map((e, i) => <Grid item key={i}><Chip label={e}
                        onDelete={() => handleRemoveFilter(e)} /></Grid>)}</Grid>
                </FormControl>
                <Toolbar variant="dense" disableGutters>
                    <Typography variant="caption" gutterBottom>Border radius on the UI</Typography>
                    <div style={{ flex: 1 }} />
                    <Slider marks sx={{maxWidth: 150}} valueLabelDisplay="auto" min={0} max={36} step={1} value={br} onChange={handleBR} />
                </Toolbar>
                <Toolbar variant="dense" disableGutters>
                    <Typography variant="caption" gutterBottom>Show snow effect</Typography>
                    <div style={{ flex: 1 }} />
                    <Switch checked={snow} onChange={handleSnow} />
                </Toolbar>
                <Toolbar variant="dense" disableGutters>
                    <Typography variant="caption" gutterBottom>Raytracing on the snow</Typography>
                    <div style={{ flex: 1 }} />
                    <Switch checked={raytracing} disabled={!snow} onChange={handleRaytracing} />
                </Toolbar>
                {/*<FormControl variant="outlined" className={classes.formControl}>
                    <Typography gutterBottom>TV Mode</Typography>
                    <Switch checked={tvMode} onChange={handleTVmode} />
                </FormControl>*/}
                {/*<FormControl variant="outlined" className={classes.formControl}>
                    <Typography gutterBottom>Allow ads?</Typography>
                    <Typography>You need to reload the side for this setting to take effect</Typography>
                    <Switch checked={allowAds} onChange={handleAds} />
                </FormControl>*/}
            </DialogContent>
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0, 2), background: (theme) => theme.palette.background.paper }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 14 }}>Are you sure?</Typography>
                    <div style={{ flex: 1 }} />
                </Toolbar>
                <Divider />
                <DialogContent>
                    Deleting your profile means deleting all of your files on the server, are you sure you want to do that?
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={() => setDeleteDialog(false)}>
                        On a second thought...
                    </Button>
                    <Button color="error" variant="contained" onClick={handleProfileDelete}>
                        Yes
                    </Button>
                </DialogActions>

            </Dialog>
        </Dialog>
    )
}

export default Settings