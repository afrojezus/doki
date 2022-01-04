import React, {MouseEvent, useRef, useState} from "react"
import {Box, LinearProgress} from "@mui/material"
import {LightTooltip, normalise} from "../utils"
import Duration from "./Duration"

interface PlayerProgressBarProps {
  onFocus: boolean;
  showBar: boolean;
  played: number;
  buffered: number;
  duration: number;
  onHover?: () => void;
  seekTo: (n: number) => void;
}

const PlayerProgressBar = ({
  onFocus,
  showBar,
  played,
  buffered,
  duration,
  onHover,
  seekTo
}: PlayerProgressBarProps) => {
  const [rawSeek, setRawSeek] = useState(0)
  const [seek, setSeek] = useState(0)
  const [seeking, setSeeking] = useState(false)
  const seeker = useRef(null)

  const handleTrack = (e: MouseEvent) => {
    setSeeking(true)
    setSeek(normalise(e.clientX, 0, e.currentTarget.clientWidth))
    setRawSeek(normalise(e.clientX, 0, e.currentTarget.clientWidth) / 100)
  }

  const handleSeek = (e: MouseEvent) => {
    setSeeking(false)
    seekTo(rawSeek * duration)
  }


  return (
    <Box onMouseDown={handleSeek} onMouseMove={handleTrack} onMouseLeave={() => setSeeking(false)} sx={{
      opacity: onFocus || showBar ? 1 : 0,
      transition: (theme) => theme.transitions.create(["all"]),
      position: "fixed",
      width: "100%",
      bottom: (theme) => theme.spacing(8),
      height: 32,
      zIndex: 10
    }}>
      <LinearProgress sx={{
        position: "fixed",
        bottom: (theme) => theme.spacing(8),
        width: "100%",
        height: seeking ? 8 : 2,
        transition: (theme) => theme.transitions.create(["all"]),
        "& .MuiLinearProgress-bar": {
          transition: (theme) => theme.transitions.create(["all"], {duration: 175}),
        },
      }} variant="buffer" value={normalise(played, 0, 1)} valueBuffer={normalise(buffered, 0, 1)} />
      <LinearProgress sx={{
        position: "fixed",
        bottom: (theme) => theme.spacing(8),
        width: "100%",
        opacity: seeking ? 0.3 : 0,
        height: seeking ? 8 : 2,
        color: "white",
        background: "transparent",
        transition: (theme) => theme.transitions.create(["all"]),
        "& .MuiLinearProgress-bar": {
          transition: "none",
        },
      }} variant="determinate" ref={seeker} value={seek} />
      <LightTooltip placement="top" title={<Duration seconds={rawSeek * duration} />}>
      <Box sx={{
        position: "fixed",
        left: `calc(${seek}% - 8px)`,
      zIndex: 2,
        bottom: (theme) => theme.spacing(8),
        width: 16,
        opacity: 0,
        height: seeking ? 8 : 2,
        background: "white",
        }} />
          </LightTooltip>
    </Box>
  )
}
  
export default PlayerProgressBar