import {Accordion, Aside, Badge, Button, Group, MediaQuery, ScrollArea, Stack, Text, Title} from '@mantine/core';
import Layout, {Menubar, Tabbar} from '../components/layout';
import SEO from '../components/seo';

const M2 = [
    {
        current: true,
        version: 'M2.02',
        details: () => (
            <>
                <p>
                    - Added internationalization. (UI language can now be changed to Norwegian, Ukranian, etc.)
                    <br/>
                    - Re-added several core features from M1, including editing files.
                    <br/>
                    - Fixed video player seeker
                    <br/>
                    - SEO-optimization, links to files can now be previewed.
                    <br/>
                    - Middle-mouse clicking issue patched.
                    <br/>
                    - Upload page improvements.
                    <br/>
                    - Styling improvements.
                </p>
            </>

        ),
    },
    {
        current: false,
        version: 'M2.01',
        details: () => (
            <>
                <p>
                    - Migrated from ASP.NET to NextJS.
                    <br/>
                    - Minimalist makeover with a completely rewritten backend.
                    <br/>
                    - Mobile-first layout.
                    <br/>
                    - Performance improvements.
                </p>
            </>

        ),
    }
];

const PreM2 = [
    {
        current: false,
        version: 'January & February builds (14.01-2022 & 15.02-2022)',
        details: () => (
            <>
                <p>
                    General:
                    <br/>
                    - Edgy redesign.
                    <br/>
                    - Standardized navigation controls.
                    <br/>
                    - First build ready for public testing.
                    <br/>
                    - The formerly known &quot;Browser page&quot; is now responsble for viewing other pages alongside
                    the file grid.
                    <br/>
                    - Internal refractoring to make the platform more reusable and sustainable to develop on.
                    <br/>
                    - UI is now adjusted to handle mobile devices when used on one.
                    <br/>
                    <br/>
                    Browser:
                    <br/>
                    - Administrator mode (private only)
                    <br/>
                    - Folders are now Channels (folders with special purpose), tags replace the old folder
                    functionality.
                    <br/>
                    - Files can be sorted by views or likes, and can be filtered by tags or by file types.
                    <br/>
                    <br/>
                    Player:
                    <br/>
                    - Timestamps and seeking functionality added
                    <br/>
                    - Right-click will show a new options pane. The options pane stores file info, sharing details,
                    comments, current channel playlist and settings.
                    <br/>
                    - More file details added to the second row of the title
                    <br/>
                    <br/>
                    Settings:
                    <br/>
                    - UI fonts can be changed.
                    <br/>
                    - An alternative theme has been added, "Material".
                    <br/>
                    - Options to hide tags and file types added.
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
                <br/>
                - Cleaner bar design, does not get in your way now
                <br/>
                - Backend now uses .NET 6, faster file handling.
                <br/>
                - More active alert management
                <br/>
                - Super hidden exclusive snow effect with optional raytracing mode in the settings
                <br/>
                <br/>
                Browser
                <br/>
                - File management from &quot;My Files&quot; have migrated over to the browser and completely removed its
                purpose
                <br/>
                - Minor adjustments to UI, you can now right click files to delete or change their folders
                <br/>
                <br/>
                Player
                <br/>
                - Common media playback control added
                <br/>
                - Autoplay is now default
                <br/>
                <br/>
                Settings
                <br/>
                - Now holds your Doki ID info
                <br/>
                - Anonymous will correctly show up now
                <br/>
            </p>
        ),
    },
    {
        current: false,
        version: 'Build 12.11-2021.COMMON',
        details: () => (
            <p>
                General
                <br/>
                - Upgraded styling backend.
                <br/>
                - Increase in upload size (from 200 MB to 5 GB).
                <br/>
                - Unlimited amount of files can now be uploaded.
                <br/>
                - Bug fixes.
                <br/>
                - (12-1) Blur effects have been removed for a smoother experience.
                <br/>
                <br/>
                Player
                <br/>
                - Removed a bunch of clutter to make space for smaller screens. Video controls are now inside of
                a &quot;quick settings&quot; menu.
                <br/>
                - The toolbar is now always visible.
                <br/>
                - The player can now adapt between classic &quot;fill your screen&quot;-style format and fitting
                everything on the screen.
                <br/>
                - Easier design for downloading non-playable files.
                <br/>
                - (12-1) Volume control will now appear on the toolbar if the screen is wide enough.
                <br/>
                <br/>
                Files Browser
                <br/>
                - Folder indicators on the sidebar.
                <br/>
                - You can now pick a different folder for each file.
                <br/>
                - NSFW indicator has been added.
                <br/>
                - New uploader interface.
                <br/>
                <br/>
                Me
                <br/>
                - New design.
                <br/>
                - Activity tab for all you&apos;ve done.
                <br/>
                - You can now download your user profile and import them.
                <br/>
                - You can now delete every single file you&apos;ve uploaded and your own profile on the server.
                <br/>
            </p>
        ),
    },
    {
        current: false,
        version: 'Build 11.10-2021.COMMON',
        details: () => (
            <p>
                General
                <br/>
                - Support for ads implemented. Not on by default on private instances.
                <br/>
                - A much more understandable button to switch between the file browser and the player
                <br/>
                - (11-1) Like functionality implemented
                <br/>
                - (11-1) Doki instances can now be renamed
                <br/>
                <br/>
                Player
                <br/>
                - Style adjustments, now turns almost transparent when the toolbar is not focused
                <br/>
                - Autoplay mechanic adjusted, click to play once you enter the site
                <br/>
                - Sound feedback removed from clicking on the video
                <br/>
                - Continuous playback will now remain in the background if the player is not in focus
                <br/>
                - Share button added
                <br/>
                <br/>
                Files Browser
                <br/>
                - Uploader should now have a less confusing indicator
                <br/>
                - Drag-and-drop onto file browser itself bug has been removed (along with performance improvements)
                <br/>
                - (11-1) Brand new redesign
                <br/>
                - (11-1) You can now search for files!
                <br/>
                <br/>
                Report
                <br/>
                - Not in use for private instances currently
                <br/>
                <br/>
            </p>
        ),
    },
    {
        current: false,
        version: 'Build 10.09-2021.COMMON',
        details: () => (
            <p>
                General
                <br/>
                - Massive structure change, TV mode is now front and center of the frontend
                <br/>
                - Much of Dokis old functionality are still retained and not fully in modal-form yet.
                <br/>
                - Subtle code refactoring.
                <br/>
                - General loading indicator for the frontend
                <br/>
                - Landing page removed temporarily
                <br/>
                - (10-1) New font, layout adjustments and sound feedback added
                <br/>
                <br/>
                TV mode & Settings
                <br/>
                - The player can now continuously play videos without looping.
                <br/>
                - An optional filter for filtering out folders the player will not play from.
                <br/>
                - Handles pictures and un-viewable file formats now.
                <br/>
                - Sensible design choices for the new player UI.
                <br/>
                - (10-1) Player will now shrink itself if the user navigates out of the TV mode
                <br/>
                - (10-1) Folder playlist for quick navigation
                <br/>
                <br/>
                Files Browser
                <br/>
                - Now instanciated in the form of a fullscreen modal
                <br/>
                - Internal navigation added; it won&apos;t forget what folder you opened files from.
                <br/>
                - &quot;All files&quot; folder shortcut added.
                <br/>
                - (10-1) Support for folders in folders
                {' '}
                <br/>
                <br/>
                Report
                <br/>
                - Initial release, backend code not yet implemented.
                <br/>
                <br/>
            </p>
        ),
    },
    {
        current: false,
        version: 'Build 9.08-2021.VNEXT',
        details: () => (
            <p>
                - Flight mode renamed to TV mode
                <br/>
                - Early preperation code in place for public release
                <br/>
                - Landing page
                <br/>
                - Settings moved to dialog
                {' '}
                <br/>
                - Custom media player for TV and File page
                <br/>
                - Additional functionality in place for TV (not complete)
                <br/>
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
                <br/>
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
                <br/>
                - Sorting options added
                <br/>
                - Support for more audio formats within flight mode
                <br/>
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
                <br/>
                - Customizable colors and light settings
                <br/>
                - Support for uploading multiple files
                <br/>
                - Support for comments
                <br/>
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
                <br/>
                - New styling
                <br/>
                - SQL-based database management
                <br/>
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
                <br/>
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
                <br/>
                - Refresh button is now an icon
                <br/>
                - ID handling has moved away from IPs to identification cookies (only stores the ID
                number on client machine)
                <br/>
                - SSL added for HTTPS connections
                <br/>
                - Updates and API pages
                <br/>
                - New &quot;O.O&quot; header
                <br/>
                - Mild rebranding
                <br/>
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
                <br/>
                - HTTP version available online
                <br/>
                - Refresh button
                <br/>
                - Video thumbnails fixed
                <br/>
                - My Files
                <br/>
                - File details in grid
                <br/>
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
                <br/>
                - File grid
                <br/>
                - Internal build
            </p>
        ),
    },
];

