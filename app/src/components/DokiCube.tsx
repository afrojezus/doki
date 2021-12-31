import React, { CSSProperties } from "react"
import { FileModel } from "../models"
import { Box, ButtonBase, CircularProgress, Divider, Paper, Theme, Tooltip, Typography } from "@mui/material"
import createStyles from "@mui/styles/createStyles"
import makeStyles from "@mui/styles/makeStyles"
import { Folder } from "@mui/icons-material"
import { useHistory } from "react-router-dom"
import clsx from "clsx"
import moment from "moment"
import { useSelector } from "react-redux"
import { ApplicationState } from "../store"
import { FileServiceState } from "../store/FileService"
import { Skeleton } from "@mui/material"
import {truncate, displayFilename} from "../utils"

interface IDokiCubeProps {
    file: FileModel | null;
    folder: boolean;
    onClick: ((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) | undefined;
    folderName: string | undefined;
    folderSize: number | undefined;
    style?: CSSProperties;
    textStyle?: CSSProperties;
    showFileName?: boolean;
    className?: string;
    onContextMenu?: ((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) | undefined;
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        imageList: {
            paddingTop: theme.spacing(2),
            paddingBottom: theme.spacing(2)
        },
        img: {
            width: "100%",
            height: 180,
            objectFit: "cover",
            background: theme.palette.primary.dark,
            borderRadius: theme.shape.borderRadius
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
        loading: {
            position: "absolute",
            bottom: theme.spacing(0),
            width: "100%",
            height: "100%",
            left: theme.spacing(0),
            borderRadius: theme.shape.borderRadius,
        },
        folderColor: {
            transition: theme.transitions.create(["all"], {
                duration: 115
            }),
            borderRadius: theme.shape.borderRadius,
            backgroundColor: `${theme.palette.primary.light} !important`,
            "&:hover": {
                backgroundColor: `${theme.palette.primary.main} !important`,
            }
        },
        fileItem: {
            transition: theme.transitions.create(["all"], {
                duration: 200
            }),
            borderRadius: theme.shape.borderRadius,
            "& > img": {
                borderRadius: theme.shape.borderRadius,
            }
        },
        title: {
            fontWeight: 700,
        },
        fileType: {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            fontWeight: 700,
            color: theme.palette.primary.contrastText
        },
        folderImg: {
            opacity: 0.18,
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            background: theme.palette.primary.dark,
            borderRadius: theme.shape.borderRadius,
        },
        cube: {
            position: "relative",
            width: 100,
            height: 100,
            textDecoration: "none",
            color: "inherit",
            textAlign: "initial",
            //animation: 'fadein 0.3s ease',
            display: "inline-flex",
            flexDirection: "column",
            justifyContent: "initial",
            border: "1px solid rgba(255,255,255,0)",
            overflow: "hidden",
            "&:hover": {
                boxShadow: `8px 8px 0px ${theme.palette.primary.dark}`,
                border: `8px solid ${theme.palette.primary.main}`,
            }
        },
        tableIcon: {
            objectFit: "cover",
            height: "100%",
            width: "100%",
            border: "none",
            position: "absolute",
            boxShadow: theme.shadows[2],
            pointerEvents: "none",
            background: theme.palette.primary.main
        },
        blurredIcon: {
            filter: "blur(10px)"
        },
        overlay: {
            boxSizing: "border-box",
            padding: 4,
            height: 180,
            width: "100%",
            position: "relative",
        },
        span: {
            fontWeight: 700,
            fontSize: "0.9em",
            overflowWrap: "break-word",
            position: "absolute",
            top: 4,
            wordBreak: "break-all",
            margin: "0 4px 0 0",
            textOverflow: "ellipsis",
            left: 4
        },
        p: {
            fontWeight: 700,
            fontSize: "0.8em",
            overflowWrap: "break-word",
            position: "absolute",
            top: 4,
            right: 0,
            wordBreak: "break-all",
            margin: "0 4px 0 0",
        },
        f_p: {
            fontWeight: 700,
            fontSize: "0.8em",
            overflowWrap: "break-word",
            position: "absolute",
            top: 24,
            right: 0,
            wordBreak: "break-all",
            margin: "0 4px 0 0",
            color: theme.palette.primary.contrastText
        },
        inactive: {
            boxShadow: "none"
        },
        overlayText: {
            color: "white",
            padding: theme.spacing(0.25, 0.5),
            background: "rgba(0,0,0,1)",
            borderRadius: theme.shape.borderRadius
        },
        info: {
            width: "100%",
            borderRadius: theme.shape.borderRadius,
            padding: theme.spacing(1),
            display: "inline-flex",
            flexFlow: "column wrap",
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            // backdropFilter: 'blur(10px)',
        },
        infoTitle: {
            opacity: 0,
            transition: theme.transitions.create(["all"], {
                duration: 115
            }),
            overflowWrap: "break-word",
            wordBreak: "break-all",
            textOverflow: "ellipsis",
            fontWeight: 600,
            fontSize: 14,
            color: "white",
            margin: 0
        },
        infoTitleShown: {
            opacity: 1,
        },
        optimized: {
            boxShadow: "initial",
            overflow: "initial",
            opacity: 0,
        },
        optimizedInfo: {
            display: "none"
        }
    }),
)


export default ({
    file = null,
    folder = false,
    onClick,
    folderName = "",
    folderSize = 0,
    style,
    textStyle,
    showFileName = false,
    className,
    onContextMenu,
}: IDokiCubeProps) => {
    const files = useSelector((state: ApplicationState) => (state.files as FileServiceState).files)
    const prepareNewFile = useSelector((state: ApplicationState) => (state.files as FileServiceState).preparingNewFile)
    const [loaded, setLoaded] = React.useState(false)
    const [showFilenameN, setShowFilename] = React.useState(false)
    const history = useHistory()
    const classes = useStyles()
    const imgExt = [
        "JPG", "JPE", "BMP", "GIF", "PNG", "JPEG", "WEBP"
    ]
    const vidExt = [
        "WEBM", "MP4", "MOV", "M4A", "AVI"
    ]
    const audExt = [
        "MP3", "WAV", "AAC", "OGG", "FLAC"
    ]
    const visibleMediaExtensions = [...imgExt, ...vidExt]
    const onLoad = () => {
        setLoaded(true)
    }
    if (file) {
        const mediaCheck = (imgExt.includes(file.fileURL.split(".")[file.fileURL.split(".").length - 1].toUpperCase()) || vidExt.includes(file.fileURL.split(".")[file.fileURL.split(".").length - 1].toUpperCase()))
        return (
            <ButtonBase style={style}
                TouchRippleProps={{
                    color: "primary"
                }}
                className={clsx(classes.cube, classes.fileItem, prepareNewFile && classes.optimized, mediaCheck && !(loaded) && classes.inactive, className)}
                onClick={onClick}
                onMouseEnter={() => setShowFilename(true)} onMouseLeave={() => setShowFilename(false)}
                onContextMenu={onContextMenu}
            >
                {mediaCheck ?
                    <Box sx={{ position: "relative", flex: 1, width: "100%", height: 100 }}>
                        <img onLoad={onLoad} className={clsx(classes.tableIcon, file.nsfw && classes.blurredIcon)} alt=""
                            src={file.thumbnail.includes(".gif") ? file.thumbnail + "&format=jpg" : file.thumbnail} />
                        {loaded && <Typography variant="h5" style={textStyle}
                            className={clsx(classes.span, classes.overlayText)}>{showFileName ? displayFilename(file.fileURL) : file.fileURL.split(".")[file.fileURL.split(".").length - 1].toUpperCase()}</Typography>}
                        {!(loaded) &&
                            <Skeleton variant="rectangular" className={classes.loading} />}
                        {loaded && <Typography style={textStyle}
                            className={clsx(classes.p, classes.overlayText)}>{(file.size / 1024 / 1024).toFixed(2)} MB</Typography>}
                        {loaded && file.folder && <Typography style={textStyle}
                            className={clsx(classes.f_p, classes.overlayText)}>{file.folder}</Typography>}
                    </Box> :
                    <Box sx={{ position: "relative", flex: 1, width: "100%", height: 100 }}>
                        <Paper className={clsx(classes.tableIcon)}>
                            <Typography variant="h3"
                                className={classes.fileType}>{file.fileURL.split(".")[file.fileURL.split(".").length - 1].toUpperCase()}</Typography>
                        </Paper>
                        <Typography variant="h5" style={textStyle}
                            className={clsx(classes.span, classes.overlayText)}>{showFileName ? file.fileURL.replace("files/", "") : file.fileURL.split(".")[file.fileURL.split(".").length - 1].toUpperCase()}</Typography>
                        <Typography style={textStyle}
                            className={clsx(classes.p, classes.overlayText)}>{(file.size / 1024 / 1024).toFixed(2)} MB</Typography>
                        {file.folder && <Typography style={textStyle}
                            className={clsx(classes.f_p)}>{file.folder}</Typography>}
                    </Box>}
                <div className={clsx(classes.info, prepareNewFile && classes.optimizedInfo)}>
                    <Typography gutterBottom className={clsx(classes.infoTitle, classes.infoTitleShown)}>{truncate(displayFilename(file.fileURL), 28)}</Typography>
                    <Box sx={{flexDirection: "row", display: "inline-flex"}}>
                        <Typography variant="caption">{moment(file.unixTime * 1e3).fromNow()}</Typography>
                        <Divider sx={{margin: (theme) => theme.spacing(0, 1)}} orientation="vertical" />
                        <Typography variant="caption">{file.views} views </Typography>
                        <Divider orientation="vertical" sx={{ margin: (theme) => theme.spacing(0, 1) }}  />
                        <Typography variant="caption">{file.likes} likes</Typography>
                    </Box>
                    {file.nsfw && <Typography variant="h5" style={{ left: "initial", bottom: 8, right: 4, top: "initial", border: "1px solid #f00", color: "#f00", ...textStyle }}
                        className={clsx(classes.span, classes.overlayText)}>NSFW</Typography>}
                </div>
            </ButtonBase>
        )
    }
    return <></>
}