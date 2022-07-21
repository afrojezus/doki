import {
    Box,
    Card,
    Container,
    Group,
    Image, Modal,
    Paper,
    Progress,
    Space,
    Stack,
    Text,
    ThemeIcon,
    Title,
    UnstyledButton
} from "@mantine/core";
import {audioFormats, displayFilename, getExt, pictureFormats, playableFormats} from "../../utils/file";
import {createRef, useCallback, useContext, useEffect, useRef, useState} from "react";
import ReactPlayer from "react-player";
import {showNotification} from "@mantine/notifications";
import {File as FileIcon} from "tabler-icons-react";
import {LinkButton} from "@src/components/buttons";
import {getLocale, LocaleContext} from "@src/locale";
import {normalise} from "../../utils/math";

function pad(string: number) {
    return `0${string}`.slice(-2);
}

function format(seconds: number) {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = pad(date.getUTCSeconds());
    if (hh) {
        return `${hh}:${pad(mm)}:${ss}`;
    }
    return `${mm}:${ss}`;
}

export function Duration({className, seconds}: { className?: string, seconds: number }) {
    return (
        <time dateTime={`P${Math.round(seconds)}S`} className={className}>
            {format(seconds)}
        </time>
    );
}


export function QuickDetails({ sx, full = false, current, isPlayable, progress, children = undefined, duration = undefined, seekTo = undefined }) {
    const locale = useContext(LocaleContext);
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [rawSeek, setRawSeek] = useState(0);
    const [seek, setSeek] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const seeker = useRef(null);

    const fullDescClose = useCallback(() => setShowFullDesc(false), [showFullDesc]);
    const fullDescOpen = useCallback(() => setShowFullDesc(true), [showFullDesc]);

    function handleTrack(e) {
        setSeeking(true);
        setSeek(normalise(e.clientX - 16, 0, e.currentTarget.clientWidth));
        setRawSeek(normalise(e.clientX - 16, 0, e.currentTarget.clientWidth) / 100);
    }

    function handleSeek() {
        setSeeking(false);
        if (seekTo && duration) seekTo(rawSeek * duration);
    }

    return <Stack sx={sx}>
        <Title style={{ filter: `drop-shadow(0px 4px 2px rgb(0 0 0 / 0.4))` }} order={5} className="file-title"
               color={isPlayable && full ? "white" : undefined}>{displayFilename(current)}</Title>
        {current.Description &&
            <UnstyledButton onClick={fullDescOpen}><Text className="fade" sx={{whiteSpace: "pre-wrap", maxHeight: 72, overflow: "hidden"}} color={isPlayable && full ? "white" : undefined} size="xs">{current.Description}</Text></UnstyledButton>}
        <Group>
            <Text style={{ filter: `drop-shadow(0px 3px 2px rgb(0 0 0 / 0.4))` }} size="xs" color={isPlayable && full ? "white" : undefined}
                  weight={500}>{`${getLocale(locale).Viewer["uploaded-by"]} `}{current.Author.Name}</Text>
            <Space/>
            <Text style={{ filter: `drop-shadow(0px 3px 2px rgb(0 0 0 / 0.4))` }} size="xs" color={isPlayable && full ? "white" : undefined}
                  weight={500}>{getExt(current.FileURL)}{getLocale(locale).Viewer["file"]}</Text>
            <Space/>
            <Text style={{ filter: `drop-shadow(0px 3px 2px rgb(0 0 0 / 0.4))` }} size="xs" color={isPlayable && full ? "white" : undefined}
                  weight={500}>{current.Views}{` ${getLocale(locale).Viewer["views"]}`}</Text>
            <Space/>
            <Text style={{ filter: `drop-shadow(0px 3px 2px rgb(0 0 0 / 0.4))` }} size="xs" color={isPlayable && full ? "white" : undefined}
                  weight={500}>{current.Likes}{` ${getLocale(locale).Viewer["likes"]}`}</Text>
        </Group>
        {duration && seekTo ?
            <Box sx={{position: "relative"}} py="sm" onMouseDown={handleSeek} onMouseMove={handleTrack}
                 onMouseLeave={() => setSeeking(false)}>
                <Progress style={{ filter: `drop-shadow(0px 2px 2px rgb(0 0 0 / 0.4))` }} radius={0} size="sm" value={progress.played * 100} styles={{
                    root: {
                        opacity: 0.5,
                        display: playableFormats.includes(getExt(current.FileURL)) ? undefined : "none"
                    },
                    bar: {
                        transition: 'all 0.375s cubic-bezier(.07, .95, 0, 1)'
                    }
                }}/>
                <Progress radius={0} size="sm" value={seek} ref={seeker} styles={{
                    root: {
                        opacity: seeking ? 0.3 : 0,
                        display: playableFormats.includes(getExt(current.FileURL)) ? undefined : "none",
                        background: "transparent",
                        transition: "all .375s var(--animation-ease)",
                        marginTop: -5,
                    },
                    bar: {
                        transition: "none",
                        color: "white",
                        backgroundColor: "white",
                    }
                }}/>
                <Paper pl="xs" pr="xs" pt={1} pb={1} sx={{
                    position: "absolute",
                    left: `calc(${seek}% - 24px)`,
                    zIndex: 2,
                    bottom: 24,
                    opacity: seeking ? 0.9 : 0,
                    transition: "opacity .375s var(--animation-ease)"
                }}>
                    <Text size="xs"><Duration seconds={rawSeek * duration}/></Text>
                </Paper>
            </Box> : <Progress radius={0} size="sm" value={progress.played * 100} styles={{
                root: {
                    opacity: 0.5,
                    display: playableFormats.includes(getExt(current.FileURL)) ? undefined : "none"
                },
                bar: {
                    transition: 'all 0.375s cubic-bezier(.07, .95, 0, 1)'
                }
            }}/>}
        {children}

        <Modal opened={showFullDesc} onClose={fullDescClose} title="Description">
            <Text size="xs" sx={{whiteSpace: "pre-wrap"}}>
                {current.Description}
            </Text>
        </Modal>
    </Stack>;
}

