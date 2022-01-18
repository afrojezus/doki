import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  ListSubheader,
  Menu,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Theme,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { areEqual, FixedSizeGrid, GridChildComponentProps } from 'react-window';
import React, { memo, useState } from 'react';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useDispatch, useSelector } from 'react-redux';
import { Switch as SwitchRouter, useHistory, useLocation } from 'react-router-dom';
import { FilePresentOutlined, FolderOutlined, MusicNoteOutlined } from '@mui/icons-material';
import { FileModel } from '../../../data/models';
import DokiCube from './DokiCube';
import { ApplicationState } from '../../../store';
import { SessionState } from '../../../store/Session';
import { PreferencesState } from '../../../store/Preferences';
import { actionCreators, FileServiceState } from '../../../store/FileService';
import {
  audioExt,
  displayFilename,
  DRAWER_WIDTH,
  getExt,
  imgExt,
  PUBLIC_CHANNELS,
  truncate,
  viewable,
} from '../../../data/utils';
import Window from '../surfaces/Window';
import Space from '../elements/Space';

const GUTTER_SIZE = 8;

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    flex: 1,
  },
  leftPane: {
    borderRight: `1px solid ${theme.palette.divider}`,
    boxSizing: 'border-box',
    transition: theme.transitions.create(['all']),
    willChange: 'auto',
    flexDirection: 'column',
    maxWidth: DRAWER_WIDTH,
  },
  leftPaneTV: {
    borderRight: '1px solid rgba(255,255,255,0.5)',
    background: 'transparent',
  },
  listText: {
  },
  grid: {
    paddingBottom: theme.spacing(2),
    overflowX: 'hidden',
  },
  gridItem: {
  },
  expand: {
    zIndex: 100000,
    filter: 'brightness(0%)',
  },
  paneHidden: {
    flex: 0,
    pointerEvents: 'none',
    opacity: 0,
  },
}));

const Previewer = memo(({ src }:{src:FileModel}) => (
  <Box sx={{
    width: '100%', height: '100%', maxHeight: 720, display: 'inline-flex',
  }}
  >
    {viewable.includes(getExt(src.fileURL)) ? (
    // eslint-disable-next-line react/jsx-no-useless-fragment
      <>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        {audioExt.includes(getExt(src.fileURL)) ? <audio controls src={src.fileURL} />
          : imgExt.includes(getExt(src.fileURL)) ? (
            <img
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: 1,
              }}
              src={src.fileURL}
              alt=""
            />
          ) : (
            <video
              controls
              muted
              autoPlay
              loop
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: 1,
              }}
              src={src.fileURL}
            />
          )}
      </>
    ) : <Typography sx={{ fontWeight: 600, margin: 'auto' }}>This is a binary file</Typography>}
  </Box>
));

