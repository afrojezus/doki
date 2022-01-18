/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  useCallback, useState,
} from 'react';
import {
  AppBar, BottomNavigation, BottomNavigationAction,
  Box,
  Button,
  CircularProgress,
  IconButton, Switch, Theme,
  Toolbar,
  Typography, useMediaQuery,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  FastForward as ForwardIcon,
  FastRewind as RewindIcon, Grid3x3Outlined, MenuOpen, MenuOutlined, MoreHorizOutlined,
  PauseCircle as PauseIcon,
  PlayCircle as PlayIcon,
  StreamOutlined,
  ThumbUp as LikeIcon, UploadFileOutlined, UploadFileTwoTone,
  VolumeMute as VolMuteIcon,
  VolumeUp as VolIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { useLocation } from 'react-router-dom';
import { LoadingButton } from '@mui/lab';
import {
  checkFile, displayFilename, DRAWER_WIDTH, LightTooltip, mediaExt, truncate, viewable,
} from '../../../data/utils';
import PlayerProgressBar from '../components/PlayerProgressBar';
import Duration from '../components/Duration';
import MarginedToolbarIconButton from '../elements/MarginedToolbarIconButton';
import ToolbarVolumeSlider from '../elements/ToolbarVolumeSlider';
import { actionCreators, FileServiceState } from '../../../store/FileService';
import { ApplicationState } from '../../../store';
import { actionCreators as prefCreators, PreferencesState } from '../../../store/Preferences';
import { sessionActions, SessionState } from '../../../store/Session';
import Space from '../elements/Space';

function ControlBar() {
  const history = useHistory();
  const location = useLocation();

  const userTheme = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).theme);
  const files = useSelector((state: ApplicationState) => (state.files as FileServiceState).files);
  const isLoading = useSelector((state: ApplicationState) => (state.files as FileServiceState).isLoading);
  const currentFile = useSelector((state: ApplicationState) => (state.files as FileServiceState).currentFile);
  const volume = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).playbackVolume);
  const muted = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).willMute);
  const continuous = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).continuous);
  const watchFilter = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).watchFilter);
  const interacted = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).interacted);
  const isUploading = useSelector((state: ApplicationState) => (state.files as FileServiceState).isUploading);

  const showPlayer = useSelector((state: ApplicationState) => (state.session as SessionState).showPlayer);
  const showOptions = useSelector((state: ApplicationState) => (state.session as SessionState).showOptionsPane);

  const playing = useSelector((state: ApplicationState) => (state.session as SessionState).playing);
  const progress = useSelector((state: ApplicationState) => (state.session as SessionState).progress);
  const duration = useSelector((state: ApplicationState) => (state.session as SessionState).duration);

  const previouslySeen = useSelector((state: ApplicationState) => (state.session as SessionState).previouslySeen);

  const L = useMediaQuery('(min-width:1280px)');
  const XL = useMediaQuery('(min-width:1600px)');

  const dispatch = useDispatch();

  const [index, setIndex] = useState(0);
  const [barOnFocus, setBarOnFocus] = useState(true);

  const [loading, setLoading] = useState(isLoading);

  const handleContinuous = (event: any) => dispatch(prefCreators.setContinuous(event.target.checked as boolean));

  const handleUpload = () => {
    dispatch(sessionActions.setUploader(true));
  };

  const willShowFiles = () => {
    dispatch(sessionActions.setPlayer(false));
    history.push('/browse');
  };

  const willNotShowFiles = () => {
    dispatch(sessionActions.setPlayer(true));
    history.push(`/${currentFile ? `watch/${currentFile.id}` : ''}`);
  };

  const handleVolumeChange = (event: any, newValue: number | number[]) => dispatch(prefCreators.setPlaybackVolume(newValue as number));

  const registerView = useCallback(() => {
    if (currentFile) {
      const updateForm = new FormData();
      updateForm.append('id', currentFile.id.toString());
      dispatch(actionCreators.giveViewToFile(currentFile.id, updateForm));
    }
  }, [currentFile, dispatch]);

  // const handleSeekDown = () => setSeeking(true);
  // const handleSeekChange = (event: React.ChangeEvent<unknown>, value: (number | number[])) => {};
  const handleSeekUp = (value: number) => {
    dispatch(sessionActions.setControlSeek(value as number));
  };

  const randomNewVideo = () => {
    if (currentFile) {
      dispatch(sessionActions.checkFileAsSeen(currentFile.id));
    }
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
    setLoading(true);

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

  const newVideoBack = async () => {
    setLoading(true);

    const video = previouslySeen.pop();
    if (video) {
      if (continuous && !showPlayer) {
        dispatch(actionCreators.requestFile(video.toString()));
      } else {
        history.push(`/watch/${video}`);
      }
    }
  };

  React.useEffect(() => {
    if (currentFile && !checkFile(viewable, currentFile)) {
      setLoading(false);
    }
    if (currentFile && playing) {
      setLoading(false);
    }
    if (currentFile === null && !showPlayer) setLoading(false);
  }, [currentFile, playing, showPlayer]);

  React.useEffect(() => {
    if (location.pathname.startsWith('/watch/')) {
      dispatch(sessionActions.setControlPlaying(true));
      dispatch(sessionActions.setPlayer(true));
      dispatch(sessionActions.setNavigationPane(false));
      registerView();
    } else {
      dispatch(sessionActions.setPlayer(false));
      dispatch(sessionActions.setControlPlaying(false));
    }
  }, [location, dispatch]);

  React.useEffect(() => {
    dispatch(prefCreators.setPlaybackVolume(volume));
  }, [dispatch, volume]);

  React.useEffect(() => {
    dispatch(prefCreators.setContinuous(continuous));
  }, [continuous, dispatch]);

  React.useEffect(() => {
    dispatch(prefCreators.setMute(muted));
  }, [dispatch, muted]);

  React.useEffect(() => {
    if (location.pathname.startsWith('/watch')) {
      setIndex(0);
    } else {
      setIndex(1);
    }
  }, [location]);

  return (
    <Box
      onMouseOver={() => setBarOnFocus(true)}
      onMouseLeave={() => setBarOnFocus(false)}
      sx={{
        height: 72,
        width: (location.pathname.startsWith('/watch') && showOptions) ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
        left: 0,
        bottom: 0,
        position: 'fixed',
        background: !L ? 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(9,9,121,0) 100%)' : 'transparent',
      }}
    >
      {(!L) && (
      <Toolbar sx={{
        opacity: !showPlayer ? 0 : 1,
        pointerEvents: !showPlayer ? 'none' : undefined,
        position: 'fixed',
        top: 0,
        width: '100%',
      }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: "'doublewide', sans-serif",
            lineHeight: 'normal',
            fontWeight: 700,
            transition: (theme) => theme.transitions.create(['all']),
            opacity: !showPlayer ? 0 : 1,
            textShadow: '1px 2px 6px rgba(0,0,0,.4)',
          }}
        >
          {process.env.REACT_APP_NAME}
        </Typography>
        <Space />
        <Typography variant="caption" sx={{ marginLeft: 1, marginRight: 1 }}>
          Autoplay
        </Typography>
        <Switch sx={{ marginRight: 1 }} checked={continuous} onChange={handleContinuous} />
        <IconButton
          onClick={() => {
            dispatch(prefCreators.setMute(!muted));
          }}
        >
          {muted
            ? <VolMuteIcon /> : <VolIcon />}
        </IconButton>
      </Toolbar>
      )}
      {(!L) && (
      <Toolbar
        sx={{
          opacity: !showPlayer ? 0 : 1,
          pointerEvents: !showPlayer ? 'none' : undefined,
          position: 'fixed',
          bottom: (theme) => theme.spacing(8),
          width: '100%',
        }}
      >
        <Box sx={{
          transition: (theme: Theme) => theme.transitions.create(['all']),
          display: 'inline-flex',
          flexDirection: 'column',
          lineHeight: '0.05em',
          ...(loading && {
            maxWidth: '0 !important',
            opacity: '0 !important',
            flex: '0 !important',
            margin: '0 !important',
            padding: '0 !important',
            pointerEvents: 'none',
          }),
        }}
        >
          <Typography
            sx={{
              background: 'linear-gradient(to right, #6666ff, #0099ff , #00ff00, #ff3399, #6666ff)',
              backgroundClip: 'text',
              color: 'transparent',
              animation: 'rainbow_animation 30s ease-in-out infinite',
              backgroundSize: '400% 100%',
              opacity: '1 !important',
              whiteSpace: 'nowrap',
              lineHeight: 'normal',
              textShadow: '1px 2px 6px rgba(0,0,0,.4)',
              fontWeight: 700,
              transition: (theme: Theme) => theme.transitions.create(['all']),
            }}
            variant="h6"
          >
            {currentFile ? currentFile.title ? currentFile.title : truncate(displayFilename(currentFile.fileURL), 30) : 'Currently not viewing a file'}
          </Typography>
          {currentFile && (
          <Box sx={{ flexFlow: 'row wrap', width: '100%' }}>
            {currentFile.folder && (
            <Typography
              variant="caption"
              sx={{
                whiteSpace: 'nowrap',
                color: 'text.primary',
                fontSize: 12,
              }}
            >
              {currentFile && currentFile.folder.replaceAll('.', '/')}
              {' '}
              ∙
              {' '}
            </Typography>
            )}
            <Typography
              variant="caption"
              sx={{
                whiteSpace: 'nowrap',
                color: 'text.primary',
                fontSize: 12,
              }}
            >
              {currentFile.views}
              {' '}
              views ∙
              {' '}
              {(currentFile.size / 1024 / 1024).toFixed(2)}
              {' '}
              MB
              ∙
              {' '}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                whiteSpace: 'nowrap',
                color: 'text.primary',
                fontSize: 12,
              }}
            >
              {currentFile.fileURL.split('.')[currentFile.fileURL.split('.').length - 1].toUpperCase()}
            </Typography>
          </Box>
          )}
        </Box>
        <Box sx={{
          margin: (theme: Theme) => (currentFile === null ? 0 : barOnFocus || !showPlayer ? theme.spacing(0, 2) : theme.spacing(0, 2)),
          transition: (theme: Theme) => theme.transitions.create(['all']),
          display: 'inline-flex',
          flexDirection: 'row',
          lineHeight: '0.05em',
          ...(!loading && {
            maxWidth: '0 !important',
            opacity: '0 !important',
            flex: '0 !important',
            margin: '0 !important',
            padding: '0 !important',
            pointerEvents: 'none',
          }),
        }}
        >
          <CircularProgress size={16} sx={{ width: 16, margin: 'auto' }} />
          <Typography sx={{ margin: 'auto', marginLeft: 2 }} variant="caption">LOADING</Typography>
        </Box>
      </Toolbar>
      )}
      <AppBar sx={{
        top: 'initial',
        left: 0,
        bottom: 0,
        transition: (theme: Theme) => theme.transitions.create(['all'], { duration: 200 }),
        width: (location.pathname.startsWith('/watch') && showOptions) ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
        background: (theme: Theme) => ((!L) ? 'transparent' : (barOnFocus || !showPlayer ? theme.palette.background.paper : 'transparent')),
        overflow: 'hidden',
        position: 'fixed',
        borderBottom: 0,
        borderTop: (barOnFocus || !showPlayer) ? '1px solid rgba(255,255,255,.12)' : '1px solid rgba(255,255,255,0)',
        boxShadow: (theme: Theme) => (barOnFocus || !showPlayer ? theme.shadows[8] : 0),
      }}
      >
        {checkFile(mediaExt, currentFile)
                    && (
                    <PlayerProgressBar
                      onFocus={barOnFocus}
                      duration={duration}
                      seekTo={handleSeekUp}
                      showBar={!showPlayer}
                      played={progress.played}
                      buffered={progress.loaded}
                    />
                    )}
        <Toolbar disableGutters={!L} sx={{ padding: !L ? 0 : undefined }}>
          {(!L) ? (
            <BottomNavigation
              sx={{ flex: 1, width: '100%', background: 'transparent' }}
              value={index}
              onChange={(e, v) => {
                switch (v) {
                  case 0:
                    willNotShowFiles();
                    break;
                  case 1:
                    willShowFiles();
                    break;
                  case 2:
                    dispatch(sessionActions.setUploader(true));
                    break;
                  case 3:
                    dispatch(sessionActions.setOptionsPane(true));
                    break;
                  default:
                    break;
                }
              }}
            >
              <BottomNavigationAction
                sx={{
                  color: 'rgba(255,255,255,.5)',
                  '& .Mui-selected': {
                    color: 'rgba(255,255,255,1)',
                  },
                }}
                label="Stream"
                icon={<StreamOutlined />}
              />
              <BottomNavigationAction
                sx={{
                  color: 'rgba(255,255,255,.5)',
                  '& .Mui-selected': {
                    color: 'rgba(255,255,255,1)',
                  },
                }}
                label="Browser"
                icon={<Grid3x3Outlined />}
              />
              <BottomNavigationAction
                sx={{
                  color: 'rgba(255,255,255,.5)',
                  '& .Mui-selected': {
                    color: 'rgba(255,255,255,1)',
                  },
                }}
                label="Upload"
                icon={<UploadFileOutlined />}
              />
              <BottomNavigationAction
                sx={{
                  color: 'rgba(255,255,255,.5)',
                  '& .Mui-selected': {
                    color: 'rgba(255,255,255,1)',
                  },
                }}
                label="Options"
                icon={<MoreHorizOutlined />}
              />
            </BottomNavigation>
          ) : (
            <>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "'doublewide', sans-serif",
                  lineHeight: 'normal',
                  marginRight: (theme) => (barOnFocus || !showPlayer ? 0 : theme.spacing(4)),
                  fontWeight: 700,
                  maxWidth: barOnFocus || !showPlayer ? 0 : 72,
                  transition: (theme) => theme.transitions.create(['all']),
                  opacity: barOnFocus || !showPlayer ? 0 : 1,
                  textShadow: barOnFocus || !showPlayer ? 'none' : '1px 2px 6px rgba(0,0,0,.4)',
                }}
              >
                {process.env.REACT_APP_NAME}
              </Typography>
              <Toolbar
                disableGutters
                sx={{
                  minWidth: currentFile === null ? 0 : barOnFocus || !showPlayer ? checkFile(mediaExt, currentFile) ? 150 : 32 : 0,
                  transition: (theme) => theme.transitions.create(['all']),
                  opacity: barOnFocus || !showPlayer ? 1 : 0,
                  flex: currentFile === null ? 0 : barOnFocus || !showPlayer ? checkFile(mediaExt, currentFile) ? 0.2 : 0.01 : 0,
                }}
              >
                {files.length > 0 && currentFile !== null && !checkFile(mediaExt, currentFile)
                            && (
                            <LightTooltip title={showPlayer ? 'Open file browser' : 'Close file browser'}>
                              <IconButton
                                color="inherit"
                                onClick={!showPlayer ? willNotShowFiles : willShowFiles}
                                className="unique-icon"
                              >
                                {!showPlayer ? <ExpandMore /> : <ExpandLess />}
                              </IconButton>
                            </LightTooltip>
                            )}
                {checkFile(mediaExt, currentFile) && (
                <>
                  <IconButton
                    sx={{
                      display: {
                        xs: 'none',
                        sm: 'none',
                        md: 'inherit',
                        lg: 'inherit',
                        xl: 'inherit',
                      },
                    }}
                    disabled={previouslySeen.length === 0}
                    onClick={() => newVideoBack()}
                  >
                    <RewindIcon />
                  </IconButton>
                  <IconButton
                    sx={{
                      display: {
                        xs: 'none',
                        sm: 'none',
                        md: 'inherit',
                        lg: 'inherit',
                        xl: 'inherit',
                      },
                    }}
                    onClick={() => {
                      if (playing) { dispatch(sessionActions.setControlPlaying(false)); willShowFiles(); } else {
                        dispatch(sessionActions.setControlPlaying(true));
                        willNotShowFiles();
                      }
                    }}
                  >
                    {!interacted ? <MenuOutlined /> : !playing ? <PlayIcon fontSize="large" /> : <PauseIcon fontSize="large" />}
                  </IconButton>
                  <IconButton
                    sx={{
                      display: {
                        xs: 'none',
                        sm: 'none',
                        md: 'inherit',
                        lg: 'inherit',
                        xl: 'inherit',
                      },
                    }}
                    onClick={() => newVideo()}
                  >
                    <ForwardIcon />
                  </IconButton>
                </>
                )}
              </Toolbar>
              <Box sx={{
                margin: (theme: Theme) => (currentFile === null ? 0 : barOnFocus || !showPlayer ? theme.spacing(0, 1) : 0),
                transition: (theme: Theme) => theme.transitions.create(['all']),
                display: 'inline-flex',
                flexDirection: 'column',
                lineHeight: '0.05em',
                ...(loading && {
                  maxWidth: '0 !important',
                  opacity: '0 !important',
                  flex: '0 !important',
                  margin: '0 !important',
                  padding: '0 !important',
                  pointerEvents: 'none',
                }),
              }}
              >
                <Typography
                  sx={{
                    background: (theme) => (barOnFocus || !showPlayer
                      ? `linear-gradient(to right, ${theme.palette.text.primary}, ${theme.palette.text.primary})` : 'linear-gradient(to right, #6666ff, #0099ff , #00ff00, #ff3399, #6666ff)'),
                    backgroundClip: 'text',
                    color: 'transparent',
                    animation: 'rainbow_animation 30s ease-in-out infinite',
                    backgroundSize: '400% 100%',
                    opacity: '1 !important',
                    whiteSpace: 'nowrap',
                    lineHeight: 'normal',
                    textShadow: barOnFocus || !showPlayer ? 'none' : '1px 2px 6px rgba(0,0,0,.4)',
                    fontWeight: 700,
                    transition: (theme: Theme) => theme.transitions.create(['all']),
                    marginLeft: (theme: Theme) => theme.spacing(2),
                    display: {
                      xs: 'none',
                      sm: 'none',
                      md: 'initial',
                      lg: 'initial',
                      xl: 'initial',
                    },
                  }}
                  variant="h6"
                >
                  {currentFile ? currentFile.title ? currentFile.title : truncate(displayFilename(currentFile.fileURL), 50) : 'Currently not viewing a file'}
                </Typography>
                {currentFile && (
                <Box sx={{ flexFlow: 'row wrap', width: '100%' }}>
                  {currentFile.folder && (
                  <Typography
                    variant="caption"
                    sx={{
                      whiteSpace: 'nowrap',
                      color: barOnFocus || !showPlayer ? 'text.primary' : 'text.disabled',
                      fontSize: 12,
                      marginLeft: (theme: Theme) => theme.spacing(2),
                      display: {
                        xs: 'none',
                        sm: 'none',
                        md: 'initial',
                        lg: 'initial',
                        xl: 'initial',
                      },
                    }}
                  >
                    {currentFile && currentFile.folder.replaceAll('.', '/')}
                    {' '}
                    ∙
                    {' '}
                  </Typography>
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      whiteSpace: 'nowrap',
                      color: barOnFocus || !showPlayer ? 'text.primary' : 'text.disabled',
                      fontSize: 12,
                      marginLeft: (theme: Theme) => (currentFile.folder ? theme.spacing(0) : theme.spacing(2)),
                      display: {
                        xs: 'none',
                        sm: 'none',
                        md: 'initial',
                        lg: 'initial',
                        xl: 'initial',
                      },
                    }}
                  >
                    {currentFile.views}
                    {' '}
                    views ∙
                    {' '}
                    {(currentFile.size / 1024 / 1024).toFixed(2)}
                    {' '}
                    MB
                    ∙
                    {' '}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      whiteSpace: 'nowrap',
                      color: barOnFocus || !showPlayer ? 'text.primary' : 'text.disabled',
                      fontSize: 12,
                      display: {
                        xs: 'none',
                        sm: 'none',
                        md: 'initial',
                        lg: 'initial',
                        xl: 'initial',
                      },
                    }}
                  >
                    {currentFile.fileURL.split('.')[currentFile.fileURL.split('.').length - 1].toUpperCase()}
                  </Typography>
                </Box>
                )}
              </Box>
              <Box sx={{
                margin: (theme: Theme) => (currentFile === null ? 0 : barOnFocus || !showPlayer ? theme.spacing(0, 2) : theme.spacing(0, 2)),
                transition: (theme: Theme) => theme.transitions.create(['all']),
                display: 'inline-flex',
                flexDirection: 'row',
                lineHeight: '0.05em',
                ...(!loading && {
                  maxWidth: '0 !important',
                  opacity: '0 !important',
                  flex: '0 !important',
                  margin: '0 !important',
                  padding: '0 !important',
                  pointerEvents: 'none',
                }),
              }}
              >
                <CircularProgress size={16} sx={{ width: 16, margin: 'auto' }} />
                <Typography sx={{ margin: 'auto', marginLeft: 2 }} variant="caption">LOADING</Typography>
              </Box>
              <Space />
              {checkFile(mediaExt, currentFile) && (
              <Typography
                variant="caption"
                sx={{
                  margin: (theme: Theme) => theme.spacing(0, 3),
                  color: 'text.primary',
                  opacity: barOnFocus || !showPlayer ? 1 : 0,
                }}
              >
                <Duration seconds={duration * progress.played} />
                /
                <Duration seconds={duration} />
              </Typography>
              )}
              <Toolbar
                disableGutters
                sx={{
                  transition: (theme) => theme.transitions.create(['all']),
                  opacity: barOnFocus || !showPlayer ? 1 : 0,
                  pointerEvents: barOnFocus || !showPlayer ? 'initial' : 'none',
                }}
              >
                {(L || XL) && (
                <>
                  <Typography variant="caption" sx={{ marginLeft: 1, marginRight: 1, color: 'text.secondary' }}>
                    Autoplay
                  </Typography>
                  <Switch sx={{ marginRight: 1 }} checked={continuous} onChange={handleContinuous} />
                </>
                )}
                <LightTooltip
                  sx={{
                    display: {
                      xs: 'none',
                      sm: 'none',
                      md: 'inherit',
                      lg: 'inherit',
                      xl: 'inherit',
                    },
                  }}
                  title="Toggle sound"
                >
                  <MarginedToolbarIconButton
                    onClick={() => {
                      dispatch(prefCreators.setMute(!muted));
                    }}
                  >
                    {muted
                      ? <VolMuteIcon /> : <VolIcon />}
                  </MarginedToolbarIconButton>
                </LightTooltip>
                <ToolbarVolumeSlider
                  sx={{
                    display: {
                      xs: 'none',
                      sm: 'none',
                      md: 'initial',
                      lg: 'initial',
                      xl: 'initial',
                    },
                    minWidth: muted ? 0 : 100,
                    maxWidth: 100,
                  }}
                  color="primary"
                  size="small"
                  muted={muted}
                  max={0.9999}
                  min={0}
                  value={volume}
                  step={0.001}
                  onChange={handleVolumeChange}
                />
                {currentFile && (
                <LightTooltip title="Like this file">
                  <Button
                    startIcon={<LikeIcon />}
                    color={userTheme === 'edge' ? 'secondary' : 'primary'}
                    sx={{
                      color: (theme) => ((userTheme === 'edge') ? theme.palette.text.primary : undefined),
                    }}
                    onClick={() => {
                      if (currentFile) {
                        const updateForm = new FormData();
                        updateForm.append('id', currentFile.id.toString());
                        dispatch(actionCreators.giveLikeToFile(currentFile.id, updateForm));
                      }
                    }}
                  >
                    {currentFile && currentFile.likes}
                  </Button>
                </LightTooltip>
                )}
                <LightTooltip title="Upload files">
                  <LoadingButton
                    onClick={handleUpload}
                    endIcon={<UploadFileTwoTone />}
                    loading={isUploading}
                    loadingPosition="end"
                    variant="outlined"
                    color={userTheme === 'edge' ? 'secondary' : 'primary'}
                    sx={{
                      margin: (theme) => theme.spacing(0, 1),
                      color: (theme) => ((userTheme === 'edge') ? theme.palette.text.primary : undefined),
                    }}
                  >
                    Upload
                  </LoadingButton>
                </LightTooltip>
                <LightTooltip title="Options">
                  <MarginedToolbarIconButton
                    onClick={() => {
                      dispatch(sessionActions.setOptionsPane(!showOptions));
                    }}
                  >
                    <MenuOpen sx={{ transition: (theme) => theme.transitions.create(['all']), transform: showOptions ? 'rotate(-180deg)' : 'rotate(0deg)' }} />
                  </MarginedToolbarIconButton>
                </LightTooltip>
              </Toolbar>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default ControlBar;
