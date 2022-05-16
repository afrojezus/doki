import {
    ActionIcon,
    Aside,
    Box,
    Button,
    Card,
    Container,
    Group,
    Image,
    Modal,
    Paper,
    Progress,
    ScrollArea,
    Slider,
    Space,
    Stack,
    Text,
    ThemeIcon,
    Title,
    Tooltip,
    useMantineTheme
} from '@mantine/core';
import {
    File as FileIcon,
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
import {createRef, useEffect, useState} from 'react';
import ReactPlayer from 'react-player';
import {Document, Page as PDFPage} from 'react-pdf';
import {checkCookies, getCookie, setCookies} from 'cookies-next';
import {CommentBox} from '../../components/comments';
import Layout, {Menubar, Tabbar} from '../../components/layout';
import SEO from '../../components/seo';
import {
    audioFormats,
    displayFilename,
    getExt,
    onlyGetMedia,
    onlyGetVideo,
    pictureFormats,
    playableFormats,
    random
} from "../../../utils/file";
import FileRepository from "@server/repositories/FileRepository";
import {Author, File} from "@server/models";
import {formatDate, ParseUnixTime} from "../../../utils/date";
import {NextPageContext} from 'next';
import {useRouter} from 'next/router';
import {LinkButton} from "@src/components/buttons";
import {useMediaQuery} from '@mantine/hooks';
import {useLongPress} from "../../../utils/react";

interface PageProps {
    post: File;
    ids: File[];
    volume: number;
    muted: boolean;
    loop: boolean;
    firstTime: boolean;
}

export async function getServerSideProps(nextPage: NextPageContext) {
    const id = nextPage.query.Id as string;
    let ids: number[];
    let post: File;
    try {
        ids = await FileRepository.findAll({attributes: ["Id", "Thumbnail", "FileURL"]});
        post = await FileRepository.findOne({
            include: {
                model: Author,
                required: true
            },
            where: {id}
        });
        return {
            props: {
                post, ids,
                volume: checkCookies('player-volume', nextPage) ? getCookie('player-volume', nextPage) : 0.25,
                muted: checkCookies('player-muted', nextPage) ? getCookie('player-muted', nextPage) : false,
                loop: checkCookies('player-loop', nextPage) ? getCookie('player-loop', nextPage) : true,
                firstTime: checkCookies('first-time', nextPage) ? getCookie('first-time', nextPage) : true
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

function QuickDetails({sx, full = false, current, isPlayable, progress}) {
    return <Stack sx={sx}>
        <Title order={5} className="rainbow">{displayFilename(current)}</Title>
        {current.Description && <Text size="xs">{current.Description}</Text>}
        <Group>
            <Text size="xs" color={isPlayable && full ? "white" : undefined} weight={500}>Uploaded
                by {current.Author.Name}</Text>
            <Space/>
            <Text size="xs" color={isPlayable && full ? "white" : undefined}
                  weight={500}>{getExt(current.FileURL)}-file</Text>
            <Space/>
            <Text size="xs" color={isPlayable && full ? "white" : undefined} weight={500}>{current.Views} views</Text>
        </Group>
        <Progress radius={0} size="sm" value={progress.played * 100} styles={{
            root: {
                opacity: 0.5,
                display: playableFormats.includes(getExt(current.FileURL)) ? undefined : "none"
            },
            bar: {
                transition: 'all 0.375s cubic-bezier(.07, .95, 0, 1)'
            }
        }}/>
    </Stack>;
}

function ContentSlide({
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
                          objFit
                      }) {
    const [player, setPlayer] = useState<ReactPlayer>(null);
    const audioVisualizer = createRef<HTMLVideoElement>();

    function handleReady(p) {
        setPlayer(p);
    }

    useEffect(() => {
        if (pip) {
            if (document.pictureInPictureEnabled) {
                (player.getInternalPlayer() as HTMLVideoElement).requestPictureInPicture()
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
                <ReactPlayer onReady={handleReady} progressInterval={0.001} stopOnUnmount playing={isSelected}
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
                getExt(data) === "PDF" ?
                    <Document file={data}>
                        <PDFPage pageNumber={1}/>
                    </Document>
                    :
                    <Container sx={{height: "100vh", display: "inline-flex"}}>
                        <Card sx={{margin: "auto", minWidth: 200}}>
                            <Card.Section>
                                <ThemeIcon variant="gradient" sx={{width: "100%", height: 160}} radius={0}
                                           gradient={{from: 'teal', to: 'blue', deg: 60}}>
                                    <FileIcon size={48}/>
                                </ThemeIcon>
                            </Card.Section>
                            <Text my="md">
                                Binary {getExt(data)} file
                            </Text>
                            <Button mb="md" fullWidth variant="light">
                                Download
                            </Button>
                            <LinkButton href={href} fullWidth variant="light">
                                Continue
                            </LinkButton>
                        </Card>
                    </Container>}
    </div>
}

function Page(props: PageProps) {

    /**
     *  The idea here is to make a stacking carousel of media content, illustrated like this
     *
     *          VIDEO -n..0     PREVIOUS
     *          -------------
     *          VIDEO 1         CURRENT
     *          -------------
     *          VIDEO 2         NEXT
     *
     *  Upon clicking the media content, it should "slide" up to the next one.
     *  Scrolling could also be a natural interaction with this.
     *  Once we've reached the end, start from the first one in the stack in which we go full circle.
     * */

    const router = useRouter();

    const theme = useMantineTheme();
    const desktop = useMediaQuery('(min-width: 760px)', false);

    const [current, setCurrent] = useState<File>(props.post);
    const [visualizer, setVisualizer] = useState<File>(random(props.ids, onlyGetVideo));

    const [hidden, setHidden] = useState(true);
    const [hoveringPlayer, setHoveringPlayer] = useState(false);
    const longPress = useLongPress(() => setHidden(true), 500);
    const [lastTimeout, setNewTimeout] = useState<NodeJS.Timeout>(null);
    const [isPlayable, setPlayable] = useState(true);
    const [helpOpen, setHelpOpen] = useState(false);
    const [firstTime, setFirstTime] = useState(props.firstTime);

    const [volume, setVolume] = useState<number>(parseFloat(String(props.volume)));
    const [muted, setMuted] = useState(props.muted);
    const [repeat, setRepeat] = useState(props.loop);
    const [playing, setPlaying] = useState(true);
    const [progress, setProgress] = useState<{ played: 0, loaded: 0 }>({played: 0, loaded: 0});
    const [pip, setPip] = useState(false);
    const [objFit, setObjFit] = useState(true);

    function handleNewFile() {
        router.push(`/files/${random(props.ids, onlyGetMedia).Id}`);
    }

    useEffect(() => {
        if (props.post && props.post.Id !== current.Id) {
            setCurrent(props.post);
            setVisualizer(random(props.ids, onlyGetVideo));

            if (audioFormats.includes(getExt(current.FileURL))) setHoveringPlayer(true);
        }
    }, [props.post]);

    useEffect(() => {
        setCookies('player-volume', volume, {maxAge: 60 * 60 * 24 * 30});
    }, [volume]);

    useEffect(() => {
        setCookies('player-muted', muted, {maxAge: 60 * 60 * 24 * 30});
    }, [muted]);

    useEffect(() => {
        setCookies('player-loop', repeat, {maxAge: 60 * 60 * 24 * 30});
    }, [repeat]);

    useEffect(() => {
        setCookies('first-time', firstTime, {maxAge: 60 * 60 * 24 * 30});
    }, [firstTime]);

    useEffect(() => {
        if (playableFormats.includes(getExt(current.FileURL))) {
            setPlayable(true);
            setHidden(true);
        } else {
            setPlayable(false);
            setHidden(false);
        }
    }, [current, isPlayable]);


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

    function handleMouseActivity(event) {
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

    return <Layout additionalMainStyle={{
        background: isPlayable ? "black" : undefined, ...(!objFit && {
            overflow: "hidden",
            padding: "0 !important"
        }),
        paddingRight: hidden ? 16 : undefined,
        transition: "padding 0.375s cubic-bezier(.07, .95, 0, 1), background 0.375s cubic-bezier(.07, .95, 0, 1)"
    }}>
        <SEO video={current.FileURL} image={current.Thumbnail} type="video"
             title={current ? displayFilename(current) : "Viewer"} siteTitle="Doki"
             description={current ? current.Description : "Sneed"}/>
        <div className="content-wrapper"
             style={{cursor: hoveringPlayer ? undefined : "none"}}
             onMouseMove={handleMouseActivity}
             onContextMenu={(e) => {
                 e.preventDefault();
                 if (isPlayable) {
                     setHidden(!hidden);
                     //setHoveringPlayer(hidden);
                 }
             }}
             onWheel={(e) => {
                 if (isPlayable) {
                     if (e.deltaY > 0) {
                         setHoveringPlayer(true);
                         setHidden(false);
                     }
                     if (e.deltaY < 0) {
                         // setHoveringPlayer(false);
                         setHidden(true);
                     }
                 }
             }}
             {...(!desktop && longPress)}
        >
            <ContentSlide visualizer={visualizer} objFit={objFit} pipCallback={handlePiP} pip={pip}
                          onProgress={(p) => setProgress(p)} onClick={handleNewFile} data={`/${current.FileURL}`}
                          isSelected={playing} muted={muted} volume={volume}
                          repeat={repeat} onEnded={handleNewFile}
                          href={`/files/${random(props.ids, onlyGetMedia).Id}`}/>

            <Box sx={{
                transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                background: isPlayable ? 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,27,0.5) 35%, rgba(0,0,0,0) 100%)' : undefined,
                height: 150,
                opacity: 0,
                pointerEvents: "none",
                ...(hoveringPlayer && {
                    opacity: 1
                }),
                zIndex: 5
            }}>
                {current && <QuickDetails current={current} isPlayable={isPlayable} progress={progress} full sx={{
                    position: 'fixed',
                    bottom: 0,
                    paddingLeft: audioFormats.includes(getExt(current.FileURL)) ? 64 : 16,
                    paddingBottom: audioFormats.includes(getExt(current.FileURL)) ? 64 : 16,
                    paddingRight: hidden ? undefined : 300,
                    left: 0,
                    zIndex: 5,
                    width: `calc(100% - ${audioFormats.includes(getExt(current.FileURL)) ? 64 : 16}px)`,
                    transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)"
                }}/>}
            </Box>
            <Box sx={{
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
                        <ActionIcon onClick={() => {
                            showNotification({
                                message: muted ? "Unmuted!" : "Muted!",
                                icon: muted ? <Volume size={24}/> : <Volume3 size={24}/>,
                                color: "dark",
                                disallowClose: true,
                                autoClose: 1000
                            });
                            setMuted(!muted);
                        }}>{muted ? <Volume3 size={24}/> : <Volume size={24}/>}</ActionIcon>
                        <Slider onChange={(value) => setVolume(value)} defaultValue={volume}
                                min={0}
                                size="xs"
                                max={1}
                                label={null}
                                step={0.01} sx={{minWidth: 100}}/>
                    </Group>
                    <Tooltip gutter={-100} position="right"
                             withArrow label="Go back to previous medium"><ActionIcon
                        onClick={() => router.back()}><PlayerSkipBack size={24}/></ActionIcon></Tooltip>
                    <Tooltip gutter={-100} position="right"
                             withArrow label="Play/pause the current medium"><ActionIcon
                        onClick={() => setPlaying(!playing)}>{playing ? <PlayerPause size={24}/> :
                        <PlayerPlay size={24}/>}</ActionIcon>
                    </Tooltip>
                    <Tooltip gutter={-100} position="right"
                             withArrow label="Repeat/autoplay"><ActionIcon onClick={() => {
                        showNotification({
                            message: repeat ? "No longer repeating. Autoplay enabled." : "Autoplay disabled. The media will repeat.",
                            icon: repeat ? <Repeat size={24}/> : <RepeatOff size={24}/>,
                            color: "dark",
                            disallowClose: true,
                            autoClose: 1000
                        });
                        setRepeat(!repeat);
                    }}>{repeat ? <Repeat size={24}/> : <RepeatOff size={24}/>}</ActionIcon></Tooltip>
                    <Tooltip gutter={-100} position="right"
                             withArrow label="Go to next medium"><ActionIcon onClick={handleNewFile}><PlayerSkipForward
                        size={24}/></ActionIcon></Tooltip>
                    <Tooltip gutter={-100} position="right"
                             withArrow label="Picture-in-picture mode"><ActionIcon onClick={handlePiP}><PictureInPicture
                        size={24}/></ActionIcon></Tooltip>
                    <Tooltip gutter={-100} position="right"
                             withArrow label="Contain/cover the medium"><ActionIcon onClick={handleObjectFit}><Resize
                        size={24}/></ActionIcon></Tooltip>
                    <ActionIcon color={firstTime ? "blue" : undefined} onClick={showHelp}><Help size={24}/></ActionIcon>
                </Stack>
            </Box>

        </div>

        <Aside p="md"
               onMouseEnter={() => isPlayable && setHidden(false)} onMouseLeave={() => isPlayable && setHidden(true)}
               sx={{
                   transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                   position: 'fixed',
                   right: 0,
                   top: 0,
                   background: theme.colorScheme === 'dark' ? 'rgba(26,27,30,.98)' : 'rgba(255,255,255,.98)',
                   backdropFilter: 'blur(30px)', ...(hidden && ':hover' && {
                       opacity: 0.2,
                       backdropFilter: 'blur(0px)'
                   }), ...(hidden && {opacity: 0, right: -100})
               }} width={{lg: 300}}>
            <Menubar closeFunc={() => setHidden(true)}/>
            <Text size="xs" weight="500">details</Text>
            <Aside.Section my="xs" mb="xs">
                <Stack>
                    <Stack spacing="xs">
                        <Text size="sm">{(current.Size / 1e3 / 1e3).toFixed(2)} MB</Text>
                        <Text size="xs" sx={{marginTop: -8}}>Filesize</Text>
                    </Stack>
                    <Stack spacing="xs">
                        <Text size="sm">{formatDate(ParseUnixTime(current.UnixTime))}</Text>
                        <Text size="xs" sx={{marginTop: -8}}>Upload date</Text>
                    </Stack>
                    <Stack spacing="xs">
                        <Text size="sm">{current.Author.Name}</Text>
                        <Text size="xs" sx={{marginTop: -8}}>Uploader</Text>
                    </Stack>
                    <Stack spacing="xs">
                        <Text size="sm">{current.Views}</Text>
                        <Text size="xs" sx={{marginTop: -8}}>Views</Text>
                    </Stack>
                    {current.Folder && <Stack spacing="xs">
                        <Text size="sm">{current.Folder}</Text>
                        <Text size="xs" sx={{marginTop: -8}}>Category</Text>
                    </Stack>}
                    <Stack spacing="xs">
                        <Text size="sm">{getExt(current.FileURL)}</Text>
                        <Text size="xs" sx={{marginTop: -8}}>File type</Text>
                    </Stack>
                    {current.Tags && <Stack spacing="xs">
                        <Text size="sm">{current.Tags.split(",").map((e, i) => e)}</Text>
                    </Stack>}
                </Stack>
            </Aside.Section>
            <Card mb="sm">
                <Text size="xs" weight={500}>Current comment policy</Text>
                <Text size="xs">Don't be a cunt</Text>
            </Card>
            <CommentBox/>
            <Aside.Section grow component={ScrollArea} mx="-xs" px="xs">
            </Aside.Section>
            <Tabbar/>
        </Aside>


        <Modal title="How to use Doki" opened={helpOpen} onClose={() => setHelpOpen(false)}>
            <Paper mb="md" shadow="md" sx={{display: "flex", padding: 16}}>
                <Stack sx={{
                    margin: "auto"
                }}>
                    <Group>
                        <ActionIcon onClick={() => {
                            showNotification({
                                message: muted ? "Unmuted!" : "Muted!",
                                icon: muted ? <Volume size={24}/> : <Volume3 size={24}/>,
                                color: "dark",
                                disallowClose: true,
                                autoClose: 1000
                            });
                            setMuted(!muted);
                        }}>{muted ? <Volume3 size={24}/> : <Volume size={24}/>}</ActionIcon>
                        <Slider onChange={(value) => setVolume(value)} defaultValue={volume}
                                min={0}
                                size="xs"
                                max={1}
                                label={null}
                                step={0.01} sx={{minWidth: 100}}/>
                    </Group>
                    <ActionIcon onClick={() => router.back()}><PlayerSkipBack size={24}/></ActionIcon>
                    <ActionIcon onClick={() => setPlaying(!playing)}>{playing ? <PlayerPause size={24}/> :
                        <PlayerPlay size={24}/>}</ActionIcon>
                    <ActionIcon onClick={() => {
                        showNotification({
                            message: repeat ? "No longer repeating. Autoplay enabled." : "Autoplay disabled. The media will repeat.",
                            icon: repeat ? <Repeat size={24}/> : <RepeatOff size={24}/>,
                            color: "dark",
                            disallowClose: true,
                            autoClose: 1000
                        });
                        setRepeat(!repeat);
                    }}>{repeat ? <Repeat size={24}/> : <RepeatOff size={24}/>}</ActionIcon>
                    <ActionIcon onClick={handleNewFile}><PlayerSkipForward size={24}/></ActionIcon>
                </Stack>
            </Paper>
            <Text size="xs">
                Player controls (when applicable) are located in the top-left corner, the repeat button can switch
                between continuous or looped playback.
                <br/>
                Found a funny moment? The play/pause button lets you pause the content.
            </Text>
            <Paper my="md" shadow="md" sx={{display: "flex", padding: 16}}>
                {current && <QuickDetails current={current} isPlayable={isPlayable} progress={progress} sx={{
                    width: 'calc(100% - 16px)',
                }}/>}
            </Paper>
            <Text size="xs">
                Bottom-left corner contains quick details of what you're looking at.
                <br/>
                Title of the file, description, uploader, file-type and view count is stored here.
            </Text>
            <Paper my="md" shadow="md" sx={{display: "flex", overflow: "hidden"}}>
                <Box sx={{flex: 1, background: "rgba(0,0,0,.1)"}}>

                </Box>
                <Paper sx={{
                    maxWidth: 0,
                    height: 160,
                    padding: 8,
                    animation: "navigation-demo 2s cubic-bezier(.07, .95, 0, 1) infinite"
                }}>
                    <Stack my="md">
                        <Paper sx={{background: "rgba(0,0,0,.1)", width: 40, height: 4}}>

                        </Paper>
                        <Paper sx={{background: "rgba(0,0,0,.1)", width: 40, height: 4}}>

                        </Paper>
                        <Paper sx={{background: "rgba(0,0,0,.1)", width: 40, height: 4}}>

                        </Paper>
                        <Paper sx={{background: "rgba(0,0,0,.1)", width: 40, height: 16}}>

                        </Paper>
                        <Paper sx={{background: "rgba(0,0,0,.1)", width: 40, height: 16}}>

                        </Paper>
                    </Stack>
                </Paper>
            </Paper>
            <Text mb="md" size="xs">
                Right side of the site is the navigation card, this comes out of sight when you're watching content, but
                can be retrieved through either moving your mouse to the right edge,
                right-clicking anywhere, or scrolling downwards.
                <br/>
                In this page it contains full details and comments for the content. The sitemap is located here.
            </Text>
            <Button fullWidth onClick={() => {
                setFirstTime(false);
                setHelpOpen(false);
            }}>
                Understood
            </Button>
        </Modal>
    </Layout>;
}

export default Page;