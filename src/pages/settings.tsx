import {
    Accordion,
    Badge,
    Button,
    Card,
    ColorScheme,
    Divider,
    Group,
    MantineColor,
    MultiSelect,
    Radio,
    RadioGroup,
    Select,
    Stack,
    Switch,
    Text,
    useMantineColorScheme,
    useMantineTheme
} from '@mantine/core';
import {deleteCookie, getCookie, hasCookie, setCookies} from 'cookies-next';
import {Check} from 'tabler-icons-react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import {useContext, useEffect, useState} from "react";
import FileRepository from "@server/repositories/FileRepository";
import {Author, File} from "@server/models";
import {languages} from "../../utils/language";
import {formatDate, ParseUnixTime} from 'utils/date';
import {Item, Value} from "@src/components/filter-elements";
import {getLocale, LocaleContext} from "@src/locale";
import {useRouter} from "next/router";
import {SeekForAuthor} from "../../utils/id_management";
import { useColorScheme } from '@mantine/hooks';
import { useCallback } from 'react';

interface PageProps {
    accentColor: MantineColor;
    NSFW: boolean;
    posts: File[];
    author?: Author;
    filter: string[];
    locale: string;
    colorScheme: ColorScheme & 'system'
}


export async function getServerSideProps({req, res}) {
    const posts = await FileRepository.findAll({
        attributes: ["Folder", "Tags"]
    });
    const author = await SeekForAuthor(getCookie('DokiIdentification', {req, res}));
    return {
        props: {
            accentColor: hasCookie('accent-color', {req, res}) ? getCookie('accent-color', {req, res}) : "blue",
            colorScheme: hasCookie('color-scheme', { req, res }) ? getCookie('color-scheme', { req, res }) : "system",
            nsfw: hasCookie('allow-nsfw-content', {req, res}) ? getCookie('allow-nsfw-content', {req, res}) : true,
            locale: hasCookie('locale', {req,res}) ? getCookie('locale', {req,res}) : "en",
            filter: hasCookie('filtered', {req, res}) ? JSON.parse(getCookie('filtered', {req, res}) as string) : [],
            posts,
            author,
        }
    }
}

function Page(props: PageProps) {
    const theme = useMantineTheme();
    const router = useRouter();
    const loc = useContext(LocaleContext);
    const [selectedColorScheme, setSelectedColorScheme] = useState<ColorScheme & 'system'>(props.colorScheme);
    const preferredColorScheme = useColorScheme();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const [accentColor, setAccentColor] = useState<MantineColor>(props.accentColor);
    const [nsfwOn, setNsfw] = useState<boolean>(props.NSFW);
    const [filter, setFilter] = useState<string[]>(props.filter);
    const [locale, setLocale] = useState<string>(props.locale);

    const tCS = useCallback((v) =>  {
        setSelectedColorScheme(v);
        const newColorScheme = v === 'system' ? preferredColorScheme : v;
        toggleColorScheme(newColorScheme);
        setCookies('color-scheme', v, {maxAge: 60 * 60 * 24 * 30});
        //router.reload();
    }, [selectedColorScheme]);

    async function newAccentColor(color: string) {
        setAccentColor(color);
        setCookies('accent-color', color, {maxAge: 60 * 60 * 24 * 30});
        await router.replace(router.asPath);
    }

    async function newLocale(loc: string) {
        setLocale(loc);
        setCookies('locale', loc, {maxAge: 60 * 60 * 24 * 30});
        await router.replace(router.asPath);
    }

    async function toggleNSFW(event) {
        const newNSFW = event.currentTarget.checked;
        setCookies('allow-nsfw-content', newNSFW, {maxAge: 60 * 60 * 24 * 30});
        await router.replace(router.asPath);
    }

    useEffect(() => {
        if (props.accentColor !== accentColor) setAccentColor(props.accentColor);
        if (props.NSFW !== nsfwOn) setNsfw(props.NSFW);
        if (props.filter !== filter) setFilter(props.filter);
    }, [props.accentColor, props.NSFW, props.filter]);

    return <Layout asideContent={<>
            <Stack mb="md">
                {props.author ? <Card>
                        <Card.Section>

                        </Card.Section>
                        <Group position="apart" style={{marginBottom: 5, marginTop: theme.spacing.sm}}>
                            <Text weight={500}>
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
                <Button variant="default">Third-party support</Button>
                <Button variant="default">Mobile</Button>
            </Stack>
    </>}>
        <SEO title="Settings" siteTitle="Doki" description="Sneed"/>
        <Stack ml="auto" mr="auto" sx={{maxWidth: 800}}>
            <Divider size="xs" label={`${getLocale(loc).Settings["content"]}`} />
            <MultiSelect data={[...props.posts.map(x => x.Folder).filter((value, index, self) => self.indexOf(value) === index).filter(x => x !== null && x !== '').map(x => x)]}
            valueComponent={Value}
            itemComponent={Item} defaultValue={props.filter}
            searchable
            styles={{
                searchInput: {
                    fontFamily: 'Manrope',
                    fontWeight: 700
                }
            }}
            placeholder="Pick a category"
            label={`${getLocale(loc).Settings["filter-label"]}`}
                         onChange={(e) => {
                             setFilter(e);
                             if (e.length <= 0) {
                                 deleteCookie('filtered');
                             } else {
                                 setCookies('filtered', JSON.stringify(e), {maxAge: 60 * 60 * 24 * 30});
                             }
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
            <Divider size="xs" label={`${getLocale(loc).Settings["ui"]}`} mt="md" />
            <Text size="xs">{`${getLocale(loc).Settings["language-label"]}`}</Text>
            <Select value={locale} data={languages} onChange={newLocale}/>
            <RadioGroup label="Appearence" value={selectedColorScheme} onChange={tCS} description="Change how the site should look like">
                <Radio value="light" label="Light" />
                <Radio value="dark" label="Dark" />
                <Radio value="system" label="Use system settings" />
            </RadioGroup>
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
            <Divider size="xs" label="Third-party support" mt="md" />
            <Text size="xs">ShareX</Text>
            <Text size="xs">Under construction!</Text>
            <Text size="xs">Discord</Text>
            <Text size="xs">Under construction!</Text>
            <Divider size="xs" label="Mobile" mt="md" />
            <Text size="xs">Official client</Text>
            <Text size="xs">Under construction!</Text>
        </Stack>
    </Layout>;
}

export default Page;
