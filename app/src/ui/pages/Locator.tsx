import React from 'react';
import { useParams } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Box } from '@mui/material';
import { actionCreators, FileServiceState } from '../../store/FileService';
import { ApplicationState } from '../../store';
import { PreferencesState } from '../../store/Preferences';
import { sessionActions } from '../../store/Session';

const mediaExt = [
  'WEBM', 'MP4', 'MOV', 'M4A', 'AVI', 'MP3', 'WAV', 'AAC', 'OGG', 'FLAC',
];

function TriggerRoute() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const history = useHistory();
  const files = useSelector((state: ApplicationState) => (state.files as FileServiceState).files);
  const watchFilter = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).watchFilter);

  const randomVideo = React.useCallback(() => {
    const videos = files.filter((x) => !watchFilter.includes(x.folder)).filter((x) => mediaExt.includes(x.fileURL.split('.')[x.fileURL.split('.').length - 1].toUpperCase()));
    const newFile = videos[Math.floor(Math.random() * videos.length)];
    history.push(`/watch/${newFile.id}`);
  }, [files, history, watchFilter]);

  React.useEffect(() => {
    if (files.length > 0) {
      if (id) {
        dispatch(actionCreators.requestFile(id));
        dispatch(sessionActions.setNavigationPane(false));
        dispatch(actionCreators.requestComments(id));
      } else if (files.filter((x) => mediaExt.includes(x.fileURL.split('.')[x.fileURL.split('.').length - 1].toUpperCase())).length > 0) {
        randomVideo();
        dispatch(sessionActions.setNavigationPane(false));
      } else {
        history.push('/browse');
      }
    }
  }, [dispatch, files, history, id, randomVideo]);
  return <Box />;
}

export default TriggerRoute;
