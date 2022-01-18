import { Slider, Theme } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';

export default styled(Slider)<{ muted: boolean }>(({ theme, muted }) => ({
  maxWidth: theme.spacing(50),
  flex: 1,
  transition: (theme as Theme).transitions.create(['all']),
  marginRight: theme.spacing(1),
  ...(muted && {
    maxWidth: '0 !important',
    opacity: '0 !important',
    flex: '0 !important',
    margin: '0 !important',
    padding: '0 !important',
    pointerEvents: 'none',
  }),
}));
