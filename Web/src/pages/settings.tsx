import {
    Accordion,
    Aside,
    Autocomplete,
    Badge,
    Button,
    Card,
    ColorScheme,
    Group,
    MantineColor,
    MediaQuery,
    ScrollArea,
    Select,
    Stack,
    Switch,
    Text,
    Title,
    useMantineTheme
} from '@mantine/core';
import {checkCookies, getCookie, setCookies} from 'cookies-next';
import {Check} from 'tabler-icons-react';
import Layout, {Menubar, Tabbar} from '../components/layout';
import SEO from '../components/seo';
import {useEffect, useState} from "react";
import FileRepository from "@server/repositories/FileRepository";
import {Author, File} from "@server/models";
import {useRouter} from 'next/router';
import {languages} from "../../utils/language";
import AuthorRepository from '@server/repositories/AuthorRepository';
import {formatDate, ParseUnixTime} from 'utils/date';

interface PageProps {
    colorScheme: ColorScheme;
    accentColor: MantineColor;
    NSFW: boolean;
    posts: File[];
    author?: Author
}


export async function getServerSideProps({req, res}) {
    const posts = await FileRepository.findAll({
        attributes: ["Folder", "Tags"]
    });
    let author: Author | null;
    try {
        author = await AuthorRepository.findOne({
            where: {
                AuthorId: getCookie('DokiIdentification', {req, res})
            }
        });
    } catch (error) {
        console.error(error);
        author = null;
    }
    return {
        props: {
            colorScheme: checkCookies('color-scheme') ? getCookie('color-scheme', {req, res}) : "dark",
            accentColor: checkCookies('accent-color') ? getCookie('accent-color', {req, res}) : "blue",
            nsfw: checkCookies('allow-nsfw-content') ? getCookie('allow-nsfw-content', {req, res}) : true,
            posts,
            author
        }
    }
}

