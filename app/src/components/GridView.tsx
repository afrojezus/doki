import {
  Box,
  Button,
  Dialog, DialogContent, DialogContentText, Divider,
  Grid, Grow,
  Link,
  Fade,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper, TextField,
  Theme, Toolbar, Typography,
  useMediaQuery
} from "@mui/material"
import createStyles from "@mui/styles/createStyles"
import makeStyles from "@mui/styles/makeStyles"
import {
  FixedSizeList,
  FixedSizeGrid,
  ListChildComponentProps,
  GridChildComponentProps,
  areEqual,
  GridOnScrollProps
} from "react-window"
import React, { memo, useState } from "react"
import { FileModel } from "../models"
import AutoSizer from "react-virtualized-auto-sizer"
import DokiCube from "./DokiCube"
import { useDispatch, useSelector } from "react-redux"
import { ApplicationState } from "../store"
import { PreferencesState } from "../store/Preferences"
import { useHistory, Link as RouterLink, Route, Switch as SwitchRouter } from "react-router-dom"
import clsx from "clsx"
import { Folder } from "@mui/icons-material"
import Uploader from "./Uploader"
import { actionCreators, FileServiceState } from "../store/FileService"

const GUTTER_SIZE = 8

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    flex: 1
  },
  leftPane: {
    borderRight: `1px solid ${theme.palette.divider}`,
    boxSizing: "border-box",
    transition: theme.transitions.create(["all"]),
    willChange: "auto",
    flexDirection: "column"
  },
  leftPaneTV: {
    borderRight: "1px solid rgba(255,255,255,0.5)",
    background: "transparent"
  },
  listText: {
  },
  grid: {
    willChange: "auto",
    paddingBottom: theme.spacing(2)
  },
  gridItem: {
    willChange: "auto"
  },
  expand: {
    zIndex: 100000,
    filter: "brightness(0%)",
  },
  paneHidden: {
    flex: 0,
    pointerEvents: "none",
    opacity: 0
  }
}))

const renderCell = memo((props: GridChildComponentProps) => {
  const classes = useStyles()
  const history = useHistory()
  const dispatch = useDispatch()
  const id = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).id)

  const { rowIndex, columnIndex, data, style } = props
  const item = data[rowIndex][columnIndex] as FileModel

  const [menu, setMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null)
  const [openDelete, setOpenDelete] = useState(false)
  const [openChange, setOpenChange] = useState(false)

  const [newFolderName, setNewFolderName] = React.useState("")

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (id == item.author.authorId)
      setMenu(menu === null
        ? {
          mouseX: e.clientX - 2,
          mouseY: e.clientY - 4,
        }
        :
        null,
      )
  }

  const handleChangeFolder = () => {
    const updateForm = new FormData()
    updateForm.append("id", id)
    updateForm.append("folder", newFolderName)
    dispatch(actionCreators.updateFile(item.id, updateForm))
    setOpenChange(false)
    setMenu(null)
  }

  const handleDelete = () => {
    const deleteForm = new FormData()
    deleteForm.append("id", id)
    dispatch(actionCreators.deleteFile(item.id, deleteForm))
    setOpenDelete(false)
    setMenu(null)
  }

  return (
    <>
          <DokiCube 
          className={clsx(classes.gridItem)} style={{
            ...style,
            left: style.left as number + GUTTER_SIZE,
            top: style.top as number + GUTTER_SIZE,
            width: style.width as number - GUTTER_SIZE,
            height: style.height as number - GUTTER_SIZE,
          }} key={`${columnIndex}-${rowIndex}`}
            folder={false}
            file={item}
            onClick={() => {
              dispatch(actionCreators.prepareForNewFile())
              history.push(`/watch/${item.id}`)
            }}
            onContextMenu={handleContextMenu}
            folderName={""}
            folderSize={0}
      />
      <Menu MenuListProps={{dense: true}} open={menu !== null}
        anchorReference="anchorPosition"
        anchorPosition={
          menu !== null
            ? { top: menu.mouseY, left: menu.mouseX }
            : undefined
        } onClose={() => setMenu(null)}>
        <Toolbar sx={{ background: (theme) => theme.palette.primary.main }} variant="dense">
          <Typography sx={{ fontWeight: 600, color: "primary.contrastText" }}>{item && item.fileURL.replace("files/", "")}</Typography>
        </Toolbar>
        <Divider />
        <MenuItem onClick={() => setOpenChange(true)}>Change folder</MenuItem>
        <MenuItem onClick={() => setOpenDelete(true)}>Delete file</MenuItem>
      </Menu>

      {item && <Dialog open={openDelete} onClose={() => { setOpenDelete(false); setMenu(null) }}>
        <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0, 2), background: (theme) => theme.palette.background.paper }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 14 }}>Delete {item.fileURL.replace("files/", "")}?</Typography>
          <div style={{ flex: 1 }} />
        </Toolbar>
        <Divider />
        <DialogContent>
          <Toolbar variant="dense" disableGutters>
            <div style={{ flex: 1 }} />
            <Button sx={{ marginRight: (theme) => theme.spacing(1) }} color="inherit" onClick={() => { setOpenDelete(false); setMenu(null) }}>
              No
            </Button>
            <Button variant="contained" color="error" onClick={handleDelete}>
              Yes
            </Button>
          </Toolbar>
        </DialogContent>
      </Dialog>}

      {item && <Dialog open={openChange} onClose={() => { setOpenChange(false); setMenu(null) }}>
        <Toolbar variant="dense" disableGutters sx={{ padding: (theme) => theme.spacing(0, 2), background: (theme) => theme.palette.background.paper }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 14 }}>Change folder</Typography>
          <div style={{ flex: 1 }} />
        </Toolbar>
        <Divider />
        <DialogContent>
          <DialogContentText>
            Type in the folder you want to place this file in
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Folder name"
            fullWidth
            onChange={(v) => setNewFolderName(v.target.value)}
          />
          <Toolbar variant="dense" disableGutters>
            <div style={{ flex: 1 }} />
            <Button sx={{ marginRight: (theme) => theme.spacing(1) }} color="inherit" onClick={() => { setOpenChange(false); setMenu(null) }}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={handleChangeFolder}>
              Accept
            </Button>
          </Toolbar>
        </DialogContent>
      </Dialog>}
    </>
  )
}, areEqual)