function Page() {
    return <Layout aside={
        <MediaQuery smallerThan="sm" styles={{display: 'none'}}>
            <Aside p="md" hiddenBreakpoint="sm" width={{lg: 300}}>
                <Menubar/>
                <Aside.Section grow component={ScrollArea} mx="-xs" px="xs">
                    <Stack>
                        <Button variant="default">M2 builds</Button>
                        <Button variant="default">Pre-M2 builds</Button>
                    </Stack>
                </Aside.Section>
                <Tabbar/>
            </Aside></MediaQuery>}>
        <SEO title="Updates" siteTitle="Doki" description="Sneed"/>
        <Group>
            <Title order={5}>
                Updates
            </Title>
            <div style={{flex: 1}}/>
        </Group>
        <Stack>
            <Text size="xs">M2 Builds</Text>
            <Accordion>
                {M2.map((elem, index) =>
                    <Accordion.Item key={index}
                                    label={<Group><Text>{elem.version}</Text>{elem.current && <Badge>Current</Badge>}
                                    </Group>}>
                        <elem.details/>
                    </Accordion.Item>)}
            </Accordion>
            <Text size="xs">Pre-M2 Builds</Text>
            <Accordion>
                {PreM2.map((elem, index) =>
                    <Accordion.Item key={index} label={elem.version}>
                        <elem.details/>
                    </Accordion.Item>)}
            </Accordion>
        </Stack>
    </Layout>;
}


export default Page;
