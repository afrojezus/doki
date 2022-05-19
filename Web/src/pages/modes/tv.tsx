import {useRouter} from "next/router";
import {
    ActionIcon, Aside, Badge, Box,Group, Image,
     ScrollArea,
    Slider,
    Stack, Text,
    Title, Tooltip,
    UnstyledButton,
    useMantineTheme
} from "@mantine/core";
import Layout from "@src/components/layout";
import SEO from "@src/components/seo";
import {
    ArrowBack,
    PictureInPicture,
    PlayerPause,
    PlayerPlay,
    PlayerSkipBack, PlayerSkipForward,
    Repeat, RepeatOff, Resize,
    Volume,
    Volume3
} from "tabler-icons-react";
import {NextPageContext} from "next";
import {Author, File} from "@server/models";
import FileRepository from "@server/repositories/FileRepository";
import {checkCookies, getCookie, setCookies} from "cookies-next";
import {audioFormats, getExt, onlyGetMedia, onlyGetVideo, playableFormats, random, random2} from "../../../utils/file";
import {ContentSlide, QuickDetails} from "@src/components/player-elements";
import {showNotification} from "@mantine/notifications";
import {useEffect, useState} from "react";
import {FixedSizeList as List} from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

interface PageProps {
    posts: File[];
    volume: number;
    muted: boolean;
    loop: boolean;
    firstTime: boolean;
    filter: string[];
}

