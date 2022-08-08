import { ReactElement, useContext, useEffect, useState } from 'react';
import {
    ActionIcon,
    AppShell,
    Aside,
    Burger,
    Button,
    Container,
    CSSObject,
    Divider,
    Footer,
    Group,
    Header,
    LoadingOverlay,
    MediaQuery,
    Menu,
    ScrollArea,
    Text,
    Tooltip,
    UnstyledButton,
    useMantineTheme
} from '@mantine/core';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import Link from 'next/link';
import { Folder, Home, InfoCircle, Plus, ServerOff, Settings, Upload } from 'tabler-icons-react';

import { useRouter } from 'next/router';
import { getLocale, LocaleContext } from "@src/locale";
import Emoji from "@src/components/emoji";
import { useMediaQuery } from "@mantine/hooks";

interface Disk {
    freeSpace: number;
    totalSpace: number;
}

interface Layout {
    children: any;
    footer?: ReactElement;
    aside?: ReactElement;
    header?: ReactElement;
    navbar?: ReactElement;
    additionalMainStyle?: CSSObject;
    asideContent?: any;
    hiddenAside?: boolean;
    permanent?: boolean;
    padding?: any;
    hiddenCallback?: (h: boolean) => void;
    hideTabbar?: boolean;
    noScrollArea?: boolean;
    onMouseLeave?: () => void;
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
    const { data, error } = useSWR(() => `/api/disk`, fetcher);
    const locale = useContext(LocaleContext);
    const router = useRouter();

    if (topBar) {
        if (error) return <Tooltip label="The server is down"><ActionIcon><ServerOff color="red" /></ActionIcon></Tooltip>;
        return <>
            <Menu transition="pop-top-right">
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
            </Menu>
        </>;
    }

    if (error) return <Aside.Section>
        <Text className="use-m-font" mb="md">The server is down.</Text>
    </Aside.Section>;

