import React from "react"
import Cookies from "js-cookie"
import {useDispatch, useSelector} from "react-redux"
import {ApplicationState} from "../store"
import {actionCreators as fileS, FileServiceState} from "../store/FileService"
import {actionCreators as pref} from "../store/Preferences"
import {
    Accordion,
    AccordionActions,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Divider,
    LinearProgress,
    Paper,
    Switch,
    Theme,
    Toolbar,
    Typography,
} from "@mui/material"
import createStyles from "@mui/styles/createStyles"
import makeStyles from "@mui/styles/makeStyles"
import Dropzone from "react-dropzone"
import {ExpandMore, UploadFile} from "@mui/icons-material"
import {audioExt, imgExt, truncate, viewable} from "../utils"
import clsx from "clsx"

const useStyles = makeStyles((theme: Theme) => createStyles({
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
    },
    folderHintLabel: {
        color: theme.palette.text.disabled
    },
    uploadStack: {
        maxHeight: 900,
        transition: theme.transitions.create(["all"])
    },
    hiddenStack: {
        maxHeight: 0,
        opacity: 0
    }
}))


export interface UploaderProps {
    open: boolean;
    close: () => void;
    droppedFiles?: File[];
    inFolder?: string;
}

export default ({ open, close, droppedFiles = [], inFolder }: UploaderProps) => {
    const classes = useStyles()
    const serverFiles = useSelector((state: ApplicationState) => (state.files as FileServiceState).files)
    const success = useSelector((state: ApplicationState) => (state.files as FileServiceState).success)
    const isLoading = useSelector((state: ApplicationState) => (state.files as FileServiceState).isUploading)
    const dispatch = useDispatch()
    const [files, setFiles] = React.useState<File[]>([])

    const [expanded, setExpanded] = React.useState<boolean>(false)

    // Attributes

    const [folder, setFolder] = React.useState(inFolder ? inFolder : " ")
    const [folders, setFolders] = React.useState<string[]>([])
    const [tmpFolder, setTmpFolder] = React.useState("")

    const [notSafe, setNotSafe] = React.useState("0")
    const [notSafeOnes, setNotSafeOnes] = React.useState<string[]>([])
    const [tmpNSFW, setTmpNSFW] = React.useState<string>("0")

    const createIdentification = (): string => {
        let newId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER / 1e8)
        return serverFiles && serverFiles.length > 0 && serverFiles.map((x, y, z) => Number.parseInt(x.author.authorId) === newId) ? Math.floor(Math.random() * Number.MAX_SAFE_INTEGER / 1e8).toString() : newId.toString()
    }

    React.useEffect(() => {
        if (droppedFiles.length > 0) {
            setFiles(droppedFiles)
        }
    }, [droppedFiles])

    const onSubmit = () => {
        if (files.length > 0) {
            let i = Cookies.get("DokiIdentification")
            if (i === undefined)
                i = createIdentification()
            console.log(i)
            const formData = new FormData()
            for (let i = 0; i < files.length; i++) {
                formData.append("file", files[i])
                formData.append("folder", folders[i] ? folders[i] : folder)
                formData.append("NSFW", notSafeOnes[i] ? notSafeOnes[i] : notSafe)
            }
            formData.append("id", i)
            dispatch(fileS.senFileModel(formData))
            if (Cookies.get("DokiIdentification") === undefined) {
                Cookies.set("DokiIdentification", i)
            }
            dispatch(pref.setID(i))
            setFiles([])
        }
    }

    React.useEffect(() => setFolder(inFolder as string), [inFolder])

    React.useEffect(() => {
        close()
    }, [success])

    const readURL = (file: File) => new Promise((res, rej) => {
            const reader = new FileReader()
            reader.onload = e => res((e.target as any).result)
            reader.onerror = e => rej(e)
            reader.readAsDataURL(file)
        })

    return (
        <Dialog PaperProps={{
            sx: {
                maxWidth: 1000
            }
        }} open={open} onClose={close}>
            <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0, 2), background: (theme) => theme.palette.background.paper }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 14 }}>Upload {inFolder && `to ${inFolder}`}</Typography>
                <div style={{ flex: 1 }} />
            </Toolbar>
            <Divider />
            <DialogContent sx={{ overflowX: "hidden" }}>
                {isLoading && <LinearProgress color="secondary" />}
                <Typography gutterBottom sx={{ marginBottom: (theme) => theme.spacing(2) }}>By uploading, you agree to having an identifiable profile on the server tied to your
                    uploads. 5 GB size limit.</Typography>
                <Box className={clsx(classes.uploadStack, isLoading && classes.hiddenStack)}>
                    <Dropzone onDrop={(acceptedFiles: File[]) => setFiles(acceptedFiles)}>
                        {({ getRootProps, getInputProps }) => (
                            <section>
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <Paper sx={{ height: files.length != 0 ? 58 : 150, width: "100%", padding: (theme) => theme.spacing(2), cursor: "pointer", transition: (theme) => theme.transitions.create(["all"]), display: "inline-flex", flexDirection: files.length != 0 ? "row" : "column" }}>
                                        <Typography sx={{ textAlign: files.length != 0 ? undefined : "center", flex: files.length != 0 ? 1 : undefined }}>{files.length != 0 ? "Drag a new set of files here" : "Drag files in here to upload, or click to bring up the file picker"}</Typography>
                                        <UploadFile fontSize={files.length != 0 ? undefined : "large"} style={{ textAlign: "center", justifyContent: "center", alignItems: "center", flex: files.length != 0 ? undefined : 1, margin: files.length != 0 ? undefined : "auto" }} />
                                    </Paper>
                                </div>
                            </section>
                        )}
                    </Dropzone>
                    {files.length != 0 && <Box sx={{ maxHeight: 600 }}>
                        <Toolbar disableGutters>
                            <Typography sx={{ flex: 1 }}>{files.length} file{files.length > 1 ? "s" : undefined} added</Typography>
                            <Typography>
                                All NSFW?
                            </Typography>
                            <Switch onChange={(e) => setNotSafe(e.target.checked ? "1" : "0")} value={notSafe} />
                            <Typography variant="caption">Put all in: </Typography>
                            <input onChange={(e) => setFolder(e.target.value === "" ? " " : e.target.value)} list="folders"
                                value={folder} />
                            <datalist id="folders">
                                {serverFiles.map(x => x.folder).filter((value, index, self) => self.indexOf(value) === index).filter(x => x !== null).map((v, index) =>
                                    <option value={v} key={index} />)}
                            </datalist>
                        </Toolbar>
                        {files.map((f: File, i: number) =>
                            <Accordion key={i} TransitionProps={{ unmountOnExit: true }}>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography sx={{ flex: 1 }}>{truncate(f.name, 25)}</Typography>
                                    <Typography sx={{ color: "text.secondary" }}>
                                        {f.type} {folders[i]}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ position: "relative" }}>
                                    {viewable.includes(f.name.split(".")[f.name.split(".").length - 1].toUpperCase()) ? <>
                                        {audioExt.includes(f.name.split(".")[f.name.split(".").length - 1].toUpperCase()) ? <audio controls src={URL.createObjectURL(f)} /> :
                                            imgExt.includes(f.name.split(".")[f.name.split(".").length - 1].toUpperCase()) ? <img style={{
                                                top: 0,
                                                left: 0,
                                                width: "100%", height: "100%", position: "absolute",
                                                zIndex: -1, objectFit: "cover", opacity: 0.3
                                            }} src={URL.createObjectURL(f)} alt="" /> :
                                                <video controls muted autoPlay loop style={{
                                                    top: 0,
                                                    left: 0,
                                                    width: "100%", height: "100%", position: "absolute",
                                                    zIndex: -1, objectFit: "cover", opacity: 0.3
                                                }} src={URL.createObjectURL(f)} />}
                                    </> : <Typography>This is a binary file</Typography>}
                                    <Box>
                                        <Typography>
                                            Folder
                                        </Typography>
                                        <Toolbar variant="dense" disableGutters>
                                            <input onChange={(e) => setTmpFolder(e.target.value === "" ? " " : e.target.value)} list="folders"
                                                value={folders[i]} />
                                            <datalist id="folders">
                                                {serverFiles.map(x => x.folder).filter((value, index, self) => self.indexOf(value) === index).filter(x => x !== null).map((v, index) =>
                                                    <option value={v} key={index} />)}
                                            </datalist>
                                            <Button onClick={() => setFolders(_folders =>
                                            ({
                                                ...folders,
                                                [i]: tmpFolder
                                            })
                                            )}>
                                                Set folder
                                            </Button>
                                        </Toolbar>
                                    </Box>
                                    <Box>
                                        <Typography>
                                            NSFW?
                                        </Typography>
                                        <Toolbar variant="dense" disableGutters>
                                            <Switch onChange={(e) => setTmpNSFW(e.target.checked ? "1" : "0")} value={notSafeOnes[i]} />
                                            <Button onClick={() => setNotSafeOnes(_nsfws =>
                                            ({
                                                ..._nsfws,
                                                [i]: tmpNSFW
                                            })
                                            )}>
                                                Set NSFW
                                            </Button>
                                        </Toolbar>
                                    </Box>
                                </AccordionDetails>
                                <AccordionActions>
                                    <Button onClick={() => setFiles(files.filter(i => i.name !== f.name))} variant="contained" color="error">Delete</Button>
                                </AccordionActions>
                            </Accordion>)}
                    </Box>}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onSubmit} disabled={files.length === 0}>Upload {files.length > 1 && "All"}</Button>
            </DialogActions>
        </Dialog>
    )
}