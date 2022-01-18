import { Theme, Tooltip } from '@mui/material';
import { withStyles } from '@mui/styles';
import { AuthorModel, FileModel } from './models';

export const DRAWER_WIDTH = 350;

export const PUBLIC_CHANNELS = ['Anime', 'Software', 'Shitposts', 'Misc', 'Politics', 'Music'];

export const mediaExt = [
  'WEBM', 'MP4', 'MOV', 'M4A', 'AVI', 'MP3', 'WAV', 'AAC', 'OGG', 'FLAC',
];
export const audioExt = [
  'MP3', 'WAV', 'AAC', 'OGG', 'FLAC',
];
export const imgExt = [
  'JPG', 'BMP', 'GIF', 'PNG', 'JPEG', 'WEBP',
];
export const viewable = [...imgExt, ...mediaExt];
export const checkFile = (extArray: Array<string>, file: FileModel | null) => (file ? extArray.includes(file.fileURL.split('.')[file.fileURL.split('.').length - 1].toUpperCase()) : false);

export const truncate = (str: string, len = 10) => (str.length > len ? `${str.substring(0, len)}...` : str);

export const getExt = (str: string) => str.split('.')[str.split('.').length - 1].toUpperCase();

export const displayFilename = (str: string) => str.split('.')[0].replace('files/', '').replaceAll('-', ' ').replaceAll('.', ' ').replaceAll('_', ' ')
  .replaceAll('(', ' (')
  .replaceAll(')', ') ');

export const normalise = (value: number, min: number, max: number) => ((value - min) * 100) / (max - min);

export const displayPathname = (str: string) => {
  switch (str) {
    case '/privacy':
      return 'Terms of Service';
    case '/about':
      return `About ${process.env.REACT_APP_NAME}`;
    case '/special':
      return 'O.O';
    case '/updates':
      return 'Updates';
    default:
      if (str.startsWith('/watch')) {
        return 'Stream';
      }
      return str;
  }
};

export const getAllTags = (files: FileModel[]) => {
  const catches = files.filter((x) => x.tags !== null).map((x) => x.tags).filter((value, index, self) => self.indexOf(value) === index)
    .filter((x) => x !== null);
  const tags: string[] = [];
  for (let i = 0; i < catches.length; i += 1) {
    const t = catches[i].split(',');
    for (let j = 0; j < t.length; j += 1) {
      if (!tags.includes(t[j])) {
        tags.push(t[j]);
      }
    }
  }
  return tags;
};

export enum LogType {
    // eslint-disable-next-line no-unused-vars
    INFO,
    // eslint-disable-next-line no-unused-vars
    ERROR,
    // eslint-disable-next-line no-unused-vars
    DEBUG
}

export function log(message: unknown, type: LogType) {
  switch (type) {
    case LogType.INFO:
      // eslint-disable-next-line no-console
      console.log(`[DOKI] ${message}`);
      break;
    case LogType.ERROR:
      // eslint-disable-next-line no-console
      console.error(`[DOKI] ${message}`);
      break;
    case LogType.DEBUG:
      // eslint-disable-next-line no-console
      console.debug(`[DOKI] ${message}`);
      break;
    default:
      break;
  }
}

export const retrieveAuthorInfo = async (id: number): Promise<AuthorModel> => {
  try {
    const res = await fetch(`api/names/${id}`);
    const json = await res.json() as AuthorModel;
    return json;
  } catch (error) {
    log(error, LogType.ERROR);
    return { name: 'Anonymous', creationDate: 0, authorId: '0' };
  }
};

export const LightTooltip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
  },
}))(Tooltip);

export const readURL = (file: File) => new Promise((res, rej) => {
  const reader = new FileReader();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reader.onload = (e) => res((e.target as any).result);
  reader.onerror = (e) => rej(e);
  reader.readAsText(file);
});

const shadowKeyUmbraOpacity = 0.2;
const shadowKeyPenumbraOpacity = 0.14;
const shadowAmbientShadowOpacity = 0.12;

export function createShadow(...px: number[]) {
  return [
    `${px[0] + 4}px ${px[1] + 2}px 0px rgba(0,0,0,${shadowKeyUmbraOpacity})`,
    `${px[4] + 2}px ${px[5] + 2}px 0px rgba(0,0,0,${shadowKeyPenumbraOpacity})`,
    `${px[8]}px ${px[9]}px 0px rgba(0,0,0,${shadowAmbientShadowOpacity})`,
  ].join(',');
}

// TODO: Function for getting MD5 hash of a file and checking it up to hash databases for illegal content.
// eslint-disable-next-line no-unused-vars
export const safeCheck = async (file: File) => {
    interface SafeCheck {
        csam: boolean;
        nsfw: boolean;
        error: Response | null;
    }
    const checks: SafeCheck = {
      csam: false,
      nsfw: false,
      error: null,
    };
    try {
      // eslint-disable-next-line no-unused-vars
      const md5 = null; // Find a way to get hash value of file
      checks.csam = await fetch('some government database').then((r) => r.json());
      checks.nsfw = await fetch('local nsfw repository').then((r) => r.json());
    } catch (e: unknown) {
      if (process.env.NODE_ENV === 'development') log({ e }, LogType.ERROR);
      checks.error = e as Response;
    }
    return checks;
};
