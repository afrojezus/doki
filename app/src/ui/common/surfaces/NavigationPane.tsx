import React, { useEffect, useState } from 'react';
import {
  Box, Button, ButtonBase, Divider, List, ListItem, ListItemText, ListSubheader, Stack, Theme, Toolbar, Typography,
} from '@mui/material';
import { Link as RouterLink, useHistory, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import { ApplicationState } from '../../../store';
import { FileServiceState } from '../../../store/FileService';
import { SessionState } from '../../../store/Session';
import Space from '../elements/Space';
import { getAllTags, getExt } from '../../../data/utils';
import { PreferencesState } from '../../../store/Preferences';

function NavigationPane() {
  const location = useLocation();
  const history = useHistory();

  const userTheme = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).theme);
  const files = useSelector((state: ApplicationState) => (state.files as FileServiceState).files);
  const currentFolder = useSelector((state: ApplicationState) => (state.session as SessionState).currentFolder);
  const currentTag = useSelector((state: ApplicationState) => (state.session as SessionState).currentTag);

  const [folders, setFolders] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    if (files.length !== 0) {
      setFolders(files.filter((x) => x.folder !== null).map((x) => x.folder).filter((value, index, self) => self.indexOf(value) === index).filter((x) => x !== null));
      setTags(getAllTags(files));
      setTypes(files.map((x) => getExt(x.fileURL)).filter((value, index, self) => self.indexOf(value) === index).filter((x) => x !== null));
    }
  }, [files]);

  return (
    <Stack sx={{
      height: '100%', overflow: 'auto',
    }}
    >
      <ButtonBase
        onClick={() => history.push('/browse')}
        component={Toolbar}
        disableGutters
        variant="dense"
        sx={{
          padding: (theme) => theme.spacing(0, 2),
          width: '100%',
          background: 'transparent',
          justifyContent: 'initial',
          minHeight: (theme) => ((userTheme === 'material') ? theme.mixins.toolbar.minHeight : 46),
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: "'doublewide', sans-serif", lineHeight: 'normal', marginRight: (theme) => theme.spacing(4), fontWeight: 700,
          }}
        >
          {process.env.REACT_APP_NAME}
        </Typography>
        <Space />
        {process.env.REACT_APP_TYPE === 'PUBLIC' && (
        <Typography
          variant="caption"
        >
          Public test 2
        </Typography>
        )}
      </ButtonBase>
      <Divider />
      <Toolbar variant="dense" disableGutters>
        {currentFolder
          ? (
            <Typography
              sx={{ margin: (theme) => theme.spacing(0, 2) }}
              variant="caption"
            >
              {([...files].filter((x) => x.folder === currentFolder).reduce((a, b) => a + b.size, 0) / 1e3 / 1e3).toFixed(2)}
              {' '}
              MB
              used in this channel
            </Typography>
          ) : (
            <Typography
              sx={{ margin: (theme) => theme.spacing(0, 2) }}
              variant="caption"
            >
              {([...files].reduce((a, b) => a + b.size, 0) / 1e3 / 1e3 / 1e3).toFixed(2)}
              {' '}
              GB
              space used
              on the server
            </Typography>
          )}
      </Toolbar>
      <Divider />
      <List dense sx={{ padding: 0 }} subheader={<ListSubheader>Channels</ListSubheader>}>
        {folders.sort((a, b) => (b.toLowerCase() > a.toLowerCase() ? -1 : 0)).map((e) => (
          <ListItem
            sx={{
              '&.Mui-selected': {
                background: (theme) => theme.palette.primary.main,
                color: 'primary.contrastText',
              },
            }}
            onClick={() => history.push(`/browse?f=${e}`)}
            button
            key={e}
            divider
            selected={currentFolder === e}
          >
            <ListItemText primary={`${e.includes('.') ? e.split('.').join('/') : e} (${[...files].filter((x) => x.folder === e).length})`} />
          </ListItem>
        ))}
      </List>
      <List dense sx={{ padding: 0 }} subheader={<ListSubheader>Tags</ListSubheader>}>
        {tags.sort((a, b) => (b.toLowerCase() > a.toLowerCase() ? -1 : 0)).map((e) => (
          <ListItem
            sx={{
              '&.Mui-selected': {
                background: (theme) => theme.palette.primary.main,
                color: 'primary.contrastText',
              },
            }}
            onClick={() => history.push(`/browse?t=${e}`)}
            button
            key={e}
            divider
            selected={currentTag === e}
          >
            <ListItemText primary={`${e} (${[...files].filter((x) => x.tags && x.tags.includes(e)).length})`} />
          </ListItem>
        ))}
      </List>
      <List dense sx={{ flex: 1, padding: 0 }} subheader={<ListSubheader>File types</ListSubheader>}>
        {types.sort((a, b) => (b.toLowerCase() > a.toLowerCase() ? -1 : 0)).map((e) => (
          <ListItem
            sx={{
              '&.Mui-selected': {
                background: (theme) => theme.palette.primary.main,
                color: 'primary.contrastText',
              },
            }}
            onClick={() => history.push(`/browse?type=${e}`)}
            button
            key={e}
            divider
            selected={new URLSearchParams(location.search).get('type') === e}
          >
            <ListItemText primary={`${e} (${[...files].filter((x) => getExt(x.fileURL) === e).length})`} />
          </ListItem>
        ))}
      </List>
      <Space />
      <Box sx={{ margin: (theme) => theme.spacing(2) }}>
        <Button sx={{ fontWeight: 600, textDecoration: 'none', color: 'text.secondary' }} component={RouterLink} to="/special">
          o.o
        </Button>
        <Button
          sx={{
            textTransform: 'capitalize', fontWeight: 600, textDecoration: 'none', color: 'text.secondary',
          }}
          component={RouterLink}
          to="/privacy"
        >
          Terms of Service
        </Button>
        <Button
          sx={{
            textTransform: 'capitalize', fontWeight: 600, textDecoration: 'none', color: 'text.secondary',
          }}
          component={RouterLink}
          to="/updates"
        >
          Updates
        </Button>
        <Button
          sx={{
            textTransform: 'capitalize', fontWeight: 600, textDecoration: 'none', color: 'text.secondary',
          }}
          component={RouterLink}
          to="/about"
        >
          About
          {' '}
          {process.env.REACT_APP_NAME}
        </Button>
      </Box>
    </Stack>
  );
}

export default NavigationPane;
