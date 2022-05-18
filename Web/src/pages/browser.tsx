import {
    Accordion,
    Aside,
    Button,
    Checkbox,
    Divider,
    Group, LoadingOverlay,
    MediaQuery,
    ScrollArea,
    Select,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    Title,
    useMantineTheme
} from '@mantine/core';
import GridItem, {SmallGridItem} from '../components/grid-item';
import Layout, {Menubar, Tabbar} from '../components/layout';
import SEO from '../components/seo';
import {Author, File} from "@server/models";
import {useContext, useEffect, useState} from "react";
import {Edit} from 'tabler-icons-react';
import {useRouter} from 'next/router';
import {getExt, retrieveAllFileTypes, retrieveAllTags} from "../../utils/file";
import Link from "next/link";
import {checkCookies, getCookie} from "cookies-next";
import {NextPageContext} from "next";
import AuthorRepository from "@server/repositories/AuthorRepository";
import useSWR from "swr";
import {showNotification} from "@mantine/notifications";
import {getLocale, LocaleContext} from "@src/locale";

interface PageProps {
    // posts: File[];
    author: Author;
    filter: string[];
}

export async function getServerSideProps(nextPage: NextPageContext) {
    // this is slow as fuck.
    /*const posts = await FileRepository.findAll({
        include: {
            model: Author,
            required: true
        }
    }); */

    let author: Author | null;
    try {
        author = await AuthorRepository.findOne({
            where: {
                AuthorId: getCookie('DokiIdentification', nextPage)
            }
        });

    } catch (error) {
        console.error(error);
        author = null;
    }
    return {
        props: {
            // posts,
            author,
            // messages: (await import(`../../../${nextPage.locale}nodemon.json`)).default,
            filter: checkCookies('filtered', nextPage) ? JSON.parse(getCookie('filtered', nextPage) as string) : []
        }
    };
}

function SearchInput({onSubmit}) {
    const locale = useContext(LocaleContext);
    const [searchTerm, setSearchTerm] = useState<string>('');
    return <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(searchTerm);
    }}><TextInput value={searchTerm} placeholder={`${getLocale(locale).Browser["search"]}`} onChange={(v) => setSearchTerm(v.target.value)}/></form>
}

const fetcher = async (url) => {
    const res = await fetch(url);
    const data = await res.json();

    if (res.status !== 200) {
        throw new Error(data.message);
    }
    return data as File[];
}

