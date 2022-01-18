/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Alert, Box, Container, Fade, Slide, SlideProps, Snackbar, Theme, Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { ErrorOutlineSharp } from '@mui/icons-material';
import { actionCreators, FileServiceState } from '../store/FileService';
import { ApplicationState } from '../store';
import Player from './pages/Stream';
import { PreferencesState } from '../store/Preferences';
import Snow from './common/components/Snow';
import Frame from './common/surfaces/Frame';
import Browser from './Navigator';
import NavigationPane from './common/surfaces/NavigationPane';
import OptionsPane from './common/surfaces/OptionsPane';
import { log, LogType } from '../data/utils';

type TransitionProps = Omit<SlideProps, 'direction'>

function TransitionDown(props: TransitionProps) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Slide {...props} direction="down" />;
}

class RuntimeContainer extends React.Component<unknown, { error: Error | null }> {
  constructor(props: unknown) {
    super(props);
    this.state = {
      error: null,
    };
  }

  public componentDidCatch(error: Error) {
    log(error, LogType.ERROR);
    this.setState({ error });
  }

  public render() {
    if (this.state.error) {
      return (
        <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', flexFlow: 'column wrap' }}>
          <Fade in>
            <Box sx={{ margin: 'auto', display: 'inline-flex', flexFlow: 'column wrap' }}>
              <ErrorOutlineSharp sx={{ color: 'error.main', marginBottom: 2, fontSize: 72 }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Oh no! Something crashed!
              </Typography>
              <Typography sx={{ marginBottom: 2 }} variant="caption">
                Try refreshing the page
              </Typography>
              <Typography variant="caption">
                TECHNICAL DETAILS
              </Typography>
              <Box sx={{
                width: '100%', color: 'error.main', display: 'inline-flex', flexFlow: 'column wrap',
              }}
              >
                <code>
                  {this.state.error.name}
                  {': '}
                  {this.state.error.message}
                </code>
                <code>
                  {this.state.error.stack}
                </code>
              </Box>
            </Box>
          </Fade>
        </Container>
      );
    }
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{this.props.children}</>;
  }
}

export default function Root({ children }: React.PropsWithChildren<any>) {
  const success = useSelector((state: ApplicationState) => (state.files as FileServiceState).success);
  const type = useSelector((state: ApplicationState) => (state.files as FileServiceState).responseType);
  const currentFile = useSelector((state: ApplicationState) => (state.files as FileServiceState).currentFile as any);
  const isUploading = useSelector((state: ApplicationState) => (state.files as FileServiceState).isUploading);
  const prefChange = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).lastChange);
  const tvMode = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).tvMode);
  const snow = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).snow);
  const dispatch = useDispatch();
  const [snackOpen, setSnackOpen] = React.useState<boolean>(false);
  const [snackMessage, setSnackMessage] = React.useState<string>('');
  const [snackType, setSnackType] = React.useState<'info' | 'error' | 'success' | 'warning' | undefined>('info');
  const [loading, setLoading] = useState(true);
  const [showTitle, setShowTitle] = useState(true);

  React.useEffect(() => {
    dispatch(actionCreators.requestAllFiles());
  }, [dispatch]);

  const handleSnackClose = () => {
    setSnackOpen(false);
  };

  React.useEffect(() => {
    // eslint-disable-next-line default-case
    switch (type) {
      case 'REQUEST_FILES':
        setSnackMessage('Fetching files...');
        setSnackType('info');
        setSnackOpen(true);
        // After the intro animation, inform the user the client is currently loading.
        break;
      case 'SEND_FILE':
        if (currentFile != null) {
          if (currentFile.errors) {
            setSnackMessage(currentFile.errors[''][0]);
            setSnackType('error');
          }
        }
        if (!isUploading) {
          setSnackMessage('Finished uploading!');
          setSnackType('success');
        }
        setSnackOpen(true);
        break;
      case 'RECEIVE_FILES':
        setSnackMessage('Received all files');
        setSnackType('success');
        setSnackOpen(true);
        setShowTitle(false);
        setLoading(false);
        break;
      case 'DELETE_FILE':
        setSnackMessage('File deleted!');
        setSnackType('success');
        setSnackOpen(true);
        break;
      case 'WILL_UPLOAD':
        setSnackMessage('Uploading...');
        setSnackType('info');
        setSnackOpen(true);
        break;
    }
  }, [currentFile, isUploading, success, type]);

  React.useEffect(() => {
    // eslint-disable-next-line default-case
    switch (prefChange) {
      case 'PREF_TV_MODE_CHANGE':
        setSnackMessage(tvMode ? 'Changed to TV mode' : 'Changed to default mode');
        setSnackType('info');
        setSnackOpen(true);
        break;
      case 'PREF_ID_CHANGE':
        setSnackMessage('Registered new Doki ID');
        setSnackType('info');
        setSnackOpen(true);
        break;
    }
  }, [prefChange, tvMode]);

  return (
    <RuntimeContainer>
      {snow && <Snow />}
      <Fade in={showTitle}>
        <Box sx={{
          position: 'fixed',
          width: '100%',
          height: '100vh',
          zIndex: -1,
          opacity: 1,
          transition: (theme: Theme) => theme.transitions.create(['all']),
        }}
        >
          <Typography
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: (theme) => `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              backgroundClip: 'text',
              backgroundSize: '400% 100%',
              color: 'transparent',
              animation: 'rainbow_animation 11s ease-in-out infinite',
              fontWeight: 700,
              fontSize: '3em',
              fontFamily: 'doublewide, sans-serif',
              transition: (theme: Theme) => theme.transitions.create(['all']),
            }}
            variant="h6"
          >
            {process.env.REACT_APP_NAME?.toUpperCase()}
          </Typography>
        </Box>
      </Fade>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        transition: (theme: Theme) => theme.transitions.create(['all']),
        opacity: 1,
        overflow: 'hidden',
        transform: 'initial',
        ...(loading && {
          opacity: 0,
          transform: 'scale(1.1)',
        }),
      }}
      >
        <Frame
          leftDrawerContent={<NavigationPane />}
          rightDrawerContent={<OptionsPane />}
          backContent={<Player />}
          frontContent={<Browser>{children}</Browser>}
        />
      </Box>
      <Snackbar
        TransitionComponent={TransitionDown}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        open={snackOpen}
        autoHideDuration={6000}
        onClose={handleSnackClose}
      >
        <Alert
          variant="filled"
          onClose={handleSnackClose}
          severity={snackType}
          action={<Box />}
        >
          {snackMessage}
        </Alert>
      </Snackbar>
    </RuntimeContainer>
  );
}
