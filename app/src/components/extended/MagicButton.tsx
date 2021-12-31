import {ButtonBase, CircularProgress, IconButton, styled, Theme, Typography} from "@mui/material"
import {
  ArrowBack as BackIcon,
  AppsOutlined as AllFilesIcon, Tv, FileCopy
} from "@mui/icons-material"
import React from "react"

interface IMagicButton {
  showFiles: boolean;
  checkFile: boolean;
  onClick?: () => void;
  theme?: Theme;
  loading?: boolean | undefined;
}

const MButtonContainer = styled(IconButton)<IMagicButton>(({ theme, showFiles, checkFile }) => ({
  borderRadius: theme.shape.borderRadius,
  paddingLeft: theme.spacing(1),
}))

const MSpinner = styled(CircularProgress)<{ loading: boolean | undefined }>(({ theme, loading }) => ({
  margin: theme.spacing(1),
  width: 18,
  transition: theme.transitions.create(["all"]),
  ...(!loading ? {
    maxWidth: "0 !important",
    opacity: "0 !important",
    flex: "0 !important",
    margin: "0 !important",
    padding: "0 !important",
    pointerEvents: "none"
  }: {})
}))

const MUniqueIcon = styled("div")(({ theme }) => ({
  transition: theme.transitions.create(["all"]),
}))

const MTitle = styled(Typography)<{ loading: boolean | undefined }>(({ theme, loading }) => ({
  fontWeight: 700,
  margin: theme.spacing(0, 1),
  marginTop: 4,
  transition: theme.transitions.create(["all"]),
  fontFamily: "'Josefin Sans', sans-serif",
  ...(loading ? {
    maxWidth: "0 !important",
    opacity: "0 !important",
    flex: "0 !important",
    margin: "0 !important",
    padding: "0 !important",
    pointerEvents: "none"
  } : {})
}))

export default ({ showFiles, checkFile, onClick, loading }: IMagicButton) => (
    <MButtonContainer showFiles={showFiles} checkFile={checkFile} onClick={onClick}><MSpinner loading={loading}
      color="secondary" size="small" />
      <MUniqueIcon className="unique-icon">{showFiles ? <Tv style={{marginTop: 2}} /> : <FileCopy style={{marginTop: 2}} />}</MUniqueIcon>
      {/*<MTitle loading={loading}
        variant='h5'>{process.env.REACT_APP_NAME?.toUpperCase()}</MTitle>*/}</MButtonContainer>
  )
