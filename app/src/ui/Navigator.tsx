﻿import * as React from 'react';
import { ReactNode, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  alpha,
  AppBar,
  Button,
  Checkbox,
  Chip,
  Divider,
  Fade,
  IconButton,
  Menu,
  MenuItem,
  Slider,
  Theme,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import {
  ArrowBack, MenuOutlined, RefreshTwoTone, SortTwoTone,
} from '@mui/icons-material';
import { ApplicationState } from '../store';
import { FileModel } from '../data/models';
import { sessionActions, SessionState } from '../store/Session';
import { actionCreators, PreferencesState } from '../store/Preferences';
import LightTooltip from './common/elements/LightTooltip';
import GridView from './common/components/GridView';
import { actionCreators as fileActions, FileServiceState } from '../store/FileService';
import { displayPathname, DRAWER_WIDTH } from '../data/utils';

const useStyles = makeStyles((theme: Theme) => createStyles({
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    background: theme.palette.primary.dark,
  },
  imgItemBar: {
    margin: 0,
    background: 'transparent',
  },
  imgItemBarTitle: {
    fontSize: '0.75em',
    background: 'rgba(0,0,0,.7)',
    paddingLeft: theme.spacing(1),
  },
  imgItemBarSubtitle: {
    fontSize: '0.7em',
    background: 'rgba(0,0,0,.7)',
    padding: theme.spacing(1),
  },
  imgItemBarWrap: {
    margin: theme.spacing(1),
  },
  folderIcon: {
    position: 'absolute',
    bottom: theme.spacing(0.5),
    right: theme.spacing(0.5),
    opacity: 0.3,
    color: theme.palette.mode === 'dark' ? 'black' : theme.palette.text.primary,
  },
  fab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      bottom: theme.spacing(8),
    },
  },
  dropzone: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    transition: theme.transitions.create(['all']),
    marginTop: -((theme.mixins.toolbar.minHeight as number) + theme.spacing(1)),
  },
  dropzoneActive: {
    backgroundColor: theme.palette.secondary.main,
    opacity: 0.5,
    zIndex: 1000,
  },
  uploadIndication: {
    top: '50%',
    left: '50%',
    transform: 'translateX(-50%) translateY(-50%)',
    position: 'absolute',
    textAlign: 'center',
    zIndex: 5000,
    color: 'rgba(255,255,255,0.85)',
    opacity: 0,
    pointerEvents: 'none',
  },
  uploadIndicationVisible: {
    opacity: 1,
  },
  imageListContainer: {
    display: 'flex',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
  imageList: {
    flex: 1,
    overflow: 'scroll',
  },
  container: {
    [theme.breakpoints.down('lg')]: {
      paddingBottom: theme.spacing(8),
    },
  },
  fileGrid: {
    marginTop: 16,
    marginBottom: 16,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gridAutoFlow: 'dense',
    gap: '20px 1px',
    [theme.breakpoints.down('md')]: {
      gap: '4px 1px',
      gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
    },
  },
  transparentAppBar: {
    background: 'transparent',
    transition: theme.transitions.create(['all']),
    boxShadow: 'none',
    willChange: 'auto',
    borderBottom: '1px solid rgba(255,255,255,0.5)',
  },
  hideAppBar: {
    height: 0,
    opacity: 0,
    top: -48,
  },
  title: {
    margin: theme.spacing(0, 2),
    marginLeft: 0,
    textTransform: 'initial',
    fontSize: theme.typography.h6.fontSize,
    transition: theme.transitions.create(['all']),
  },
  chevron: {
    animation: 'fadein 0.3s ease',
  },
  folderTitle: {
    margin: theme.spacing(0, 2),
    animation: 'fadein 0.3s ease',
    '& > .MuiButton-label': {
      textTransform: 'initial',
      fontSize: theme.typography.h6.fontSize,
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    margin: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 'auto',
    },
    flex: 1,
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
    fontSize: 14,
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '15ch',
    },
  },
  leftPane: {
    transition: theme.transitions.create(['all']),
    borderRight: `1px solid ${theme.palette.primary.dark}`,
    borderBottom: `1px solid ${theme.palette.primary.dark}`,
    maxWidth: DRAWER_WIDTH,
  },
  leftPaneNoBorder: {
    borderRight: 'none',
  },
}));

