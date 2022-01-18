import React, { useCallback, useEffect, useState } from 'react';
import {
  Accordion, AccordionDetails, AccordionSummary,
  Box, Button,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem, ListItemIcon,
  ListItemText, ListSubheader,
  Paper, Stack, Tab, TextField,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  AccountCircleOutlined,
  CommentOutlined, CopyAllTwoTone, DownloadOutlined, ExpandMore, FolderOutlined,
  HourglassFullOutlined, InfoOutlined, Inventory2Outlined, PermMediaOutlined, PlaylistPlayOutlined, PreviewOutlined,
  RefreshTwoTone, Report as ReportIcon,
  SettingsOutlined, ThumbUpOutlined, TimerOutlined,
} from '@mui/icons-material';
import moment from 'moment';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory, useLocation } from 'react-router-dom';
import Commenter from '../components/Commenter';
import { ApplicationState } from '../../../store';
import { actionCreators, FileServiceState } from '../../../store/FileService';
import Settings from '../components/Settings';
import PlaylistThumbnail from '../elements/PlaylistThumbnail';
import { displayFilename, getExt } from '../../../data/utils';
import Report from '../components/Report';
import { SessionState } from '../../../store/Session';
import { PreferencesState } from '../../../store/Preferences';

function Comments() {
  const currentFile = useSelector((state: ApplicationState) => (state.files as FileServiceState).currentFile);
  const comments = useSelector((state: ApplicationState) => (state.files as FileServiceState).comments);
  const dispatch = useDispatch();

  const refreshComments = useCallback(() => {
    if (currentFile) {
      dispatch(actionCreators.requestComments(currentFile.id.toString()));
    }
  }, [currentFile, dispatch]);
  return (
    <>
      <Toolbar
        variant="dense"
        disableGutters
        sx={{
          background: (theme) => theme.palette.background.paper,
        }}
      >
        {currentFile
            && (
            <Commenter file={currentFile.id.toString()} />
            )}
        <div style={{ flex: 1 }} />
        <Tooltip title="Refresh comments">
          <IconButton
            sx={{ marginRight: (theme) => theme.spacing(1) }}
            onClick={refreshComments}
          >
            <RefreshTwoTone />
          </IconButton>
        </Tooltip>
      </Toolbar>
      <Divider />
      <List>
        {comments && comments.length > 0 ? comments.sort((a, b) => b.date - a.date).map((c) => (
          <Paper key={c.id} sx={{ margin: (theme) => theme.spacing(1) }}>
            <ListItem>
              <Tooltip title={moment(c.date * 1e3).fromNow()}>
                <ListItemText
                  primary={c.author.name}
                  secondary={c.content}
                />
              </Tooltip>
            </ListItem>
          </Paper>
        )) : (
          <ListItem>
            <ListItemText style={{ opacity: 0.5 }} primary="O.O No comments!" />
          </ListItem>
        )}
      </List>
    </>
  );
}

function Playlist() {
  const files = useSelector((state: ApplicationState) => (state.files as FileServiceState).files);
  const currentFile = useSelector((state: ApplicationState) => (state.files as FileServiceState).currentFile);
  return (
    <List dense subheader={<ListSubheader>{currentFile && currentFile.folder ? currentFile.folder : 'All files'}</ListSubheader>}>
      {files.length > 0 && files.filter((x) => (currentFile && currentFile.folder ? x.folder === currentFile.folder : x)).map((x) => (
        <ListItem
          button
          dense
          key={x.id}
          component={Link}
          to={`/watch/${x.id}`}
        >
          {x.thumbnail && (
          <PlaylistThumbnail
            src={x.thumbnail}
            alt=""
          />
          )}
          <ListItemText primary={x.title ? x.title : displayFilename(x.fileURL)} secondary={(x.folder !== null ? `${x.folder} ∙ ` : '') + getExt(x.fileURL)} />
        </ListItem>
      ))}
    </List>
  );
}