function Page(props: PageProps) {
    const theme = useMantineTheme();
    const router = useRouter();
    const locale = useContext(LocaleContext);
    const { data, error } = useSWR('/api/posts', fetcher);
    const [noFiles, setNoFiles] = useState<boolean>(false);
    const [sort, setSort] = useState<string>("Time");
    const [onlyUsers, setOnlyUsers] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [searchF, setSearchF] = useState('');
    const [category, setCategory] = useState(null);
    const [tag, setTag] = useState(null);
    const [type, setType] = useState(null);
    const [selected, setSelected] = useState<File[]>([]);

    useEffect(() => {
        if (router.query["f"]) {
            setCategory(router.query["f"])
        } else {
            setCategory(null);
        }

        if (router.query["t"]) {
            setTag(router.query["t"])
        } else {
            setTag(null);
        }

        if (router.query["type"]) {
            setType(router.query["type"])
        } else {
            setType(null);
        }
    }, [router.query]);

    useEffect(() => {

        console.log(data, error);
        if (error) {
            showNotification({
                color: "red",
                title: "Error loading view",
                message: error.message
            });
        }
        else {
            setNoFiles(data === undefined);
        }
    }, [data, error]);

    function handleSelect(value) {
        setSort(value);
    }

    function handleOnlyUser(event) {
        setOnlyUsers(event.currentTarget.checked);
    }

    function _sort(a, b) {
        switch (sort) {
            case "Time":
                return b.UnixTime - a.UnixTime;
            case "Size":
                return b.Size - a.Size;
            case "Views":
                return b.Views - a.Views;
            default:
                return;
        }
    }

    function toggleEditMode() {
        setEditMode(!editMode);
    }

    function handleSearch(search) {
        setSearchF(search);
    }

    return <Layout aside={
        <MediaQuery smallerThan="sm" styles={{display: 'none'}}>
            <Aside p="md" hiddenBreakpoint="sm" width={{xs: 300, lg: 300}}>
                <LoadingOverlay visible={noFiles}/>
                <Menubar/>
                <SearchInput onSubmit={handleSearch}/>
                <Accordion mt="md" sx={{
                    backgroundColor: theme.colorScheme === "light" ? theme.white : theme.colors.dark[5],
                    borderRadius: 4
                }} styles={{
                    contentInner: {padding: 0}
                }} offsetIcon={false} onChange={toggleEditMode} disableIconRotation>
                    <Accordion.Item sx={{border: "none"}} icon={<Edit size={16}/>} styles={{label: {fontSize: 12}}}
                                    label={`${getLocale(locale).Browser["edit-mode"]}`}>
                        <Stack>
                            <Text size="xs">{selected.length}{` ${getLocale(locale).Browser["selected"]}`}</Text>
                            <Button disabled={selected.length === 0} variant="light">{`${getLocale(locale).Browser["edit-details"]}`}</Button>
                            <Button disabled={selected.length === 0} variant="light" color="red">{`${getLocale(locale).Browser["delete-files"]}`}</Button>
                        </Stack>
                    </Accordion.Item>
                </Accordion>
                <Divider label={`${getLocale(locale).Browser["view-options"]}`} mt="sm"/>
                <Select label={`${getLocale(locale).Browser["sort"]}`} mt="xs" value={sort} onChange={handleSelect} data={["Time", "Size", "Views"]}/>
                <Checkbox disabled={!props.author} label={`${getLocale(locale).Browser["show-only"]}`} mt="sm" checked={onlyUsers}
                          onChange={handleOnlyUser}/>
                <Aside.Section grow component={ScrollArea} mx="-xs" px="xs">
                    <Divider label={`${getLocale(locale).Browser["tags"]}`} mb="sm" my="sm"/>
                    {data && <Stack spacing={0}>
                        {retrieveAllTags(data).map((t, i) =>
                            <Link href={`/browser?t=${t}`} key={i} passHref>
                                <Text size="xs" color={theme.colors.blue[4]} sx={{
                                    textDecoration: "none",
                                    cursor: "pointer",
                                    "&:hover": {textDecoration: "underline"}
                                }}>{t}</Text>
                            </Link>)}
                    </Stack>}
                    <Divider label={`${getLocale(locale).Browser["file-types"]}`}mb="sm" my="sm"/>
                    {data && <Stack spacing={0}>
                        {retrieveAllFileTypes(data).map((t, i) =>
                            <Link href={`/browser?type=${t}`} key={i} passHref>
                                <Text size="xs" color={theme.colors.blue[4]} sx={{
                                    textDecoration: "none",
                                    cursor: "pointer",
                                    "&:hover": {textDecoration: "underline"}
                                }}>{t}</Text>
                            </Link>)}
                    </Stack>}
                </Aside.Section>
                <Tabbar/>
            </Aside></MediaQuery>}>
        <SEO title="Browser" siteTitle="Doki" description="Sneed"/>
        <Group>
            {category && <Title mb="md" order={5}>{category}</Title>}
        </Group>
            {!error && <LoadingOverlay visible={noFiles}/>}
            {noFiles && <>
                <Stack>
                    <Title className="use-m-font fancy-transition1">O.O'</Title>
                    <Text className="use-m-font fancy-transition1">There's no files here!</Text>
                </Stack>
            </>}
        {!category && data && data.find(x => x.Folder) && <SimpleGrid cols={5} mb="md">
            {data.sort(_sort)
                .filter(f => onlyUsers && props.author ? f.AuthorId === props.author.AuthorId : f)
                .filter((x) => x.Folder !== null).filter(f => !props.filter.includes(f.Folder)).map((x) => x.Folder).filter((value, index, self) => self.indexOf(value) === index).filter((x) => x !== null).map((elem, index) =>
                    <SmallGridItem data={elem} key={index}/>)}
        </SimpleGrid>}
        <SimpleGrid cols={5} breakpoints={[
            {maxWidth: 'lg', cols: 4, spacing: 'md'},
            {maxWidth: 'md', cols: 3, spacing: 'md'},
            {maxWidth: 'sm', cols: 2, spacing: 'sm'},
            {maxWidth: 'xs', cols: 1, spacing: 'sm'},
        ]}>
            {data && data
                .sort(_sort)
                .filter(f => onlyUsers && props.author ? f.AuthorId === props.author.AuthorId : f)
                .filter(f => f.Folder ? !props.filter.includes(f.Folder) : f)
                .filter(f => category ? f.Folder === category : f)
                .filter(f => tag ? f.Tags.includes(tag) : f)
                .filter(f => type ? getExt(f.FileURL) === type : f)
                .filter(f => f.Tags ? f.Tags.split(",").map(l => l.match(searchF)) : f)
                .filter(f => f.Title ? f.Title.match(searchF) : f)
                .filter(f => f.FileURL.match(searchF))
                .map((elem, index) =>
                    <GridItem editMode={editMode} selected={selected.includes(elem)}
                              onUnselect={(f) => setSelected(p => p.filter(x => x !== f))}
                              onSelect={(f) => setSelected(p => [...p, f])} data={elem} key={index}/>)}
        </SimpleGrid>
    </Layout>;
}

export default Page;
