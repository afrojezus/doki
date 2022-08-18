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
    Select,
    Stack,
    Switch,
    Text,
    Title,
    Tooltip,
    useMantineColorScheme,
    useMantineTheme
} from '@mantine/core';
import { deleteCookie, getCookie, hasCookie, setCookie } from 'cookies-next';
import { Check } from 'tabler-icons-react';
import Layout from '../components/layout';
import SEO from '../components/seo';
import { useContext, useEffect, useState } from "react";
import FileRepository from "@server/repositories/FileRepository";
import { Author, File, Space } from "@server/models";
import { languages } from "../../utils/language";
import { formatDate, ParseUnixTime } from 'utils/date';
import { Item, Value } from "@src/components/filter-elements";
import { getLocale, LocaleContext } from "@src/locale";
import { useRouter } from "next/router";
import { SeekForAuthor } from "../../utils/id_management";
import { useColorScheme } from '@mantine/hooks';
import { useCallback } from 'react';
import { withSessionSsr } from '@src/lib/session';
import FilledAccordion from '@src/components/filledAccordion';
import { retrieveAllTags } from 'utils/file';

interface PageProps {
    accentColor: MantineColor;
    nsfw: boolean;
    posts: File[];
    author?: Author;
    filter: string[];
    filteredTags: string[];
    locale: string;
    colorScheme: ColorScheme & 'system';
    space: Space;
    colorful: boolean;
    radius: string;
}


export const getServerSideProps = withSessionSsr(async function ({
    req,
    res,
    ...other
}) {
    const space = req.session.space;
    if (space === undefined) {
        res.statusCode = 302;
        return {
            redirect: {
                destination: `/login`,
                permanent: false
            }
        };
    }
    const posts = await FileRepository.findAll({
        where: {
            Space: space.Id
        },
        attributes: ["Folder", "Tags"]
    });
    const author = await SeekForAuthor(getCookie('DokiIdentification', { req, res }));
    return {
        props: {
            space,
            accentColor: hasCookie('accent-color', { req, res }) ? getCookie('accent-color', { req, res }) : "blue",
            colorScheme: hasCookie('color-scheme', { req, res }) ? getCookie('color-scheme', { req, res }) : "system",
            nsfw: hasCookie('allow-nsfw-content', { req, res }) ? getCookie('allow-nsfw-content', { req, res }) : false,
            colorful: hasCookie('colorful', { req, res }) ? getCookie('colorful', { req, res }) : false,
            radius: hasCookie('radius', { req, res }) ? getCookie('radius', { req, res }) : 'sm',
            locale: hasCookie('locale', { req, res }) ? getCookie('locale', { req, res }) : "en",
            filter: hasCookie('filtered', { req, res }) ? JSON.parse(getCookie('filtered', { req, res }) as string) : [],
            filteredTags: hasCookie('filtered-tags', { req, res }) ? JSON.parse(getCookie('filtered-tags', { req, res }) as string) : [],
            posts,
            author,
        }
    };
});