export async function getServerSideProps(nextPage: NextPageContext) {
    let posts: File[];
    try {
        posts = await FileRepository.findAll({
            include: {
                model: Author,
                required: true
            }
        });
        return {
            props: {
                posts,
                volume: checkCookies('player-volume', nextPage) ? getCookie('player-volume', nextPage) : 0.25,
                muted: checkCookies('player-muted', nextPage) ? getCookie('player-muted', nextPage) : false,
                loop: checkCookies('player-loop', nextPage) ? getCookie('player-loop', nextPage) : true,
                firstTime: checkCookies('first-time', nextPage) ? getCookie('first-time', nextPage) : true,
                filter: checkCookies('filtered', nextPage) ? JSON.parse(getCookie('filtered', nextPage) as string) : [],
               // messages: (await import(`../../../${nextPage.locale}nodemon.json`)).default
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
    const theme = useMantineTheme();

    const [previous, setPrevious] = useState<number[]>([]);
    const [current, setCurrent] = useState<File>(random(props.posts, onlyGetMedia));
    const [visualizer, setVisualizer] = useState<File>(random(props.posts, onlyGetVideo));

    const [hidden, setHidden] = useState(true);
    const [hoveringPlayer, setHoveringPlayer] = useState(false);
    const [lastTimeout, setNewTimeout] = useState<NodeJS.Timeout>(null);
    const [isPlayable] = useState(true);

    const [volume, setVolume] = useState<number>(parseFloat(String(props.volume)));
    const [muted, setMuted] = useState(props.muted);
    const [repeat, setRepeat] = useState(props.loop);
    const [playing, setPlaying] = useState(true);
    const [progress, setProgress] = useState<{ played: 0, loaded: 0 }>({ played: 0, loaded: 0 });
    const [pip, setPip] = useState(false);
    const [objFit, setObjFit] = useState(true);

    const [time, setTime] = useState(new Date());

    function handleNewFile() {
        setVisualizer(random(props.posts,onlyGetVideo));
        // check current as seen
        setPrevious(x => [...x, current.Id]);
        // get all media
        const _m = onlyGetMedia(props.posts.filter(x => !props.filter.includes(x.Folder)).filter(x => x.Id !== current.Id));
        if (previous.length === _m.length) {
            // reset seen
            setPrevious([]);
            return setCurrent(random2(_m));
        }
        const _n = _m.filter(x => !previous.includes(x.Id));
        return setCurrent(random2(_n));
    }

    function handleSelectedFile(e: File) {
        setHidden(!hidden);
        setPlaying(!playing);
        setCurrent(e);
        setVisualizer(random(props.posts,onlyGetVideo));
        // router.push(`/view/${random(props.posts, onlyGetMedia).Id}`);
    }

    useEffect(() => {
        const i = setInterval(() => setTime(time), 1000);

        return function cleanup() {
            clearInterval(i);
        }
    }, []);

    useEffect(() => {
        setCookies('player-volume', volume, { maxAge: 60 * 60 * 24 * 30 });
    }, [volume]);

    useEffect(() => {
        setCookies('player-muted', muted, { maxAge: 60 * 60 * 24 * 30 });
    }, [muted]);

    useEffect(() => {
        setCookies('player-loop', repeat, { maxAge: 60 * 60 * 24 * 30 });
    }, [repeat]);


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
        if (lastTimeout) clearTimeout(lastTimeout);
        setHoveringPlayer(true);
        if (hidden && isPlayable && !audioFormats.includes(getExt(current.FileURL))) {
            setNewTimeout(
                setTimeout(() => setHoveringPlayer(false), 5000));
        }
    }

    function handlePiP() {
        setPip(!pip);
    }

    function handleObjectFit() {
        setObjFit(!objFit);
    }

    function ItemRenderer({data, index, style}) {
        const item = data[index];
        return <UnstyledButton style={style} key={index} onClick={() => handleSelectedFile(item)} sx={{display: "inline-flex"}}>
            <Image withPlaceholder placeholder={<Text size="xs" align="center">
                {getExt(item.FileURL)}-format file
            </Text>} radius={0} styles={{
                root: {
                    width: 200,
                    height: 100,
                    background: theme.primaryColor
                },
                imageWrapper: {
                    height: "100%"
                },
                placeholder: {},
                figure: {
                    height: "100%"
                },
                image: {
                    height: "100% !important",
                    position: "absolute",
                    top: 0,
                    left: 0
                }
            }} src={`/${item.Thumbnail}`} alt="" />
            <Stack style={{flex: 1}} ml="md">
                <Text className="use-m-font" size="md" sx={{color: "white"}}>{item.Title}</Text>
                <Text size="xs" sx={{color: "white", opacity: 0.5}}>{item.Description}</Text>
                <Group position="apart">
                    <Text size="xs" sx={{color: "white"}}>{(item.Size / 1e3 / 1e3).toFixed(2)} MB</Text>
                    <Badge>{getExt(item.FileURL)}</Badge>
                    {item.NSFW ? <Badge color="red">NSFW</Badge> : undefined}
                </Group>

            </Stack>
        </UnstyledButton>
    }

    return <Layout additionalMainStyle={{background: isPlayable ? "black" : undefined, ...(!objFit && {
            overflow: "hidden",
            padding: "0 !important"
        }),
        paddingRight: hidden ? 16 : undefined,
        transition: "padding 0.375s cubic-bezier(.07, .95, 0, 1), background 0.375s cubic-bezier(.07, .95, 0, 1)"}}
        aside={<></>} footer={<></>}>
        <SEO title="TV" siteTitle="Doki"
             description="Content for days"/>
        <ActionIcon sx={{transition: "all .375s var(--animation-ease)", animation: "flowDown 7s var(--animation-ease)", position: "absolute", left: 16, top: 16, color: "white", zIndex: 10, opacity: hoveringPlayer ? 1 : 0}} onClick={() => router.back()}><ArrowBack /></ActionIcon>
        <Text sx={{transition: "all .375s var(--animation-ease)", animation: "flowDown 7s var(--animation-ease)", position: "absolute", top: 32, right: hidden ? 64 : 64 + 500, color: "white", zIndex: 10, opacity: hoveringPlayer ? 1 : 0.2, fontSize: 32, fontWeight: "800 !important"}} size="xl" className="use-m-font">{time.getHours()}:{time.getMinutes()}</Text>
        <div className="content-wrapper"
             style={{ cursor: hoveringPlayer ? undefined : "none" }}
             onMouseMove={handleMouseActivity}
             onContextMenu={(e) => {
                 e.preventDefault();
                 if (isPlayable) {
                     setHidden(!hidden);
                     setPlaying(!playing);
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
        >
            {current && <ContentSlide visualizer={visualizer} objFit={objFit} pipCallback={handlePiP} pip={pip}
                                 onProgress={(p) => setProgress(p)} onClick={handleNewFile} data={`/${current.FileURL}`}
                                 isSelected={playing} muted={muted} volume={volume}
                                 repeat={repeat} onEnded={handleNewFile}
                                 href={`/files/${random(props.posts, onlyGetMedia).Id}`} />}

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
                        opacity: 1
                    }),
                    zIndex: 5
                }}>
                {current && <QuickDetails current={current} isPlayable={isPlayable} progress={progress} full sx={{
                    position: 'fixed',
                    bottom: 0,
                    paddingLeft: 64,
                    paddingBottom: 64,
                    paddingRight: hidden ? undefined : 500,
                    left: 0,
                    zIndex: 5,
                    width: `calc(100% - ${64}px)`,
                    transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)"
                }}>
                    <Group position="apart">
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
                            }}>{muted ? <Volume3 size={24} color="white" /> : <Volume size={24} color="white" />}</ActionIcon>
                            <Slider onChange={(value) => setVolume(value)} defaultValue={volume}
                                    min={0}
                                    size="xs"
                                    max={1}
                                    label={null}
                                    step={0.01} sx={{ minWidth: 100 }} />
                        </Group>
                        <Group>
                        <Tooltip
                                 withArrow label="Go back to previous medium"><ActionIcon
                            onClick={() => router.back()}><PlayerSkipBack size={24} color="white" /></ActionIcon></Tooltip>
                        <Tooltip
                                 withArrow label="Play/pause the current medium"><ActionIcon
                            onClick={() => setPlaying(!playing)}>{playing ? <PlayerPause size={24} color="white" /> :
                            <PlayerPlay size={24} color="white" />}</ActionIcon>
                        </Tooltip>
                        <Tooltip
                                 withArrow label="Repeat/autoplay"><ActionIcon onClick={() => {
                            showNotification({
                                message: repeat ? "No longer repeating. Autoplay enabled." : "Autoplay disabled. The media will repeat.",
                                icon: repeat ? <Repeat size={24} /> : <RepeatOff size={24} />,
                                color: "dark",
                                disallowClose: true,
                                autoClose: 1000
                            });
                            setRepeat(!repeat);
                        }}>{repeat ? <Repeat size={24} color="white" /> : <RepeatOff size={24} color="white" />}</ActionIcon></Tooltip>
                        <Tooltip
                                 withArrow label="Go to next medium"><ActionIcon onClick={handleNewFile}><PlayerSkipForward
                            size={24} color="white" /></ActionIcon></Tooltip>
                        </Group>
                        <Group>
                        <Tooltip
                                 withArrow label="Picture-in-picture mode"><ActionIcon onClick={handlePiP}><PictureInPicture
                            size={24} color="white" /></ActionIcon></Tooltip>
                        <Tooltip
                                 withArrow label="Contain/cover the medium"><ActionIcon onClick={handleObjectFit}><Resize
                            size={24} color="white" /></ActionIcon></Tooltip>
                        </Group>
                    </Group>
                </QuickDetails>}
            </Box>
            <Box
                sx={{
                    transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    pointerEvents: "none",
                    background: 'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,27,0.5) 35%, rgba(0,0,0,0) 100%)',
                    height: 150,
                    opacity: 0,
                    ...(hoveringPlayer && {
                        opacity: playableFormats.includes(getExt(current.FileURL)) ? 1 : 0,
                        pointerEvents: playableFormats.includes(getExt(current.FileURL)) ? undefined : "none"
                    }),
                    zIndex: 5
                }}>

            </Box>

        </div>

        <Aside p="md"
               sx={{
                   transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                   position: 'fixed',
                   right: 0,
                   top: 0,
                   borderLeft: 'rgba(26,27,30,.98)',
                   background: 'rgba(26,27,30,.98)',
                   backdropFilter: 'blur(30px)', ...(hidden && ':hover' && {
                       opacity: 0.2,
                   }), ...(hidden && { opacity: 0, right: -500 })
               }} width={{ lg: 500 }}>
            <Title my="md" className="use-m-font" sx={{color: "white"}}>Playlist</Title>
            <Aside.Section grow>
                    <AutoSizer>
                        {({height, width}) => (
                            <List
                                itemCount={onlyGetVideo(props.posts).length}
                                itemSize={125}
                                height={height}
                                width={width}
                                itemData={onlyGetVideo(props.posts)}
                            >
                                {ItemRenderer}
                            </List>
                        )}
                    </AutoSizer>
            </Aside.Section>
        </Aside>
    </Layout>
}

export default Page;