const toMatrix = (arr: any[], width: number) =>
  arr.reduce((rows: any[], key: any[], index: number) => (index % width == 0 ? rows.push([key])
    : rows[rows.length - 1].push(key)) && rows, [])

const GridView = ({ children, files, currentFolder, onListClick, onGridClick, scale }: { children: React.PropsWithChildren<any>, files: FileModel[], currentFolder: string | null, onListClick: (item: string) => void, onGridClick: (item: FileModel) => void, scale?: number }) => {
  const watchFilter = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).watchFilter)
  const prepareNewFile = useSelector((state: ApplicationState) => (state.files as FileServiceState).preparingNewFile)
  const tvMode = useSelector((state: ApplicationState) => (state.prefs as PreferencesState).tvMode)
  const classes = useStyles()
  const [showUploader, willShowUploader] = React.useState(false)
  const [droppedFiles, setDroppedFiles] = React.useState<File[]>([])

  const [gridifiedFiles, setGridifiedFiles] = React.useState<any[][]>([[]])
  let gridRef = React.createRef<FixedSizeGrid>()

  function renderRow(props: ListChildComponentProps) {
    const { index, data, style } = props
    const item = data[index] as string
    return (<>
      <ListItem sx={{
        "&.Mui-selected": {
          "background": (theme) => theme.palette.primary.main,
          "color": "primary.contrastText"
        }
      }} onClick={() => onListClick(item)} button style={style} key={index} divider selected={currentFolder === item}>
        {/*<ListItemIcon sx={{color: currentFolder === item ? "primary.contrastText" : undefined}}>
          <Folder />
    </ListItemIcon>*/}
        <ListItemText className={classes.listText} secondary={item.includes(".") ? item.split(".")[0] : undefined} inset={item.includes(".")} primary={item.includes(".") ? item.split(".")[1] : item} />
      </ListItem>
    </>
    )
  }

  const S = useMediaQuery("(min-width:360px)")
  const M = useMediaQuery("(min-width:600px)")
  const L = useMediaQuery("(min-width:1280px)")
  const XL = useMediaQuery("(min-width:1600px)")

  const grid = {
    cols: 0,
  }

  let spacing = 6
  let rowHeight = 300
  if (tvMode) {
    grid.cols = 5
    spacing = 8
  }
  else if (scale) {
    grid.cols = scale
    spacing = scale < 5 ? scale + 10 : scale > 10 ? scale - 10 : scale + 1
    rowHeight = 300 - (scale * 2)
  }
  else if (XL) {
    grid.cols = 5
    spacing = 6
  } else if (L) {
    grid.cols = 5
    spacing = 6
  } else if (M) {
    grid.cols = 4
    spacing = 11
  } else if (S) {
    grid.cols = 2
    spacing = 16
  } else {
    grid.cols = 2
  }

  React.useEffect(() => {
    setGridifiedFiles(toMatrix(files.filter(x => currentFolder ? x.folder === currentFolder : !watchFilter.includes(x.folder)), grid.cols))
  }, [files, currentFolder, rowHeight])

  /*React.useEffect(() => {
    if (gridRef.current && prepareNewFile) {
      (gridRef.current as FixedSizeGrid).scrollTo({
        scrollLeft: 0,
        scrollTop: 0
      })
    }
  }, [gridRef, prepareNewFile])*/

  return (
    <Grid container className={classes.root}>
      <Grid container item xs={2} className={clsx(classes.leftPane, tvMode && classes.leftPaneTV, S || M && classes.paneHidden)}>
        <Toolbar variant="dense" disableGutters>
          {currentFolder ?
            <Typography sx={{ color: (theme) => theme.palette.primary.main, margin: (theme) => theme.spacing(0, 2) }}
              variant="caption">{([...files].filter(x => x.folder === currentFolder).reduce((a, b) => a + b.size, 0) / 1e3 / 1e3).toFixed(2)} MB
              used in this folder</Typography> : <Typography sx={{ margin: (theme) => theme.spacing(0, 2), color: (theme) => theme.palette.primary.main }}
                variant="caption">{([...files].reduce((a, b) => a + b.size, 0) / 1e3 / 1e3 / 1e3).toFixed(2)} GB
              space used
              on the server</Typography>}
        </Toolbar>
        <Divider />
          <List dense sx={{flex: 1, padding: 0}}>
          <AutoSizer>
            {({ height, width }) => (
              <FixedSizeList height={height} width={width} itemSize={46} itemCount={[...files].filter(x => x.folder !== null).map(x => x.folder).filter((value, index, self) => self.indexOf(value) === index).filter(x => x !== null).length} itemData={[...files].filter(x => x.folder !== null).map(x => x.folder).filter((value, index, self) => self.indexOf(value) === index).filter(x => x !== null).sort((a, b) => b.toLowerCase() > a.toLowerCase() ? -1 : 0)}>
                {renderRow}
              </FixedSizeList>
            )}
            </AutoSizer>
            </List>
        <Box sx={{ margin: (theme) => theme.spacing(2) }}>
          <Button sx={{ textTransform: "capitalize", fontWeight: 600, textDecoration: "none" }} component={RouterLink} to="/privacy">
            Terms of Service
          </Button>
          <Button sx={{ textTransform: "capitalize", fontWeight: 600, textDecoration: "none" }} component={RouterLink} to="/updates">
            Updates
          </Button>
          <Button sx={{ textTransform: "capitalize", fontWeight: 600, textDecoration: "none" }} component={RouterLink} to="/about">
            About {process.env.REACT_APP_NAME}
          </Button>
        </Box>
      </Grid>
      <Grid item xs sx={{ overflow: "auto", height: "calc(100vh - 110px)" }}>
        {location.pathname.startsWith("/browse") ? files.length === 0 ? <Box sx={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", position: "absolute", marginBottom: -2 }}>
          <Typography sx={{ fontWeight: 700, opacity: 0.3, textAlign: "center" }} variant="h1">
            O.O
          </Typography>
          <Typography variant="h6">
            Oh no! There's nothing in here! Upload a file to fill the emptiness!
          </Typography>
        </Box>
          :
          <>
            {Boolean(currentFolder && [...files].filter(x => x.folder === currentFolder).length > 0 && [...files].filter(x => x.folder === currentFolder)[0].thumbnail) &&
              <img alt="" src={[...files].filter(x => x.folder === currentFolder)[0].thumbnail} style={{
              width: "100%",
              height: "100%",
              zIndex: -1,
              position: "absolute",
              objectFit: "cover",
              opacity: 0.2,
              animation: "folder_intro 0.3s ease",
              filter: "blur(20px)"
            }} />}
          <AutoSizer>
            {({ height, width }) => (
              <FixedSizeGrid useIsScrolling className={classes.grid} ref={gridRef} height={height} width={width} rowHeight={rowHeight} columnWidth={(width / grid.cols) - spacing} rowCount={gridifiedFiles.length} columnCount={grid.cols} itemData={gridifiedFiles}>
                {renderCell}
              </FixedSizeGrid>
            )}
            </AutoSizer></> :
          <SwitchRouter>
            {children}
          </SwitchRouter>}
      </Grid>
      <Uploader inFolder={currentFolder ? currentFolder : undefined} open={showUploader} close={() => {
        willShowUploader(false)
      }}
        droppedFiles={droppedFiles} />
    </Grid>
  )
}

export default GridView