function Page(props: PageProps) {
    const theme = useMantineTheme();
    const router = useRouter();
    const loc = useContext(LocaleContext);
    const [selectedColorScheme, setSelectedColorScheme] = useState<ColorScheme & 'system'>(props.colorScheme);
    const preferredColorScheme = useColorScheme();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const [accentColor, setAccentColor] = useState<MantineColor>(props.accentColor);
    const [nsfwOn, setNsfw] = useState<boolean>(props.nsfw);
    const [filter, setFilter] = useState<string[]>(props.filter);
    const [filteredTags, setFilteredTags] = useState<string[]>(props.filteredTags);
    const [locale, setLocale] = useState<string>(props.locale);
    const [colorful, setColorful] = useState<boolean>(props.colorful);
    const [radius, setRadius] = useState<string>(props.radius);

    const tCS = useCallback((v) => {
        setSelectedColorScheme(v);
        const newColorScheme = v === 'system' ? preferredColorScheme : v;
        toggleColorScheme(newColorScheme);
        setCookie('color-scheme', v, { maxAge: 60 * 60 * 24 * 30 });
        //router.reload();
    }, [selectedColorScheme]);

    async function newAccentColor(color: string) {
        setAccentColor(color);
        setCookie('accent-color', color, { maxAge: 60 * 60 * 24 * 30 });
        await router.replace(router.asPath);
    }

    async function newLocale(loc: string) {
        setLocale(loc);
        setCookie('locale', loc, { maxAge: 60 * 60 * 24 * 30 });
        await router.replace(router.asPath);
    }

    async function toggleNSFW(event) {
        const newNSFW = event.currentTarget.checked;
        setCookie('allow-nsfw-content', newNSFW, { maxAge: 60 * 60 * 24 * 30 });
        await router.replace(router.asPath);
    }

    async function toggleColorful(event) {
        const newColorful = event.currentTarget.checked;
        setCookie('colorful', newColorful, { maxAge: 60 * 60 * 24 * 30 });
        await router.replace(router.asPath);
    }

    async function changeRadius(value) {
        setCookie('radius', value, { maxAge: 60 * 60 * 24 * 30 });
        await router.replace(router.asPath);
    }

    useEffect(() => {
        if (props.accentColor !== accentColor) setAccentColor(props.accentColor);
        if (props.nsfw !== nsfwOn) setNsfw(props.nsfw);
        if (props.filter !== filter) setFilter(props.filter);
        if (props.filteredTags !== filteredTags) setFilteredTags(props.filteredTags);
        if (props.colorful !== colorful) setColorful(props.colorful);
        if (props.radius !== radius) setRadius(props.radius);
    }, [props.accentColor, props.nsfw, props.filter, props.colorful, props.radius, props.filteredTags]);

    return <Layout space={props.space} navbar={<>
        <Stack mb="md">
            {props.author ? <Card>
                <Card.Section>

                </Card.Section>
                <Group position="apart" style={{ marginBottom: 5, marginTop: theme.spacing.sm }}>
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
                <Button variant="light" fullWidth style={{ marginTop: 14 }}>
                    {`${getLocale(loc).Settings["download-profile"]}`}
                </Button>
                <Button variant="light" fullWidth style={{ marginTop: 14 }}>
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
        <SEO title="Settings" siteTitle="Doki" description="Sneed" />
        <Stack ml="auto" mr="auto" sx={{ maxWidth: 800 }}>
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
                        setCookie('filtered', JSON.stringify(e), { maxAge: 60 * 60 * 24 * 30 });
                    }
                }
                }
            />
            <MultiSelect data={[...retrieveAllTags(props.posts)]}
                valueComponent={Value}
                itemComponent={Item} defaultValue={props.filteredTags}
                searchable
                styles={{
                    searchInput: {
                        fontFamily: 'Manrope',
                        fontWeight: 700
                    }
                }}
                placeholder="Pick some tags"
                label={`Which tags do you wish to hide?`}
                onChange={(e) => {
                    setFilter(e);
                    if (e.length <= 0) {
                        deleteCookie('filtered-tags');
                    } else {
                        setCookie('filtered-tags', JSON.stringify(e), { maxAge: 60 * 60 * 24 * 30 });
                    }
                }
                }
            />
            <Group position="apart">
                <Text size="xs">{`${getLocale(loc).Settings["nsfw-label"]}`}</Text>
                <Switch checked={nsfwOn} onChange={toggleNSFW} label={nsfwOn ? getLocale(loc).Settings["on"] : getLocale(loc).Settings["off"]} />
            </Group>
            <FilledAccordion>
                <Accordion.Item value="delete-profile">
                    <Accordion.Control>
                        {getLocale(loc).Settings["delete-profile-label"]}
                    </Accordion.Control>
                    <Accordion.Panel>
                        <Group position="apart">
                            <Text size="xs">By deleting your profile on Doki, you also risk deleting all of your
                                uploads.</Text>
                            <Button variant="light" color="red">{`${getLocale(loc).Settings["delete-profile-label"]}`}</Button>
                        </Group>
                    </Accordion.Panel>
                </Accordion.Item>
            </FilledAccordion>
            <Divider size="xs" label={`${getLocale(loc).Settings["ui"]}`} mt="md" />
            <Select label={`${getLocale(loc).Settings["language-label"]}`} value={locale} data={languages} onChange={newLocale} />
            <Radio.Group label="Appearence" value={selectedColorScheme} onChange={tCS} description="Change how the site should look like">
                <Radio value="light" label="Light" />
                <Radio value="dark" label="Dark" />
                <Radio value="system" label="Use system settings" />
            </Radio.Group>
            <Text size="xs">{`${getLocale(loc).Settings["accent-color"]}`}</Text>
            <Group>
                <Button sx={{ transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)" }}
                    onClick={() => newAccentColor("blue")} color="blue" radius="xl">
                    <Check style={{
                        transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                        maxWidth: 0,
                        opacity: 0, ...(accentColor === "blue" && { maxWidth: 24, opacity: 1 })
                    }} />
                </Button>
                <Button sx={{ transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)" }}
                    onClick={() => newAccentColor("red")} color="red" radius="xl">
                    <Check style={{
                        transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                        maxWidth: 0,
                        opacity: 0, ...(accentColor === "red" && { maxWidth: 24, opacity: 1 })
                    }} />
                </Button>
                <Button sx={{ transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)" }}
                    onClick={() => newAccentColor("green")} color="green" radius="xl">
                    <Check style={{
                        transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                        maxWidth: 0,
                        opacity: 0, ...(accentColor === "green" && { maxWidth: 24, opacity: 1 })
                    }} />
                </Button>
                <Button sx={{ transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)" }}
                    onClick={() => newAccentColor("cyan")} color="cyan" radius="xl">
                    <Check style={{
                        transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                        maxWidth: 0,
                        opacity: 0, ...(accentColor === "cyan" && { maxWidth: 24, opacity: 1 })
                    }} />
                </Button>
                <Button sx={{ transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)" }}
                    onClick={() => newAccentColor("indigo")} color="indigo" radius="xl">
                    <Check style={{
                        transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                        maxWidth: 0,
                        opacity: 0, ...(accentColor === "indigo" && { maxWidth: 24, opacity: 1 })
                    }} />
                </Button>
                <Button sx={{ transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)" }}
                    onClick={() => newAccentColor("pink")} color="pink" radius="xl">
                    <Check style={{
                        transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                        maxWidth: 0,
                        opacity: 0, ...(accentColor === "pink" && { maxWidth: 24, opacity: 1 })
                    }} />
                </Button>
                <Button sx={{ transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)" }}
                    onClick={() => newAccentColor("teal")} color="teal" radius="xl">
                    <Check style={{
                        transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                        maxWidth: 0,
                        opacity: 0, ...(accentColor === "teal" && { maxWidth: 24, opacity: 1 })
                    }} />
                </Button>
                <Button sx={{ transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)" }}
                    onClick={() => newAccentColor("lime")} color="lime" radius="xl">
                    <Check style={{
                        transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                        maxWidth: 0,
                        opacity: 0, ...(accentColor === "lime" && { maxWidth: 24, opacity: 1 })
                    }} />
                </Button>
                <Button sx={{ transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)" }}
                    onClick={() => newAccentColor("orange")} color="orange" radius="xl">
                    <Check style={{
                        transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                        maxWidth: 0,
                        opacity: 0, ...(accentColor === "orange" && { maxWidth: 24, opacity: 1 })
                    }} />
                </Button>
                <Button sx={{ transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)" }}
                    onClick={() => newAccentColor("gray")} color="gray" radius="xl">
                    <Check style={{
                        transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
                        maxWidth: 0,
                        opacity: 0, ...(accentColor === "gray" && { maxWidth: 24, opacity: 1 })
                    }} />
                </Button>
            </Group>
            <Group position="apart">
                <Text size="xs">Make the accent color affect the entire UI</Text>
                <Switch checked={colorful} onChange={toggleColorful} label={colorful ? getLocale(loc).Settings["on"] : getLocale(loc).Settings["off"]} />
            </Group>
            <Stack>
                <Text size="xs">Adjust the border radius of all UI elements</Text>
                <Button.Group>
                    <Button onClick={() => changeRadius('xs')} variant={radius === 'xs' ? 'filled' : 'default'}>Extra small</Button>
                    <Button onClick={() => changeRadius('sm')} variant={radius === 'sm' ? 'filled' : 'default'}>Small</Button>
                    <Button onClick={() => changeRadius('md')} variant={radius === 'md' ? 'filled' : 'default'}>Medium</Button>
                    <Button onClick={() => changeRadius('lg')} variant={radius === 'lg' ? 'filled' : 'default'}>Large</Button>
                </Button.Group>
            </Stack>
            <Divider size="xs" label="Third-party support" mt="md" />
            <Text size="xs">ShareX</Text>
            <Text size="xs">Under construction!</Text>
            <Text size="xs">Discord</Text>
            <Text size="xs">Under construction!</Text>
            <Divider size="xs" label="Mobile" mt="md" />
            <Text size="xs">Official client</Text>
            <Text size="xs">Under construction!</Text>
            <Divider size="xs" label="Support" mt="md" />
            <Tooltip label="Send us a ticket if you wish to remove a space or other reasons"><Button>Send a support ticket</Button></Tooltip>
        </Stack>
    </Layout>;
}

export default Page;
