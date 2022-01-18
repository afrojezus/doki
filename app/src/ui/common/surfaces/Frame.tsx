/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Backdrop,
  Box, Drawer, Fade, Typography, useMediaQuery,
} from '@mui/material';
import React, {
  PropsWithChildren, ReactElement, ReactNode, useCallback, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { ApplicationState } from '../../../store';
import { sessionActions, SessionState } from '../../../store/Session';
import ControlBar from './ControlBar';
import { DRAWER_WIDTH } from '../../../data/utils';
import Uploader from '../components/Uploader';
import { PreferencesState } from '../../../store/Preferences';

interface FrameProps {
    leftDrawerContent: PropsWithChildren<ReactNode>;
    rightDrawerContent: PropsWithChildren<ReactNode>;
    frontContent: PropsWithChildren<ReactElement<any, any>>;
    backContent: PropsWithChildren<ReactElement<any, any>>;
}

/**
 * Defines the root layout of the application
 *
 * Interactive views that are swappable in form of a z-stack, with
 * drawers on left and right side.
 * @returns JSX Element
 */
function Frame(props: FrameProps) {
  const location = useLocation();
  const L = useMediaQuery('(min-width:1280px)');

  const userTheme = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).theme);
  const leftDrawer = useSelector((state: ApplicationState) => (state.session as SessionState).showNavigationPane);
  const rightDrawer = useSelector((state: ApplicationState) => (state.session as SessionState).showOptionsPane);
  const showPlayer = useSelector((state: ApplicationState) => (state.session as SessionState).showPlayer);
  const showUploader = useSelector((state: ApplicationState) => (state.session as SessionState).showUploader);
  const currentFolder = useSelector((state: ApplicationState) => (state.session as SessionState).currentFolder);
  const dispatch = useDispatch();

  const [droppedFiles, setDroppedFiles] = useState([]);
  const onDrop = useCallback((accepted) => {
    setDroppedFiles(accepted);
    dispatch(sessionActions.setUploader(true));
  }, [dispatch]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true, noKeyboard: true });

  const [firstTime, setFirstTime] = useState(!window.localStorage.getItem('first_time'));

  return (
    <Box>
      <div {...getRootProps({ className: 'global-dropzone' })}>
        <input {...getInputProps()} />
        <Drawer
          sx={{
            width: 250,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 250,
              boxSizing: 'border-box',
              height: (theme) => (!L ? '100vh' : `calc(100vh - (${theme.mixins.toolbar.minHeight}px + 9px))`),
              boxShadow: !L || userTheme === 'material' ? 'initial' : 'none',
              background: (theme) => ((!L || !leftDrawer || userTheme === 'material') ? theme.palette.background.paper : 'transparent'),
            },
          }}
          variant={!L ? 'temporary' : 'persistent'}
          open={leftDrawer}
          onClose={() => dispatch(sessionActions.setNavigationPane(false))}
        >
          {props.leftDrawerContent}
        </Drawer>

        <Box sx={{
          transition: (theme) => theme.transitions.create(['all']),
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '100%',
          opacity: showPlayer ? 1 : 0.08,
          filter: !showPlayer ? 'blur(20px)' : 'initial',
          pointerEvents: !showPlayer ? 'none' : 'initial',
          marginRight: rightDrawer && L ? `${DRAWER_WIDTH}px` : 0,
        }}
        >
          {props.backContent}
        </Box>
        <Fade in={!showPlayer} timeout={200}>
          <Box sx={{ marginLeft: leftDrawer && L ? `${250}px` : 0, marginRight: rightDrawer && L ? `${DRAWER_WIDTH}px` : 0 }}>{props.frontContent}</Box>
        </Fade>
        <Drawer
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              height: (theme) => ((location.pathname.startsWith('/watch') || !L) ? '100vh' : `calc(100vh - (${theme.mixins.toolbar.minHeight}px + 9px))`),
              boxShadow: 'none',
            },
          }}
          variant={!L ? 'temporary' : 'persistent'}
          anchor="right"
          open={rightDrawer}
          onClose={() => dispatch(sessionActions.setOptionsPane(false))}
        >
          {props.rightDrawerContent}
        </Drawer>
        <ControlBar />
        <Backdrop open={isDragActive} sx={{ zIndex: 10000 }}>
          <Typography variant="h6">Drop the file(s) in here to upload them</Typography>
        </Backdrop>
        <Uploader
          inFolder={currentFolder || undefined}
          open={showUploader}
          close={() => {
            dispatch(sessionActions.setUploader(false));
          }}
          droppedFiles={droppedFiles}
        />
      </div>
    </Box>
  );
}

export default Frame;
