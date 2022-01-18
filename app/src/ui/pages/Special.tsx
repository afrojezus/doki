import React from 'react';
import { Typography } from '@mui/material';

function Special() {
  return (
    <Typography
      variant="h1"
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontWeight: 700,
        position: 'absolute',
        fontSize: '1em',
        opacity: 0,
        animation: 'fuck ease 30s',
      }}
    >
      o.o
    </Typography>
  );
}

export default Special;
