import {ReactElement} from 'react';
import {
    ActionIcon,
    AppShell,
    Aside,
    Badge,
    Button,
    CSSObject,
    Divider,
    LoadingOverlay,
    MediaQuery,
    Menu,
    Text,
    Tooltip,
    useMantineTheme
} from '@mantine/core';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import Link from 'next/link';
import {Folder, Home, InfoCircle, Settings, Upload, X} from 'tabler-icons-react';

import Emoji from './emoji';
import {useRouter} from 'next/router';
import {useMediaQuery} from '@mantine/hooks';

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
    additionalMainStyle?: CSSObject
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
    const desktop = useMediaQuery('(min-width: 760px)', false);
    const router = useRouter();

    if (error) return <Aside.Section>
        <Text>The server is down.</Text>
    </Aside.Section>

    return <>
        <Aside.Section style={{flexFlow: 'row wrap', display: 'inline-flex'}}>
            <LoadingOverlay visible={!data}/>
            <Text weight="500">doki</Text><Tooltip label="Work in progress" placement="end"><Badge ml="sm"
                                                                                                   style={{marginTop: 3}}>M2</Badge></Tooltip>
            <div style={{flex: 1}}/>
            {desktop && <><Link href="/" passHref>
                <ActionIcon><Home size={20}/></ActionIcon>
            </Link>
                <Link href="/browser" passHref>
                    <ActionIcon><Folder size={20}/></ActionIcon>
                </Link>
                <Link href="/updates" passHref>
                    <ActionIcon><InfoCircle size={20}/></ActionIcon>
                </Link>
                <Link href="/settings" passHref>
                    <ActionIcon><Settings size={20}/></ActionIcon>
                </Link></>}
            <Menu>
                <Menu.Label>Sitemap</Menu.Label>
                <Link href="/" passHref>
                    <Menu.Item icon={<Home size={14}/>}>Viewer</Menu.Item>
                </Link>
                <Link href="/browser" passHref>
                    <Menu.Item icon={<Folder size={14}/>}>Browser</Menu.Item>
                </Link>
                <Link href="/updates" passHref>
                    <Menu.Item icon={<InfoCircle size={14}/>}>Updates</Menu.Item>
                </Link>
                <Link href="/settings" passHref>
                    <Menu.Item icon={<Settings size={14}/>}>Settings</Menu.Item>
                </Link>
                <Divider/>
                <Link href="/policies" passHref>
                    <Menu.Item>Policies</Menu.Item>
                </Link>
                <Link href="/about" passHref>
                    <Menu.Item>About</Menu.Item>
                </Link>
                <Link href="/license" passHref>
                    <Menu.Item>License</Menu.Item>
                </Link>
                <Divider/>
                <Menu.Label>Created by tokumei with <Emoji symbol={String.fromCodePoint(parseInt("2764", 16))}
                                                           label="Love"/>.<br/>{data && `Currently hosting ${((data.totalSpace - data.freeSpace) / 1e3 / 1e3 / 1e3).toFixed(2)} GB of files. ${(data.freeSpace / 1e3 / 1e3 / 1e3).toFixed(2)} GB available.`}
                </Menu.Label>
            </Menu>
            <MediaQuery largerThan="sm" styles={{display: "none"}}>
                <ActionIcon ml="md" onClick={closeFunc}><X size={20}/></ActionIcon>
            </MediaQuery>
        </Aside.Section>
        <Divider mb="md" size="xs" label={router.asPath}/></>
}

export const Menubar = dynamic(() => Promise.resolve(Mbar), {ssr: false});

export function Tabbar() {
    return <><Divider my="md" size="xs"/>
        <Aside.Section style={{flexFlow: 'row wrap', display: 'inline-flex'}}>
            <Link href="/upload" passHref>
                <Button component="a" variant="outline" style={{flex: 1}} leftIcon={<Upload size={14}/>}>Upload</Button>
            </Link>
        </Aside.Section></>
}

export default function Layout({children, footer, aside, header, navbar, additionalMainStyle}: Layout) {
    const theme = useMantineTheme();
    const desktop = useMediaQuery('(min-width: 760px)', false);
    const router = useRouter();
    return <AppShell
        styles={{
            main: {
                background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                ...additionalMainStyle
            },
        }}
        asideOffsetBreakpoint="sm"
        fixed
        header={null}
        navbar={null}
        aside={aside}
        footer={null}
    >
        {children}
    </AppShell>
}