import {
    Accordion,
    Aside,
    Badge,
    Button,
    Card,
    ColorScheme,
    Group,
    MantineColor,
    MediaQuery, MultiSelect,
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
import {useContext, useEffect, useState} from "react";
import FileRepository from "@server/repositories/FileRepository";
import {Author, File} from "@server/models";
import {languages} from "../../utils/language";
import AuthorRepository from '@server/repositories/AuthorRepository';
import {formatDate, ParseUnixTime} from 'utils/date';
import {Item, Value} from "@src/components/filter-elements";
import {getLocale, LocaleContext} from "@src/locale";

interface PageProps {
    colorScheme: ColorScheme;
    accentColor: MantineColor;
    NSFW: boolean;
    posts: File[];
    author?: Author;
    filter: string[];
    locale: string;
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
            locale: checkCookies('locale', {req,res}) ? getCookie('locale', {req,res}) : "en",
            filter: checkCookies('filtered', {req, res}) ? JSON.parse(getCookie('filtered', {req, res}) as string) : [],
            posts,
            author,
        }
    }
}

function Page(props: PageProps) {
    const theme = useMantineTheme();
    const loc = useContext(LocaleContext);
    const [colorScheme, setColorScheme] = useState<ColorScheme>(props.colorScheme);
    const [accentColor, setAccentColor] = useState<MantineColor>(props.accentColor);
    const [nsfwOn, setNsfw] = useState<boolean>(props.NSFW);
    const [filter, setFilter] = useState<string[]>(props.filter);
    const [locale, setLocale] = useState<string>(props.locale);

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

    function newLocale(loc: string) {
        setLocale(loc);
        setCookies('locale', loc, {maxAge: 60 * 60 * 24 * 30});
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
        if (props.filter !== filter) setFilter(props.filter);
    }, [props.accentColor, props.NSFW, props.colorScheme, props.filter]);

    return <Layout asideContent={<>
            <Stack mb="md">
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
                            {`${getLocale(loc).Settings["first-uploaded"]} `}{formatDate(ParseUnixTime(props.author.CreationDate))}
                        </Text>
                        <Button variant="light" color="blue" fullWidth style={{marginTop: 14}}>
                            {`${getLocale(loc).Settings["download-profile"]}`}
                        </Button>
                        <Button variant="light" color="blue" fullWidth style={{marginTop: 14}}>
                            {`${getLocale(loc).Settings["import-profile"]}`}
                        </Button>
                    </Card> :
                    <Card>
                        <Text size="xs">{`${getLocale(loc).Settings["details-desc"]}`}</Text>
                    </Card>
                }
            </Stack>
            <Stack>
                <Button variant="default">{`${getLocale(loc).Settings["content-settings"]}`}</Button>
                <Button variant="default">{`${getLocale(loc).Settings["ui-settings"]}`}</Button>
            </Stack>
    </>}>
        <SEO title="Settings" siteTitle="Doki" description="Sneed"/>
        <Group>
            <Title order={5}>
                {`${getLocale(loc).Settings["settings"]}`}
            </Title>
            <div style={{flex: 1}}/>
        </Group>
        <Stack>
            <Text size="xs">{`${getLocale(loc).Settings["content"]}`}</Text>
            <MultiSelect data={[...props.posts.map(x => x.Folder).filter((value, index, self) => self.indexOf(value) === index).filter(x => x !== null).map(x => x)]}
            valueComponent={Value}
            itemComponent={Item} defaultValue={props.filter}
            searchable
            placeholder="Pick a category"
            label={`${getLocale(loc).Settings["filter-label"]}`}
                         onChange={(e) => {
                             setFilter(e)
                             setCookies('filtered', JSON.stringify(e), {maxAge: 60 * 60 * 24 * 30});
                         }
                         }
            />
            <Group position="apart">
                <Text size="xs">{`${getLocale(loc).Settings["nsfw-label"]}`}</Text>
                <Switch checked={nsfwOn} onChange={toggleNSFW} label={nsfwOn ? getLocale(loc).Settings["on"] : getLocale(loc).Settings["off"]}/>
            </Group>
            <Accordion>
                <Accordion.Item label={`${getLocale(loc).Settings["delete-profile-label"]}`}>
                    <Group position="apart">
                        <Text size="xs">By deleting your profile on Doki, you also risk deleting all of your
                            uploads.</Text>
                        <Button variant="light" color="red">{`${getLocale(loc).Settings["delete-profile-label"]}`}</Button>
                    </Group>
                </Accordion.Item>
            </Accordion>
            <Text size="xs">{`${getLocale(loc).Settings["ui"]}`}</Text>
            <Text size="xs">{`${getLocale(loc).Settings["language-label"]}`}</Text>
            <Select value={locale} data={languages} onChange={newLocale}/>
            <Text size="xs">{`${getLocale(loc).Settings["dark-mode"]}`}</Text>
            <Switch checked={colorScheme === 'dark'} onChange={toggleColorScheme}
                    label={colorScheme === 'dark' ? "On" : "Off"}/>
            <Text size="xs">{`${getLocale(loc).Settings["accent-color"]}`}</Text>
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