function FileInfo() {
  const history = useHistory();
  const currentFile = useSelector((state: ApplicationState) => (state.files as FileServiceState).currentFile);
  const [showReport, setShowReport] = useState(false);
  if (currentFile) {
    return (
      <Stack>
        <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(2) }}>
          <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
            {currentFile.title ? currentFile.title : displayFilename(currentFile.fileURL)}
          </Typography>
        </Toolbar>
        {currentFile.description && (
          <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(2), paddingTop: 0 }}>
            <Typography variant="caption" sx={{ flex: 1 }}>
              {currentFile.description}
            </Typography>
          </Toolbar>
        )}
        <Divider />
        <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(2) }}>
          {process.env.REACT_APP_TYPE === 'PUBLIC' && (
          <Button
            sx={{ flex: 1, marginRight: 1 }}
            size="small"
            variant="contained"
            color="error"
            startIcon={<ReportIcon />}
            onClick={() => {
              setShowReport(true);
            }}
          >
            Report
          </Button>
          )}
          <Button
            startIcon={<DownloadOutlined />}
            sx={{ flex: 1 }}
            size="small"
            variant="contained"
            component="a"
            href={`https://${window.location.hostname}/${currentFile.fileURL}`}
            download
          >
            Download
          </Button>
        </Toolbar>
        <Divider />
        <List dense subheader={<ListSubheader>Details</ListSubheader>}>
          <ListItem>
            <ListItemIcon>
              <Inventory2Outlined />
            </ListItemIcon>
            <ListItemText primary={`${(currentFile.size / 1024 / 1024).toFixed(2)} MB`} secondary="Size" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TimerOutlined />
            </ListItemIcon>
            <ListItemText primary={moment(currentFile.unixTime * 1e3).format('DD/MM/YYYY')} secondary="Upload date" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AccountCircleOutlined />
            </ListItemIcon>
            <ListItemText primary={currentFile.author.name} secondary="Uploader" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PreviewOutlined />
            </ListItemIcon>
            <ListItemText primary={currentFile.views} secondary="Views" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <ThumbUpOutlined />
            </ListItemIcon>
            <ListItemText primary={currentFile.likes} secondary="Likes" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FolderOutlined />
            </ListItemIcon>
            <ListItemText primary={currentFile.folder ? currentFile.folder : 'None'} secondary="Channel" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PermMediaOutlined />
            </ListItemIcon>
            <ListItemText primary={getExt(currentFile.fileURL)} secondary="Type" />
          </ListItem>
        </List>
        {currentFile.tags && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="caption">Tags</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {currentFile.tags.split(',').map((e) => (
              <Chip onClick={() => history.push(`/browse?t=${e}`)} key={e} label={e} variant="outlined" />
            ))}
          </AccordionDetails>
        </Accordion>
        )}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="caption">Share</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>Doki link</Typography>
            <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0) }}>
              <TextField
                size="small"
                InputProps={{ style: { fontSize: 12 } }}
                fullWidth
                sx={{ paddingTop: (theme) => theme.spacing(1) }}
                style={{ width: 300 }}
                value={currentFile && `https://${window.location.hostname}/watch/${currentFile.id}`}
              />
              <IconButton
                onClick={() => navigator.clipboard.writeText(`https://${window.location.hostname}/watch/${currentFile.id}`)}
              >
                <CopyAllTwoTone />
              </IconButton>
            </Toolbar>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>Direct link</Typography>
            <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0) }}>
              <TextField
                size="small"
                InputProps={{ style: { fontSize: 12 } }}
                fullWidth
                sx={{ paddingTop: (theme) => theme.spacing(1) }}
                style={{ width: 300 }}
                value={`https://${window.location.hostname}/${currentFile.fileURL}`}
              />
              <IconButton
                onClick={() => navigator.clipboard.writeText(`https://${window.location.hostname}/${currentFile.fileURL}`)}
              >
                <CopyAllTwoTone />
              </IconButton>
            </Toolbar>
          </AccordionDetails>
        </Accordion>
        <Report
          open={showReport}
          close={() => {
            setShowReport(false);
          }}
        />
      </Stack>
    );
  } return <HourglassFullOutlined />;
}

function OptionsPane() {
  const L = useMediaQuery('(min-width:1280px)');
  const location = useLocation();
  const userTheme = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).theme);
  const files = useSelector((state: ApplicationState) => (state.files as FileServiceState).files);
  const currentFile = useSelector((state: ApplicationState) => (state.files as FileServiceState).currentFile);
  const shown = useSelector((state: ApplicationState) => (state.session as SessionState).showOptionsPane);
  const [index, setIndex] = useState(location.pathname.startsWith('/watch') ? '1' : '4');
  const height = (location.pathname.startsWith('/watch') || !L) ? 'calc(100vh - 49px)' : 'calc(100vh - 114px)';

  useEffect(() => {
    if (!shown && location.pathname.startsWith('/watch')) {
      setIndex('1');
    }
  }, [shown, location]);

  return (
    <Box sx={{
      width: '100%',
    }}
    >
      <TabContext value={index}>
        <Box sx={{
          background: (theme) => theme.palette.background.default,
          height: 46,
        }}
        >
          <TabList
            variant="fullWidth"
            onChange={(i: React.SyntheticEvent, n: string) => setIndex(n)}
            sx={{
              '& .MuiTabs-indicator': {
                height: '1px',
                bottom: 1,
              },
            }}
          >
            <Tab icon={<InfoOutlined />} disabled={!currentFile} value="1" />
            <Tab icon={<CommentOutlined />} disabled={!currentFile} value="2" />
            <Tab icon={<PlaylistPlayOutlined />} disabled={files.length === 0} value="3" />
            <Tab icon={<SettingsOutlined />} value="4" />
          </TabList>
        </Box>
        <Divider />
        <TabPanel value="1" sx={{ padding: 0, height, overflow: 'auto' }}>
          <FileInfo />
        </TabPanel>
        <TabPanel value="2" sx={{ padding: 0, height, overflow: 'auto' }}>
          <Comments />
        </TabPanel>
        <TabPanel value="3" sx={{ padding: 0, height, overflow: 'auto' }}>
          <Playlist />
        </TabPanel>
        <TabPanel value="4" sx={{ padding: (theme) => theme.spacing(0, 2), height, overflow: 'auto' }}>
          <Settings />
        </TabPanel>
      </TabContext>
    </Box>
  );
}

export default OptionsPane;
