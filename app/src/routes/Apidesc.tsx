import React from "react"
import Container from "@mui/material/Container"
import Box from "@mui/material/Box"
import { Typography } from "@mui/material"

const APIDesc = () => (
        <Container maxWidth="lg" style={{ paddingBottom: 64, animation: "fadein 0.3s ease" }}>
            <Box my={4}>
                <br />
                <Typography variant="h4" gutterBottom style={{ fontWeight: 700 }}>API
                    DOCUMENTATION</Typography>
                <br />
                <p>
                    {process.env.REACT_APP_NAME} uses API endpoints to communicate between the frontend and the backend. These endpoints are
                    used by the frontend as is.
                </p>

                <code>/api/all</code>
                <p>GET request to retrieve all files on the server in JSON-format</p>

                <code>/api/file/:id</code>
                <p>GET request to retrieve a file on the server by its id in JSON-format</p>

                <code>/api/delete/:id</code>
                <p>POST request to delete a file on the server by its id</p>

                <code>/api/folder/:name</code>
                <p>GET request to retrieve all files in a folder on the server by its name</p>

                <code>/api/upload</code>
                <p>POST request to send a file to the server using a form (form needs identification number and file
                    data)</p>

                <code>/api/all/length</code>
                <p>GET request to retrieve file count from the server</p>

                <code>/api/names/:id</code>
                <p>GET request to retrieve an author object from the server</p>
            </Box>
        </Container>
    )

export default APIDesc