function Browser({ children }: { children: React.PropsWithChildren<ReactNode> }) {
  const location = useLocation();
  const L = useMediaQuery('(min-width:1280px)');
  const history = useHistory();
  const classes = useStyles();
  const userTheme = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).theme);
  const tvMode = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).tvMode);
  const files = useSelector((state: ApplicationState) => (state.files as FileServiceState).files);
  const prefOrder = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).order);
  const id = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).id);

  const isAdmin = useSelector((state: ApplicationState) => (state.session as SessionState).adminPowers);
  const openNavigationPane = useSelector((state: ApplicationState) => (state.session as SessionState).showNavigationPane);

  const lastScale = useSelector((state: ApplicationState) => (state.session as SessionState).gridScale);
  const currentFolder = useSelector((state: ApplicationState) => (state.session as SessionState).currentFolder);
  const currentTag = useSelector((state: ApplicationState) => (state.session as SessionState).currentTag);

  const [orderMode, setOrderMode] = useState(prefOrder);
  const [orderMenuOpen, setOrderMenuOpen] = useState<null | HTMLElement>(null);

  const [type, setType] = useState<string | null>(null);
  const [scale, setScale] = useState(lastScale);
  const [onlyUser, setOnlyUser] = useState(false);

  const [searchVal, setSearchVal] = useState('');
  const [searchRes, setSearchRes] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    const folder = new URLSearchParams(window.location.search).get('f');
    const tag = new URLSearchParams(window.location.search).get('t');
    const t = new URLSearchParams(window.location.search).get('type');
    setType(t);
    dispatch(sessionActions.setCurrentFolder(folder));
    dispatch(sessionActions.setCurrentTag(tag));
  }, [dispatch]);

  useEffect(() => {
    const folder = new URLSearchParams(window.location.search).get('f');
    const tag = new URLSearchParams(window.location.search).get('t');
    const t = new URLSearchParams(window.location.search).get('type');
    setType(t);
    dispatch(sessionActions.setCurrentFolder(folder));
    dispatch(sessionActions.setCurrentTag(tag));
  }, [dispatch, location]);

  useEffect(() => {
    dispatch(sessionActions.setGridScale(scale));
  }, [dispatch, scale]);

  const handleOpenOrderMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOrderMenuOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOrderMenuOpen(null);
  };

  const selectOrderByLikes = () => {
    handleCloseMenu();
    setOrderMode('likes');
    dispatch(actionCreators.setOrder('likes'));
    localStorage.setItem('order', 'likes');
  };

  const selectOrderByViews = () => {
    handleCloseMenu();
    setOrderMode('views');
    dispatch(actionCreators.setOrder('views'));
    localStorage.setItem('order', 'views');
  };

  const selectOrderByTime = () => {
    handleCloseMenu();
    setOrderMode('time');
    dispatch(actionCreators.setOrder('time'));
    localStorage.setItem('order', 'time');
  };

  const selectOrderByName = () => {
    handleCloseMenu();
    setOrderMode('name');
    dispatch(actionCreators.setOrder('name'));
    localStorage.setItem('order', 'name');
  };

  const selectOrderBySize = () => {
    handleCloseMenu();
    setOrderMode('size');
    dispatch(actionCreators.setOrder('size'));
    localStorage.setItem('order', 'size');
  };

  const handleSort = (A: FileModel, B: FileModel): number => {
    switch (orderMode) {
      case 'likes':
        return B.likes - A.likes;
      case 'views':
        return B.views - A.views;
      case 'time':
        return B.unixTime - A.unixTime;
      case 'name': {
        if (A.fileURL < B.fileURL) {
          return -1;
        }
        if (A.fileURL > B.fileURL) {
          return 0;
        }
        return 0;
      }
      case 'size':
        return B.size - A.size;
      default:
        return 0;
    }
  };

  const handleRootFolder = () => {
    history.push('/browse');
  };

  const handleUpFolder = () => {
    if (currentFolder) {
      const folders = currentFolder.split('.');
      if (folders.length === 1) handleRootFolder();
      else if (folders.length === 2) history.push(`/browse?f=${folders[0]}`);
      else history.push(`/browse?f=${`${folders.slice(0, folders.length - 2).join('.')}.${folders[folders.length - 2]}`}`);
    }
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const req = await fetch(`api/all/search/${searchVal}`);
    const result = await req.json();
    setSearchRes(result);
  };

  return (
    <>
      <AppBar
        position="relative"
        color="default"
        sx={{
          background: 'transparent',
          boxShadow: 'none',
          transition: (theme) => theme.transitions.create(['all']),
          willChange: 'auto',
          borderBottom: 'none',
          ...(userTheme === 'material' && {
            background: undefined,
            boxShadow: undefined,
            borderBottom: undefined,
          }),
        }}
      >
        <Toolbar
          disableGutters={userTheme !== 'material'}
          variant={userTheme === 'material' ? 'regular' : 'dense'}
          sx={{
            padding: (theme: Theme) => theme.spacing(0, 2),
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            ...(userTheme === 'material' && {
              padding: undefined,
              borderBottom: undefined,
              minHeight: (theme) => theme.mixins.toolbar.minHeight,
            }),
          }}
        >
          {(!L) && (
          <IconButton onClick={() => dispatch(sessionActions.setNavigationPane(!openNavigationPane))}>
            <MenuOutlined />
          </IconButton>
          )}
          {location.pathname.startsWith('/browse') ? (
            <>
              <Fade in={Boolean(currentFolder)}>
                <IconButton
                  sx={{
                    marginRight: currentFolder ? 1 : -4,
                    transition: (theme) => theme.transitions.create(['all']),
                  }}
                  onClick={handleUpFolder}
                >
                  <ArrowBack />
                </IconButton>
              </Fade>
              {!currentFolder && (
              <Typography variant="h6" className={classes.title}>
                All
                files
                {files.length === 0 && '?'}
              </Typography>
              )}
              {currentFolder && (
              <Typography variant="h6" className={classes.title}>
                {currentFolder.split('.').join('/')}
              </Typography>
              )}
              {currentTag && (
              <>
                <Typography sx={{ marginLeft: 1, marginRight: 1 }} variant="caption">
                  tagged
                </Typography>
                <Chip label={currentTag} />
              </>
              )}
              {type && (
              <>
                <Typography sx={{ marginLeft: 1, marginRight: 1 }} variant="caption">
                  of type
                </Typography>
                <Chip label={type} />
              </>
              )}
            </>
          ) : (
            <>
              <IconButton
                sx={{ marginRight: 1, transition: (theme) => theme.transitions.create(['all']) }}
                onClick={() => history.push('/browse')}
              >
                <ArrowBack />
              </IconButton>
              <Typography variant="h6" className={classes.title}>
                {displayPathname(location.pathname)}
              </Typography>
            </>
          )}
          <div style={{ flex: 1 }} />
          {isAdmin && (
          <Typography sx={{ fontWeight: 600, color: 'error.main' }} variant="caption">
            ADMIN
            MODE
          </Typography>
          )}

          <LightTooltip title="Reload files">
            <IconButton
              sx={{
                marginLeft: 1, marginRight: 1,
              }}
              onClick={() => dispatch(fileActions.requestAllFiles())}
            >
              <RefreshTwoTone />
            </IconButton>
          </LightTooltip>
          {id && (
          <>
            {(L) && <Typography variant="caption">Show only my uploads</Typography>}
            <Checkbox
              sx={{ marginRight: 1 }}
              checked={onlyUser}
              onChange={(e) => setOnlyUser(e.target.checked)}
            />
          </>
          )}
          {(L) && (
          <>
            <Typography variant="caption" sx={{ marginRight: 1 }}>Scale</Typography>
            <Slider
              size="small"
              sx={{ maxWidth: 150 }}
              value={scale}
              step={1}
              marks
              onChange={(e, n) => setScale(n as number)}
              min={2}
              max={12}
            />
          </>
          )}
          <LightTooltip title="Sort files">
            {L ? (
              <Button
                sx={{
                  marginLeft: (theme: Theme) => theme.spacing(1), marginRight: 1,
                }}
                color="inherit"
                onClick={handleOpenOrderMenu}
                startIcon={<SortTwoTone />}
                size="large"
              >
                {orderMode}
              </Button>
            ) : (
              <IconButton
                sx={{ marginRight: 1 }}
                onClick={handleOpenOrderMenu}
              >
                <SortTwoTone />
              </IconButton>
            ) }
          </LightTooltip>
        </Toolbar>
      </AppBar>
      <GridView
        scale={scale}
        currentFolder={currentFolder}
        currentTag={currentTag}
        type={type}
        files={files.sort(handleSort).filter((x) => (onlyUser ? parseInt(x.author.authorId, 10) === parseInt(id, 10) : x))}
      >
        {children}
      </GridView>
      <Menu
        MenuListProps={{ dense: true }}
        id="order-menu"
        anchorEl={orderMenuOpen}
        open={Boolean(orderMenuOpen)}
        onClose={handleCloseMenu}
        PaperProps={{
          style: {
            width: '20ch',
          },
        }}
      >
        <Toolbar
          sx={{ background: (theme) => theme.palette.background.default, padding: (theme) => theme.spacing(0, 2) }}
          variant="dense"
          disableGutters
        >
          <Typography sx={{ fontWeight: 600 }}>Sort files by...</Typography>
        </Toolbar>
        <Divider />
        <MenuItem onClick={selectOrderByViews}>Views</MenuItem>
        <MenuItem onClick={selectOrderByLikes}>Likes</MenuItem>
        <MenuItem onClick={selectOrderByTime}>Time</MenuItem>
        <MenuItem onClick={selectOrderByName}>Name</MenuItem>
        <MenuItem onClick={selectOrderBySize}>Size</MenuItem>
      </Menu>
    </>
  );
}

export default Browser;