function Page(props: PageProps) {
    const theme = useMantineTheme();
    const router = useRouter();
    const [colorScheme, setColorScheme] = useState<ColorScheme>(props.colorScheme);
    const [accentColor, setAccentColor] = useState<MantineColor>(props.accentColor);
    const [nsfwOn, setNsfw] = useState<boolean>(props.NSFW);

    function toggleColorScheme() {
        const newColorScheme = colorScheme === 'dark' ? 'light' : 'dark';
        setColorScheme(newColorScheme);
        setCookies('color-scheme', newColorScheme, {maxAge: 60 * 60 * 24 * 30});
        //router.reload();
    }

    function newAccentColor(color: string) {
        setAccentColor(color);
        setCookies('accent-color', color, {maxAge: 60 * 60 * 24 * 30});
        //router.reload();
    }

    function toggleNSFW(event) {
        const newNSFW = event.currentTarget.checked;
        setCookies('allow-nsfw-content', newNSFW, {maxAge: 60 * 60 * 24 * 30});
        //router.reload();
    }

    useEffect(() => {
        if (props.accentColor !== accentColor) setAccentColor(props.accentColor);
        if (props.NSFW !== nsfwOn) setNsfw(props.NSFW);
        if (props.colorScheme !== colorScheme) setColorScheme(props.colorScheme);
    }, [props.accentColor, props.NSFW, props.colorScheme]);

    return <Layout aside={
        <MediaQuery smallerThan="sm" styles={{display: 'none'}}>
            <Aside p="md" hiddenBreakpoint="sm" width={{lg: 300}}>
                <Menubar/>
                <Aside.Section mb="md">
                    <Stack>
                        {props.author ? <Card>
                                <Card.Section>

                                </Card.Section>
                                <Group position="apart" style={{marginBottom: 5, marginTop: theme.spacing.sm}}>
                                    <Text weight="500">
                                        {props.author.Name}
                                    </Text>
                                    <Badge>
                                        ID
                                    </Badge>
                                </Group>
                                <Text size="xs">
                                    First uploaded {formatDate(ParseUnixTime(props.author.CreationDate))}
                                </Text>
                                <Button variant="light" color="blue" fullWidth style={{marginTop: 14}}>
                                    Download profile
                                </Button>
                                <Button variant="light" color="blue" fullWidth style={{marginTop: 14}}>
                                    Import new profile
                                </Button>
                            </Card> :
                            <Card>
                                <Text size="xs">Profile details will be shown here if you upload</Text>
                            </Card>
                        }
                    </Stack>
                </Aside.Section>
                <Aside.Section grow component={ScrollArea} mx="-xs" px="xs">
                    <Stack>
                        <Button variant="default">Content settings</Button>
                        <Button variant="default">UI settings</Button>
                    </Stack>
                </Aside.Section>
                <Tabbar/>
            </Aside></MediaQuery>}>
        <SEO title="Settings" siteTitle="Doki" description="Sneed"/>
        <Group>
            <Title order={5}>
                Settings
            </Title>
            <div style={{flex: 1}}/>
        </Group>
        <Stack>
            <Text size="xs">Content</Text>
            <Autocomplete placeholder="Enter tags and categories you wish to dismiss" data={[]}/>
            <Group position="apart">
                <Text size="xs">Allow not safe for work content to be shown on Doki</Text>
                <Switch checked={nsfwOn} onChange={toggleNSFW} label={nsfwOn ? "On" : "Off"}/>
            </Group>
            <Accordion>
                <Accordion.Item label="Delete profile">
                    <Group position="apart">
                        <Text size="xs">By deleting your profile on Doki, you also risk deleting all of your
                            uploads.</Text>
                        <Button variant="light" color="red">Delete profile</Button>
                    </Group>
                </Accordion.Item>
            </Accordion>
            <Text size="xs">UI</Text>
            <Text size="xs">Language (Beta)</Text>
            <Select value="English" data={languages}/>
            <Text size="xs">Dark mode</Text>
            <Switch checked={colorScheme === 'dark'} onChange={toggleColorScheme}
                    label={colorScheme === 'dark' ? "On" : "Off"}/>
            <Text size="xs">Accent color</Text>
            <Group>
                <Button sx={{transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)"}}
                        onClick={() => newAccentColor("blue")} color="blue" radius="xl">
                    <Check style={{
                        transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                        maxWidth: 0,
                        opacity: 0, ...(accentColor === "blue" && {maxWidth: 24, opacity: 1})
                    }}/>
                </Button>
                <Button sx={{transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)"}}
                        onClick={() => newAccentColor("red")} color="red" radius="xl">
                    <Check style={{
                        transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                        maxWidth: 0,
                        opacity: 0, ...(accentColor === "red" && {maxWidth: 24, opacity: 1})
                    }}/>
                </Button>
                <Button sx={{transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)"}}
                        onClick={() => newAccentColor("green")} color="green" radius="xl">
                    <Check style={{
                        transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                        maxWidth: 0,
                        opacity: 0, ...(accentColor === "green" && {maxWidth: 24, opacity: 1})
                    }}/>
                </Button>
                <Button sx={{transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)"}}
                        onClick={() => newAccentColor("cyan")} color="cyan" radius="xl">
                    <Check style={{
                        transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                        maxWidth: 0,
                        opacity: 0, ...(accentColor === "cyan" && {maxWidth: 24, opacity: 1})
                    }}/>
                </Button>
                <Button sx={{transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)"}}
                        onClick={() => newAccentColor("indigo")} color="indigo" radius="xl">
                    <Check style={{
                        transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                        maxWidth: 0,
                        opacity: 0, ...(accentColor === "indigo" && {maxWidth: 24, opacity: 1})
                    }}/>
                </Button>
                <Button sx={{transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)"}}
                        onClick={() => newAccentColor("pink")} color="pink" radius="xl">
                    <Check style={{
                        transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                        maxWidth: 0,
                        opacity: 0, ...(accentColor === "pink" && {maxWidth: 24, opacity: 1})
                    }}/>
                </Button>
            </Group>
        </Stack>
    </Layout>;
}

export default Page;