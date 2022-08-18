import {
    ActionIcon,
    Aside,
    Box,
    Button,
    Card,
    Divider,
    Group,
    Header,
    Modal,
    Paper,
    Slider,
    Stack,
    Text,
    Tooltip,
    useMantineTheme
} from '@mantine/core';
import {
    Cast,
    Download,
    Help,
    PictureInPicture,
    PlayerPause,
    PlayerPlay,
    PlayerSkipBack,
    PlayerSkipForward,
    Repeat,
    RepeatOff,
    Resize,
    Volume,
    Volume3
} from 'tabler-icons-react';
import { showNotification } from '@mantine/notifications';
import { useContext, useEffect, useState } from 'react';
import { getCookie, hasCookie, setCookie } from 'cookies-next';
import { CommentBox } from '@src/components/comments';
import Layout, { TopNavBar } from '../../components/layout';
import SEO from '../../components/seo';
import {
    audioFormats,
    displayFilename,
    getExt,
    onlyGetMedia,
    onlyGetVideo,
    pictureFormats,
    playableFormats,
    random,
    random2,
    videoFormats,
} from "../../../utils/file";
import dynamic from 'next/dynamic';
import FileRepository from "@server/repositories/FileRepository";
import { Author, Comment, File, Space } from "@server/models";
import { formatDate, ParseUnixTime } from "../../../utils/date";
import { NextPageContext } from 'next';
import { useRouter } from 'next/router';
import { useMediaQuery } from '@mantine/hooks';
import { useLongPress } from "../../../utils/react";
import { ContentSlide, QuickDetails } from "@src/components/player-elements";
import Link from "next/link";
import { getLocale, LocaleContext } from "@src/locale";
import { withSessionSsr } from '@src/lib/session';
import { useSessionState, setInteracted as setAppInteracted, setCurrentFile, cacheVolume } from '@src/slices/sessionState';
import { useDispatch, useSelector } from "react-redux";
import useSWR, { mutate } from 'swr';
import { SeekForAuthor } from 'utils/id_management';
import { TouchableLink } from '@src/components/buttons';

interface PageProps {
    post: File;
    ids: File[];
    volume: number;
    muted: boolean;
    loop: boolean;
    firstTime: boolean;
    filter: string[];
    messages: any;
    interacted: boolean;
    space: Space;
    author?: Author;
}

const DynamicContentSlide = dynamic(() => Promise.resolve(ContentSlide), {
    ssr: false
});


