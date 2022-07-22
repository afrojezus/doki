import {
    ActionIcon,
    Aside,
    Box,
    Button,
    Card,
    Divider,
    Group,
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
import {showNotification} from '@mantine/notifications';
import {useContext, useEffect, useState} from 'react';
import {getCookie, hasCookie, setCookies} from 'cookies-next';
import {CommentBox} from '@src/components/comments';
import Layout, {BottomNavBar} from '../../components/layout';
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
import {Author, File} from "@server/models";
import {formatDate, ParseUnixTime} from "../../../utils/date";
import {NextPageContext} from 'next';
import {useRouter} from 'next/router';
import {useMediaQuery} from '@mantine/hooks';
import {useLongPress} from "../../../utils/react";
import {ContentSlide, QuickDetails} from "@src/components/player-elements";
import Link from "next/link";
import {getLocale, LocaleContext} from "@src/locale";

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
}

const DynamicContentSlide = dynamic(() => Promise.resolve(ContentSlide), {
    ssr: false
});


export async function getServerSideProps(nextPage: NextPageContext) {
    const id = nextPage.query.Id as string;
    let ids: number[];
    let post: File;
    try {
        ids = await FileRepository.findAll({ attributes: ["Id", "Thumbnail", "FileURL", "Folder"] });
        post = await FileRepository.findOne({
            include: {
                model: Author,
                required: true
            },
            where: { id }
        });
        return {
            props: {
                post, ids,
                volume: hasCookie('player-volume', nextPage) ? getCookie('player-volume', nextPage) : 0.25,
                muted: hasCookie('player-muted', nextPage) ? getCookie('player-muted', nextPage) : false,
                loop: hasCookie('player-loop', nextPage) ? getCookie('player-loop', nextPage) : true,
                firstTime: hasCookie('first-time', nextPage) ? getCookie('first-time', nextPage) : true,
                filter: hasCookie('filtered', nextPage) ? JSON.parse(getCookie('filtered', nextPage) as string) : [],
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
}

function Page(props: PageProps) {
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
    const [lastTimeout, setNewTimeout] = useState<NodeJS.Timeout>(null);
    const [isPlayable, setPlayable] = useState(true);
    const [helpOpen, setHelpOpen] = useState(false);
    const [firstTime, setFirstTime] = useState(props.firstTime);
    const [interacted, setInteracted] = useState(false);

    const [volume, setVolume] = useState<number>(parseFloat(String(props.volume)));
    const [muted, setMuted] = useState(props.muted);
    const [repeat, setRepeat] = useState(props.loop);
    const [playing, setPlaying] = useState(true);
    const [progress, setProgress] = useState<{ played: 0, loaded: 0 }>({played: 0, loaded: 0});
    const [pip, setPip] = useState(false);
    const [objFit, setObjFit] = useState(false);
    const [duration, setDuration] = useState(0);
    const [seek, setSeek] = useState(-1);
    const [willSeek, setWillSeek] = useState(false);

    //const [palette, setPalette] = useState<Palette>(null);

    function handleNewFile() {
        if (!interacted) {
            setInteracted(true);
            return;
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
        if (props.post && props.post.Id !== current.Id) {
            setCurrent(props.post);
            setVisualizer(random(props.ids, onlyGetVideo));

            if (audioFormats.includes(getExt(current.FileURL))) setHoveringPlayer(true);
        }
    }, [props.post]);

    useEffect(() => {
        setCookies('player-volume', volume, { maxAge: 60 * 60 * 24 * 30 });
    }, [volume]);

    useEffect(() => {
        setCookies('player-muted', muted, { maxAge: 60 * 60 * 24 * 30 });
    }, [muted]);

    useEffect(() => {
        setCookies('player-loop', repeat, {maxAge: 60 * 60 * 24 * 30});
    }, [repeat]);

    useEffect(() => {
        setCookies('first-time', firstTime, {maxAge: 60 * 60 * 24 * 30});
    }, [firstTime]);

    useEffect(() => {
        const updateViewCounter = async (id: number) => {
            await fetch(`/api/updateViews/${id}`, {method: 'POST'});
        }

        if (current) {

            if ([...videoFormats, ...pictureFormats].includes(getExt(current.FileURL))) {

                /*const v = new Vibrant(locatePreview(current));
                v.getPalette().then((pal) => setPalette(pal));*/
            }

            updateViewCounter(current.Id);
        }
    }, [current]);

    useEffect(() => {
        if (playableFormats.includes(getExt(current.FileURL))) {
            setPlayable(true);
            setHidden(true);
        } else {
            setPlayable(false);
            setHidden(false);
        }
    }, [current, isPlayable]);

    useEffect(() => {
        if (mobile) {
            setHoveringPlayer(mobile);
        }
    }, [mobile]);


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

    function handleMouseActivity() {
        if (mobile) {
            setHoveringPlayer(true);
            return;
        }
        if (lastTimeout) clearTimeout(lastTimeout);
        setHoveringPlayer(true);
        if (hidden && isPlayable && !audioFormats.includes(getExt(current.FileURL))) {
            setNewTimeout(
                setTimeout(() => setHoveringPlayer(false), 5000));
        }
    }

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

    function handleCast () {
        // TODO: integrate chromecasting
    }

    return <Layout onMouseLeave={() => setHidden(true)} footer={<></>} hiddenCallback={(h) => setHidden(h)} padding={0} additionalMainStyle={{
        background: isPlayable ? "black" : undefined, overflow: "hidden",
        padding: isPlayable ? hidden ? "0 !important" : undefined : undefined,
        transition: "padding 0.375s cubic-bezier(.07, .95, 0, 1), background 0.375s cubic-bezier(.07, .95, 0, 1)"
    }}
                   hiddenAside={hidden}
                   permanent={!isPlayable}
                   asideContent={
                       <>
                           <Divider label={getLocale(locale).Viewer["nc-details"]}/>
                           <Aside.Section my="xs" mb="xs">
                               <Stack>
                                   <Stack spacing="xs">
                                       <Text size="sm">{(current.Size / 1e3 / 1e3).toFixed(2)} MB</Text>
                                       <Text size="xs"
                                             sx={{marginTop: -8}}>{getLocale(locale).Viewer["nc-filesize"]}</Text>
                                   </Stack>
                                   <Stack spacing="xs">
                                       <Text size="sm">{formatDate(ParseUnixTime(current.UnixTime))}</Text>
                                       <Text size="xs"
                                             sx={{marginTop: -8}}>{getLocale(locale).Viewer["nc-upload-date"]}</Text>
                                   </Stack>
                                   <Stack spacing="xs">
                                       <Text size="sm">{current.Author.Name}</Text>
                                       <Text size="xs"
                                             sx={{marginTop: -8}}>{getLocale(locale).Viewer["nc-uploader"]}</Text>
                                   </Stack>
                                   <Stack spacing="xs">
                                       <Text size="sm">{current.Views}</Text>
                                       <Text size="xs"
                                             sx={{marginTop: -8}}>{getLocale(locale).Viewer["nc-views"]}</Text>
                                   </Stack>
                                   {current.Folder && <Stack spacing="xs">
                                       <Link href={`/browser?f=${current.Folder}`} passHref>
                                           <Text color={theme.colors.blue[4]} sx={{
                                               textDecoration: "none",
                                               cursor: "pointer",
                                               "&:hover": { textDecoration: "underline" }
                                           }} size="sm">{current.Folder}</Text>
                                       </Link>
                                       <Text size="xs"
                                             sx={{marginTop: -8}}>{getLocale(locale).Viewer["nc-category"]}</Text>
                                   </Stack>}
                                   <Stack spacing="xs">
                                       <Link href={`/browser?type=${getExt(current.FileURL)}`} passHref>
                                           <Text color={theme.colors.blue[4]} sx={{
                                               textDecoration: "none",
                                               cursor: "pointer",
                                               "&:hover": { textDecoration: "underline" }
                                           }} size="sm">{getExt(current.FileURL)}</Text>
                                       </Link>
                                       <Text size="xs"
                                             sx={{marginTop: -8}}>{getLocale(locale).Viewer["nc-file-type"]}</Text>
                                   </Stack>
                               </Stack>
                           </Aside.Section>
                           <Divider label={getLocale(locale).Viewer["nc-tags"]}/>
                           <Aside.Section mt="xs" mb="md">
                               <Stack spacing={0}>
                                   {current.Tags ? current.Tags.split(",").map((t, i) =>
                                       <Link href={`/browser?t=${t}`} key={i} passHref>
                                           <Text size="xs" color={theme.colors.blue[4]} sx={{
                                               textDecoration: "none",
                                               cursor: "pointer",
                                               "&:hover": {textDecoration: "underline"}
                                           }}>{t}</Text>
                                       </Link>) : <Text size="xs">{getLocale(locale).Viewer["nc-none"]}</Text>}
                               </Stack>
                           </Aside.Section>
                           {current && <Button
                               onClick={() => window.open(`https://${window.location.hostname}/${current.FileURL}`)}
                               my="sm" variant="light" fullWidth leftIcon={<Download size={14}/>}>Download</Button>}
                           <Card mb="sm">
                               <Text size="xs" weight={500}>{getLocale(locale).Viewer["nc-comment-policy"]}</Text>
                               <Text size="xs">{getLocale(locale).Viewer["nc-comment-policy-message"]}</Text>
                           </Card>
                           <CommentBox/>
                       </>
                   }
    >
        <SEO video={`/${current.FileURL}`} image={`/${current.Thumbnail}`}
             audio={`/${current.FileURL}`}
             type={videoFormats.includes(getExt(current.FileURL)) ? "video" :
                 audioFormats.includes(getExt(current.FileURL)) ? "audio" :
                     pictureFormats.includes(getExt(current.FileURL)) ? "image" : "website"}
             title={current ? displayFilename(current) : "Viewer"} siteTitle="Doki"
             description={current ? current.Description : "Sneed"}/>
        <div className="content-wrapper"
             style={{cursor: hoveringPlayer ? undefined : "none"}}
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
                                 onProgress={(p) => setProgress(p)} onClick={handleNewFile} data={`/${current.FileURL}`}
                                 isSelected={playing} muted={muted} volume={volume}
                                 repeat={repeat} onEnded={handleNewFile}
                                 interacted={interacted}
                                 thumbnail={`/${current.Thumbnail}`}
                                 href={`/view/${random(props.ids, onlyGetMedia).Id}`}/>

            <Box
                sx={{
                    transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    background: isPlayable ? 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,27,0.5) 35%, rgba(0,0,0,0) 100%)' : undefined,
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
                    bottom: 0,
                    paddingLeft: audioFormats.includes(getExt(current.FileURL)) ? 64 : 16,
                    paddingBottom: audioFormats.includes(getExt(current.FileURL)) ? 64 : 16,
                    paddingRight: hidden ? undefined : 300,
                    left: 0,
                    zIndex: 5,
                    width: `calc(100% - ${audioFormats.includes(getExt(current.FileURL)) ? 64 : 16}px)`,
                    transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)"
                }}>
                    <BottomNavBar white setHidden={(f) => setHidden(f)} hidden={hidden}/>
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
                        opacity: playableFormats.includes(getExt(current.FileURL)) ? 1 : 0,
                        pointerEvents: playableFormats.includes(getExt(current.FileURL)) ? undefined : "none"
                    }),
                    zIndex: 5
                }}>
                <Stack sx={{
                    position: 'fixed',
                    top: 16,
                    left: 16,
                    zIndex: 5
                }}>
                    <Group>
                        <ActionIcon sx={() => ({color: "white"})} onClick={() => {
                            showNotification({
                                message: muted ? "Unmuted!" : "Muted!",
                                icon: muted ? <Volume size={24}/> : <Volume3 size={24}/>,
                                color: "dark",
                                disallowClose: true,
                                autoClose: 1000
                            });
                            setMuted(!muted);
                        }}>{muted ? <Volume3 style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={24} /> : <Volume style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={24}/>}</ActionIcon>
                        <Slider onChange={(value) => setVolume(value)} defaultValue={volume}
                                min={0}
                                size="xs"
                                max={1}
                                label={null}
                                step={0.01} sx={{minWidth: 100}}/>
                    </Group>
                    <Tooltip gutter={-100} position="right"
                             withArrow label={getLocale(locale).Viewer["prev"]}><ActionIcon
                        sx={() => ({color: "white"})}
                            onClick={() => router.back()}><PlayerSkipBack style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={24}/></ActionIcon></Tooltip>
                    <Tooltip gutter={-100} position="right"
                             withArrow label={getLocale(locale).Viewer["play"]}><ActionIcon
                        sx={() => ({color: "white"})}
                            onClick={() => setPlaying(!playing)}>{playing && interacted ? <PlayerPause style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={24}/> :
                                <PlayerPlay style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={24}/>}</ActionIcon>
                    </Tooltip>
                    <Tooltip gutter={-100} position="right"
                             withArrow label={getLocale(locale).Viewer["repeat"]}><ActionIcon
                        sx={() => ({color: "white"})} onClick={() => {
                        showNotification({
                            message: repeat ? "No longer repeating. Autoplay enabled." : "Autoplay disabled. The media will repeat.",
                            icon: repeat ? <Repeat size={24}/> : <RepeatOff size={24}/>,
                            color: "dark",
                            disallowClose: true,
                            autoClose: 1000
                        });
                        setRepeat(!repeat);
                            }}>{repeat ? <Repeat style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={24} /> : <RepeatOff style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={24}/>}</ActionIcon></Tooltip>
                    <Tooltip gutter={-100} position="right"
                             withArrow label={getLocale(locale).Viewer["skip"]}><ActionIcon
                        sx={() => ({color: "white"})} onClick={handleNewFile}><PlayerSkipForward
                                size={24} style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} /></ActionIcon></Tooltip>
                    <Tooltip gutter={-100} position="right"
                             withArrow label={getLocale(locale).Viewer["pip"]}><ActionIcon
                        sx={() => ({color: "white"})} onClick={handlePiP}><PictureInPicture
                                size={24} style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} /></ActionIcon></Tooltip>
                    <Tooltip gutter={-100} position="right"
                             withArrow label={getLocale(locale).Viewer["contain"]}><ActionIcon
                        sx={() => ({color: "white"})} onClick={handleObjectFit}><Resize
                                size={24} style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} /></ActionIcon></Tooltip>
                    <Tooltip gutter={-100} position="right"
                        withArrow label="Cast (under construction!)"><ActionIcon
                            sx={() => ({ color: "white" })} onClick={handleCast}><Cast
                                size={24} style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} /></ActionIcon></Tooltip>
                    <ActionIcon color={firstTime ? "blue" : undefined} sx={() => ({color: "white"})}
                        onClick={showHelp}><Help size={24} style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} /></ActionIcon>
                </Stack>
            </Box>
            <Box onMouseEnter={() => setHidden(false)} sx={{
                position: "fixed",
                height: '100vh',
                width: 100,
                right: 0,
                top: 0,
                '@media (max-width: 480px)': {
                    width: 0
                }
            }}></Box>
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
