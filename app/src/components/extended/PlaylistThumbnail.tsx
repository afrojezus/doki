import { styled } from "@mui/system"
import React from "react"

export default styled("img")(({ theme }) => ({
  width: 100,
  height: 75,
  marginRight: theme.spacing(1)
}))