    return <>
        <Aside.Section mb="sm" style={{ flexFlow: 'row wrap', display: 'inline-flex' }}>
            <Text
                className="use-m-font">{router.asPath.split("/").join("").replace(/\?([;\s\w\"\=\,\:\./\~\{\}\?\!\-\%\&\#\$\^\(\)]*?)\=/, "/")}</Text>
            <div style={{ flex: 1 }} />
            <Menu transition="pop-top-right">
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
                <Link href="/policies" passHref>
                    <Menu.Item>Policies</Menu.Item>
                </Link>
                <Link href="/streamshare" passHref>
                    <Menu.Item>{getLocale(locale).Modes["ss"]}</Menu.Item>
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

export function TopNavBar({ setHidden, hidden, white = false }) {
    const router = useRouter();
    return <Group sx={{ height: '100%' }} position="apart">
        <MediaQuery smallerThan="sm" styles={{ display: "none" }}><Group ml="md">
            <Link href="/" passHref><Text className="doki-vfx" sx={(theme) => ({
                fontFamily: "Manrope, sans-serif;",
                fontWeight: 800,
                lineHeight: 1.75,
                color: white ? theme.colors.dark[0] : undefined
            })}>doki</Text></Link>
            {/*<Tooltip label="Work in progress" placement="end"><Badge sx={{ marginBottom: 4 }}>M2</Badge></Tooltip>*/}
            <Text
                className="use-m-font">{router.asPath.split('/').join('').replace(/\?([;\s\w\"\=\,\:\./\~\{\}\?\!\-\%\&\#\$\^\(\)]*?)\=/, "/")}</Text>
        </Group></MediaQuery>
        <Group>
            <Link href="/" passHref>
                <ActionIcon variant={router.asPath.includes("viewer") ? "filled" : "hover"} sx={() => ({
                    transition: "all .375s var(--animation-ease)",
                })}>
                    <Home size={20} />
                </ActionIcon>
            </Link>
            <Link href="/browser" passHref>
                <ActionIcon variant={router.asPath.includes("browser") ? "filled" : "hover"} sx={() => ({
                    transition: "all .375s var(--animation-ease)",
                })}>
                    <Folder size={20} />
                </ActionIcon>
            </Link>
            <Link href="/updates" passHref>
                <ActionIcon variant={router.asPath.includes("updates") ? "filled" : "hover"} sx={() => ({
                    transition: "all .375s var(--animation-ease)",
                })}>
                    <InfoCircle size={20} />
                </ActionIcon>
            </Link>
            <Link href="/settings" passHref>
                <ActionIcon variant={router.asPath.includes("settings") ? "filled" : "hover"} sx={() => ({
                    transition: "all .375s var(--animation-ease)",
                })}>
                    <Settings size={20} />
                </ActionIcon>
            </Link>

            <Menubar topBar />
            <Burger sx={(theme) => ({ color: white ? theme.colors.dark[0] : undefined })} mr="md"
                onClick={() => setHidden(!hidden)} opened={!hidden} size="sm"></Burger>

        </Group>
    </Group>;
}

export function BottomNavBar({ setHidden, hidden, white = false }) {
    const locale = useContext(LocaleContext);
    const router = useRouter();
    return <Group position="apart">
        <MediaQuery smallerThan="sm" styles={{ display: "none" }}><Group ml="md">
            <Text style={{ filter: `brightness(2) drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} className="doki-vfx" sx={(theme) => ({
                fontFamily: "Manrope, sans-serif;",
                fontWeight: 800,
                lineHeight: 1.75,
                color: white ? theme.colors.dark[0] : undefined
            })}>doki</Text>
            {/*<Tooltip label="Work in progress" placement="end"><Badge sx={{ marginBottom: 4 }}>M2</Badge></Tooltip>*/}
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
                    <Group>
                        <Home style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={20} />
                        <MediaQuery smallerThan="sm" styles={{ display: "none" }}><Text style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} mr="xs"
                            size="xs">{getLocale(locale).Common["viewer"]}</Text></MediaQuery>
                    </Group>
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
                    <Group>
                        <Folder style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={20} />
                        <MediaQuery smallerThan="sm" styles={{ display: "none" }}><Text style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} mr="xs"
                            size="xs">{getLocale(locale).Common["browser"]}</Text></MediaQuery>
                    </Group>
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

                        ...(router.asPath.includes("upload") && {
                            backgroundColor: theme.colors[theme.primaryColor][1] + "22",
                            borderRadius: 0
                        })
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
                    <Group>
                        <InfoCircle style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={20} />
                        <MediaQuery smallerThan="sm" styles={{ display: "none" }}><Text style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} mr="xs"
                            size="xs">{getLocale(locale).Common["updates"]}</Text></MediaQuery>
                    </Group>
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
                    <Group>
                        <Settings style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size={20} />
                        <MediaQuery smallerThan="sm" styles={{ display: "none" }}><Text style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} mr="xs"
                            size="xs">{getLocale(locale).Common["settings"]}</Text></MediaQuery>
                    </Group>
                </UnstyledButton>
            </Link>
        </Group>
        <Burger style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} color={white ? `#fff` : undefined} mr="md"
            onClick={() => setHidden(!hidden)} opened={!hidden} size="sm"></Burger>
    </Group>;
}

export default function Layout({
    children,
    footer = null,
    aside = null,
    navbar = null,
    additionalMainStyle,
    asideContent,
    hiddenAside,
    permanent = true,
    padding = "md",
    noScrollArea = false,
    hideTabbar = false,
    onMouseLeave,
}: Layout) {
    const theme = useMantineTheme();
    const router = useRouter();
    const [hidden, setHidden] = useState<boolean>(false);
    const isMobile = useMediaQuery('only screen and (max-width: 768px)');

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
                position: "fixed",
                background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                transition: "all .375s var(--animation-ease)",
                paddingTop: "calc(var(--mantine-header-height, 0px))",
                paddingLeft: "calc(var(--mantine-navbar-width, 0px))",
                paddingBottom: "calc(var(--mantine-footer-height, 0px))",
                paddingRight: hidden && permanent ? 16 : "calc(var(--mantine-aside-width, 0px))",
                ...additionalMainStyle
            },
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        fixed
        padding={padding}
        header={!isMobile ? footer ? footer : <Header style={{ filter: `drop-shadow(0px 1px 2px rgb(0 0 0 / 0.1))` }} height={52}>
            <TopNavBar setHidden={(f) => setHidden(f)} hidden={hidden} />
        </Header> : null}
        navbar={navbar}
        aside={
            aside ? aside : <Aside p="md"
                //onMouseEnter={() => !permanent && setHidden(false)} onMouseLeave={() => !permanent && setHidden(true)}
                onMouseLeave={onMouseLeave}
                sx={{
                    transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                    background: theme.colorScheme === 'dark' ? 'rgba(26,27,30,.98)' : 'rgba(255,255,255,.98)',
                    backdropFilter: 'blur(30px)', ...(hidden && ':hover' && {
                        opacity: 0.2,
                        backdropFilter: 'blur(0px)'
                    }), ...(hidden && { opacity: 0, right: -(300 - 16), pointerEvents: "none" })
                }} width={{ sm: 200, md: 250, lg: 300 }}>
                {isMobile || router.asPath.includes("view") ? <Menubar /> : null}
                {noScrollArea ? asideContent : <Aside.Section grow component={ScrollArea} mx="-xs" px="xs">
                    {asideContent}
                </Aside.Section>}
                {hideTabbar ? undefined : <Tabbar />}
            </Aside>
        }
        footer={isMobile ?
            footer ? footer : <Footer height={42}>
                <BottomNavBar setHidden={(f) => setHidden(f)} hidden={hidden} />
            </Footer> : null
        }
    >
        <Container sx={{
            maxWidth: "100%",
            paddingTop: 16,
            paddingBottom: "calc(var(--mantine-footer-height, 0px) + 16px)",
            paddingLeft: "calc(var(--mantine-navbar-width, 0px) + 16px)",
            paddingRight: "calc(var(--mantine-footer-height, 0px) + 16px)",
            maxHeight: "calc(100vh - var(--mantine-header-height, 0px))",
            overflow: "auto",
            height: "100vh",
        }}>
            {children}
        </Container>
    </AppShell>;
}