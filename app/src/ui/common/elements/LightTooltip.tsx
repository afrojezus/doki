import React from 'react';
import { Theme, Tooltip, TooltipProps } from '@mui/material';
import { styled } from '@mui/system';

interface ILightTooltip extends TooltipProps {
  theme?: Theme
}

export default styled(Tooltip)(({ theme }: ILightTooltip) => ({
  tooltip: {
    backgroundColor: (theme as Theme).palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: (theme as Theme).shadows[1],
    fontSize: 11,
  },
}));
