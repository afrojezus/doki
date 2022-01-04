import {Theme, Typography} from "@mui/material"
import {styled} from "@mui/system"
import React from "react"
import LightTooltip from "./LightTooltip"

export interface IBrandWatermark {
  onMenu?: boolean;
  theme?: Theme;
  onClick?: () => void;
  sx?: any;
}

const BrandTitle = styled(Typography)<IBrandWatermark>(({ theme, onMenu, onClick }) => ({
  fontWeight: 700,
  transition: theme.transitions.create(["all"]),
  fontFamily: "'Josefin Sans', sans-serif",
  position: "fixed",
  cursor: "pointer",
  top: theme.spacing(8),
  right: theme.spacing(8),
  opacity: 0.25,
  "&:hover": {
    opacity: 0.6
  },
  ...(onMenu && {
    opacity: "1 !important",
  }),
  [theme.breakpoints.down("md")]: {
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
}))

export default ({ onMenu, onClick, sx }: IBrandWatermark) =>
  <>
    <LightTooltip title={!onMenu ? "Main menu" : "Return to video"}>
    <BrandTitle onMenu={onMenu} sx={sx} onClick={onClick}
      variant="h4">{process.env.REACT_APP_NAME}</BrandTitle>
    </LightTooltip>
  </>