import * as React from 'react';
import { Route } from 'react-router';
import {
  Color, createTheme, CssBaseline, ThemeProvider, useMediaQuery,
} from '@mui/material';
import {
  amber, blue, green, grey, red, yellow, deepPurple,
} from '@mui/material/colors';
import { useDispatch, useSelector } from 'react-redux';
import Privacy from './pages/Tos';

import '../local/style/animations.css';
import '../local/style/common.css';
import { actionCreators, PreferencesState } from '../store/Preferences';
import Special from './pages/Special';
import Landing from './pages/Landing';
import Browser from './Navigator';
import TriggerRoute from './pages/Locator';
import ErrorRoute from './pages/404';
import { ApplicationState } from '../store';
import Root from './Root';
import Updates from './pages/Updates';
import { createShadow } from '../data/utils';

export default function App() {
  const L = useMediaQuery('(min-width:1280px)');
  const userTheme = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).theme);
  const font = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).font);
  const colorScheme = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).colorScheme);
  const light = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).light);
  const borderRadius = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).borderRadius);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (localStorage.getItem('order') !== null) {
      dispatch(actionCreators.setOrder(localStorage.getItem('order') as string));
    }
  }, [dispatch]);

  const theme = React.useMemo(
    () => {
      let scheme: Color;
      let paperColor: '#424242' | string;
      let bgColor: string;

      switch (colorScheme) {
        case 'midori':
          scheme = green;
          paperColor = '#4e6449';
          bgColor = '#313f2e';
          break;
        case 'umi':
          scheme = blue;
          paperColor = '#495964';
          bgColor = '#232c31';
          break;
        case 'aka':
          scheme = red;
          paperColor = '#644949';
          bgColor = '#312323';
          break;
        case 'gure':
          scheme = yellow;
          paperColor = grey['900'];
          bgColor = '#111';
          break;
        case 'pixel':
          scheme = blue;
          paperColor = grey['800'];
          bgColor = grey['900'];
          break;
        case 'anba':
          scheme = amber;
          paperColor = '#4a4238';
          bgColor = '#3f382e';
          break;
        case 'ninomae':
          scheme = deepPurple;
          paperColor = '#352f43';
          bgColor = '#1e1a26';
          break;
        default:
          scheme = yellow;
          paperColor = grey['900'];
          bgColor = '#111';
          break;
      }

      if (userTheme === 'material') {
        return createTheme({
          palette: {
            // eslint-disable-next-line no-nested-ternary
            mode: 'dark',
            primary: colorScheme ? scheme : grey,
            secondary: grey,
            error: {
              main: red.A400,
            },
          },
          components: {
            MuiSnackbar: {
              styleOverrides: {
                anchorOriginTopRight: {
                  top: '8px !important',
                  right: '8px !important',
                },
              },
            },
          },
          typography: {
            fontFamily: `${font}, sans-serif`,
          },
        });
      }
      return createTheme({
        palette: {
          // eslint-disable-next-line no-nested-ternary
          mode: 'dark',
          primary: colorScheme ? scheme : grey,
          secondary: grey,
          error: {
            main: red.A400,
          },
          background: {
            default: bgColor,
            paper: paperColor,
          },
        },
        shape: { borderRadius },
        shadows: [
          'none',
          createShadow(0, 2, 1, -1, 0, 1, 1, 0, 0, 1, 3, 0),
          createShadow(0, 3, 1, -2, 0, 2, 2, 0, 0, 1, 5, 0),
          createShadow(0, 3, 3, -2, 0, 3, 4, 0, 0, 1, 8, 0),
          createShadow(0, 2, 4, -1, 0, 4, 5, 0, 0, 1, 10, 0),
          createShadow(0, 3, 5, -1, 0, 5, 8, 0, 0, 1, 14, 0),
          createShadow(0, 3, 5, -1, 0, 6, 10, 0, 0, 1, 18, 0),
          createShadow(0, 4, 5, -2, 0, 7, 10, 1, 0, 2, 16, 1),
          createShadow(0, 5, 5, -3, 0, 8, 10, 1, 0, 3, 14, 2),
          createShadow(0, 5, 6, -3, 0, 9, 12, 1, 0, 3, 16, 2),
          createShadow(0, 6, 6, -3, 0, 10, 14, 1, 0, 4, 18, 3),
          createShadow(0, 6, 7, -4, 0, 11, 15, 1, 0, 4, 20, 3),
          createShadow(0, 7, 8, -4, 0, 12, 17, 2, 0, 5, 22, 4),
          createShadow(0, 7, 8, -4, 0, 13, 19, 2, 0, 5, 24, 4),
          createShadow(0, 7, 9, -4, 0, 14, 21, 2, 0, 5, 26, 4),
          createShadow(0, 8, 9, -5, 0, 15, 22, 2, 0, 6, 28, 5),
          createShadow(0, 8, 10, -5, 0, 16, 24, 2, 0, 6, 30, 5),
          createShadow(0, 8, 11, -5, 0, 17, 26, 2, 0, 6, 32, 5),
          createShadow(0, 9, 11, -5, 0, 18, 28, 2, 0, 7, 34, 6),
          createShadow(0, 9, 12, -6, 0, 19, 29, 2, 0, 7, 36, 6),
          createShadow(0, 10, 13, -6, 0, 20, 31, 3, 0, 8, 38, 7),
          createShadow(0, 10, 13, -6, 0, 21, 33, 3, 0, 8, 40, 7),
          createShadow(0, 10, 14, -6, 0, 22, 35, 3, 0, 8, 42, 7),
          createShadow(0, 11, 14, -7, 0, 23, 36, 3, 0, 9, 44, 8),
          createShadow(0, 11, 15, -7, 0, 24, 38, 3, 0, 9, 46, 8),
        ],
        components: {
          MuiAppBar: {
            styleOverrides: {
              root: {
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
              },
              positionSticky: {
                boxShadow: 'none',
              },
              colorPrimary: {
                backgroundColor: bgColor,
              },
              colorDefault: {
                backgroundColor: bgColor,
              },
            },
          },
          MuiToolbar: {
            styleOverrides: {},
          },
          MuiGrid: {
            styleOverrides: {
              item: {
                display: 'inline-flex',
                flexFlow: 'column',
              },
            },
          },
          MuiMenu: {
            styleOverrides: {
              list: {
                paddingTop: 0,
                paddingBottom: 0,
              },
            },
          },
          MuiDivider: {
            styleOverrides: {
              root: {
                marginTop: '0px !important',
                marginBottom: '0px !important',
              },
            },
          },
          MuiListItemText: {
            styleOverrides: {
              inset: {
                paddingLeft: 16,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                border: '1px solid rgba(0,0,0,.12)',
                boxShadow: '8px 8px 0px rgba(0,0,0,.12)',
                // backdropFilter: 'blur(6px)'
              },
            },
          },
          MuiSnackbar: {
            styleOverrides: {
              anchorOriginTopRight: {
                top: '8px !important',
                right: '8px !important',
              },
            },
          },
          MuiFab: {
            styleOverrides: {
              root: {
                borderRadius: 0,
              },
            },
          },
          MuiBackdrop: {
            styleOverrides: {
              root: {
                backdropFilter: !L ? 'none' : 'blur(20px)',
              },
            },
          },
        },
        typography: {
          fontFamily: `${font}, sans-serif`,
        },
      });
    },
    [colorScheme, light, borderRadius, L, userTheme, font],
  );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Root>
        <Route exact path="/" component={TriggerRoute} />
        <Route exact path="/watch/:id" component={TriggerRoute} />
        <Route exact path="/browse" component={Browser} />
        <Route exact path="/about" component={Landing} />
        <Route exact path="/privacy" component={Privacy} />
        <Route exact path="/updates" component={Updates} />
        <Route exact path="/special" component={Special} />
        <Route component={ErrorRoute} />
      </Root>
    </ThemeProvider>
  );
}
