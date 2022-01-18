import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

const Data = [
  {
    current: true,
    version: 'Build 14.01-2022.MAIN & Build 15.01-2022.MAIN',
    details: () => (
      <>
        <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'doublewide' }}>
          THE EDGE UPDATE
        </Typography>
        <br />
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          New in 15.01-2022.MAIN
        </Typography>
        <p>
          General:
          <br />
          - Edgy redesign.
          <br />
          - First build ready for public testing.
          <br />
          - The formerly known &quot;Browser page&quot; is now responsble for viewing other pages alongside the file grid.
          <br />
          <br />
          Browser:
          <br />
          - Administrator mode (private only)
          <br />
          - Folder navigation now makes sense with multiple subfolders
          {' '}
          <br />
          - 2 new sorting options: views and likes
          <br />
          - Refresh button has returned
          <br />
          <br />
          Player:
          <br />
          - Timestamps and seeking functionality added
          <br />
          - Right-click will now pause and play the video. Downloading the video is doable through the share menu instead
          <br />
          - More file details added to the second row of the title
          <br />

          {/* Public-only<br />
                    - Report functionality.<br />
                    - Scanning functionality (using abuse repositories and MD5 hashes).<br />
                    - Social network sharing options.<br /> */}
        </p>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>New in 14.01-2022.MAIN</Typography>
        <p>
          General
          <br />
          <br />
          - The top bar is gone, the file browser is the only relevant route.
          <br />
          - View counting.
          <br />
          <br />
          Browser
          <br />
          - What you&apos;ve uploaded should show up much more obvious
          <br />
          - Useless search has been replaced with small lists of most viewed and most liked files.
          <br />
        </p>
      </>

    ),
  },
  {
    current: false,
    version: 'Build 13.12-2021.MAIN',
    details: () => (
      <p>
        General
        <br />
        - Cleaner bar design, does not get in your way now
        <br />
        - Backend now uses .NET 6, faster file handling.
        <br />
        - More active alert management
        <br />
        - Super hidden exclusive snow effect with optional raytracing mode in the settings
        <br />
        <br />
        Browser
        <br />
        - File management from &quot;My Files&quot; have migrated over to the browser and completely removed its purpose
        <br />
        - Minor adjustments to UI, you can now right click files to delete or change their folders
        <br />
        <br />
        Player
        <br />
        - Common media playback control added
        <br />
        - Autoplay is now default
        <br />
        <br />
        Settings
        <br />
        - Now holds your Doki ID info
        <br />
        - Anonymous will correctly show up now
        <br />
      </p>
    ),
  },
  {
    current: false,
    version: 'Build 12.11-2021.COMMON',
    details: () => (
      <p>
        General
        <br />
        - Upgraded styling backend.
        <br />
        - Increase in upload size (from 200 MB to 5 GB).
        <br />
        - Unlimited amount of files can now be uploaded.
        <br />
        - Bug fixes.
        <br />
        - (12-1) Blur effects have been removed for a smoother experience.
        <br />
        {/* - (12-2) Server backend has been updated to .NET 6. Improvements in file management speed.<br />
                    - (12-2) Folders and Likes are now treated as own objects within the backend. This allows for folder ownership, and likes to considered authentic.<br />
                    - (12-2) This change also causes likes to be restricted to just uploaders.<br /> */}
        <br />
        Player
        <br />
        - Removed a bunch of clutter to make space for smaller screens. Video controls are now inside of a &quot;quick settings&quot; menu.
        <br />
        - The toolbar is now always visible.
        <br />
        - The player can now adapt between classic &quot;fill your screen&quot;-style format and fitting everything on the screen.
        <br />
        - Easier design for downloading non-playable files.
        <br />
        - (12-1) Volume control will now appear on the toolbar if the screen is wide enough.
        <br />
        <br />
        Files Browser
        <br />
        - Folder indicators on the sidebar.
        <br />
        - You can now pick a different folder for each file.
        <br />
        - NSFW indicator has been added.
        <br />
        - New uploader interface.
        <br />
        <br />
        Me
        <br />
        - New design.
        <br />
        - Activity tab for all you&apos;ve done.
        <br />
        - You can now download your user profile and import them.
        <br />
        - You can now delete every single file you&apos;ve uploaded and your own profile on the server.
        <br />
      </p>
    ),
  },
  {
    current: false,
    version: 'Build 11.10-2021.COMMON',
    details: () => (
      <p>
        General
        <br />
        - Support for ads implemented. Not on by default on private instances.
        <br />
        - A much more understandable button to switch between the file browser and the player
        <br />
        - (11-1) Like functionality implemented
        <br />
        - (11-1) Doki instances can now be renamed
        <br />
        <br />
        Player
        <br />
        - Style adjustments, now turns almost transparent when the toolbar is not focused
        <br />
        - Autoplay mechanic adjusted, click to play once you enter the site
        <br />
        - Sound feedback removed from clicking on the video
        <br />
        - Continuous playback will now remain in the background if the player is not in focus
        <br />
        - Share button added
        <br />
        <br />
        Files Browser
        <br />
        - Uploader should now have a less confusing indicator
        <br />
        - Drag-and-drop onto file browser itself bug has been removed (along with performance improvements)
        <br />
        - (11-1) Brand new redesign
        <br />
        - (11-1) You can now search for files!
        <br />
        <br />
        Report
        <br />
        - Not in use for private instances currently
        <br />
        <br />
      </p>
    ),
  },
  {
    current: false,
    version: 'Build 10.09-2021.COMMON',
    details: () => (
      <p>
        General
        <br />
        - Massive structure change, TV mode is now front and center of the frontend
        <br />
        - Much of Dokis old functionality are still retained and not fully in modal-form yet.
        <br />
        - Subtle code refactoring.
        <br />
        - General loading indicator for the frontend
        <br />
        - Landing page removed temporarily
        <br />
        - (10-1) New font, layout adjustments and sound feedback added
        <br />
        <br />
        TV mode & Settings
        <br />
        - The player can now continuously play videos without looping.
        <br />
        - An optional filter for filtering out folders the player will not play from.
        <br />
        - Handles pictures and un-viewable file formats now.
        <br />
        - Sensible design choices for the new player UI.
        <br />
        - (10-1) Player will now shrink itself if the user navigates out of the TV mode
        <br />
        - (10-1) Folder playlist for quick navigation
        <br />
        <br />
        Files Browser
        <br />
        - Now instanciated in the form of a fullscreen modal
        <br />
        - Internal navigation added; it won&apos;t forget what folder you opened files from.
        <br />
        - &quot;All files&quot; folder shortcut added.
        <br />
        - (10-1) Support for folders in folders
        {' '}
        <br />
        <br />
        Report
        <br />
        - Initial release, backend code not yet implemented.
        <br />
        <br />
      </p>
    ),
  },
  {
    current: false,
    version: 'Build 9.08-2021.VNEXT',
    details: () => (
      <p>
        - Flight mode renamed to TV mode
        <br />
        - Early preperation code in place for public release
        <br />
        - Landing page
        <br />
        - Settings moved to dialog
        {' '}
        <br />
        - Custom media player for TV and File page
        <br />
        - Additional functionality in place for TV (not complete)
        <br />
        - Expect breaking changes in build 10
      </p>
    ),
  },
  {
    current: false,
    version: 'Build 8.08-2021.VNEXT',
    details: () => (
      <p>
        - Minor adjustments for better Firefox compatability
        <br />
        - Revamped UI tweaks for mobile devices
      </p>
    ),
  },
  {
    current: false,
    version: 'Build 7.08-2021.VNEXT',
    details: () => (
      <p>
        - Booru-like view and a mobile-friendly &quot;timeline&quot; view added
        <br />
        - Sorting options added
        <br />
        - Support for more audio formats within flight mode
        <br />
        - Jaded animations to complement virtualized lists
      </p>
    ),
  },
  {
    current: false,
    version: 'Build 6.08-2021.VNEXT',
    details: () => (
      <p>
        - Drag-and-drop based upload
        <br />
        - Customizable colors and light settings
        <br />
        - Support for uploading multiple files
        <br />
        - Support for comments
        <br />
        - Random video viewing mode
      </p>
    ),
  },
  {
    current: false,
    version: 'Build 5.08-2021.VNEXT',
    details: () => (
      <p>
        - React frontend on a rewritten ASP.NET backend
        <br />
        - New styling
        <br />
        - SQL-based database management
        <br />
        - Folder support
      </p>
    ),
  },
  {
    current: false,
    version: 'Build 4.08-2021',
    details: () => (
      <p>
        - Tooltip for files
        <br />
        - .JPEG and .WEBP support for images
      </p>
    ),
  },
  {
    current: false,
    version: 'Build 3.07-2021',
    details: () => (
      <p>
        - More styling
        <br />
        - Refresh button is now an icon
        <br />
        - ID handling has moved away from IPs to identification cookies (only stores the ID
        number on client machine)
        <br />
        - SSL added for HTTPS connections
        <br />
        - Updates and API pages
        <br />
        - New &quot;O.O&quot; header
        <br />
        - Mild rebranding
        <br />
        - Upload now has a preview
      </p>
    ),
  },
  {
    current: false,
    version: 'Build 2.07-2021',
    details: () => (
      <p>
        - Dark mode
        <br />
        - HTTP version available online
        <br />
        - Refresh button
        <br />
        - Video thumbnails fixed
        <br />
        - My Files
        <br />
        - File details in grid
        <br />
        - First publicly available build
      </p>
    ),
  },
  {
    current: false,
    version: 'Build 1.07-2021',
    details: () => (
      <p>
        - Upload functionality
        <br />
        - File grid
        <br />
        - Internal build
      </p>
    ),
  },
];

function Updates() {
  return (
    <Container maxWidth="lg" style={{ paddingBottom: 64 }}>
      <Box my={4}>
        <Typography
          sx={{ fontFamily: 'doublewide' }}
          variant="h6"
        >
          UPDATES
        </Typography>
        <br />
        <Typography variant="caption" style={{ fontWeight: 700 }}>
          Current version:
          {process.env.REACT_APP_BUILD}
          .
          {process.env.REACT_APP_BRANCH}
          .
          {process.env.REACT_APP_TYPE}
          -
          {process.env.REACT_APP_MINOR_VERSION}
          {' '}
          {process.env.NODE_ENV}
        </Typography>
        <br />
        <br />
        <br />

        {Data.map((e) => (
          <Accordion key={e.version}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              {e.current && <Typography variant="caption" sx={{ fontWeight: 600, flex: 0.1 }}>CURRENT</Typography>}
              <Typography variant="caption">{e.version}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <e.details />
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
}

export default Updates;
