import React from "react"
import {useParams} from "react-router"
import {actionCreators, FileServiceState} from "../store/FileService"
import {useDispatch, useSelector} from "react-redux"
import {ApplicationState} from "../store"
import {PreferencesState} from "../store/Preferences"
import {useHistory} from "react-router-dom"

const TriggerRoute = () => {
    const { id } = useParams<{ id: string }>()
    const dispatch = useDispatch()
    const history = useHistory()
    const files = useSelector((state: ApplicationState) => (state.files as FileServiceState).files)
    const watchFilter = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).watchFilter)
    const mediaExt = [
        "WEBM", "MP4", "MOV", "M4A", "AVI", "MP3", "WAV", "AAC", "OGG", "FLAC"
    ]

    const imgExt = [
        "JPG", "BMP", "GIF", "PNG", "JPEG", "WEBP"
    ]

    const viewable = [...imgExt, ...mediaExt]
    const randomVideo = () => {
        const videos = files.filter(x => !watchFilter.includes(x.folder)).filter(x => mediaExt.includes(x.fileURL.split(".")[x.fileURL.split(".").length - 1].toUpperCase()))
        const newFile = videos[Math.floor(Math.random() * videos.length)]
        history.push(`/watch/${newFile.id}`)
    }

    const randomFile = () => {
        const filteredFiles = files.filter(x => !watchFilter.includes(x.folder))
        const newFile = filteredFiles[Math.floor(Math.random() * filteredFiles.length)]
        history.push(`/watch/${newFile.id}`)
    }

    React.useEffect(() => {
        if (files.length > 0) {
            dispatch(actionCreators.requestFile(id))
            dispatch(actionCreators.requestComments(id))
        }
    }, [id])

    React.useEffect(() => {
        if (files.length > 0) {
            if (id) {
                dispatch(actionCreators.requestFile(id))
                dispatch(actionCreators.requestComments(id))
            } else {
                history.push("/browse")
            }
        }
    }, [files])
    return <></>
}

export default TriggerRoute