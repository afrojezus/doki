import React, {
  forwardRef, useCallback, useRef, useState,
} from 'react';
import { Box, Paper } from '@mui/material';
import ReactPlayer, { ReactPlayerProps } from 'react-player';
import { useSelector } from 'react-redux';
import { ApplicationState } from '../../../store';
import { FileServiceState } from '../../../store/FileService';
import { FileModel } from '../../../data/models';
import { checkFile, mediaExt } from '../../../data/utils';

type MediaPlayerInterface = ReactPlayerProps

const visualExt = [
  'WEBM', 'MP4', 'MOV', 'M4A', 'AVI',
  'GIF',
];

const audioExt = [
  'MP3', 'WAV', 'AAC', 'OGG', 'FLAC',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MediaPlayer = forwardRef((props: MediaPlayerInterface, ref: any) => {
  const gifVideo = useRef(null);
  const files = useSelector((state: ApplicationState) => (state.files as FileServiceState).files);
  const [music, setMusic] = useState(false);
  // const [duration, setDuration] = useState(0)
  const [gif, setGif] = useState<FileModel | null>(null);
  // const [randomAudio, setRandomAudio] = useState<FileModel | null>(null);

  const findGif = useCallback(() => {
    setGif(files.filter((x) => visualExt.includes(x.fileURL.split('.')[x.fileURL.split('.').length - 1].toUpperCase()))[Math.floor(Math.random() * files.filter((x) => visualExt.includes(x.fileURL.split('.')[x.fileURL.split('.').length - 1].toUpperCase())).length)]);
  }, [files]);

  const handleGifPlaying = () => {
    (gifVideo.current as unknown as HTMLVideoElement).playbackRate = 2.0;
  };
  React.useEffect(() => {
    if (props.url) {
      setMusic(audioExt.includes(props.url && (props.url as string).split('.')[(props.url as string).split('.').length - 1].toUpperCase()));
      // setRandomAudio(files.filter((x) => audioExt.includes(x.fileURL.split('.')[x.fileURL.split('.').length - 1].toUpperCase()))[Math.floor(Math.random() * files.filter((x) => audioExt.includes(x.fileURL.split('.')[x.fileURL.split('.').length - 1].toUpperCase())).length)]);
      findGif();
    }
  }, [files, findGif, props.url]);

  return (
    <Paper
      className={props.className}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
      }}
    >
      <Box className="player-container">
        <ReactPlayer
          ref={ref}
          width="100%"
          height="100%"
          className="player"
          style={props.style}
          controls={false}
          /* eslint-disable-next-line react/jsx-props-no-spreading */
          {...props}
        />
        {music && gif && (// eslint-disable-next-line react/jsx-no-useless-fragment
        <>
          {checkFile(mediaExt, gif) ? <video autoPlay onPlay={handleGifPlaying} muted loop src={gif.fileURL} ref={gifVideo} className="gif" style={{ objectFit: 'cover', opacity: 0.5 }} width="100%" height="100%" /> : <img className="gif" alt="" src={gif.fileURL} style={{ opacity: 1 }} />}
        </>
        )}
      </Box>
    </Paper>
  );
});

export default MediaPlayer;