const renderCell = memo((props: GridChildComponentProps) => {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const id = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).id);
  const files = useSelector((state: ApplicationState) => (state.files as FileServiceState).files);

  const isAdmin = useSelector((state: ApplicationState) => (state.session as SessionState).adminPowers);

  const {
    rowIndex, columnIndex, data, style,
  } = props;
  const item = data[rowIndex][columnIndex] as FileModel;

  const [menu, setMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openChange, setOpenChange] = useState(false);

  const [title, setTitle] = React.useState<string>((item && item.title) || '');
  const [desc, setDesc] = React.useState<string>((item && item.description) || '');
  const [notSafe, setNotSafe] = React.useState((item && item.nsfw) || false);
  const [tags, setTags] = React.useState<string>((item && item.tags) || '');
  const [newFolderName, setNewFolderName] = React.useState((item && item.folder) || '');

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // eslint-disable-next-line eqeqeq
    if (id == item.author.authorId || isAdmin) {
      setMenu(menu === null
        ? {
          mouseX: e.clientX - 2,
          mouseY: e.clientY - 4,
        }
        : null);
    }
  };

  const handleChangeFolder = () => {
    const updateForm = new FormData();
    updateForm.append('id', id);
    updateForm.append('folder', newFolderName);
    updateForm.append('title', title);
    updateForm.append('description', desc);
    updateForm.append('tags', tags ? tags.split(',').map((x) => x.trim()).join(',') : ' ');
    updateForm.append('nsfw', notSafe ? '1' : '0');
    dispatch(actionCreators.updateFile(item.id, updateForm));
    setOpenChange(false);
    setMenu(null);
  };

  const handleDelete = () => {
    const deleteForm = new FormData();
    deleteForm.append('id', id);
    dispatch(actionCreators.deleteFile(item.id, deleteForm));
    setOpenDelete(false);
    setMenu(null);
  };

  return (
    <>
      <DokiCube
        style={{
          ...style,
          left: style.left as number + GUTTER_SIZE,
          top: style.top as number + GUTTER_SIZE,
          width: style.width as number - GUTTER_SIZE,
          height: style.height as number - GUTTER_SIZE,
        }}
        key={`${columnIndex}-${rowIndex}`}
        file={item}
        onClick={() => {
          dispatch(actionCreators.prepareForNewFile());
          history.push(`/watch/${item.id}`);
        }}
        onContextMenu={handleContextMenu}
      />
      <Menu
        MenuListProps={{ dense: true }}
        open={menu !== null}
        anchorReference="anchorPosition"
        anchorPosition={
          menu !== null
            ? { top: menu.mouseY, left: menu.mouseX }
            : undefined
        }
        onClose={() => setMenu(null)}
      >
        <ListSubheader>{item && item.fileURL.replace('files/', '')}</ListSubheader>
        <Divider />
        <MenuItem onClick={() => setOpenChange(true)}>Edit info</MenuItem>
        <MenuItem onClick={() => setOpenDelete(true)}>Delete file</MenuItem>
      </Menu>

      {item && (
      <Dialog open={openDelete} onClose={() => { setOpenDelete(false); setMenu(null); }}>
        <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0, 2), background: (theme) => theme.palette.background.paper }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 14 }}>
            Delete
            {item.fileURL.replace('files/', '')}
            ?
          </Typography>
          <div style={{ flex: 1 }} />
        </Toolbar>
        <Divider />
        <DialogContent>
          <Toolbar variant="dense" disableGutters>
            <div style={{ flex: 1 }} />
            <Button sx={{ marginRight: (theme) => theme.spacing(1) }} color="inherit" onClick={() => { setOpenDelete(false); setMenu(null); }}>
              No
            </Button>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Yes
            </Button>
          </Toolbar>
        </DialogContent>
      </Dialog>
      )}

      {item && (
      <Window
        fullWidth
        maxWidth="xl"
        title="Edit file info"
        open={openChange}
        disabledGutters
        onClose={() => { setOpenChange(false); setMenu(null); }}
        toolbarRight={(
          <>
            <Typography sx={{ marginLeft: 2 }}>{title || item.title || truncate(displayFilename(item.fileURL), 20)}</Typography>
            <Typography sx={{ color: 'text.secondary', marginLeft: 2 }}>
              {'Size: '}
              {(item.size / 1e3 / 1e3).toFixed(2)}
              {' MB '}
            </Typography>
            <Typography sx={{ color: 'text.primary', marginLeft: 2 }}>
              {(notSafe) ? 'NSFW' : 'Not NSFW'}
            </Typography>
            <Typography sx={{ color: 'text.primary', marginLeft: 2 }}>
              {newFolderName}
            </Typography>
            <Typography sx={{ color: 'text.secondary', marginLeft: 2 }}>
              {getExt(item.fileURL)}
            </Typography>
          </>
)}
      >
        <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(1) }}>
          <Grid container spacing={1}>
            <Grid item xs>
              <TextField
                fullWidth
                size="small"
                label="Title"
                placeholder={title || item.title || displayFilename(item.fileURL)}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <Autocomplete
                size="small"
                fullWidth
                freeSolo={process.env.REACT_APP_TYPE === 'PRIVATE'}
                options={process.env.REACT_APP_TYPE === 'PUBLIC' ? PUBLIC_CHANNELS.map((v) => v) : [...files.map((x) => x.folder).filter((value, index, self) => self.indexOf(value) === index).filter((x) => x !== null)].map((v) => v)}
                placeholder={item.folder}
                value={newFolderName}
                      // eslint-disable-next-line react/jsx-props-no-spreading
                renderInput={(params) => <TextField {...params} label="Channel" />}
                onChange={(e, v) => setNewFolderName(v as string)}
              />
            </Grid>
          </Grid>
        </Toolbar>
        <Divider />
        <Grid container>
          <Grid item xs sx={{ position: 'relative', background: 'black' }}>
            <Previewer src={item} />
          </Grid>
          <Grid item xs={4} sx={{ padding: 2 }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <TextField
                size="small"
                label="Description"
                placeholder="Enter a description for the file here."
                multiline
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
              <TextField
                size="small"
                label="Tags"
                placeholder="Enter any tags you want to associate this file with here. Seperated by comma."
                multiline
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
              <Toolbar variant="dense" disableGutters>
                <Typography variant="caption">
                  Mark as not safe for work?
                </Typography>
                <Space />
                <Switch onChange={(e) => setNotSafe(e.target.checked)} checked={notSafe} />
              </Toolbar>
              <Space />
              <Toolbar variant="dense" disableGutters>
                <Space />
                <Button sx={{ marginRight: (theme) => theme.spacing(1) }} color="inherit" onClick={() => { setOpenChange(false); setMenu(null); }}>
                  Cancel
                </Button>
                <Button variant="contained" color="primary" onClick={handleChangeFolder}>
                  Save changes
                </Button>
              </Toolbar>
            </Stack>
          </Grid>
        </Grid>
      </Window>
      )}
    </>
  );
}, areEqual);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toMatrix = (arr: any[], width: number) => arr.reduce((rows: any[], key: any[], index: number) => (index % width === 0 ? rows.push([key])
  : rows[rows.length - 1].push(key)) && rows, []);

