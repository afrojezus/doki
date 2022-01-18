import React, { memo } from 'react';
import Cookies from 'js-cookie';
import { useDispatch, useSelector } from 'react-redux';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Divider, Grid,
  List,
  Paper, Slide,
  Stack,
  Switch,
  TextField,
  Theme,
  Toolbar,
  Typography,
} from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import Dropzone from 'react-dropzone';
import { ExpandMore, UploadFile } from '@mui/icons-material';
import clsx from 'clsx';
import { TransitionProps } from '@mui/material/transitions';
import { actionCreators as pref } from '../../../store/Preferences';
import {
  audioExt, imgExt, log, LogType, truncate, viewable, displayFilename, getExt, PUBLIC_CHANNELS,
} from '../../../data/utils';
import { actionCreators as fileS, FileServiceState } from '../../../store/FileService';
import { ApplicationState } from '../../../store';
import Window from '../surfaces/Window';
import Space from '../elements/Space';

const useStyles = makeStyles((theme: Theme) => createStyles({
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
  folderHintLabel: {
    color: theme.palette.text.disabled,
  },
  uploadStack: {
    transition: theme.transitions.create(['all']),
  },
  hiddenStack: {
    maxHeight: 0,
    opacity: 0,
  },
}));

export interface UploaderProps {
    open: boolean;
    close: () => void;
    droppedFiles?: File[];
    inFolder?: string;
}

const Transition = React.forwardRef((
  props: TransitionProps & {
        children: React.ReactElement;
    },
  ref: React.Ref<unknown>,
) =>
// eslint-disable-next-line react/jsx-props-no-spreading,implicit-arrow-linebreak
  <Slide direction="up" ref={ref} {...props} />);

