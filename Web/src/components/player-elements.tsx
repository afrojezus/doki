import {
    Box,
    Button,
    Card,
    Container,
    Group,
    Image,
    Progress,
    Space,
    Stack,
    Text,
    ThemeIcon,
    Title
} from "@mantine/core";
import {audioFormats, displayFilename, getExt, pictureFormats, playableFormats} from "../../utils/file";
import {createRef, useContext, useEffect, useState} from "react";
import ReactPlayer from "react-player";
import {showNotification} from "@mantine/notifications";
import {File as FileIcon} from "tabler-icons-react";
import {LinkButton} from "@src/components/buttons";
import {getLocale, LocaleContext} from "@src/locale";

export function QuickDetails({ sx, full = false, current, isPlayable, progress, children = undefined }) {
    const locale = useContext(LocaleContext);
    return <Stack sx={sx}>
        <Title order={5} className="rainbow">{displayFilename(current)}</Title>
        {current.Description && <Text color={isPlayable && full ? "white" : undefined} size="xs">{current.Description}</Text>}
        <Group>
            <Text size="xs" color={isPlayable && full ? "white" : undefined} weight={500}>{`${getLocale(locale).Viewer["uploaded-by"]} `}{current.Author.Name}</Text>
            <Space />
            <Text size="xs" color={isPlayable && full ? "white" : undefined}
                  weight={500}>{getExt(current.FileURL)}{getLocale(locale).Viewer["file"]}</Text>
            <Space />
            <Text size="xs" color={isPlayable && full ? "white" : undefined} weight={500}>{current.Views}{` ${getLocale(locale).Viewer["views"]}`}</Text>
            <Space />
            <Text size="xs" color={isPlayable && full ? "white" : undefined} weight={500}>{current.Likes}{` ${getLocale(locale).Viewer["likes"]}`}</Text>
        </Group>
        <Progress radius={0} size="sm" value={progress.played * 100} styles={{
            root: {
                opacity: 0.5,
                display: playableFormats.includes(getExt(current.FileURL)) ? undefined : "none"
            },
            bar: {
                transition: 'all 0.375s cubic-bezier(.07, .95, 0, 1)'
            }
        }} />
        {children}
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
            <Box sx={{ "& > * > video": { objectFit: objFit ? "contain" : "cover" } }}
                 style={{ width: "inherit", height: "inherit", position: "inherit" }} onClick={onClick}>
                <ReactPlayer onReady={handleReady} progressInterval={0.001} stopOnUnmount playing={isSelected}
                             onProgress={onProgress} muted={muted} volume={volume} loop={repeat} onEnded={onEnded}
                             className="react-player"
                             url={data} width="100%" height="100%" />
                {audioFormats.includes(getExt(data)) &&
                    <video src={`/${visualizer.FileURL}`} autoPlay loop muted width="100%" height="100%"
                           ref={audioVisualizer}
                           style={{ objectFit: "cover", position: "fixed", top: 0, left: 0, height: "100vh" }} />}
            </Box> :
            pictureFormats.includes(getExt(data)) ?
                <Image onClick={onClick} src={data} alt="" width="100%" height="100vh"
                       fit={objFit ? "contain" : "cover"} sx={{ margin: "auto" }} />
                :
                    <Container sx={{ height: "100vh", display: "inline-flex" }}>
                        <Card sx={{ margin: "auto", minWidth: 200 }}>
                            <Card.Section>
                                <ThemeIcon variant="gradient" sx={{ width: "100%", height: 160 }} radius={0}
                                           gradient={{ from: 'teal', to: 'blue', deg: 60 }}>
                                    <FileIcon size={48} />
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