/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Slider,
  Switch,
  Theme,
  Toolbar,
  Typography,
} from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import { useDispatch, useSelector } from 'react-redux';
import Cookies from 'js-cookie';
import moment from 'moment';
import { styled } from '@mui/material/styles';
import { ApplicationState } from '../../../store';
import { sessionActions, SessionState } from '../../../store/Session';
import { actionCreators, PreferencesState } from '../../../store/Preferences';
import { actionCreators as fileActions, FileServiceState } from '../../../store/FileService';
import { AuthorModel } from '../../../data/models';
import {
  getAllTags, getExt, LightTooltip, PUBLIC_CHANNELS, readURL, retrieveAuthorInfo,
} from '../../../data/utils';

const Input = styled('input')({
  display: 'none',
});

const useStyles = makeStyles((theme: Theme) => createStyles({
  formControl: {
    margin: theme.spacing(1, 0),
    minWidth: 300,
    width: '100%',
    marginTop: theme.spacing(2),
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  heading: {
    marginBottom: theme.spacing(1),
  },
  previewChip: {
    minWidth: 160,
    maxWidth: 210,
  },
  folderInput: {
    marginTop: theme.spacing(1),
    width: '100%',
    padding: theme.spacing(1, 2),
  },
  folderLabel: {
    marginTop: theme.spacing(2),
  },
}));

function Settings() {
  const classes = useStyles();
  const files = useSelector((state: ApplicationState) => (state.files as FileServiceState).files);
  const lastTheme = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).theme);
  const lastFont = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).font);
  const colorScheme = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).colorScheme);
  const prevWatchFilter = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).watchFilter);
  const prevTagFilter = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).tagFilter);
  const prevTypeFilter = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).typeFilter);
  const hasSnow = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).snow);
  const hasBorderRadius = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).borderRadius);
  const id = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).id);
  const isAdmin = useSelector((state: ApplicationState) => (state.session as SessionState).adminPowers);
  const continuous = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).continuous);
  const dispatch = useDispatch();
  const [theme, setTheme] = useState<string>(lastTheme);
  const [font, setFont] = useState<string>(lastFont);
  const [color, setColor] = useState<string>(colorScheme);
  const [watchFilter, setWatchFilter] = useState<string[]>(prevWatchFilter);
  const [tagFilter, setTagFilter] = useState<string[]>(prevTagFilter);
  const [typeFilter, setTypeFilter] = useState<string[]>(prevTypeFilter);
  const [snow, setSnow] = useState(hasSnow);
  const [raytracing, setRaytracing] = useState(false);
  const [br, setBr] = useState(hasBorderRadius);
  const [admin, setAdmin] = useState(isAdmin);

  // User management
  const [user, setUser] = React.useState<AuthorModel>({ name: 'Anonymous', creationDate: 0, authorId: '0' });
  const [loadingUser, setLoadingUser] = React.useState(true);

  const [tmpImport, setTmpImport] = React.useState<FileList | null>(null);
  const [deleteDialog, setDeleteDialog] = React.useState(false);

  const fetchUser = async (_id: string) => {
    setLoadingUser(true);
    const u = await retrieveAuthorInfo(parseInt(_id, 10));
    setUser(u);
    setLoadingUser(false);
  };

  React.useEffect(() => {
    const i = Cookies.get('DokiIdentification');
    if (i) {
      fetchUser(i);
    }
  }, []);

  React.useEffect(() => {
    if (id) {
      fetchUser(id);
    }
  }, [id]);

  const handleColor = (event: SelectChangeEvent) => {
    setColor(event.target.value as string);
  };
  const handleSnow = (event: any) => setSnow(event.target.checked);
  const handleRaytracing = (event: any) => setRaytracing(event.target.checked);
  const handleRemoveFilter = (e: string) => setWatchFilter(watchFilter.filter((x) => x !== e));
  const handleContinuous = (event: any) => dispatch(actionCreators.setContinuous(event.target.checked as boolean));
  const handleBR = (event: Event, value: number | number[]) => setBr(value as number);

  const handleAdmin = (event: any) => setAdmin(event.target.checked);
  React.useEffect(() => {
    dispatch(actionCreators.setTheme(theme));
  }, [theme, dispatch]);
  React.useEffect(() => {
    dispatch(actionCreators.setFont(font));
  }, [font, dispatch]);
  React.useEffect(() => {
    localStorage.setItem('color_scheme', color);
    dispatch(actionCreators.setColorScheme(color));
  }, [color, dispatch]);
  React.useEffect(() => {
    localStorage.setItem('snow', snow.toString());
    dispatch(actionCreators.setSnowMode(snow));
  }, [dispatch, snow]);
  React.useEffect(() => {
    dispatch(actionCreators.setWatchFilter(watchFilter));
  }, [dispatch, watchFilter]);
  React.useEffect(() => {
    dispatch(actionCreators.setTagFilter(tagFilter));
  }, [dispatch, tagFilter]);
  React.useEffect(() => {
    dispatch(actionCreators.setTypeFilter(typeFilter));
  }, [dispatch, typeFilter]);
  React.useEffect(() => {
    if (raytracing) {
      document.body.style.filter = 'drop-shadow(0 0 10px white)';
    } else {
      document.body.style.filter = 'none';
    }
  }, [raytracing]);
  React.useEffect(() => {
    dispatch(actionCreators.setBorderRadius(br));
  }, [br, dispatch]);
  React.useEffect(() => {
    dispatch(sessionActions.setAdminPowers(admin));
  }, [admin, dispatch]);

  const handleDownloadProfile = () => {
    const profileExport = {
      DokiIdentification: user.authorId,
      watch_filter: window.localStorage.getItem('watch_filter'),
      color_scheme: window.localStorage.getItem('color_scheme'),
      ads: window.localStorage.getItem('ads'),
      light: window.localStorage.getItem('light'),
      order: window.localStorage.getItem('order'),
      playback_volume: window.localStorage.getItem('playback_volume'),
    };
    const profileExportRAW = JSON.stringify(profileExport);
    const a = document.createElement('a');
    a.setAttribute('href', `data:application/json;charset=utf-8,${profileExportRAW}`);
    a.setAttribute('download', 'doki_profile.json');
    a.click();
  };
  const handleImportProfile = async (e: FileList | null) => {
    if (e !== null && e.length > 0) {
      setLoadingUser(true);
      setTmpImport(e);
      const file = await readURL(e.item(0) as File);
      const importDetails = JSON.parse(file as string) as any;
      window.localStorage.setItem('watch_filter', importDetails.watch_filter);
      dispatch(actionCreators.setColorScheme(importDetails.color_scheme));
      dispatch(actionCreators.setAdPreference(importDetails.ads));
      dispatch(actionCreators.setLight(importDetails.light));
      dispatch(actionCreators.setPlaybackVolume(importDetails.playback_volume));
      dispatch(actionCreators.setID(importDetails.DokiIdentification));
      Cookies.set('DokiIdentification', importDetails.DokiIdentification);
      fetchUser(importDetails.DokiIdentification);
      setTmpImport(null);
    }
  };
  const handleProfileDelete = () => {
    setDeleteDialog(false);
    dispatch(fileActions.requestProfileRemoval({ Id: parseInt(user.authorId, 10) }));
    setUser({ name: 'Anonymous', creationDate: 0, authorId: '0' });
    Cookies.remove('DokiIdentification');
  };

  return (
    <List dense>
      <Card sx={{ boxShadow: 'none' }}>
        <CardHeader
          avatar={user.name === 'Anonymous' ? undefined : (
            <Avatar
              sx={{
                // eslint-disable-next-line @typescript-eslint/no-shadow
                fontWeight: 700, bgcolor: (theme) => theme.palette.primary.main, color: 'primary.contrastText',
              }}
              variant="rounded"
            >
              ID
            </Avatar>
          )}
          titleTypographyProps={{ style: { fontSize: 14 } }}
          title={user.name}
          subheader={user.name === 'Anonymous' ? undefined : `Joined ${moment(user.creationDate * 1e3).format('Do MMMM yyyy')}`}
        />
      </Card>
      <ListItemButton
        disabled={user.name === 'Anonymous'}
        color="inherit"
        onClick={handleDownloadProfile}
      >
        <ListItemText primary="Download profile" />
      </ListItemButton>
      <label htmlFor="import-profile">
        {files.length > 0 && <Input id="import-profile" type="file" onChange={(e) => { handleImportProfile(e.target.files as FileList); }} />}
        <ListItemButton color="inherit" disabled={files.length === 0} component="span">
          <ListItemText primary="Import profile" />
        </ListItemButton>
      </label>
      <LightTooltip title="This will delete every file you've uploaded.">
        <ListItemButton onClick={() => setDeleteDialog(true)} disabled={user.name === 'Anonymous'}>
          <ListItemText sx={{ color: 'error.main' }} primary="Delete profile" />
        </ListItemButton>
      </LightTooltip>
      <Toolbar variant="dense" disableGutters sx={{ minHeight: 24, marginTop: 4 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Player
        </Typography>
        <div style={{ flex: 1 }} />
      </Toolbar>
      <Divider />
      <Toolbar variant="dense" disableGutters>
        <Typography variant="caption" gutterBottom>Autoplay new media after the current one has ended</Typography>
        <div style={{ flex: 1 }} />
        <Switch checked={continuous} onChange={handleContinuous} />
      </Toolbar>
      <Toolbar variant="dense" disableGutters sx={{ minHeight: 24, marginTop: 4 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          File management
        </Typography>
        <div style={{ flex: 1 }} />
      </Toolbar>
      <Divider />
      {process.env.REACT_APP_TYPE === 'PRIVATE' && (
      <Toolbar variant="dense" disableGutters>
        <Typography variant="caption" gutterBottom>Administrator mode</Typography>
        <div style={{ flex: 1 }} />
        <Switch checked={admin} onChange={handleAdmin} />
      </Toolbar>
      )}
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel id="filter-label">Hidden channels</InputLabel>
        <Select
          multiple
          labelId="filter-label"
          label="Hidden channels"
          value={watchFilter}
          onChange={(e) => setWatchFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {process.env.REACT_APP_TYPE === 'PUBLIC' ? PUBLIC_CHANNELS.map((v) => <MenuItem value={v} key={v}>{v}</MenuItem>)
            : files && files.length > 0 && files.map((x) => x.folder)
              .filter((value, index, self) => self.indexOf(value) === index)
              .filter((x) => x !== null)
              .map((v) => <MenuItem value={v} key={v}>{v}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel id="filter-label">Hidden tags</InputLabel>
        <Select
          labelId="filter-label"
          label="Hidden tags"
          multiple
          value={tagFilter}
          onChange={(e) => setTagFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {files && files.length > 0 && getAllTags(files)
            .map((v) => <MenuItem value={v} key={v}>{v}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel id="filter-label">Hidden file types</InputLabel>
        <Select
          labelId="filter-label"
          label="Hidden file types"
          multiple
          value={typeFilter}
          onChange={(e) => setTypeFilter(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {files && files.length > 0 && files.map((x) => getExt(x.fileURL))
            .filter((value, index, self) => self.indexOf(value) === index)
            .filter((x) => x !== null)
            .map((v) => <MenuItem value={v} key={v}>{v}</MenuItem>)}
        </Select>
      </FormControl>
      <Toolbar variant="dense" disableGutters sx={{ minHeight: 24, marginTop: 4 }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          UI
        </Typography>
        <div style={{ flex: 1 }} />
      </Toolbar>
      <Divider />
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel id="theme-label">Theme</InputLabel>
        <Select labelId="theme-label" label="Theme" value={theme} onChange={(e) => setTheme(e.target.value as string)}>
          <MenuItem value="edge">Edge (default)</MenuItem>
          <MenuItem value="material">Material</MenuItem>
        </Select>
      </FormControl>
      {lastTheme === 'edge' && (
      <Toolbar variant="dense" disableGutters>
        <Typography variant="caption" gutterBottom>Border radius on the UI</Typography>
        <div style={{ flex: 1 }} />
        <Slider marks sx={{ maxWidth: 100 }} valueLabelDisplay="auto" min={0} max={16} step={1} value={br} onChange={handleBR} />
      </Toolbar>
      )}
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel id="color-label">Color scheme</InputLabel>
        <Select labelId="color-label" label="Color scheme" value={color} onChange={handleColor}>
          <MenuItem value="midori">Green Tea</MenuItem>
          <MenuItem value="umi">Ocean Blue</MenuItem>
          <MenuItem value="aka">Red</MenuItem>
          <MenuItem value="gure">Black & Yellow</MenuItem>
          <MenuItem value="anba">Ubuntu 7.10</MenuItem>
          <MenuItem value="ninomae">Ninomae</MenuItem>
          <MenuItem value="pixel">Pixel Blue</MenuItem>
        </Select>
      </FormControl>
      <FormControl variant="outlined" className={classes.formControl}>
        <InputLabel id="font-label">Font</InputLabel>
        <Select labelId="font-label" label="Font" value={font} onChange={(e) => setFont(e.target.value as string)}>
          <MenuItem value="Inter">Inter (default)</MenuItem>
          <MenuItem value="Roboto">Roboto</MenuItem>
          <MenuItem value="'Be Vietnam Pro'">Be Vietnam Pro</MenuItem>
          <MenuItem value="Outfit">Outfit</MenuItem>
          <MenuItem value="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue'">System</MenuItem>
        </Select>
      </FormControl>
      <Toolbar variant="dense" disableGutters>
        <Typography variant="caption" gutterBottom>Show snow effect</Typography>
        <div style={{ flex: 1 }} />
        <Switch checked={snow} onChange={handleSnow} />
      </Toolbar>
      <Toolbar variant="dense" disableGutters>
        <Typography variant="caption" gutterBottom>Raytracing on the snow</Typography>
        <div style={{ flex: 1 }} />
        <Switch checked={raytracing} disabled={!snow} onChange={handleRaytracing} />
      </Toolbar>
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        {/* eslint-disable-next-line @typescript-eslint/no-shadow */}
        <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0, 2), background: (theme) => theme.palette.background.paper }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 14 }}>Are you sure?</Typography>
          <div style={{ flex: 1 }} />
        </Toolbar>
        <Divider />
        <DialogContent>
          Deleting your profile means deleting all of your files on the server,
          are you sure you want to do that?
        </DialogContent>
        <DialogActions>
          <Button color="secondary" onClick={() => setDeleteDialog(false)}>
            On a second thought...
          </Button>
          <Button color="error" variant="contained" onClick={handleProfileDelete}>
            Yes
          </Button>
        </DialogActions>

      </Dialog>
    </List>
  );
}

export default Settings;
