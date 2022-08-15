import { ReactElement, useContext, useEffect, useState } from 'react';
import {
    ActionIcon,
    AppShell,
    Aside,
    Avatar,
    Burger,
    Button,
    Center,
    Container,
    CSSObject,
    Dialog,
    Divider,
    Footer,
    Group,
    Header,
    LoadingOverlay,
    MediaQuery,
    Menu,
    Navbar,
    ScrollArea,
    Stack,
    Text,
    TextInput,
    Tooltip,
    UnstyledButton,
    useMantineTheme
} from '@mantine/core';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import Link from 'next/link';
import { Folder, Home, InfoCircle, Dots as MenuIcon, Plus, ServerOff, Settings, Upload, LayoutSidebarLeftExpand } from 'tabler-icons-react';
import { useSelector } from 'react-redux';

import { useRouter } from 'next/router';
import { getLocale, LocaleContext } from "@src/locale";
import Emoji from "@src/components/emoji";
import { useMediaQuery, useWindowScroll } from "@mantine/hooks";
import { Space } from '@server/models';
import { useSessionState } from '@src/slices/sessionState';
import { displayFilename, getExt } from 'utils/file';

interface Disk {
    freeSpace: number;
    totalSpace: number;
}

interface Layout {
    space?: Space;
    children: any;
    footer?: ReactElement;
    aside?: ReactElement;
    header?: ReactElement;
    navbar?: ReactElement;
    additionalMainStyle?: CSSObject;
    additionalContainerStyle?: CSSObject;
    additionalAsideStyle?: CSSObject;
    asideContent?: any;
    hiddenAside?: boolean;
    permanent?: boolean;
    padding?: any;
    hiddenCallback?: (h: boolean) => void;
    hideTabbar?: boolean;
    noScrollArea?: boolean;
    onMouseLeave?: () => void;

    flex?: boolean;
}

const fetcher = async (url) => {
    const res = await fetch(url);
    const data = await res.json();

    if (res.status !== 200) {
        throw new Error(data.message);
    }
    return data as Disk;
};

