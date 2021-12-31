import React from "react"
import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import { connect } from "react-redux"

const Privacy = () => (
        <Container maxWidth="lg" style={{ paddingBottom: 64 }}>
            <Box my={4}>
                <br />
                <Typography variant="h4" gutterBottom style={{ fontFamily: "doublewide", fontWeight: 700 }}>TERMS OF SERVICE</Typography>
                <br />
                <Typography>
                    The file service stores a cookie used for identifying authors for files uploaded. The cookie is
                    responsible for validating your ownership of your files on the service.
                </Typography>
                <br />
                <Typography>
                    Color scheme and light options are saved to local storage on your device to remember your choices if
                    you decide to change them.
                </Typography>
                <br />
                <Typography>
                    Uploaders have control over how their files are shown on the service. Deleting a file here will remove it from the server.
                </Typography>
                <br />
                <Typography>
                    The file service by default does not contain any third-party trackers such as advertisments and
                    analytics.
                </Typography>
                <br />
                <Typography>
                    None of the uploads are IP-logged. Any files on the service cannot be traced back to the uploader.
                </Typography>
                <br />
                <Typography>
                    Your connection to the server is encrypted with TLS. No one else knows what you're looking at in here.
                </Typography>
                <br />
                <br />
                <Typography variant="h6">
                    Moderation process
                </Typography>
                <br />
                <Typography>
                    By default, Doki has no moderation put in place. Instances of Doki may wish to implement their own
                    form of moderation that fits their needs.
                </Typography>
                <br />
                <br />
                <Typography variant="caption">
                    This instance of Doki is private. It needs authentication in order to access. It is not meant to be
                    used in public.
                </Typography>
            </Box>
        </Container>
    )

export default connect()(Privacy)