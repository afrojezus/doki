import { Icon } from '@mui/material';
import { styled } from '@mui/system';
import React from 'react';

export default styled(Icon)(({ theme }) => ({
  margin: theme.spacing(0, 0.5),
  '&:first-child': {
    margin: 0,
  },
  '&:last-child': {
    margin: 0,
  },
}));
