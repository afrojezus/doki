import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Theme,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { createStyles, makeStyles } from '@mui/styles';
import moment from 'moment';
import React, {
  createRef, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import Marquee from 'react-fast-marquee';
import ReactPlayer from 'react-player';
import { FileModel } from '../../data/models';
import { ApplicationState } from '../../store';
import { actionCreators, FileServiceState } from '../../store/FileService';
import { actionCreators as prefCreators, PreferencesState } from '../../store/Preferences';
import MediaPlayer from '../common/components/MediaPlayer';
import {
  audioExt, checkFile, displayFilename, DRAWER_WIDTH, imgExt, log, LogType, mediaExt, viewable,
} from '../../data/utils';
import { sessionActions, SessionState } from '../../store/Session';

const TOOLBAR_SIZE = 47;

const useStyles = makeStyles((theme: Theme) => createStyles({
  playerFlex: {
    flex: 1,
    // display: 'flex',
    transition: theme.transitions.create(['all']),
  },
  tvContainer: {
    bottom: 0,
    right: 0,
    height: '100vh',
    position: 'fixed',
    width: '100%',
    transition: theme.transitions.create(['all']),
  },
  tvHide: {
    opacity: 0.25,
    pointerEvents: 'none',
  },
  routeFlex: {
    display: 'inline-flex',
    flexDirection: 'column',
    height: `calc(100vh - ${TOOLBAR_SIZE}px)`,
    transition: theme.transitions.create(['all']),
  },
  closeFlex: {
    flex: 0,
  },
  toggleIcon: {
    transition: theme.transitions.create(['all']),
  },
  dokiBrand: {
    position: 'fixed',
    bottom: theme.spacing(1),
    left: theme.spacing(2),
    textShadow: '4px 4px 0px rgba(0,0,0,1)',
  },
  appbar: {
    top: 'initial',
    bottom: 0,
    opacity: 0.05,
    transition: theme.transitions.create(['all']),
    '& > * > * > .unique-icon': {
      opacity: 0,
      maxWidth: 0,
      margin: 0,
      padding: 0,
    },
    borderBottom: 'none',
    borderTop: '1px solid rgba(255,255,255,.12)',
  },
  appbarHover: {
    opacity: 1,
    '& > * > * > .unique-icon': {
      opacity: 1,
      maxWidth: 24,
      margin: 'initial',
      padding: 'initial',
    },
    background: theme.palette.mode === 'light' ? 'rgba(255,255,255,.95)' : 'rgba(0,0,0,.95)',
  },
  player: {
    width: '100%',
    height: '100vh',
    border: 'none',
    '& > * > * > video': {
      transition: theme.transitions.create(['all']),
    },
  },
  inactivePlayer: {
    height: 100,
  },
  inactivePlayerTV: {
    filter: 'brightness(25%)',
  },
  toolbar: {
    minHeight: TOOLBAR_SIZE,
    padding: theme.spacing(0, 1),
  },
  mini: {
    pointerEvents: 'none',
    position: 'fixed',
  },
  miniPadding: {},
  hiddenPanel: {
    maxHeight: '0 !important',
    opacity: '0 !important',
    flex: '0 !important',
    margin: '0 !important',
    padding: '0 !important',
    pointerEvents: 'none',
  },
  hidden: {
    maxWidth: '0 !important',
    opacity: '0 !important',
    flex: '0 !important',
    margin: '0 !important',
    padding: '0 !important',
    pointerEvents: 'none',
  },
  button: {
    color: theme.palette.primary.contrastText,
    margin: theme.spacing(0, 0.5),
    '&:first-child': {
      margin: 0,
    },
    '&:last-child': {
      margin: 0,
    },
  },
  divider: {
    margin: theme.spacing(0, 1),
    height: theme.spacing(6),
  },
  status: {
    margin: theme.spacing(0, 1),
    transition: theme.transitions.create(['all']),
  },
  visible: {
    opacity: 1,
  },
  visibleTV: {},
  seeker: {
    width: '100%',
    padding: 0,
    margin: 0,
    marginBottom: -2,
    display: 'block',
  },
  visualizer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  fullTrigger: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: `calc(100% - ${theme.mixins.toolbar.minHeight as number}px - ${theme.spacing(8)}px)`,
  },
  gif: {
    position: 'absolute',
    backgroundColor: 'black',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
  },
  tvIcon: {
    fontWeight: 700,
    margin: theme.spacing(0, 1),
    marginTop: 4,
    transition: theme.transitions.create(['all']),
    fontFamily: "'Josefin Sans', sans-serif",
  },
  spinner: {
    width: 20,
    transition: theme.transitions.create(['all']),
  },
  reminder: {
    margin: theme.spacing(0, 3),
    color: theme.palette.text.secondary,
  },
  rainbowPaper: {
    background: `linear-gradient(to right, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
    animation: 'rainbow_animation 30s ease-in-out infinite',
    backgroundSize: '400% 100%',
    height: '100vh',
  },
  rainbow: {
    background: 'linear-gradient(to right, #6666ff, #0099ff , #00ff00, #ff3399, #6666ff)',
    '-webkit-background-clip': 'text',
    backgroundClip: 'text',
    color: 'transparent',
    animation: 'rainbow_animation 6s ease-in-out infinite',
    backgroundSize: '400% 100%',
    opacity: '1 !important',
    whiteSpace: 'nowrap',
    lineHeight: 'normal',
  },
  plainbow: {
    opacity: '1 !important',
    whiteSpace: 'nowrap',
    lineHeight: 'normal',
    transition: theme.transitions.create(['all']),
  },
  moreControl: {
    display: 'inline-flex',
    transition: theme.transitions.create(['all']),
  },
  subtitle: {
    whiteSpace: 'nowrap',
  },
  drawer: {
    width: DRAWER_WIDTH,
    flexShrink: 0,
  },
  drawerPaper: {
    width: DRAWER_WIDTH,
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 2),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
    justifyContent: 'flex-start',
  },
  volume: {
    maxWidth: theme.spacing(12),
    flex: 1,
    transition: theme.transitions.create(['all']),
    marginRight: theme.spacing(1),
  },
  volumeIcon: {
    margin: theme.spacing(0, 0.5),
    color: 'white',
  },
  binaryCard: {
    padding: theme.spacing(2),
    margin: 'auto',
  },
  image: {
    width: '100%',
    height: `calc(100vh - ${TOOLBAR_SIZE}px)`,
    objectFit: 'contain',
  },
  binaryFileText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(50%, 25%)',
    fontWeight: 700,
    textShadow: '0 6px 12px rgba(0,0,0,.5)',
    background: 'linear-gradient(to right, #777, #888 , #fff, #eee, #aaa)',
    '-webkit-background-clip': 'text',
    backgroundClip: 'text',
    animation: 'rainbow_animation 6s ease-in-out infinite',
  },
  playlistThumbnail: {
    width: 100,
    height: 75,
    marginRight: theme.spacing(1),
  },
  uiToggle: {
    color: theme.palette.primary.main,
  },
  loadingbar: {
    height: 1,
    position: 'fixed',
    bottom: TOOLBAR_SIZE,
    width: '100%',
  },
  loadingbarglow: {
    height: 16,
    filter: 'blur(20px)',
    position: 'fixed',
    width: '100%',
    transform: 'scale(1.2)',
    pointerEvents: 'none',
    bottom: 0,
  },
  loadingbarglowHUGE: {
    height: 100,
    filter: 'blur(50px)',
    position: 'fixed',
    width: '100%',
    transform: 'scale(1.4)',
    pointerEvents: 'none',
    bottom: 0,
  },
  ptv: {
    height: '100vh !important',
  },
  pcov: {
    height: '100vh !important',
    '& > * > * > video': {
      objectFit: 'cover',
    },
  },
}));

function Player() {
  const L = useMediaQuery('(min-width:1280px)');
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();

  const player = createRef();

  const tvMode = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).tvMode);

  const files = useSelector((state: ApplicationState) => (state.files as FileServiceState).files);
  const currentFile = useSelector((state: ApplicationState) => (state.files as FileServiceState).currentFile);
  const volume = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).playbackVolume);
  const muted = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).willMute);
  const continuous = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).continuous);
  const watchFilter = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).watchFilter);
  const hasInteracted = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).interacted);
  const prepareNewFile = useSelector((state: ApplicationState) => (state.files as FileServiceState).preparingNewFile);

  const showPlayer = useSelector((state: ApplicationState) => (state.session as SessionState).showPlayer);
  const rightDrawer = useSelector((state: ApplicationState) => (state.session as SessionState).showOptionsPane);

  const previouslySeen = useSelector((state: ApplicationState) => (state.session as SessionState).previouslySeen);
  const playing = useSelector((state: ApplicationState) => (state.session as SessionState).playing);
  const tmpSeek = useSelector((state: ApplicationState) => (state.session as SessionState).tmpSeek);

  const dispatch = useDispatch();

  const [interacted, setInteracted] = useState(hasInteracted);

  const randomNewVideo = () => {
    if (currentFile) { dispatch(sessionActions.checkFileAsSeen(currentFile.id)); }
    const videos = files.filter((x) => !watchFilter.includes(x.folder)).filter((x) => x.id !== (currentFile ? currentFile.id : 0)).filter((x) => mediaExt.includes(x.fileURL.split('.')[x.fileURL.split('.').length - 1].toUpperCase()));
    if (previouslySeen.length === videos.length) {
      dispatch(sessionActions.resetPreviouslySeen());
      // eslint-disable-next-line no-bitwise
      return videos[~~(Math.random() * videos.length)];
    }
    const newVideos = videos.filter((x) => !previouslySeen.includes(x.id));
    // eslint-disable-next-line no-bitwise
    return newVideos[~~(Math.random() * newVideos.length)];
  };

  const newVideo = async () => {
    const video = randomNewVideo();

    if (video === undefined && continuous) {
      dispatch(prefCreators.setContinuous(false));
      return;
    }

    if (continuous && !showPlayer) {
      dispatch(actionCreators.requestFile(video.id.toString()));
    } else {
      history.push(`/watch/${video.id}`);
    }
  };

  const onDuration = (n: number) => dispatch(sessionActions.setControlDuration(n));

  const onProgress = (p: { played: number, playedSeconds: number, loaded: number, loadedSeconds: number }) => {
    dispatch(sessionActions.setControlProgress(p));
  };

  React.useEffect(() => {
    if (tmpSeek !== 0) {
      (player.current as unknown as ReactPlayer).seekTo(tmpSeek as number, 'seconds');
      dispatch(sessionActions.setControlSeek(0));
    }
  }, [dispatch, player, tmpSeek]);

  React.useEffect(() => {
    if (location.pathname.startsWith('/watch/') && showPlayer) {
      dispatch(sessionActions.setControlPlaying(true));
      dispatch(sessionActions.setNavigationPane(false));
    } else {
      dispatch(sessionActions.setControlPlaying(false));
      if (L) dispatch(sessionActions.setNavigationPane(true));
    }
  }, [L, dispatch, location, showPlayer]);

  React.useEffect(() => {
    dispatch(prefCreators.setInteracted(interacted));
  }, [dispatch, interacted]);

  return (
    <Box
      onContextMenu={(e: React.MouseEvent) => {
        e.preventDefault();
        if (currentFile && checkFile(mediaExt, currentFile)) {
          dispatch(sessionActions.setOptionsPane(!rightDrawer));
        }
      }}
        /* eslint-disable-next-line no-nested-ternary */
      style={{ display: !currentFile ? 'flex' : !checkFile(viewable, currentFile) ? 'flex' : undefined }}
      className={clsx(classes.playerFlex, !showPlayer && tvMode && classes.tvHide, !showPlayer && !tvMode && classes.mini)}
      sx={{
        marginRight: rightDrawer ? `${DRAWER_WIDTH}px` : 0,
        bottom: 0,
        right: 0,
        height: '100vh',
        position: 'fixed',
        transition: (theme) => theme.transitions.create(['all']),
        width: (rightDrawer) ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
      }}
      onClick={() => {
        if (currentFile && !checkFile(viewable, currentFile)) {
          return;
        }
        if (interacted) {
          if (files.length > 1 && showPlayer) {
            newVideo();
          }
          if (!showPlayer && currentFile) {
            history.push(`/watch/${currentFile.id}`);
          }
        } else {
          setInteracted(true);
        }
      }}
    >
      {checkFile(viewable, currentFile) ? (
        <>
          {checkFile(mediaExt, currentFile)
                        && (
                        <MediaPlayer
                            /* eslint-disable-next-line no-nested-ternary */
                          className={!showPlayer && currentFile ? tvMode ? classes.inactivePlayerTV : classes.inactivePlayer : clsx(classes.player, prepareNewFile && classes.inactivePlayer)}
                          ref={player}
                          progressInterval={0.001}
                          url={currentFile ? currentFile.fileURL : undefined}
                          width="100%"
                          onDuration={onDuration}
                          onProgress={onProgress}
                          light={(checkFile(audioExt, currentFile) && !interacted) || (!interacted && (currentFile as FileModel && (currentFile as FileModel).thumbnail as string))}
                          height="100%"
                          loop={!continuous}
                          playing={playing}
                          muted={muted}
                          onEnded={() => (continuous && newVideo())}
                          volume={volume}
                        />
                        )}
          {checkFile(imgExt, currentFile)
                        && (
                        <>
                          <img
                            alt=""
                            src={currentFile ? currentFile.fileURL : undefined}
                            style={{
                              width: '100%',
                              height: '100vh',
                              objectFit: 'contain',
                            }}
                          />
                          <Marquee
                            gradient={false}
                            speed={60}
                            style={{
                              position: 'fixed', width: '100%', top: 32, zIndex: -1,
                            }}
                          >
                            <Typography
                              variant="h3"
                              sx={{
                                fontWeight: 600,
                                zIndex: -1,
                                color: 'primary.main',
                                fontFamily: "'Zen Kaku Gothic Antique'",
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                              }}
                            >
                              ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ
                            </Typography>
                            <Typography
                              variant="h3"
                              sx={{
                                fontWeight: 600,
                                zIndex: -1,
                                color: 'primary.main',
                                fontFamily: "'Zen Kaku Gothic Antique'",
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                              }}
                            >
                              ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ
                            </Typography>
                            <Typography
                              variant="h3"
                              sx={{
                                fontWeight: 600,
                                zIndex: -1,
                                color: 'primary.main',
                                fontFamily: "'Zen Kaku Gothic Antique'",
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                              }}
                            >
                              ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ
                            </Typography>
                            <Typography
                              variant="h3"
                              sx={{
                                fontWeight: 600,
                                zIndex: -1,
                                color: 'primary.main',
                                fontFamily: "'Zen Kaku Gothic Antique'",
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                              }}
                            >
                              ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ
                            </Typography>
                          </Marquee>
                          <Marquee
                            gradient={false}
                            speed={90}
                            style={{
                              position: 'fixed', width: '100%', top: '25%', bottom: '25%', zIndex: -1,
                            }}
                          >
                            <Typography
                              variant="h1"
                              sx={{
                                textTransform: 'uppercase',
                                fontSize: '12em',
                                fontWeight: 600,
                                zIndex: -1,
                                color: 'primary.main',
                                fontFamily: 'doublewide',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                              }}
                            >
                              {displayFilename(currentFile ? currentFile.fileURL : '')}
                            </Typography>
                            <Typography
                              variant="h1"
                              sx={{
                                textTransform: 'uppercase',
                                fontSize: '12em',
                                fontWeight: 600,
                                zIndex: -1,
                                color: 'text.primary',
                                fontFamily: 'doublewide',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                              }}
                            >
                              {displayFilename(currentFile ? currentFile.fileURL : '')}
                            </Typography>
                            <Typography
                              variant="h1"
                              sx={{
                                textTransform: 'uppercase',
                                fontSize: '12em',
                                fontWeight: 600,
                                zIndex: -1,
                                color: 'primary.main',
                                fontFamily: 'doublewide',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                              }}
                            >
                              {displayFilename(currentFile ? currentFile.fileURL : '')}
                            </Typography>
                            <Typography
                              variant="h1"
                              sx={{
                                textTransform: 'uppercase',
                                fontSize: '12em',
                                fontWeight: 600,
                                zIndex: -1,
                                color: 'text.primary',
                                fontFamily: 'doublewide',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                              }}
                            >
                              {displayFilename(currentFile ? currentFile.fileURL : '')}
                            </Typography>
                          </Marquee>
                          <Marquee
                            direction="right"
                            gradient={false}
                            speed={60}
                            style={{
                              position: 'fixed', width: '100%', bottom: 32, zIndex: -1,
                            }}
                          >
                            <Typography
                              variant="h3"
                              sx={{
                                fontWeight: 600,
                                zIndex: -1,
                                color: 'primary.main',
                                fontFamily: "'Zen Kaku Gothic Antique'",
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                              }}
                            >
                              ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ
                            </Typography>
                            <Typography
                              variant="h3"
                              sx={{
                                fontWeight: 600,
                                zIndex: -1,
                                color: 'primary.main',
                                fontFamily: "'Zen Kaku Gothic Antique'",
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                              }}
                            >
                              ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ
                            </Typography>
                            <Typography
                              variant="h3"
                              sx={{
                                fontWeight: 600,
                                zIndex: -1,
                                color: 'primary.main',
                                fontFamily: "'Zen Kaku Gothic Antique'",
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                              }}
                            >
                              ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ
                            </Typography>
                            <Typography
                              variant="h3"
                              sx={{
                                fontWeight: 600,
                                zIndex: -1,
                                color: 'primary.main',
                                fontFamily: "'Zen Kaku Gothic Antique'",
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                              }}
                            >
                              ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ ドキ
                            </Typography>
                          </Marquee>
                        </>
                        )}
        </>
      ) : (
      // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
          {showPlayer && (
            <Box sx={{ margin: 'auto', display: 'inline-flex', flexDirection: 'row' }}>
              {files.length > 0 && currentFile && (
              <>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    fontFamily: 'doublewide',
                    transform: 'rotate(-90deg) translateX(-100px)',
                    margin: 'auto',
                    width: '100px',
                    height: 0,
                  }}
                >
                  BINARY
                </Typography>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 600,
                    zIndex: -1,
                    margin: 'auto',
                    color: 'text.primary',
                    fontFamily: 'doublewide',
                    transform: 'translateY(-242px)',
                    width: 0,
                    height: 0,
                  }}
                >
                  {currentFile && currentFile.fileURL.split('.')[currentFile.fileURL.split('.').length - 1].toUpperCase()}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 600,
                    zIndex: -1,
                    margin: 'auto',
                    color: 'primary.main',
                    fontFamily: "'Zen Kaku Gothic Antique'",
                    transform: 'translateY(150px)',
                    width: 0,
                    whiteSpace: 'nowrap',
                    height: 0,
                  }}
                >
                  アップロードされたバイナリデータ
                </Typography>
              </>
              )}
              <Card
                sx={{
                  padding: (theme: Theme) => theme.spacing(2),
                  background: (theme) => theme.palette.primary.main,
                }}
                elevation={24}
              >
                {/* eslint-disable-next-line no-nested-ternary */}
                {files.length > 0 && currentFile ? (
                  <>
                    <CardContent sx={{ minWidth: 400 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 600,
                          color: 'primary.contrastText',
                        }}
                      >
                        {currentFile ? currentFile.fileURL.replace('files/', '') : ''}
                      </Typography>
                      <Typography
                        sx={{
                          background: (theme) => theme.palette.primary.contrastText,
                          color: 'primary.main',
                          fontWeight: 600,
                          padding: 0.25,
                        }}
                        variant="caption"
                      >
                        Size
                      </Typography>
                      <Typography sx={{
                        fontWeight: 600,
                        color: 'primary.contrastText',
                      }}
                      >
                        {currentFile ? `${(currentFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
                      </Typography>
                      <Typography
                        sx={{
                          background: (theme) => theme.palette.primary.contrastText,
                          color: 'primary.main',
                          fontWeight: 600,
                          padding: 0.25,
                        }}
                        variant="caption"
                      >
                        Date
                      </Typography>
                      <Typography sx={{
                        fontWeight: 600,
                        color: 'primary.contrastText',
                      }}
                      >
                        {currentFile ? moment(currentFile.unixTime * 1e3).fromNow() : ''}
                      </Typography>
                      <Typography
                        sx={{
                          background: (theme) => theme.palette.primary.contrastText,
                          fontWeight: 600,
                          color: 'primary.main',
                          padding: 0.25,
                        }}
                        variant="caption"
                      >
                        Uploader
                      </Typography>
                      <Typography sx={{
                        fontWeight: 600,
                        color: 'primary.contrastText',
                      }}
                      >
                        {currentFile ? currentFile.author.name : ''}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        color="secondary"
                        sx={{
                          width: '100%',
                          color: 'secondary.main',
                          background: (theme) => theme.palette.primary.contrastText,
                        }}
                        onClick={() => newVideo()}
                        variant="contained"
                      >
                        Jump ahead
                      </Button>
                      <Button
                        sx={{
                          width: '100%',
                          color: 'primary.main',
                          background: (theme) => theme.palette.primary.contrastText,
                        }}
                        onClick={() => {
                          window.open(currentFile ? currentFile.fileURL as string : '');
                        }}
                        variant="contained"
                      >
                        Download
                      </Button>
                    </CardActions>
                  </>
                ) : files.length > 0
                  ? (
                    <CardContent>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 600,
                          fontFamily: 'doublewide',
                          color: 'primary.contrastText',
                        }}
                      >
                        FILE NOT FOUND
                      </Typography>
                      <Typography sx={{ color: 'primary.contrastText' }}>
                        Sure the link is
                        correct?
                      </Typography>
                    </CardContent>
                  )
                  : (
                    <CardContent>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 600,
                          fontFamily: 'doublewide',
                          color: 'primary.contrastText',
                        }}
                      >
                        EMPTY SERVER
                      </Typography>
                      <Typography sx={{ color: 'primary.contrastText' }}>
                        Click on the Doki button to
                        bring up the file browser. You can upload
                        there.
                      </Typography>
                    </CardContent>
                  )}
              </Card>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

export default Player;
