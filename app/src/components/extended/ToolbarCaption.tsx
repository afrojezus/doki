import { Typography } from "@mui/material"
import { styled } from "@mui/system"
import React from "react"

export default styled(Typography)(({ theme }) => ({
  margin: theme.spacing(0, 0.5),
  "&:first-of-type": {
    margin: 0
  },
  "&:last-of-type": {
    margin: 0
  }
}))
