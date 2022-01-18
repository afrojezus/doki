import { styled } from '@mui/system';
import React from 'react';

export default styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 2),
  // necessary for content to be below app bar
  ...(theme.mixins as any).toolbar,
  justifyContent: 'flex-start',
}));
