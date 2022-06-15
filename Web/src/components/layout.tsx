import {ReactElement, useContext, useEffect, useState} from 'react';
import {
    ActionIcon,
    AppShell,
    Aside,
    Button,
    CSSObject,
    Divider,
    Footer,
    Group,
    LoadingOverlay,
    MediaQuery,
    Menu,
    ScrollArea,
    Text,
    UnstyledButton,
    useMantineTheme
} from '@mantine/core';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import Link from 'next/link';
import {Folder, Home, InfoCircle, Menu2, Settings, Upload, X} from 'tabler-icons-react';

import {useRouter} from 'next/router';
import {getLocale, LocaleContext} from "@src/locale";
import Emoji from "@src/components/emoji";

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
}

const fetcher = async (url) => {
    const res = await fetch(url);
    const data = await res.json();

    if (res.status !== 200) {
        throw new Error(data.message);
    }
    return data as Disk;
}

function Mbar({
                  closeFunc = () => {
                  }
              }) {
    const {data, error} = useSWR(() => `/api/disk`, fetcher);
    const locale = useContext(LocaleContext);
    const router = useRouter();

    if (error) return <Aside.Section>
        <Text>The server is down.</Text>
    </Aside.Section>

    return <>
        <Aside.Section mb="sm" style={{flexFlow: 'row wrap', display: 'inline-flex'}}>
            <LoadingOverlay visible={!data}/>
            <Text
                className="use-m-font">{router.asPath.replaceAll('/', '').replace(/\?([;\s\w\"\=\,\:\./\~\{\}\?\!\-\%\&\#\$\^\(\)]*?)\=/, "/")}</Text>
            <div style={{flex: 1}}/>
            <Menu>
                <Menu.Label>Sitemap</Menu.Label>
                <Link href="/" passHref>
                    <Menu.Item icon={<Home size={14}/>}>{getLocale(locale).Common["viewer"]}</Menu.Item>
                </Link>
                <Link href="/browser" passHref>
                    <Menu.Item icon={<Folder size={14}/>}>{getLocale(locale).Common["browser"]}</Menu.Item>
                </Link>
                <Link href="/updates" passHref>
                    <Menu.Item icon={<InfoCircle size={14}/>}>{getLocale(locale).Common["updates"]}</Menu.Item>
                </Link>
                <Link href="/settings" passHref>
                    <Menu.Item icon={<Settings size={14}/>}>{getLocale(locale).Common["settings"]}</Menu.Item>
                </Link>
                <Divider/>
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
                <Divider/>
                <Menu.Label>{`${getLocale(locale).Common["created-by"]} `}<Emoji
                    symbol={String.fromCodePoint(parseInt("2764", 16))}
                    label="Love"/>.<br/>{data && `Currently hosting ${((data.totalSpace - data.freeSpace) / 1e3 / 1e3 / 1e3).toFixed(2)} GB of files. ${(data.freeSpace / 1e3 / 1e3 / 1e3).toFixed(2)} GB available.`}
                </Menu.Label>
            </Menu>
            <MediaQuery largerThan="sm" styles={{display: "none"}}>
                <ActionIcon ml="md" onClick={closeFunc}><X size={20}/></ActionIcon>
            </MediaQuery>
        </Aside.Section></>
}

export const Menubar = dynamic(() => Promise.resolve(Mbar), {ssr: false});

export function Tabbar() {
    const locale = useContext(LocaleContext);
    return <>
        <Aside.Section style={{flexFlow: 'row wrap', display: 'inline-flex'}}>
            <Link href="/upload" passHref>
                <Button component="a" variant="outline" style={{flex: 1}}
                        leftIcon={<Upload size={14}/>}>{getLocale(locale).Common["upload"]}</Button>
            </Link>
        </Aside.Section></>
}

export function BottomNavBar({setHidden, hidden, white = false}) {
    const locale = useContext(LocaleContext);
    const router = useRouter();
    return <Group position="apart">
        <MediaQuery smallerThan="sm" styles={{display: "none"}}><Group ml="md">
            <Text className="doki-vfx" sx={(theme) => ({
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
                        <Home size={20}/>
                        <MediaQuery smallerThan="sm" styles={{display: "none"}}><Text mr="xs"
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
                        <Folder size={20}/>
                        <MediaQuery smallerThan="sm" styles={{display: "none"}}><Text mr="xs"
                                                                                      size="xs">{getLocale(locale).Common["browser"]}</Text></MediaQuery>
                    </Group>
                </UnstyledButton>
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
                        <InfoCircle size={20}/>
                        <MediaQuery smallerThan="sm" styles={{display: "none"}}><Text mr="xs"
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
                        <Settings size={20}/>
                        <MediaQuery smallerThan="sm" styles={{display: "none"}}><Text mr="xs"
                                                                                      size="xs">{getLocale(locale).Common["settings"]}</Text></MediaQuery>
                    </Group>
                </UnstyledButton>
            </Link>
        </Group>
        <ActionIcon sx={(theme) => ({color: white ? theme.colors.dark[0] : undefined})} mr="md"
                    onClick={() => setHidden(!hidden)}><Menu2/></ActionIcon>
    </Group>
}

export default function Layout({
                                   children,
                                   footer = null,
                                   aside = null,
                                   header = null,
                                   navbar = null,
                                   additionalMainStyle,
                                   asideContent,
                                   hiddenAside,
                                   permanent = true,
                                   padding = "md",
                                   hiddenCallback,
                                   noScrollArea = false,
                                   hideTabbar = false
                               }: Layout) {
    const theme = useMantineTheme();
    const [hidden, setHidden] = useState<boolean>(false);

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
                paddingRight: hidden ? 16 : undefined,
                ...additionalMainStyle
            },
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        fixed
        padding={padding}
        header={header}
        navbar={navbar}
        aside={
            aside ? aside : <Aside p="md"
                //onMouseEnter={() => !permanent && setHidden(false)} onMouseLeave={() => !permanent && setHidden(true)}
                                   sx={{
                                       transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                                       background: theme.colorScheme === 'dark' ? 'rgba(26,27,30,.98)' : 'rgba(255,255,255,.98)',
                                       backdropFilter: 'blur(30px)', ...(hidden && ':hover' && {
                                           opacity: 0.2,
                                           backdropFilter: 'blur(0px)'
                                       }), ...(hidden && {opacity: 0, right: -(300 - 16), pointerEvents: "none"})
                                   }} width={{lg: 300}}>
                <Menubar closeFunc={() => {
                    setHidden(true);
                    hiddenCallback && hiddenCallback(true);
                }}/>
                {noScrollArea ? asideContent : <Aside.Section grow component={ScrollArea} mx="-xs" px="xs">
                    {asideContent}
                </Aside.Section>}
                {hideTabbar ? undefined : <Tabbar/>}
            </Aside>
        }
        footer={
            footer ? footer : <Footer height={42}>
                <BottomNavBar setHidden={(f) => setHidden(f)} hidden={hidden}/>
            </Footer>
        }
    >
        {children}
    </AppShell>
}