export const getServerSideProps = withSessionSsr(async function ({
    req,
    res,
    ...other
}) {
    const space = req.session.space;
    if (space === undefined) {
        res.statusCode = 302;
        return {
            redirect: {
                destination: `/login`,
                permanent: false
            }
        };
    }
    const id = other.query.Id as string;
    let ids: number[];
    let post: File;
    try {
        ids = await FileRepository.findAll({
            where: {
                Space: space.Id
            },
            attributes: ["Id", "Thumbnail", "FileURL", "Folder"]
        });
        post = await FileRepository.findOne({
            include: {
                model: Author,
                required: true
            },
            where: {
                id,
                Space: space.Id
            }
        });

        const author = await SeekForAuthor(getCookie('DokiIdentification', { req, res }));
        return {
            props: {
                space,
                post, ids,
                author,
                volume: hasCookie('player-volume', { req, res }) ? getCookie('player-volume', { req, res }) : 0.25,
                muted: hasCookie('player-muted', { req, res }) ? getCookie('player-muted', { req, res }) : false,
                loop: hasCookie('player-loop', { req, res }) ? getCookie('player-loop', { req, res }) : true,
                firstTime: hasCookie('first-time', { req, res }) ? getCookie('first-time', { req, res }) : true,
                filter: hasCookie('filtered', { req, res }) ? JSON.parse(getCookie('filtered', { req, res }) as string) : [],
            }
        };
    } catch (e) {
        return {
            redirect: {
                permanent: false,
                destination: "/404"
            }
        };
    }
});
function Page(props: PageProps) {
    const sessionState = useSelector(useSessionState);
    const dispatch = useDispatch();
    const router = useRouter();
    const locale = useContext(LocaleContext);
    const theme = useMantineTheme();
    const desktop = useMediaQuery('(min-width: 760px)', false);
    const mobile = useMediaQuery('only screen and (max-width: 768px)', false);

    const [previous, setPrevious] = useState<number[]>([]);
    const [current, setCurrent] = useState<File>(props.post);
    const [visualizer, setVisualizer] = useState<File>(random(props.ids, onlyGetVideo));

    const [hidden, setHidden] = useState(true);
    const [hoveringPlayer, setHoveringPlayer] = useState(true);
    const longPress = useLongPress(() => setHidden(true), 500);
    const [isPlayable, setPlayable] = useState(true);
    const [helpOpen, setHelpOpen] = useState(false);
    const [firstTime, setFirstTime] = useState(props.firstTime);
    const [interacted, setInteracted] = useState(sessionState.interacted);

    const [volume, setVolume] = useState(sessionState.volume);
    const [muted, setMuted] = useState(props.muted);
    const [repeat, setRepeat] = useState(props.loop);
    const [playing, setPlaying] = useState(true);
    const [progress, setProgress] = useState<{ played: 0, loaded: 0; }>({ played: 0, loaded: 0 });
    const [pip, setPip] = useState(false);
    const [objFit, setObjFit] = useState(true);
    const [duration, setDuration] = useState(0);
    const [seek, setSeek] = useState(-1);
    const [willSeek, setWillSeek] = useState(false);

    const [loading, setLoading] = useState(true);

    let timeout: NodeJS.Timeout;

    function handleNewFile() {
        if (!interacted) {
            setInteracted(true);
            return;
        }
        setLoading(true);
        if (props.ids.length === 1) {
            // There is no more media to consume, repeat the current.
            setRepeat(true);
            setPlaying(false);
            return router.push(`/view/${current.Id}`);
        }
        // check current as seen
        setPrevious(x => [...x, current.Id]);
        // get all media
        const _m = onlyGetMedia(props.ids.filter(x => !props.filter.includes(x.Folder)).filter(x => x.Id !== current.Id));
        if (previous.length === _m.length) {
            // reset seen
            setPrevious([]);
            return router.push(`/view/${random2(_m).Id}`);
        }
        const _n = _m.filter(x => !previous.includes(x.Id));
        return router.push(`/view/${random2(_n).Id}`);
    }

    useEffect(() => {
        if (props.post) {
            dispatch(setCurrentFile(props.post));
            setLoading(false);
            if (props.post.Id !== current.Id) {
                setCurrent(props.post);
                setVisualizer(random(props.ids, onlyGetVideo));

                if (audioFormats.includes(getExt(current.FileURL))) setHoveringPlayer(true);
            }
        }
    }, [props.post]);

    useEffect(() => {
        setCookie('player-volume', volume, { maxAge: 60 * 60 * 24 * 30 });
        dispatch(cacheVolume(volume));
    }, [volume]);

    useEffect(() => {
        setCookie('player-muted', muted, { maxAge: 60 * 60 * 24 * 30 });
    }, [muted]);

    useEffect(() => {
        setCookie('player-loop', repeat, { maxAge: 60 * 60 * 24 * 30 });
    }, [repeat]);

    useEffect(() => {
        setCookie('first-time', firstTime, { maxAge: 60 * 60 * 24 * 30 });
    }, [firstTime]);

    useEffect(() => {
        dispatch(setAppInteracted(interacted));
    }, [interacted]);

    useEffect(() => {
        const updateViewCounter = async (id: number) => {
            await fetch(`/api/updateViews/${id}`, { method: 'POST' });
        };

        if (current) {

            if ([...videoFormats, ...pictureFormats].includes(getExt(current.FileURL))) {

                /*const v = new Vibrant(locatePreview(current));
                v.getPalette().then((pal) => setPalette(pal));*/
            }

            updateViewCounter(current.Id);
        }
    }, [current]);


    useEffect(() => {
        if (hoveringPlayer) {
            if (mobile) return;
            if (timeout) clearTimeout(timeout);
            if (hidden && isPlayable && !audioFormats.includes(getExt(current.FileURL))) {
                timeout = setTimeout(() => setHoveringPlayer(false), 5000);
            }
        }
        return () => clearTimeout(timeout);
    }, [hoveringPlayer, mobile, current, hidden, isPlayable]);


    /*function handleScroll(event) {
        function trigger(e) {
            if (event.deltaY >= 100) {
                handleClickSlide(selected, null);
            } else if (selected !== 0) {
                handleClickSlide(selected - 2, null);
            }    
        }
        
        debounce(() => trigger(event));
    }*/

    const handleMouseActivity = () => setHoveringPlayer(true);

    function showHelp() {
        setHelpOpen(true);
    }

    function handlePiP() {
        setPip(!pip);
    }

    function handleObjectFit() {
        setObjFit(!objFit);
    }

    function seekTo(s) {
        setSeek(s);
        setWillSeek(true);
    }

    function handleCast() {
        // TODO: integrate chromecasting
    }

    return <Layout noScrollArea space={props.space}
        header={<Header onMouseMove={handleMouseActivity} sx={{
            background: "transparent", border: "none", pointerEvents: "none", opacity: 0, ...(hoveringPlayer && {
                opacity: 1,
                pointerEvents: "all"
            }),
        }} height={52}>
            <TopNavBar white space={props.space} setHidden={(f) => setHidden(f)} hidden={hidden} />
        </Header>}

        onMouseLeave={isPlayable ? () => setHidden(true) : undefined} hiddenCallback={(h) => setHidden(h)} padding={0}

        additionalMainStyle={{
            willChange: "auto",
            background: "black", overflow: "hidden",
            padding: 0,
            transition: "padding 0.375s cubic-bezier(.07, .95, 0, 1), background 0.375s cubic-bezier(.07, .95, 0, 1)",
        }}
        additionalContainerStyle={{
            willChange: "auto",
            maxHeight: "100vh",
            padding: 0,
            '&:hover': {
                overflow: "hidden"
            },
            marginRight: 0
        }}
        additionalAsideStyle={{
            willChange: "auto",
            top: hoveringPlayer ? undefined : 0,
            height: hoveringPlayer ? "calc(100vh - var(--mantine-header-height, 0px) - var(--mantine-footer-height, 0px) - 16px - 16px)" : "calc(100vh - var(--mantine-header-height, 0px) + 16px)"
        }}
        hiddenAside={hidden}
        permanent={false}
        aside={
            <>
                {current && <Button
                    sx={(theme) => ({ background: theme.fn.primaryColor("dark"), color: "white" })}
                    onClick={() => window.open(`https://${window.location.hostname}/${current.FileURL}`)}
                    mb="sm" variant="light" color={theme.fn.primaryColor("dark")} fullWidth leftIcon={<Download size={14} />}>Download</Button>}
                <Divider color="dark" label={getLocale(locale).Viewer["nc-details"]} />
                <Aside.Section my="xs" mb="xs">
                    <Stack>
                        <Stack spacing="xs">
                            <Text size="sm">{(current.Size / 1e3 / 1e3).toFixed(2)} MB</Text>
                            <Text size="xs"
                                sx={{ marginTop: -8 }}>{getLocale(locale).Viewer["nc-filesize"]}</Text>
                        </Stack>
                        <Stack spacing="xs">
                            <Text size="sm">{formatDate(ParseUnixTime(current.UnixTime))}</Text>
                            <Text size="xs"
                                sx={{ marginTop: -8 }}>{getLocale(locale).Viewer["nc-upload-date"]}</Text>
                        </Stack>
                        <Stack spacing="xs">
                            <Text size="sm">{current.Author.Name}</Text>
                            <Text size="xs"
                                sx={{ marginTop: -8 }}>{getLocale(locale).Viewer["nc-uploader"]}</Text>
                        </Stack>
                        <Stack spacing="xs">
                            <Text size="sm">{current.Views}</Text>
                            <Text size="xs"
                                sx={{ marginTop: -8 }}>{getLocale(locale).Viewer["nc-views"]}</Text>
                        </Stack>
                        {current.Folder && <Stack spacing="xs">
                            <TouchableLink link={`/browser?f=${current.Folder}`} passHref>
                                <Text color={theme.colors.blue[4]} sx={{
                                    textDecoration: "none",
                                    cursor: "pointer",
                                    "&:hover": { textDecoration: "underline" }
                                }} size="sm">{current.Folder}</Text>
                            </TouchableLink>
                            <Text size="xs"
                                sx={{ marginTop: -8 }}>{getLocale(locale).Viewer["nc-category"]}</Text>
                        </Stack>}
                        <Stack spacing="xs">
                            <TouchableLink link={`/browser?type=${getExt(current.FileURL)}`} passHref>
                                <Text color={theme.colors.blue[4]} sx={{
                                    textDecoration: "none",
                                    cursor: "pointer",
                                    "&:hover": { textDecoration: "underline" }
                                }} size="sm">{getExt(current.FileURL)}</Text>
                            </TouchableLink>
                            <Text size="xs"
                                sx={{ marginTop: -8 }}>{getLocale(locale).Viewer["nc-file-type"]}</Text>
                        </Stack>
                    </Stack>
                </Aside.Section>
                <Divider color="dark" label={getLocale(locale).Viewer["nc-tags"]} />
                <Aside.Section mt="xs" mb="md">
                    <Stack spacing={0}>
                        {current.Tags ? current.Tags.split(",").map((t, i) =>
                            <TouchableLink link={`/browser?t=${t}`} key={i} passHref>
                                <Text size="xs" color={theme.colors.blue[4]} sx={{
                                    textDecoration: "none",
                                    cursor: "pointer",
                                    "&:hover": { textDecoration: "underline" }
                                }}>{t}</Text>
                            </TouchableLink>) : <Text size="xs">{getLocale(locale).Viewer["nc-none"]}</Text>}
                    </Stack>
                </Aside.Section>
                <Card sx={(theme) => ({ background: theme.colors.dark[5] })} mb="sm">
                    <Text color="white" size="xs" weight={500}>{getLocale(locale).Viewer["nc-comment-policy"]}</Text>
                    <Text color="white" size="xs">{getLocale(locale).Viewer["nc-comment-policy-message"]}</Text>
                </Card>
                <CommentBox file={current} author={props.author} />
            </>
        }
    >
        <SEO video={`/${current.FileURL}`} image={`/${current.Thumbnail}`}
            audio={`/${current.FileURL}`}
            type={videoFormats.includes(getExt(current.FileURL)) ? "video" :
                audioFormats.includes(getExt(current.FileURL)) ? "audio" :
                    pictureFormats.includes(getExt(current.FileURL)) ? "image" : "website"}
            title={current ? displayFilename(current) : "Viewer"} siteTitle="Doki"
            description={current ? current.Description : "Sneed"} />
        <div className="content-wrapper"
            style={{ cursor: hoveringPlayer ? undefined : "none" }}
            onMouseMove={handleMouseActivity}
            onContextMenu={(e) => {
                e.preventDefault();
                //if (isPlayable) {
                setHidden(!hidden);
                //setHoveringPlayer(hidden);
                //}
            }}
            onWheel={(e) => {
                if (isPlayable) {
                    if (e.deltaY > 0 || e.deltaX > 0) {
                        setHoveringPlayer(true);
                        setHidden(false);
                    }
                    if (e.deltaY < 0 || e.deltaX < 0) {
                        // setHoveringPlayer(false);
                        setHidden(true);
                    }
                }
            }}
            {...(!desktop && longPress)}
        >
            <DynamicContentSlide seek={seek} willSeek={willSeek} seekCallback={() => setWillSeek(false)}
                onDuration={(n: number) => setDuration(n)} visualizer={visualizer} objFit={objFit}
                pipCallback={handlePiP} pip={pip}
                onProgress={(p) => setProgress(p)} onClick={handleNewFile} data={loading ? null : `/${current.FileURL}`}
                isSelected={playing} muted={muted} volume={volume}
                repeat={repeat} onEnded={handleNewFile}
                interacted={interacted}
                thumbnail={`/${current.Thumbnail}`}
                href={`/view/${random(props.ids, onlyGetMedia).Id}`} />

            <Box
                sx={{
                    transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    background: 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,27,0.5) 35%, rgba(0,0,0,0) 100%)',
                    height: 150,
                    opacity: 0,
                    ...(hoveringPlayer && {
                        opacity: 1,
                        pointerEvents: "all"
                    }),
                    zIndex: 5
                }}>
                {current && <QuickDetails duration={duration} seekTo={seekTo} current={current} isPlayable={isPlayable}
                    progress={progress} full sx={{
                        position: 'fixed',
                        bottom: mobile ? "calc(var(--mantine-footer-height, 0px))" : 0,
                        paddingLeft: 16,
                        paddingBottom: 16,
                        paddingRight: hidden ? undefined : "calc(var(--mantine-aside-width, 0px) + 16px)",
                        left: 0,
                        zIndex: 5,
                        width: `calc(100% - ${16}px)`,
                        transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)"
                    }}>
                </QuickDetails>}
            </Box>
            <Box
                sx={{
                    transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    background: 'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,27,0.5) 35%, rgba(0,0,0,0) 100%)',
                    height: 150,
                    opacity: 0,
                    ...(hoveringPlayer && {
                        opacity: 1
                    }),
                    zIndex: 5
                }}>
                <Stack sx={{
                    position: 'fixed',
                    top: "calc(var(--mantine-header-height, 0px) + 16px)",
                    left: 16,
                    zIndex: 5,
                    ...(hoveringPlayer && {
                        opacity: playableFormats.includes(getExt(current.FileURL)) ? 1 : 0,
                        pointerEvents: playableFormats.includes(getExt(current.FileURL)) ? undefined : "none"
                    })
                }}>
                    <Group>
                        <ActionIcon sx={() => ({ color: "white" })} onClick={() => {
                            showNotification({
                                message: muted ? "Unmuted!" : "Muted!",
                                icon: muted ? <Volume size={24} /> : <Volume3 size={24} />,
                                color: "dark",
                                disallowClose: true,
                                autoClose: 1000
                            });
                            setMuted(!muted);
                        }}>{muted ? <Volume3 style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={24} /> : <Volume style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={24} />}</ActionIcon>
                        <Slider onChange={(value) => setVolume(value)} defaultValue={volume}
                            min={0}
                            size="xs"
                            max={1}
                            label={null}
                            step={0.01} sx={{ minWidth: 100, filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} />
                    </Group>
                    <Tooltip position="right"
                        withArrow label={getLocale(locale).Viewer["prev"]}><ActionIcon
                            sx={() => ({ color: "white" })}
                            onClick={() => router.back()}><PlayerSkipBack style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={24} /></ActionIcon></Tooltip>
                    <Tooltip position="right"
                        withArrow label={getLocale(locale).Viewer["play"]}><ActionIcon
                            sx={() => ({ color: "white" })}
                            onClick={() => setPlaying(!playing)}>{playing && interacted ? <PlayerPause style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={24} /> :
                                <PlayerPlay style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={24} />}</ActionIcon>
                    </Tooltip>
                    <Tooltip position="right"
                        withArrow label={getLocale(locale).Viewer["repeat"]}><ActionIcon
                            sx={() => ({ color: "white" })} onClick={() => {
                                showNotification({
                                    message: repeat ? "No longer repeating. Autoplay enabled." : "Autoplay disabled. The media will repeat.",
                                    icon: repeat ? <Repeat size={24} /> : <RepeatOff size={24} />,
                                    color: "dark",
                                    disallowClose: true,
                                    autoClose: 1000
                                });
                                setRepeat(!repeat);
                            }}>{repeat ? <Repeat style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={24} /> : <RepeatOff style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={24} />}</ActionIcon></Tooltip>
                    <Tooltip position="right"
                        withArrow label={getLocale(locale).Viewer["skip"]}><ActionIcon
                            sx={() => ({ color: "white" })} onClick={handleNewFile}><PlayerSkipForward
                                size={24} style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} /></ActionIcon></Tooltip>
                    <Tooltip position="right"
                        withArrow label={getLocale(locale).Viewer["pip"]}><ActionIcon
                            sx={() => ({ color: "white" })} onClick={handlePiP}><PictureInPicture
                                size={24} style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} /></ActionIcon></Tooltip>
                    <Tooltip position="right"
                        withArrow label={getLocale(locale).Viewer["contain"]}><ActionIcon
                            sx={() => ({ color: "white" })} onClick={handleObjectFit}><Resize
                                size={24} style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} /></ActionIcon></Tooltip>
                    <Tooltip position="right"
                        withArrow label="Cast (under construction!)"><ActionIcon
                            sx={() => ({ color: "white" })} onClick={handleCast}><Cast
                                size={24} style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} /></ActionIcon></Tooltip>
                    <ActionIcon color={firstTime ? "blue" : undefined} sx={() => ({ color: "white" })}
                        onClick={showHelp}><Help size={24} style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} /></ActionIcon>
                </Stack>
            </Box>
        </div>

        <Modal title={getLocale(locale).Viewer["help-title"]} opened={helpOpen} onClose={() => setHelpOpen(false)}>
            <Paper mb="md" shadow="md" sx={{ display: "flex", padding: 16 }}>
                <Stack sx={{
                    margin: "auto"
                }}>
                    <Group>
                        <ActionIcon onClick={() => {
                            showNotification({
                                message: muted ? "Unmuted!" : "Muted!",
                                icon: muted ? <Volume size={24} /> : <Volume3 size={24} />,
                                color: "dark",
                                disallowClose: true,
                                autoClose: 1000
                            });
                            setMuted(!muted);
                        }}>{muted ? <Volume3 size={24} /> : <Volume size={24} />}</ActionIcon>
                        <Slider onChange={(value) => setVolume(value)} defaultValue={volume}
                            min={0}
                            size="xs"
                            max={1}
                            label={null}
                            step={0.01} sx={{ minWidth: 100 }} />
                    </Group>
                    <ActionIcon onClick={() => router.back()}><PlayerSkipBack size={24} /></ActionIcon>
                    <ActionIcon onClick={() => setPlaying(!playing)}>{playing ? <PlayerPause size={24} /> :
                        <PlayerPlay size={24} />}</ActionIcon>
                    <ActionIcon onClick={() => {
                        showNotification({
                            message: repeat ? "No longer repeating. Autoplay enabled." : "Autoplay disabled. The media will repeat.",
                            icon: repeat ? <Repeat size={24} /> : <RepeatOff size={24} />,
                            color: "dark",
                            disallowClose: true,
                            autoClose: 1000
                        });
                        setRepeat(!repeat);
                    }}>{repeat ? <Repeat size={24} /> : <RepeatOff size={24} />}</ActionIcon>
                    <ActionIcon onClick={handleNewFile}><PlayerSkipForward size={24} /></ActionIcon>
                </Stack>
            </Paper>
            <Text size="xs">
                {getLocale(locale).Viewer["help-controls"]}
            </Text>
            <Paper my="md" shadow="md" sx={{ display: "flex", padding: 16 }}>
                {current && <QuickDetails current={current} isPlayable={isPlayable} progress={progress} sx={{
                    width: 'calc(100% - 16px)',
                }} />}
            </Paper>
            <Text size="xs">
                {getLocale(locale).Viewer["help-quickdetails"]}
            </Text>
            <Paper my="md" shadow="md" sx={{ display: "flex", overflow: "hidden" }}>
                <Box sx={{ flex: 1, background: "rgba(0,0,0,.1)" }}>

                </Box>
                <Paper sx={{
                    maxWidth: 0,
                    height: 160,
                    padding: 8,
                    animation: "navigation-demo 2s cubic-bezier(.07, .95, 0, 1) infinite"
                }}>
                    <Stack my="md">
                        <Paper sx={{ background: "rgba(0,0,0,.1)", width: 40, height: 4 }}>

                        </Paper>
                        <Paper sx={{ background: "rgba(0,0,0,.1)", width: 40, height: 4 }}>

                        </Paper>
                        <Paper sx={{ background: "rgba(0,0,0,.1)", width: 40, height: 4 }}>

                        </Paper>
                        <Paper sx={{ background: "rgba(0,0,0,.1)", width: 40, height: 16 }}>

                        </Paper>
                        <Paper sx={{ background: "rgba(0,0,0,.1)", width: 40, height: 16 }}>

                        </Paper>
                    </Stack>
                </Paper>
            </Paper>
            <Text mb="md" size="xs">
                {getLocale(locale).Viewer["help-navcard"]}
            </Text>
            <Button fullWidth onClick={() => {
                setFirstTime(false);
                setHelpOpen(false);
            }}>
                {getLocale(locale).Viewer["help-accept"]}
            </Button>
        </Modal>
    </Layout>;
}

export default Page;