export function ContentSlide({
                                 visualizer,
                                 data,
                                 isSelected,
                                 muted,
                                 volume,
                                 repeat,
                                 onEnded,
                                 onClick,
                                 href = "/",
                                 onProgress,
                                 pip,
                                 pipCallback,
                                 objFit,
                                 onDuration = null,
                                 seek = -1,
                                 willSeek = false,
                                 seekCallback = null,
                                 interacted = false,
                                 thumbnail = ""
                             }) {
    const [player, setPlayer] = useState<ReactPlayer>(null);
    const audioVisualizer = createRef<HTMLVideoElement>();

    function handleReady(p) {
        setPlayer(p);
    }

    useEffect(() => {
        if (pip) {
            if (document["pictureInPictureEnabled"]) {
                (player.getInternalPlayer() as HTMLVideoElement)["requestPictureInPicture"]()
                    .catch((e) => {
                        showNotification({
                            title: "Failed to enable picture-in-picture",
                            message: e,
                            color: "red"
                        })
                    });
                pipCallback();
            } else {
                showNotification({
                    title: "Browser error",
                    message: "Your browser currently doesn't support picture-in-picture mode",
                    color: "yellow"
                })
            }
        }
    }, [pip, player]);

    useEffect(() => {
        if (seek !== -1 && willSeek) {
            player.seekTo(seek as number, 'seconds');
            seekCallback();
        }
    }, [seek, player]);

    useEffect(() => {
        if (audioVisualizer.current instanceof HTMLVideoElement) {
            audioVisualizer.current.playbackRate = 5;
            if (isSelected) audioVisualizer.current.play();
            else audioVisualizer.current.pause();
        }
    }, [audioVisualizer, isSelected]);

    return <div className="player-wrapper">
        {playableFormats.includes(getExt(data)) ?
            <Box sx={{"& > * > video": {objectFit: objFit ? "contain" : "cover"}}}
                 style={{width: "inherit", height: "inherit", position: "inherit"}} onClick={onClick}>
                <ReactPlayer light={(audioFormats.includes(getExt(data)) && !interacted) || (!interacted && thumbnail)} onDuration={onDuration} onReady={handleReady} progressInterval={0.001} stopOnUnmount
                             playing={isSelected}
                             onProgress={onProgress} muted={muted} volume={volume} loop={repeat} onEnded={onEnded}
                             className="react-player"
                             url={data} width="100%" height="100%"/>
                {audioFormats.includes(getExt(data)) &&
                    <video src={`/${visualizer.FileURL}`} autoPlay loop muted width="100%" height="100%"
                           ref={audioVisualizer}
                           style={{objectFit: "cover", position: "fixed", top: 0, left: 0, height: "100vh"}}/>}
            </Box> :
            pictureFormats.includes(getExt(data)) ?
                <Image onClick={onClick} src={data} alt="" width="100%" height="100vh"
                       fit={objFit ? "contain" : "cover"} sx={{margin: "auto"}}/>
                :
                <Container sx={{height: "100vh", display: "inline-flex"}}>
                    <Card sx={{margin: "auto", minWidth: 200}}>
                        <Card.Section>
                            <ThemeIcon variant="light" sx={{width: "100%", height: 160}} radius={0}>
                                <FileIcon size={48}/>
                            </ThemeIcon>
                        </Card.Section>
                        <Text my="md">
                            Binary {getExt(data)} file
                        </Text>
                        <LinkButton href={href} fullWidth variant="light">
                            Continue
                        </LinkButton>
                    </Card>
                </Container>}
    </div>
}