function GridView({
  children, files, currentFolder, scale, currentTag, type,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}: { children: React.PropsWithChildren<any>, files: FileModel[], currentFolder: string | null, scale?: number, currentTag: string | null, type: string | null }) {
  const location = useLocation();
  const history = useHistory();
  const watchFilter = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).watchFilter);
  const tagFilter = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).tagFilter);
  const typeFilter = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).typeFilter);
  const userTheme = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).theme);
  const classes = useStyles();

  const [searchVal, setSearchVal] = React.useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [gridifiedFiles, setGridifiedFiles] = React.useState<any[][]>([[]]);
  const gridRef = React.createRef<FixedSizeGrid>();

  const S = useMediaQuery('(min-width:410px)');
  const L = useMediaQuery('(min-width:1280px)');

  const grid = {
    cols: 0,
  };

  let spacing = 6;
  let rowHeight = 300;
  if (!S) {
    grid.cols = 1;
    spacing = 16;
  } else if (!L) {
    grid.cols = 2;
    spacing = 16;
  } else if (scale) {
    grid.cols = scale;
    spacing = scale < 5 ? scale + 10 : scale > 10 ? scale - 10 : scale + 1;
    rowHeight = scale >= 7 ? 150 - scale : 300 - (scale * 4);
  } else {
    grid.cols = 2;
  }

  React.useEffect(() => {
    const handleTagFiltering = (x: FileModel) => {
      if (currentTag) {
        return x.tags.includes(currentTag);
      }
      return x;
    };

    setGridifiedFiles(toMatrix(files
      .filter((x) => (type ? getExt(x.fileURL) === type : !typeFilter.includes(getExt(x.fileURL))))
      .filter((x) => (currentTag ? x.tags : !tagFilter.join(',').includes(x.tags)))
      .filter(handleTagFiltering)
      .filter((x) => (currentFolder ? x.folder === currentFolder : !watchFilter.includes(x.folder)))
      .filter((x) => (searchVal ? x.title ? x.title.match(searchVal) : displayFilename(x.fileURL).match(searchVal) : x)), grid.cols));
  }, [files, currentFolder, rowHeight, grid.cols, watchFilter, type, typeFilter, currentTag, tagFilter, searchVal]);

  /* React.useEffect(() => {
    if (gridRef.current && prepareNewFile) {
      (gridRef.current as FixedSizeGrid).scrollTo({
        scrollLeft: 0,
        scrollTop: 0
      })
    }
  }, [gridRef, prepareNewFile]) */

  return (
    <Stack className={classes.root}>
      <Autocomplete
        autoHighlight
        autoComplete
        clearOnEscape
        getOptionLabel={(option) => option.title || displayFilename(option.fileURL)}
        renderOption={(props, option) => (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <Box component="li" {...props}>
            {option.thumbnail ? (
              <img
                alt={option.title || displayFilename(option.fileURL)}
                src={option.thumbnail}
                loading="lazy"
                width="32"
                height="32"
                style={{ marginRight: 8, objectFit: 'cover' }}
              />
            ) : audioExt.includes(getExt(option.fileURL)) ? <MusicNoteOutlined sx={{ mr: 1 }} /> : <FilePresentOutlined sx={{ mr: 1 }} />}
            <Typography sx={{ flex: 1 }}>{option.title || displayFilename(option.fileURL)}</Typography>
            {option.tags && option.tags.split(',').slice(0, 3).map((x) => <Chip size="small" sx={{ ml: 1 }} label={x} />)}
            {option.folder && <Chip size="small" icon={<FolderOutlined />} sx={{ ml: 1 }} label={option.folder} />}
          </Box>
        )}
        sx={{ padding: 1 }}
        freeSolo
        size="small"
        onChange={(e, v) => setSearchVal(v ? ((v as FileModel).title || displayFilename((v as FileModel).fileURL)) : null)}
        fullWidth
        /* eslint-disable-next-line react/jsx-props-no-spreading */
        renderInput={(params) => <TextField {...params} label={`Search files${currentFolder ? ` in ${currentFolder}` : ''}`} />}
        options={[...files].sort((a, b) => ((a.title || displayFilename(a.fileURL)) < (b.title || displayFilename(b.fileURL)) ? -1 : 0))}
        onFocus={() => (!(currentFolder || currentTag) ? history.push('/browse') : undefined)}
      />
      <Box sx={{ overflowX: 'hidden', overflowY: 'auto', height: userTheme === 'material' ? 'calc(100vh - 176px)' : 'calc(100vh - 166px)' }}>
        {location.pathname.startsWith('/browse') ? files.length === 0 ? (
          <Box sx={{
            top: '50%', left: '50%', transform: 'translate(-50%, -50%)', position: 'absolute', marginBottom: -2,
          }}
          >
            <Typography sx={{ fontWeight: 700, opacity: 0.3, textAlign: 'center' }} variant="h1">
              O.O
            </Typography>
            <Typography variant="h6">
              Oh no! There&apos;s nothing in here! Upload a file to fill the emptiness!
            </Typography>
          </Box>
        )
          : (
            <>
              {Boolean(currentFolder && [...files].filter((x) => x.folder === currentFolder).length > 0 && [...files].filter((x) => x.folder === currentFolder)[0].thumbnail)
              && (
              <img
                alt=""
                src={[...files].filter((x) => x.folder === currentFolder)[0].thumbnail}
                style={{
                  width: '100%',
                  height: '100%',
                  zIndex: -1,
                  position: 'absolute',
                  objectFit: 'cover',
                  opacity: 0.2,
                  animation: 'folder_intro 0.3s ease',
                  filter: 'blur(20px)',
                }}
              />
              )}
              <AutoSizer>
                {({ height, width }) => (
                  <FixedSizeGrid useIsScrolling className={classes.grid} ref={gridRef} height={height} width={width} rowHeight={rowHeight} columnWidth={(width / grid.cols) - spacing} rowCount={gridifiedFiles.length} columnCount={grid.cols} itemData={gridifiedFiles}>
                    {renderCell}
                  </FixedSizeGrid>
                )}
              </AutoSizer>
            </>
          ) : (
            <SwitchRouter>
              {children}
            </SwitchRouter>
        )}
      </Box>
    </Stack>
  );
}

export default GridView;
