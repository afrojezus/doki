import React, {forwardRef, useRef, useState} from "react"
import {Box, Paper} from "@mui/material"
import ReactPlayer, {ReactPlayerProps} from "react-player"
import {useDispatch, useSelector} from "react-redux"
import {ApplicationState} from "../store"
import {actionCreators, PreferencesState} from "../store/Preferences"
import {FileServiceState} from "../store/FileService"
import {FileModel} from "../models"
import {checkFile, mediaExt} from "../utils"

interface MediaPlayerInterface extends ReactPlayerProps {
    
}

const MediaPlayer = forwardRef((props: MediaPlayerInterface, ref: any) => {
    const visualExt = [
        "WEBM", "MP4", "MOV", "M4A", "AVI",
        "GIF"
    ]
    
    const audioExt = [
        "MP3", "WAV", "AAC", "OGG", "FLAC"
    ]

    const player = useRef(null)
    const gifVideo = useRef(null)
    const audioPlayer = useRef(null)
    const files = useSelector((state: ApplicationState) => (state.files as FileServiceState).files)
    const playbackVolume = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).playbackVolume)
    const dispatch = useDispatch()
    const [music, setMusic] = useState(false)
    const [vol, setVol] = useState(playbackVolume)
    const [muted, setMuted] = useState(false)
    const [playing, setPlaying] = useState(props.playing)
    const [pip, setPip] = useState(false)
    const [showControls, setShowControls] = useState(false)
    //const [duration, setDuration] = useState(0)
    const [progress, setProgress] = useState({ played: 0, playedSeconds: 0, loaded: 0, loadedSeconds: 0 })
    const [played, setPlayed] = useState(progress.playedSeconds)
    const [seeking, setSeeking] = useState(false)
    const [gif, setGif] = useState<FileModel | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const togglePlay = () => setPlaying(!playing)
    const handleVol = (event: any, newValue: number | number[]) => setVol(newValue as number)
    const toggleVol = () => setMuted(!muted)
    const togglePip = () => setPip(!pip)
    
    const [consolidateAudio, willConsolidateAudio] = useState(false)
    const [randomAudio, setRandomAudio] =  useState<FileModel | null>(null)

    const handleSeekDown = () => setSeeking(true)
    const handleSeekChange = (event: React.ChangeEvent<{}>, value: (number | number[])) => setPlayed(value as number)
    const handleSeekUp = (event: React.ChangeEvent<{}>, value: (number | number[])) => {
        setSeeking(false);
        (player.current as unknown as ReactPlayer).seekTo(value as number, "seconds")
    }

    //const onDuration = (n: number) => setDuration(n)
    const onProgress = (p: { played: number, playedSeconds: number, loaded: number, loadedSeconds: number }) => {
        if (!seeking) {
            setPlayed(p.playedSeconds)
            setProgress(p)
        }
    }
    
    const findGif = () => {
        setGif(files.filter(x => visualExt.includes(x.fileURL.split(".")[x.fileURL.split(".").length - 1].toUpperCase()))[Math.floor(Math.random() * files.filter(x => visualExt.includes(x.fileURL.split(".")[x.fileURL.split(".").length - 1].toUpperCase())).length)])
    }
    
    const handleGifPlaying = () => {
        (gifVideo.current as unknown as HTMLVideoElement).playbackRate = 2.0
    }
    
    const checkAudio = () => {
        if (player.current && (player.current as unknown as ReactPlayer).getInternalPlayer()) {
            // for chromium, safari
            if (typeof (player.current as unknown as ReactPlayer).getInternalPlayer().webkitAudioDecodedByteCount !== "undefined") {
                // non-zero if video has audio track
                if ((player.current as unknown as ReactPlayer).getInternalPlayer().webkitAudioDecodedByteCount > 0) {
                    // Do nothing
                    willConsolidateAudio(false)
                } else {
                    willConsolidateAudio(true)
                    if (audioPlayer.current) {
                        (audioPlayer.current as unknown as HTMLAudioElement).volume = playbackVolume
                    }
                }
            }
            // for firefox
            else if (typeof (player.current as unknown as ReactPlayer).getInternalPlayer().mozHasAudio !== "undefined") {
                // true if video has audio track
                if ((player.current as unknown as ReactPlayer).getInternalPlayer().mozHasAudio) {
                    // Do nothing
                    willConsolidateAudio(false)
                } else {
                    willConsolidateAudio(true)
                    if (audioPlayer.current) {
                        (audioPlayer.current as unknown as HTMLAudioElement).volume = playbackVolume
                    }
                }
            } else {
                // Not a video
            }
        }
    }

    React.useEffect(() => {
        dispatch(actionCreators.setPlaybackVolume(vol))
    }, [vol])
    React.useEffect(() => {
        if (props.url) {
            setMusic(audioExt.includes(props.url && (props.url as string).split(".")[(props.url as string).split(".").length - 1].toUpperCase()))
            setRandomAudio(files.filter(x => audioExt.includes(x.fileURL.split(".")[x.fileURL.split(".").length - 1].toUpperCase()))[Math.floor(Math.random() * files.filter(x => audioExt.includes(x.fileURL.split(".")[x.fileURL.split(".").length - 1].toUpperCase())).length)])
            findGif()
            setLoading(true)
            
        }
    }, [props.url])

    return (
        <Paper className={props.className} style={{
            width: "100%",
            height: "100%",
            border: "none"
        }}>
            <Box className="player-container">
                <ReactPlayer pip={pip} ref={ref} width="100%" height="100%"
                    className="player" style={props.style} {...props} />
                {music && gif && <>
                {checkFile(mediaExt, gif) ? <video autoPlay onPlay={handleGifPlaying} muted loop src={gif.fileURL} ref={gifVideo} className="gif" style={{objectFit: "cover", opacity: 0.5}} width="100%" height="100%"  /> : <img className="gif" alt="" src={gif.fileURL} style={{ opacity: played === 0 ? 0.5 : 1 }} />}</>}
            </Box></Paper>)
})

export default MediaPlayer