function Mbar({ topBar = false }) {
    const session = useSelector(useSessionState);
    const { data, error } = useSWR(() => `/api/disk`, fetcher);
    const locale = useContext(LocaleContext);
    const router = useRouter();
    const theme = useMantineTheme();

    if (topBar) {
        if (error) return <Tooltip label="The server is down"><ActionIcon><ServerOff color="red" /></ActionIcon></Tooltip>;
        return <>
            <Menu shadow="xl" position="bottom-end" withinPortal width={200} transition="pop-top-right">
                <Menu.Target>
                    <ActionIcon>
                        <MenuIcon />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown sx={{ zIndex: 9000 }}>
                    <LoadingOverlay visible={!data} />
                    <Menu.Label>Sitemap</Menu.Label>
                    <Link href="/" passHref>
                        <Menu.Item icon={<Home size={14} />}>{getLocale(locale).Common["viewer"]}</Menu.Item>
                    </Link>
                    <Link href="/browser" passHref>
                        <Menu.Item icon={<Folder size={14} />}>{getLocale(locale).Common["browser"]}</Menu.Item>
                    </Link>
                    <Link href="/updates" passHref>
                        <Menu.Item icon={<InfoCircle size={14} />}>{getLocale(locale).Common["updates"]}</Menu.Item>
                    </Link>
                    <Link href="/settings" passHref>
                        <Menu.Item icon={<Settings size={14} />}>{getLocale(locale).Common["settings"]}</Menu.Item>
                    </Link>
                    <Divider />
                    <Link href="/streamshare" passHref>
                        <Menu.Item>{getLocale(locale).Modes["ss"]}</Menu.Item>
                    </Link>
                    <Divider />
                    <Link href="/login" passHref>
                        <Menu.Item>Switch space</Menu.Item>
                    </Link>
                    {/*<Link href="/policies" passHref>
                    <Menu.Item>Policies</Menu.Item>
                </Link>
                <Link href="/about" passHref>
                    <Menu.Item>About</Menu.Item>
                </Link>
                <Link href="/license" passHref>
                    <Menu.Item>License</Menu.Item>
                </Link>*/}
                    <Divider />
                    <Menu.Label>{`${getLocale(locale).Common["created-by"]} `}<Emoji
                        symbol={String.fromCodePoint(parseInt("2764", 16))}
                        label="Love" />.<br />{data && `Currently hosting ${((data.totalSpace - data.freeSpace) / 1e3 / 1e3 / 1e3).toFixed(2)} GB of files. ${(data.freeSpace / 1e3 / 1e3 / 1e3).toFixed(2)} GB available.`}
                    </Menu.Label>
                </Menu.Dropdown>
            </Menu>
        </>;
    }

    if (error) return <Aside.Section>
        <Text className="use-m-font" mb="md">The server is down.</Text>
    </Aside.Section>;

    return <>
        <Aside.Section mb="sm" style={{ flexFlow: 'row wrap', display: 'inline-flex' }}>
            <Text
                className="use-m-font">{router.pathname.includes("view") ? session.currentFile ? (session.currentFile.Title ?? displayFilename(session.currentFile)) : "" : router.asPath.split("/").join("").replace(/\?([;\s\w\"\=\,\:\./\~\{\}\?\!\-\%\&\#\$\^\(\)]*?)\=/, "/")}</Text>
            <div style={{ flex: 1 }} />
            <Menu withinPortal width={200} transition="pop-top-right">
                <Menu.Target>
                    <ActionIcon>
                        <MenuIcon />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <LoadingOverlay visible={!data} />
                    <Menu.Label>Sitemap</Menu.Label>
                    <Link href="/" passHref>
                        <Menu.Item icon={<Home size={14} />}>{getLocale(locale).Common["viewer"]}</Menu.Item>
                    </Link>
                    <Link href="/browser" passHref>
                        <Menu.Item icon={<Folder size={14} />}>{getLocale(locale).Common["browser"]}</Menu.Item>
                    </Link>
                    <Link href="/updates" passHref>
                        <Menu.Item icon={<InfoCircle size={14} />}>{getLocale(locale).Common["updates"]}</Menu.Item>
                    </Link>
                    <Link href="/settings" passHref>
                        <Menu.Item icon={<Settings size={14} />}>{getLocale(locale).Common["settings"]}</Menu.Item>
                    </Link>
                    <Divider />
                    <Link href="/streamshare" passHref>
                        <Menu.Item>{getLocale(locale).Modes["ss"]}</Menu.Item>
                    </Link>
                    <Divider />
                    <Link href="/login" passHref>
                        <Menu.Item>Switch space</Menu.Item>
                    </Link>
                    {/*<Link href="/policies" passHref>
                    <Menu.Item>Policies</Menu.Item>
                </Link>
                <Link href="/about" passHref>
                    <Menu.Item>About</Menu.Item>
                </Link>
                <Link href="/license" passHref>
                    <Menu.Item>License</Menu.Item>
                </Link>*/}
                    <Divider />
                    <Menu.Label>{`${getLocale(locale).Common["created-by"]} `}<Emoji
                        symbol={String.fromCodePoint(parseInt("2764", 16))}
                        label="Love" />.<br />{data && `Currently hosting ${((data.totalSpace - data.freeSpace) / 1e3 / 1e3 / 1e3).toFixed(2)} GB of files. ${(data.freeSpace / 1e3 / 1e3 / 1e3).toFixed(2)} GB available.`}
                    </Menu.Label>
                </Menu.Dropdown>
            </Menu>
        </Aside.Section></>;
}

export const Menubar = dynamic(() => Promise.resolve(Mbar), { ssr: false });

export function Tabbar() {
    const locale = useContext(LocaleContext);
    return <>
        <Aside.Section style={{ flexFlow: 'row wrap', display: 'inline-flex' }}>
            <Link href="/upload" passHref>
                <Button component="a" variant="outline" style={{ flex: 1 }}
                    leftIcon={<Upload size={14} />}>{getLocale(locale).Common["upload"]}</Button>
            </Link>
        </Aside.Section></>;
}

export function TopNavBar({ setHidden, hidden, white = false, space, aside = null, navbar = null }) {
    const isMobile = useMediaQuery('only screen and (max-width: 768px)');
    const session = useSelector(useSessionState);
    const router = useRouter();
    return <Group sx={{ height: '100%' }} position="apart">
        <Group ml="md">
            <ActionIcon sx={(theme) => ({ color: white ? theme.colors.dark[0] : undefined })}
                onClick={() => setHidden(!hidden)} size="sm">
                <LayoutSidebarLeftExpand style={{ transition: "all .375s var(--animation-ease)", rotate: !hidden ? (navbar ? "180deg" : "0deg") : (navbar ? "0deg" : "180deg") }} />
            </ActionIcon>
            <Avatar src={(space && space.Icon) ?? "/assets/doki-logo.png"} />
            <Link href="/" passHref><Text className="doki-vfx" sx={(theme) => ({
                fontFamily: "Manrope, sans-serif;",
                fontWeight: 800,
                lineHeight: 1.75,
                color: white ? theme.colors.dark[0] : undefined
            })}>{(space && space.Name) ?? "doki"}</Text></Link>
            {/*<Tooltip label="Work in progress" placement="end"><Badge sx={{ marginBottom: 4 }}>M2</Badge></Tooltip>*/}
            {isMobile ? undefined : <Text
                className="use-m-font">{router.pathname.includes("view") ? session.currentFile ? (session.currentFile.Title ?? displayFilename(session.currentFile)) : "" : router.asPath.split('/').join('').replace(/\?([;\s\w\"\=\,\:\./\~\{\}\?\!\-\%\&\#\$\^\(\)]*?)\=/, "/")}</Text>}
        </Group>
        {isMobile ? undefined : <Group mr="md">
            <Link href="/" passHref>
                <ActionIcon variant={router.asPath.includes("viewer") ? "filled" : "subtle"} sx={() => ({
                    transition: "all .375s var(--animation-ease)",
                })}>
                    <Home size={20} />
                </ActionIcon>
            </Link>
            <Link href="/browser" passHref>
                <ActionIcon variant={router.asPath.includes("browser") ? "filled" : "subtle"} sx={() => ({
                    transition: "all .375s var(--animation-ease)",
                })}>
                    <Folder size={20} />
                </ActionIcon>
            </Link>
            <Link href="/updates" passHref>
                <ActionIcon variant={router.asPath.includes("updates") ? "filled" : "subtle"} sx={() => ({
                    transition: "all .375s var(--animation-ease)",
                })}>
                    <InfoCircle size={20} />
                </ActionIcon>
            </Link>
            <Link href="/settings" passHref>
                <ActionIcon variant={router.asPath.includes("settings") ? "filled" : "subtle"} sx={() => ({
                    transition: "all .375s var(--animation-ease)",
                })}>
                    <Settings size={20} />
                </ActionIcon>
            </Link>

            <Menubar topBar />

        </Group>}
    </Group>;
}

export function BottomNavBar({ setHidden, hidden, white = false, space }) {
    const locale = useContext(LocaleContext);
    const router = useRouter();
    return <Group position="center" sx={{ flex: 1 }}>
        <MediaQuery smallerThan="sm" styles={{ display: "none" }}><Group ml="md">
            <Avatar src={(space && space.Icon) ?? "/assets/doki-logo.png"} />
            <Text style={{ filter: `brightness(2) drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} className="doki-vfx" sx={(theme) => ({
                fontFamily: "Manrope, sans-serif;",
                fontWeight: 800,
                lineHeight: 1.75,
                color: white ? theme.colors.dark[0] : undefined
            })}>{(space && space.Name) ?? "doki"}</Text>
        </Group></MediaQuery>
        <Group spacing={0}>
            <Link href="/" passHref>
                <UnstyledButton sx={(theme) => ({
                    display: 'block',
                    padding: theme.spacing.xs,
                    borderRadius: theme.radius.sm,
                    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : white ? theme.colors.dark[0] : theme.black,
                    transition: "all .375s var(--animation-ease)",

                    '&:hover': {
                        backgroundColor:
                            theme.colorScheme === 'dark' ? theme.colors.dark[6] + "44" : theme.colors.gray[0] + "44",
                    },

                    ...(router.asPath.includes("viewer") && {
                        backgroundColor: theme.colors[theme.primaryColor][1] + "22",
                        borderRadius: 0
                    })
                })}>
                    <Stack spacing={0} sx={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <Home style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={20} />
                        <Text sx={{ marginRight: "0 !important" }} style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} mr="xs"
                            size="xs">{getLocale(locale).Common["viewer"]}</Text>
                    </Stack>
                </UnstyledButton>
            </Link>
            <Link href="/browser" passHref>
                <UnstyledButton sx={(theme) => ({
                    display: 'block',
                    padding: theme.spacing.xs,
                    borderRadius: theme.radius.sm,
                    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : white ? theme.colors.dark[0] : theme.black,
                    transition: "all .375s var(--animation-ease)",

                    '&:hover': {
                        backgroundColor:
                            theme.colorScheme === 'dark' ? theme.colors.dark[6] + "44" : theme.colors.gray[0] + "44",
                    },

                    ...(router.asPath.includes("browser") && {
                        backgroundColor: theme.colors[theme.primaryColor][1] + "22",
                        borderRadius: 0
                    })
                })}>
                    <Stack spacing={0} sx={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <Folder style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={20} />
                        <Text sx={{ marginRight: "0 !important" }} style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} mr="xs"
                            size="xs">{getLocale(locale).Common["browser"]}</Text>
                    </Stack>
                </UnstyledButton>
            </Link>
            <Link href="/upload" passHref>
                <Tooltip transition="slide-up" label="Upload">
                    <UnstyledButton mx="md" sx={(theme) => ({
                        display: 'block',
                        padding: theme.spacing.xs,
                        borderRadius: theme.radius.xl,
                        border: `1px solid ${theme.colorScheme === 'dark' ? 'rgba(255,255,255,.5)' : white ? 'rgba(255,255,255,.5)' : theme.black}`,
                        color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : white ? theme.colors.dark[0] : theme.black,
                        transition: "all .375s var(--animation-ease)",

                        '&:hover': {
                            backgroundColor:
                                theme.colorScheme === 'dark' ? theme.colors.dark[6] + "44" : theme.colors.gray[0] + "44",
                        },
                    })}>
                        <Group>
                            <Plus style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={20} />
                        </Group>
                    </UnstyledButton>
                </Tooltip>
            </Link>
            <Link href="/updates" passHref>
                <UnstyledButton sx={(theme) => ({
                    display: 'block',
                    padding: theme.spacing.xs,
                    borderRadius: theme.radius.sm,
                    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : white ? theme.colors.dark[0] : theme.black,
                    transition: "all .375s var(--animation-ease)",

                    '&:hover': {
                        backgroundColor:
                            theme.colorScheme === 'dark' ? theme.colors.dark[6] + "44" : theme.colors.gray[0] + "44",
                    },

                    ...(router.asPath.includes("updates") && {
                        backgroundColor: theme.colors[theme.primaryColor][1] + "22",
                        borderRadius: 0
                    })
                })}>
                    <Stack spacing={0} sx={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <InfoCircle style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={20} />
                        <Text sx={{ marginRight: "0 !important" }} style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} mr="xs"
                            size="xs">{getLocale(locale).Common["updates"]}</Text>
                    </Stack>
                </UnstyledButton>
            </Link>
            <Link href="/settings" passHref>
                <UnstyledButton sx={(theme) => ({
                    display: 'block',
                    padding: theme.spacing.xs,
                    borderRadius: theme.radius.sm,
                    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : white ? theme.colors.dark[0] : theme.black,
                    transition: "all .375s var(--animation-ease)",

                    '&:hover': {
                        backgroundColor:
                            theme.colorScheme === 'dark' ? theme.colors.dark[6] + "44" : theme.colors.gray[0] + "44",
                    },

                    ...(router.asPath.includes("settings") && {
                        backgroundColor: theme.colors[theme.primaryColor][1] + "22",
                        borderRadius: 0
                    })
                })}>
                    <Stack spacing={0} sx={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <Settings style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={20} />
                        <Text sx={{ marginRight: "0 !important" }} style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} mr="xs"
                            size="xs">{getLocale(locale).Common["settings"]}</Text>
                    </Stack>
                </UnstyledButton>
            </Link>
        </Group>
    </Group>;
}

export default function Layout({
    space = null,
    children,
    footer = null,
    aside = null,
    navbar = null,
    header = null,
    additionalMainStyle,
    additionalAsideStyle,
    asideContent,
    hiddenAside,
    permanent = true,
    padding = "md",
    noScrollArea = false,
    hideTabbar = false,
    flex = false,
}: Layout) {
    const theme = useMantineTheme();
    const [hidden, setHidden] = useState<boolean>(false);
    const isMobile = useMediaQuery('only screen and (max-width: 768px)');

    const [scroll, scrollTo] = useWindowScroll();

    useEffect(() => {
        if (permanent) {
            setHidden(hiddenAside);
        } else {
            setHidden(hiddenAside);
        }
    }, [hiddenAside, permanent]);

    return <AppShell
        styles={{
            main: {
                background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                transition: "all .375s var(--animation-ease)",
                paddingLeft: flex ? 0 : navbar ? hidden ? 16 : "calc(var(--mantine-navbar-width, 0px) + 16px + 16px)" : undefined,
                paddingRight: flex ? 0 : aside ? hidden ? 16 : "calc(var(--mantine-aside-width, 0px) + 16px + 16px)" : undefined,
                ...additionalMainStyle
            },
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        fixed
        padding={flex ? 0 : padding}
        header={header ? header : footer ? footer : <Header sx={{ transition: "all .375s var(--animation-ease)", backdropFilter: scroll.y > 30 ? "blur(10px)" : undefined, filter: scroll.y > 30 ? `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` : undefined, background: scroll.y > 30 ? theme.colorScheme === 'dark' ? 'rgba(26,27,30,.93)' : 'rgba(255,255,255,.93)' : "transparent", border: "none" }} height={52}>
            <TopNavBar aside={Boolean(aside)} navbar={Boolean(navbar)} space={space} setHidden={(f) => setHidden(f)} hidden={hidden} />
        </Header>}
        navbar={
            navbar ? <Navbar p="md"
                sx={{
                    transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                    filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))`,
                    background: theme.colorScheme === 'dark' ? 'rgba(26,27,30,.98)' : 'rgba(255,255,255,.98)',
                    margin: isMobile ? undefined : 16,
                    height: isMobile ? undefined : `calc(100vh - var(--mantine-header-height, 0px) - var(--mantine-footer-height, 0px) - 16px - 16px)`,
                    border: isMobile ? "none" : `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[3]}`,
                    borderRadius: isMobile ? undefined : theme.other.userRadius === 'sm' ? 8 : theme.radius[theme.other.userRadius],
                    ...(hidden && ':hover' && {
                        opacity: 0.2,
                        backdropFilter: 'blur(0px)'
                    }), ...(hidden && { opacity: 0, left: -(300 - 16), pointerEvents: "none" }),
                    ...additionalAsideStyle
                }} width={{ sm: 200, md: 250, lg: 300 }} zIndex={100}>
                {isMobile ? <Menubar /> : null}
                {noScrollArea ? navbar : <Navbar.Section grow component={ScrollArea} mx="-xs" px="xs">
                    {navbar}
                </Navbar.Section>}
                {hideTabbar ? undefined : <Tabbar />}
            </Navbar> : null
        }
        aside={
            aside ? <Aside p="md"
                sx={{
                    transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                    filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))`,
                    background: theme.colorScheme === 'dark' ? 'rgba(26,27,30,.98)' : 'rgba(255,255,255,.98)',
                    margin: isMobile ? undefined : 16,
                    height: isMobile ? undefined : `calc(100vh - var(--mantine-header-height, 0px) - var(--mantine-footer-height, 0px) - 16px - 16px)`,
                    border: isMobile ? "none" : `1px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[3]}`,
                    borderRadius: isMobile ? undefined : theme.other.userRadius === 'sm' ? 8 : theme.radius[theme.other.userRadius],
                    ...(hidden && ':hover' && {
                        opacity: 0.2,
                        backdropFilter: 'blur(0px)'
                    }), ...(hidden && { opacity: 0, right: -(300 - 16), pointerEvents: "none" }),
                    ...additionalAsideStyle
                }} width={{ sm: 200, md: 250, lg: 300 }} zIndex={100}>
                {isMobile ? <Menubar /> : null}
                {noScrollArea ? aside : <Navbar.Section grow component={ScrollArea} mx="-xs" px="xs">
                    {aside}
                </Navbar.Section>}
                {hideTabbar ? undefined : <Tabbar />}
            </Aside> : null
        }
        footer={isMobile ?
            footer ? footer : <Footer height={64} sx={{ display: 'flex' }}>
                <BottomNavBar space={space} setHidden={(f) => setHidden(f)} hidden={hidden} />
            </Footer> : null
        }
    >
        {flex ? <Center sx={{
            maxHeight: "100vh",
            minHeight: "100vh"
        }}>
            {children}
        </Center> :
            children}
    </AppShell>;
}