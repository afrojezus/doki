import React from "react"
import Container from "@mui/material/Container"
import Typography from "@mui/material/Typography"
import Box from "@mui/material/Box"
import Divider from "@mui/material/Divider"
import { connect } from "react-redux"

const Updates = () => (
        <Container maxWidth="lg" style={{ paddingBottom: 64 }}>
            <Box my={4}>
                <Typography sx={{ fontFamily: "doublewide" }}
                    variant="h6">UPDATES</Typography>
                <br />
                <Typography variant="caption" style={{ fontWeight: 700 }}>Current version: {process.env.REACT_APP_BUILD}.{process.env.REACT_APP_BRANCH}.{process.env.REACT_APP_TYPE}-{process.env.REACT_APP_MINOR_VERSION} {process.env.NODE_ENV}</Typography><br /><br /><br />

                <Typography variant="caption">Build 14.01-2022.MAIN & Build 15.01-2022.MAIN</Typography>
                <br />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    New in 15.01-2022.MAIN</Typography>
                <p>
                    General<br />
                    - Edgy redesign.<br />
                    - Huge refactoring to minimize tech debt.<br />
                    - First build ready for public testing.<br />
                    Public-only<br />
                    - Report functionality.<br />
                    - Scanning functionality (using abuse repositories and MD5 hashes).<br />
                    - Social network sharing options.<br />
                </p>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>New in 14.01-2022.MAIN</Typography>
                <p>
                    General<br />
                    - The top bar is gone, the file browser is the only relevant route.<br />
                    - View counting.<br />
                    Browser<br />
                    - What you've uploaded should show up much more obvious<br />
                    - Useless search has been replaced with small lists of most viewed and most liked files.<br />
                </p>

                <Divider />

                <Typography variant="caption">Build 13.12-2021.MAIN</Typography>
                <p>
                    General<br />
                    - Cleaner bar design, does not get in your way now<br />
                    - Backend now uses .NET 6, faster file handling.<br />
                    - More active alert management<br />
                    - Super hidden exclusive snow effect with optional raytracing mode in the settings<br />
                    Browser<br />
                    - File management from "My Files" have migrated over to the browser and completely removed its purpose<br />
                    - Minor adjustments to UI, you can now right click files to delete or change their folders<br />
                    Player<br />
                    - Common media playback control added<br />
                    - Autoplay is now default<br />
                    Settings<br />
                    - Now holds your Doki ID info<br />
                    - Anonymous will correctly show up now<br />
                </p>

                <Divider />

                <Typography variant="caption">Build 12.11-2021.COMMON</Typography>
                <p>
                    General<br />
                    - Upgraded styling backend.<br />
                    - Increase in upload size (from 200 MB to 5 GB).<br />
                    - Unlimited amount of files can now be uploaded.<br />
                    - Bug fixes.<br />
                    - (12-1) Blur effects have been removed for a smoother experience.<br />
                    {/*- (12-2) Server backend has been updated to .NET 6. Improvements in file management speed.<br />
                    - (12-2) Folders and Likes are now treated as own objects within the backend. This allows for folder ownership, and likes to considered authentic.<br />
                    - (12-2) This change also causes likes to be restricted to just uploaders.<br />*/}
                    <br />
                    Player<br />
                    - Removed a bunch of clutter to make space for smaller screens. Video controls are now inside of a "quick settings" menu.<br />
                    - The toolbar is now always visible.<br />
                    - The player can now adapt between classic "fill your screen"-style format and fitting everything on the screen.<br />
                    - Easier design for downloading non-playable files.<br />
                    - (12-1) Volume control will now appear on the toolbar if the screen is wide enough.<br />
                    <br />
                    Files Browser<br />
                    - Folder indicators on the sidebar.<br />
                    - You can now pick a different folder for each file.<br />
                    - NSFW indicator has been added.<br />
                    - New uploader interface.<br />
                    <br />
                    Me<br />
                    - New design.<br />
                    - Activity tab for all you've done.<br />
                    - You can now download your user profile and import them.<br />
                    - You can now delete every single file you've uploaded and your own profile on the server.<br />
                    {/*- (12-2) Strange bug that made the anonymous profile not show has now been squashed.<br />*/}
                    <br />
                </p>

                <Divider />
                <Typography variant="caption">Build 11.10-2021.COMMON</Typography>
                <p>
                    General<br />
                    - Support for ads implemented. Not on by default on private instances.<br />
                    - A much more understandable button to switch between the file browser and the player<br />
                    - (11-1) Like functionality implemented<br />
                    - (11-1) Doki instances can now be renamed<br />
                    <br />
                    Player<br />
                    - Style adjustments, now turns almost transparent when the toolbar is not focused<br />
                    - Autoplay mechanic adjusted, click to play once you enter the site<br />
                    - Sound feedback removed from clicking on the video<br />
                    - Continuous playback will now remain in the background if the player is not in focus<br />
                    - Share button added<br />
                    <br />
                    Files Browser<br />
                    - Uploader should now have a less confusing indicator<br />
                    - Drag-and-drop onto file browser itself bug has been removed (along with performance improvements)<br />
                    - (11-1) Brand new redesign<br />
                    - (11-1) You can now search for files!<br />
                    <br />
                    Report<br />
                    - Not in use for private instances currently<br />
                    <br />
                </p>

                <Divider />
                <Typography variant="caption">Build 10.09-2021.COMMON</Typography>
                <p>
                    General<br />
                    - Massive structure change, TV mode is now front and center of the frontend<br />
                    - Much of Dokis old functionality are still retained and not fully in modal-form yet.<br />
                    - Subtle code refactoring.<br />
                    - General loading indicator for the frontend<br />
                    - Landing page removed temporarily<br />
                    - (10-1) New font, layout adjustments and sound feedback added<br />
                    <br />
                    TV mode & Settings<br />
                    - The player can now continuously play videos without looping.<br />
                    - An optional filter for filtering out folders the player will not play from.<br />
                    - Handles pictures and un-viewable file formats now.<br />
                    - Sensible design choices for the new player UI.<br />
                    - (10-1) Player will now shrink itself if the user navigates out of the TV mode<br />
                    - (10-1) Folder playlist for quick navigation<br />
                    <br />
                    Files Browser<br />
                    - Now instanciated in the form of a fullscreen modal<br />
                    - Internal navigation added; it won't forget what folder you opened files from.<br />
                    - "All files" folder shortcut added.<br />
                    - (10-1) Support for folders in folders <br />
                    <br />
                    Report<br />
                    - Initial release, backend code not yet implemented.<br />
                    <br />
                </p>

                <Divider />
                <Typography variant="caption">Build 9.08-2021.VNEXT</Typography>
                <p>
                    - Flight mode renamed to TV mode<br />
                    - Early preperation code in place for public release<br />
                    - Landing page<br />
                    - Settings moved to dialog <br />
                    - Custom media player for TV and File page<br />
                    - Additional functionality in place for TV (not complete)<br />
                    - Expect breaking changes in build 10
                </p>

                <Divider />
                <Typography variant="caption">Build 8.08-2021.VNEXT</Typography>
                <p>
                    - Minor adjustments for better Firefox compatability<br />
                    - Revamped UI tweaks for mobile devices
                </p>

                <Divider />
                <Typography variant="caption">Build 7.08-2021.VNEXT</Typography>
                <p>
                    - Booru-like view and a mobile-friendly "timeline" view added<br />
                    - Sorting options added<br />
                    - Support for more audio formats within flight mode<br />
                    - Jaded animations to complement virtualized lists
                </p>

                <Divider />
                <Typography variant="caption">Build 6.08-2021.VNEXT</Typography>
                <p>
                    - Drag-and-drop based upload<br />
                    - Customizable colors and light settings<br />
                    - Support for uploading multiple files<br />
                    - Support for comments<br />
                    - Random video viewing mode
                </p>

                <Divider />
                <Typography variant="caption">Build 5.08-2021.VNEXT</Typography>
                <p>
                    - React frontend on a rewritten ASP.NET backend<br />
                    - New styling<br />
                    - SQL-based database management<br />
                    - Folder support
                </p>

                <Divider />
                <Typography variant="caption">Build 4.08-2021</Typography>
                <p>
                    - Tooltip for files<br />
                    - .JPEG and .WEBP support for images
                </p>


                <Divider />
                <Typography variant="caption">Build 3.07-2021</Typography>
                <p>
                    - More styling<br />
                    - Refresh button is now an icon<br />
                    - ID handling has moved away from IPs to identification cookies (only stores the ID
                    number on client machine)<br />
                    - SSL added for HTTPS connections<br />
                    - Updates and API pages<br />
                    - New "O.O" header<br />
                    - Mild rebranding<br />
                    - Upload now has a preview
                </p>

                <Divider />
                <Typography variant="caption">Build 2.07-2021</Typography>
                <p>
                    - Dark mode<br />
                    - HTTP version available online<br />
                    - Refresh button<br />
                    - Video thumbnails fixed<br />
                    - My Files<br />
                    - File details in grid<br />
                    - First publicly available build
                </p>

                <Divider />
                <Typography variant="caption">Build 1.07-2021</Typography>
                <p>
                    - Upload functionality<br />
                    - File grid<br />
                    - Internal build
                </p>
            </Box>
        </Container>
    )

export default connect()(Updates)