import { Button, TextField, Theme } from "@mui/material"
import createStyles from "@mui/styles/createStyles"
import makeStyles from "@mui/styles/makeStyles"
import React, { ChangeEvent, FormEvent, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { actionCreators, FileServiceState } from "../store/FileService"
import { ApplicationState } from "../store"
import { actionCreators as pref, PreferencesState } from "../store/Preferences"
import Cookies from "js-cookie"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        paper: {
            marginTop: theme.spacing(2),
            backgroundColor: "black",
        },
        paperWide: {
            width: "100%",
            marginBottom: theme.spacing(2),
        },
        paperWideDisabled: {
            width: "100%",
            marginBottom: theme.spacing(2),
            opacity: .5
        },
        paperToolbar: {
            marginTop: theme.spacing(2),
        },
        image: {
            display: "block",
            marginLeft: "auto",
            marginRight: "auto",
            width: "50%",
            maxHeight: 720,
            objectFit: "contain",
        },
        video: {
            width: "100%",
            maxHeight: 720,
            objectFit: "contain",
        },
        audio: {
            width: "100%",
        },
        title: {
            flexGrow: 1
        },
        commentForm: {
            display: "flex",
            padding: theme.spacing(1),
        },
        commentInput: {
            flexGrow: 1,
            marginRight: theme.spacing(1)
        },
        noComment: {
            padding: theme.spacing(2),
            textAlign: "center"
        },
        likeBtn: {
            marginRight: theme.spacing(1)
        },
        avatar: {
            background: "white"
        }
    }),
)

const Commenter = ({ file }: { file: string }) => {
    const serverFiles = useSelector((state: ApplicationState) => (state.files as FileServiceState).files)
    const id = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).id)
    const classes = useStyles()
    const dispatch = useDispatch()
    const [content, setContent] = useState("")
    const createIdentification = (): string => {
        let newId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER / 1e8)
        return serverFiles.map((x, y, z) => Number.parseInt(x.author.authorId) === newId) ? Math.floor(Math.random() * Number.MAX_SAFE_INTEGER / 1e8).toString() : newId.toString()
    }
    React.useEffect(() => {
        let i = Cookies.get("DokiIdentification")
        if (i === undefined) {
            dispatch(pref.setID(createIdentification()))
        }
    }, [serverFiles.length])
    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const f = new FormData()
        f.append("id", id)
        f.append("date", (Math.floor(Date.now() / 1000)).toString())
        f.append("content", content)
        f.append("file", file)
        dispatch(actionCreators.senCommentModel(file, f))
        setContent("")
    }
    const onChange = (event: ChangeEvent<{ value: unknown }>) => {
        setContent(event.target.value as string)
    }
    return (
        <form className={classes.commentForm} noValidate autoComplete="off" onSubmit={handleSubmit}>
            <TextField onChange={onChange} multiline className={classes.commentInput} label="Your comment"
                variant="outlined" />
            <Button disabled={content.length === 0} variant="contained" color="secondary" type="submit">Send</Button>
        </form>
    )
}

export default Commenter