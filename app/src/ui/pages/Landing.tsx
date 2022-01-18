import React from 'react';
import { createStyles, makeStyles } from '@mui/styles';
import {
  Container, Link, Theme, Toolbar, Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import clsx from 'clsx';

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    transition: theme.transitions.create(['all']),
    opacity: 1,
    transform: 'initial',
  },
  title: {
    color: theme.palette.text.primary,
  },
  subtitle: {
    color: theme.palette.text.secondary,
  },
  text: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1),
  },
  button: {
    margin: theme.spacing(1),
  },
  menuButton: {
    marginLeft: theme.spacing(1),
  },
  space: {
    flexGrow: 1,
  },
  progress: {
    margin: theme.spacing(1),
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    maxHeight: 600,
    width: 500,
    overflow: 'auto',
  },
  divider: {
    height: 36,
  },
  bar: {
    transition: theme.transitions.create(['all']),
  },
  noBar: {
    boxShadow: 'none',
    marginTop: theme.spacing(-8),
    position: 'relative',
  },
  scroll: {
    margin: theme.spacing(0, 4),
    color: theme.palette.text.secondary,
  },
  scrollContainer: {
    width: 'calc(100% - 700px)',
  },
  bottomBar: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    transition: theme.transitions.create(['all']),
  },
  noBottomBar: {
    marginBottom: theme.spacing(-8),
  },
  fill: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  cool: {
    fontWeight: 700,
    fontSize: '7em',
    fontFamily: 'doublewide, sans-serif',
    transition: theme.transitions.create(['all']),
  },
  rainbowBig: {
    background: 'linear-gradient(to right, #6666ff33, #0099ff33 , #00ff0033, #ff339933, #6666ff33)',
    animation: 'rainbow_animation 20s ease-in-out infinite',
    backgroundSize: '400% 100%',
    position: 'sticky',
    width: '100%',
    height: '100vh',
    borderRadius: 24,
    transform: 'scale(.85)',
    zIndex: -1,
    transition: theme.transitions.create(['all']),
  },
  rainbow: {
    background: 'linear-gradient(to right, #6666ff, #0099ff , #00ff00, #ff3399, #6666ff)',
    '-webkit-background-clip': 'text',
    backgroundClip: 'text',
    color: 'transparent',
    animation: 'rainbow_animation 2s ease-in-out infinite',
    backgroundSize: '400% 100%',
    opacity: '1 !important',
    whiteSpace: 'nowrap',
    lineHeight: 'normal',
    textShadow: '5px 5px 0 rgba(0,0,0,1)',
    transition: theme.transitions.create(['all']),
  },
  hidden: {
    opacity: 0,
    transform: 'scale(.85)',
    borderRadius: 24,
    background: theme.palette.background.paper,
    overflow: 'hidden',
  },
  expand: {
    background: 'rgba(0, 0, 0, 0)',
  },
}));

function Landing() {
  const classes = useStyles();
  return (
    <Container maxWidth="lg" style={{ paddingBottom: 64, animation: 'fadein 0.3s ease' }}>
      <Box my={4}>
        <Typography
          className={clsx(classes.cool)}
          variant="h6"
        >
          {process.env.REACT_APP_NAME?.toUpperCase()}
        </Typography>
        <br />
        <Typography variant="h4" gutterBottom style={{ fontFamily: 'doublewide', fontWeight: 700 }}>
          THE FILE HOSTING PLATFORM FOR THE VIEWERS
        </Typography>
        <br />
        <Typography>
          User-generated content streamer with the ability of basic file sharing functionality.
          <br />
          Designed to be adjusted to a providers need, using commonly used frameworks and tools.
          <br />
          <br />
          Made with love from tokumei.
        </Typography>
        <Toolbar disableGutters>
          <Link href="https://github.com/tokumei-gr/doki">GitHub</Link>
          <div style={{ flex: 0.1 }} />
          <Link href="https://twitter.com/dokiwebsite">Twitter</Link>
        </Toolbar>
      </Box>
    </Container>
  );
}

export default Landing;
