import React, { CSSProperties } from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Fade,
  Stack,
  Theme,
  Toolbar,
  Typography,
} from '@mui/material';
import createStyles from '@mui/styles/createStyles';
import makeStyles from '@mui/styles/makeStyles';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { FolderOutlined, People, ThumbUp } from '@mui/icons-material';
import Space from '../elements/Space';
import { FileModel } from '../../../data/models';
import { ApplicationState } from '../../../store';
import { FileServiceState } from '../../../store/FileService';
import { displayFilename, getExt, truncate } from '../../../data/utils';
import { PreferencesState } from '../../../store/Preferences';
import { SessionState } from '../../../store/Session';

interface IDokiCubeProps {
    file: FileModel | null;
    onClick: ((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) | undefined;
    style: CSSProperties;
    textStyle?: CSSProperties;
    showFileName?: boolean;
    className?: string;
    onContextMenu?: ((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void) | undefined;
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  ripple: {
    color: theme.palette.primary.main,
  },
}));

export default function DokiCube({
  file = null,
  onClick,
  style,
  textStyle,
  showFileName = false,
  className,
  onContextMenu,
}: IDokiCubeProps) {
  const id = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).id);
  const scale = useSelector((state: ApplicationState) => (state.session as SessionState).gridScale);
  const prepareNewFile = useSelector((state: ApplicationState) => (state.files as FileServiceState).preparingNewFile);
  const [loaded, setLoaded] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const classes = useStyles();
  const imgExt = [
    'JPG', 'JPE', 'BMP', 'GIF', 'PNG', 'JPEG', 'WEBP',
  ];
  const vidExt = [
    'WEBM', 'MP4', 'MOV', 'M4A', 'AVI',
  ];
  const onLoad = () => {
    setLoaded(true);
  };
  if (file) {
    const mediaCheck = (imgExt.includes(getExt(file.fileURL)) || vidExt.includes(getExt(file.fileURL)));
    return (
      <Card
        sx={{
          display: 'inline-flex',
          flexFlow: 'column wrap',
          transition: (theme) => theme.transitions.create(['all']),
          animation: 'fadein 0.3s ease',
          height: scale >= 7 && hover ? '250px !important' : undefined,
          width: scale >= 7 && hover ? '250px !important' : undefined,
          zIndex: hover ? 20 : undefined,
        }}
        style={style}
        className={className}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => { setHover(false); }}
      >
        <CardActionArea
          sx={{
            flex: 1, display: 'inline-flex', flexFlow: 'column wrap', position: 'relative', transition: (theme) => theme.transitions.create(['all']),
          }}
          onClick={onClick}
          onContextMenu={onContextMenu}
          TouchRippleProps={{
            classes: {
              ripple: classes.ripple,
            },
          }}
        >
          <Toolbar
            variant="dense"
            disableGutters
            sx={{
              padding: 1, position: 'absolute', top: 0, width: '100%', zIndex: 4,
            }}
          >
            <Chip icon={<People />} sx={{ fontSize: 10, backgroundColor: 'rgba(0,0,0,.35)' }} size="small" label={`${file.views}`} />
            <Chip icon={<ThumbUp />} sx={{ fontSize: 10, marginLeft: 1, backgroundColor: 'rgba(0,0,0,.35)' }} size="small" label={`${file.likes}`} />
            <Space />
            {file.folder && <Chip icon={<FolderOutlined />} sx={{ fontSize: 10, backgroundColor: 'rgba(0,0,0,.35)' }} size="small" label={file.folder} />}
          </Toolbar>
          {!mediaCheck
            ? (
              <Stack sx={{
                minHeight: hover ? style.height as number / 1.85 : scale >= 7 ? style.height as number : style.height as number / 1.2, transition: (theme) => theme.transitions.create(['all']), width: '100%', background: (theme) => theme.palette.primary.main, display: 'inline-flex',
              }}
              >
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.contrastText', margin: 'auto' }}>{getExt(file.fileURL)}</Typography>
              </Stack>
            )
            : (
              <>
                {((vidExt.includes(getExt(file.fileURL)) && !file.nsfw) && (
                <Fade in={hover}>
                  <video
                    muted
                    autoPlay
                    loop
                    onLoad={onLoad}
                    style={{
                      backgroundImage: `url(${file.thumbnail})`,
                      backgroundSize: 'cover',
                      position: 'absolute',
                      width: '100%',
                      zIndex: 3,
                      pointerEvents: 'none',
                      top: 0,
                      left: 0,
                      objectFit: 'cover',
                      height: style.height as number / 1.85,
                    }}
                    onTimeUpdate={(e) => {
                      if (e.currentTarget.currentTime > 1.0) { e.currentTarget.currentTime = 0.0; }
                    }}
                    src={file.fileURL}
                  />
                </Fade>
                ))}
                <CardMedia
                  component="img"
                  onLoad={onLoad}
                  src={file.thumbnail.includes('.gif') ? `${file.thumbnail}&format=jpg` : file.thumbnail}
                  height={style.height as number / 1.85}
                  sx={{
                    minHeight: hover ? style.height as number / 1.85 : scale >= 7 ? style.height as number : style.height as number / 1.2,
                    filter: ((hover && (vidExt.includes(getExt(file.fileURL)))) || file.nsfw) ? 'blur(20px)' : 'none',
                    objectFit: 'cover',
                    width: '100%',
                    transition: (theme) => theme.transitions.create(['all']),
                    backgroundImage: `url(${file.thumbnail})`,
                    backgroundSize: 'cover',
                    pointerEvents: 'none',
                  }}
                  alt={file.title || displayFilename(file.fileURL)}
                />
              </>
            )}
          <CardContent sx={{ padding: (theme) => theme.spacing(0, 1), width: '100%', transition: (theme) => theme.transitions.create(['all']) }}>
            <Stack>
              <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(1, 0) }}>
                <Chip sx={{ fontSize: 10 }} size="small" label={getExt(file.fileURL)} />
                <Typography variant="caption" sx={{ fontSize: 10, marginLeft: 1 }}>
                  {(file.size / 1e3 / 1e3).toFixed(2)}
                  {' '}
                  MB
                </Typography>
                <Space />
                {file.nsfw && (
                <Chip
                  sx={{
                    fontSize: 10, marginRight: 1, backgroundColor: 'error.main', color: 'white',
                  }}
                  size="small"
                  label="NSFW"
                />
                )}
                {/* eslint-disable-next-line eqeqeq */}
                {id == file.author.authorId && (<Chip sx={{ fontSize: 10, backgroundColor: 'primary.main', color: 'primary.contrastText' }} size="small" label="Yours" />)}
              </Toolbar>
              <Typography
                sx={{
                  fontWeight: 600,
                }}
                gutterBottom
              >
                {file.title ? truncate(file.title, scale < 5 ? 60 : 20) : truncate(displayFilename(file.fileURL), scale < 5 ? 60 : 20)}
              </Typography>
              <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(1, 0) }}>
                <Typography
                  variant="caption"
                >
                  {moment(file.unixTime * 1e3).fromNow()}

                </Typography>
                <Space />
                {file.folder && <Chip sx={{ fontSize: 10 }} size="small" label={file.author.name} />}
              </Toolbar>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }
  return <Box />;
}