const Previewer = memo(({ src }: { src: File }) => (
  <Box sx={{
    width: '100%', height: '100%', maxHeight: 720, display: 'inline-flex',
  }}
  >
    {viewable.includes(getExt(src.name)) ? (
    // eslint-disable-next-line react/jsx-no-useless-fragment
      <>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        {audioExt.includes(getExt(src.name)) ? <audio controls src={URL.createObjectURL(src)} />
          : imgExt.includes(getExt(src.name)) ? (
            <img
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: 1,
              }}
              src={URL.createObjectURL(src)}
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
              src={URL.createObjectURL(src)}
            />
          )}
      </>
    ) : <Typography sx={{ fontWeight: 600, margin: 'auto' }}>This is a binary file</Typography>}
  </Box>
));
export default function Uploader({
  open, close, droppedFiles = [], inFolder,
}: UploaderProps) {
  const classes = useStyles();
  const serverFiles = useSelector((state: ApplicationState) => (state.files as FileServiceState).files);
  const success = useSelector((state: ApplicationState) => (state.files as FileServiceState).success);
  const isLoading = useSelector((state: ApplicationState) => (state.files as FileServiceState).isUploading);
  const dispatch = useDispatch();
  const [files, setFiles] = React.useState<File[]>([]);

  // Attributes

  const [titles, setTitles] = React.useState<string[]>([]);

  const [descs, setDescs] = React.useState<string[]>([]);

  const [folder, setFolder] = React.useState(inFolder || '');
  const [folders, setFolders] = React.useState<string[]>([]);

  const [notSafe, setNotSafe] = React.useState('0');
  const [notSafeOnes, setNotSafeOnes] = React.useState<string[]>([]);
  const [tmpNSFW, setTmpNSFW] = React.useState<string>('0');

  const [tags, setTags] = React.useState<string[]>([]);

  const createIdentification = (): string => {
    const newId = Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER / 1e8));
    return serverFiles && serverFiles.length > 0 && serverFiles.map((x) => Number.parseInt(x.author.authorId, 10) === newId) ? Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER / 1e8)).toString() : newId.toString();
  };

  React.useEffect(() => {
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
    }
  }, [droppedFiles]);

  const onSubmit = () => {
    if (files.length > 0) {
      let i = Cookies.get('DokiIdentification');
      if (i === undefined) {
        i = createIdentification();
      }
      log(i, LogType.DEBUG);
      const formData = new FormData();
      for (let k = 0; k < files.length; k += 1) {
        formData.append('file', files[k]);
        formData.append('folder', folders[k] ? folders[k] : folder === '' ? getExt(files[k].name) : folder);
        formData.append('NSFW', notSafeOnes[k] ? notSafeOnes[k] : notSafe);
        formData.append('tags', tags[k] ? tags[k].split(',').map((x) => x.trim()).join(',') : ' ');
        formData.append('title', titles[k] ? titles[k].trim() : ' ');
        formData.append('description', descs[k]);
      }
      formData.append('id', i);
      dispatch(fileS.senFileModel(formData));
      if (Cookies.get('DokiIdentification') === undefined) {
        Cookies.set('DokiIdentification', i);
      }
      dispatch(pref.setID(i));
      setFiles([]);
    }
  };

  React.useEffect(() => setFolder(inFolder as string), [inFolder]);

  React.useEffect(() => {
    close();
    // Don't really bother.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  return (
    <Window
      open={open}
      onClose={close}
      title="Upload"
      fullScreen
      TransitionComponent={Transition}
      toolbarRight={(
        <Button
          sx={{ margin: 1 }}
          variant="contained"
          color="primary"
          onClick={onSubmit}
          disabled={files.length === 0}
        >
          Upload
          {files.length > 1 && ' All'}
        </Button>
            )}
    >
      <Grid container spacing={4}>
        <Grid item xs>
          <Box className={clsx(classes.uploadStack, isLoading && classes.hiddenStack)}>
            <Dropzone onDrop={(acceptedFiles: File[]) => setFiles(acceptedFiles)}>
              {({ getRootProps, getInputProps }) => (
                <section>
                  {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                  <div {...getRootProps()}>
                    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                    <input {...getInputProps()} />
                    <Paper sx={{
                      height: files.length !== 0 ? 58 : 150,
                      width: '100%',
                      padding: (theme) => theme.spacing(2),
                      cursor: 'pointer',
                      transition: (theme) => theme.transitions.create(['all']),
                      display: 'inline-flex',
                      flexDirection: files.length !== 0 ? 'row' : 'column',
                    }}
                    >
                      <Typography sx={{
                        textAlign: files.length !== 0 ? undefined : 'center',
                        flex: files.length !== 0 ? 1 : undefined,
                      }}
                      >
                        {files.length !== 0 ? 'Drag a new set of files here' : 'Drag files in here to upload, or click to bring up the file picker'}
                      </Typography>
                      <UploadFile
                        fontSize={files.length !== 0 ? undefined : 'large'}
                        style={{
                          textAlign: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                          flex: files.length !== 0 ? undefined : 1,
                          margin: files.length !== 0 ? undefined : 'auto',
                        }}
                      />
                    </Paper>
                  </div>
                </section>
              )}
            </Dropzone>
            {files.length !== 0 && (
            <Box>
              <Toolbar disableGutters>
                <Typography sx={{ flex: 1 }}>
                  {files.length}
                  {' '}
                  file
                  {files.length > 1 ? 's' : undefined}
                  {' '}
                  added
                </Typography>
                <Typography variant="caption">
                  Are all these files explicit?
                </Typography>
                <Checkbox
                  onChange={(e) => setNotSafe(e.target.checked ? '1' : '0')}
                  value={notSafe}
                />
                <Autocomplete
                  size="small"
                  sx={{ minWidth: 250 }}
                  freeSolo={process.env.REACT_APP_TYPE === 'PRIVATE'}
                  options={process.env.REACT_APP_TYPE === 'PUBLIC' ? PUBLIC_CHANNELS.map((v) => v) : [...serverFiles.map((x) => x.folder).filter((value, index, self) => self.indexOf(value) === index).filter((x) => x !== null)].map((v) => v)}
                  renderInput={(params) => (
                    <TextField
                        // eslint-disable-next-line react/jsx-props-no-spreading
                      {...params}
                      label="Channel for all these files"
                    />
                  )}
                  onChange={(e, v) => setFolder(v || '')}
                />
              </Toolbar>
              <List dense sx={{ maxHeight: 'calc(100vh - 350px)', overflow: 'auto' }}>
                {files.map((f: File, i: number) => (
                  <Accordion key={f.name} TransitionProps={{ unmountOnExit: true }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography
                        sx={{ flex: 1 }}
                      >
                        {titles[i] ? titles[i] : truncate(displayFilename(f.name), 20)}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', flex: 1 }}>
                        {'Size: '}
                        {(f.size / 1e3 / 1e3).toFixed(2)}
                        {' MB '}
                      </Typography>
                      <Typography sx={{ color: 'text.primary', flex: 1 }}>
                        {(notSafe === '1' || notSafeOnes[i] === '1') ? 'NSFW' : ''}
                      </Typography>
                      <Typography sx={{ color: 'text.primary', flex: 1 }}>
                        {folders[i]}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>
                        {f.type}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ position: 'relative', padding: 0 }}>
                      <Toolbar
                        variant="dense"
                        disableGutters
                        sx={{ padding: (theme) => theme.spacing(1) }}
                      >
                        <Grid container spacing={1}>
                          <Grid item xs>
                            <TextField
                              fullWidth
                              size="small"
                              label="Title"
                              placeholder={displayFilename(f.name)}
                              value={titles[i]}
                              onChange={(e) => setTitles(() => ({
                                ...titles,
                                [i]: e.target.value,
                              }))}
                            />
                          </Grid>
                          <Grid item xs={4}>
                            <Autocomplete
                              size="small"
                              fullWidth
                              freeSolo={process.env.REACT_APP_TYPE === 'PRIVATE'}
                              options={process.env.REACT_APP_TYPE === 'PUBLIC' ? PUBLIC_CHANNELS.map((v) => v) : [...serverFiles.map((x) => x.folder).filter((value, index, self) => self.indexOf(value) === index).filter((x) => x !== null)].map((v) => v)}
                              value={folders[i]}
                              renderInput={(params) => (
                                <TextField
                                    // eslint-disable-next-line react/jsx-props-no-spreading
                                  {...params}
                                  label="Channel"
                                />
                              )}
                              onChange={(e, v) => setFolders(() => ({
                                ...folders,
                                [i]: v || '',
                              }))}
                            />
                          </Grid>
                        </Grid>
                      </Toolbar>
                      <Divider />
                      <Grid container>
                        <Grid item xs sx={{ position: 'relative', background: 'black' }}>
                          <Previewer src={f} />
                        </Grid>
                        <Grid item xs={4} sx={{ padding: 2 }}>
                          <Stack spacing={1} sx={{ height: '100%' }}>
                            <TextField
                              size="small"
                              label="Description"
                              placeholder="Enter a description for the file here."
                              multiline
                              value={descs[i]}
                              onChange={(e) => setDescs(() => ({
                                ...descs,
                                [i]: e.target.value,
                              }))}
                            />
                            <TextField
                              size="small"
                              label="Tags"
                              placeholder="Enter any tags you want to associate this file with here. Seperated by comma."
                              multiline
                              value={tags[i]}
                              onChange={(e) => setTags(() => ({
                                ...tags,
                                [i]: e.target.value,
                              }))}
                            />
                            <Toolbar variant="dense" disableGutters>
                              <Typography variant="caption">
                                Mark as not safe for work?
                              </Typography>
                              <Space />
                              <Switch
                                onChange={(e) => setNotSafeOnes((_nsfws) => ({
                                  ..._nsfws,
                                  [i]: e.target.checked ? '1' : '0',
                                }))}
                                value={notSafeOnes[i]}
                              />
                            </Toolbar>
                            <Space />
                            <Button
                              onClick={() => setFiles(files.filter((k) => k.name !== f.name))}
                              variant="contained"
                              color="error"
                            >
                              Delete
                            </Button>
                          </Stack>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </List>
            </Box>
            )}
          </Box>
        </Grid>
        <Grid item xs={3}>
          <Stack spacing={1}>
            <Typography gutterBottom>
              By uploading, you agree to having an identifiable profile on the server tied to your
              uploads. 5 GB size limit.
            </Typography>
            <Divider sx={{ paddingTop: 1 }} />
            <Typography variant="h6">
              Upload terms
            </Typography>
            <Typography variant="caption" gutterBottom>
              NSFW content must be marked as NSFW. NSFW content without this mark will be removed.
              <br />
              <br />
              Gore and related violent content is not tolerated and will be removed if found.
              <br />
              <br />
              Content revealing abuse of minors of any form is not tolerated and will be removed.
              <br />
              <br />
              If not specified, the content must adhere to Dutch law.
            </Typography>
            <Divider sx={{ paddingTop: 1 }} />
            <Typography variant="h6">
              Channels and tags
            </Typography>
            <Typography variant="caption">
              Channels define the topic of your file, think of it as a folder.
              <br />
              Any file without a specified channel will be marked by the file type to make it easily
              locatable on the server.
              <br />
              <br />
              We encourage the use of tags when uploading. Tags are helpful in finding files faster.
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Window>
  );
}
