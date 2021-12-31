import React from "react"
import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import { Typography } from "@mui/material"
const Error = () => (
        <Container maxWidth="lg" style={{ paddingBottom: 64, animation: "fadein 0.3s ease" }}>
            <Box my={4}>
                <br />
                <Typography variant="h4" gutterBottom style={{ fontWeight: 700 }}>
                    404</Typography>
                <br />
            </Box>
        </Container>
    )

export default Error