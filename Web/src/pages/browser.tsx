import {
    Accordion,
    Aside,
    Button,
    Checkbox,
    Divider,
    Group,
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
import FileRepository from "@server/repositories/FileRepository";
import {useEffect, useState} from "react";
import {Edit} from 'tabler-icons-react';
import {useRouter} from 'next/router';
import {getExt, retrieveAllFileTypes, retrieveAllTags} from "../../utils/file";
import Link from "next/link";
import {checkCookies, getCookie} from "cookies-next";
import {NextPageContext} from "next";
import AuthorRepository from "@server/repositories/AuthorRepository";

interface PageProps {
    posts: File[];
    author: Author;
    filter: string[];
}

export async function getServerSideProps(nextPage: NextPageContext) {
    const posts = await FileRepository.findAll({
        include: {
            model: Author,
            required: true
        }
    });

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
            posts, author, messages: (await import(`../../../${nextPage.locale}.json`)).default,
            filter: checkCookies('filtered', nextPage) ? JSON.parse(getCookie('filtered', nextPage) as string) : []
        }
    };
}

function SearchInput({onSubmit}) {
    const [searchTerm, setSearchTerm] = useState<string>('');
    return <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(searchTerm);
    }}><TextInput value={searchTerm} placeholder="Search" onChange={(v) => setSearchTerm(v.target.value)}/></form>
}

function Page(props: PageProps) {
    const theme = useMantineTheme();
    const router = useRouter();
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
            <Aside p="md" hiddenBreakpoint="sm" width={{lg: 300}}>
                <Menubar/>
                <SearchInput onSubmit={handleSearch}/>
                <Accordion mt="md" sx={{
                    backgroundColor: theme.colorScheme === "light" ? theme.white : theme.colors.dark[5],
                    borderRadius: 4
                }} styles={{
                    contentInner: {padding: 0}
                }} offsetIcon={false} onChange={toggleEditMode} disableIconRotation>
                    <Accordion.Item sx={{border: "none"}} icon={<Edit size={16}/>} styles={{label: {fontSize: 12}}}
                                    label="Edit mode">
                        <Stack>
                            <Text size="xs">{selected.length} file(s) selected</Text>
                            <Button disabled={selected.length === 0} variant="light">Edit details</Button>
                            <Button disabled={selected.length === 0} variant="light" color="red">Delete file(s)</Button>
                        </Stack>
                    </Accordion.Item>
                </Accordion>
                <Divider label="view options" mt="sm"/>
                <Select label="Sort" mt="xs" value={sort} onChange={handleSelect} data={["Time", "Size", "Views"]}/>
                <Checkbox disabled={!props.author} label="Show only my uploads" mt="sm" checked={onlyUsers}
                          onChange={handleOnlyUser}/>
                <Divider label="tags" mb="sm" my="sm"/>
                <Aside.Section grow component={ScrollArea} mx="-xs" px="xs">
                    <Stack spacing={0}>
                        {retrieveAllTags(props.posts).map((t, i) =>
                            <Link href={`/browser?t=${t}`} key={i} passHref>
                                <Text size="xs" color={theme.colors.blue[4]} sx={{
                                    textDecoration: "none",
                                    cursor: "pointer",
                                    "&:hover": {textDecoration: "underline"}
                                }}>{t}</Text>
                            </Link>)}
                    </Stack>
                    <Divider label="file types" mb="sm" my="sm"/>
                    <Stack spacing={0}>
                        {retrieveAllFileTypes(props.posts).map((t, i) =>
                            <Link href={`/browser?type=${t}`} key={i} passHref>
                                <Text size="xs" color={theme.colors.blue[4]} sx={{
                                    textDecoration: "none",
                                    cursor: "pointer",
                                    "&:hover": {textDecoration: "underline"}
                                }}>{t}</Text>
                            </Link>)}
                    </Stack>
                </Aside.Section>
                <Tabbar/>
            </Aside></MediaQuery>}>
        <SEO title="Browser" siteTitle="Doki" description="Sneed"/>
        <Group>
            {category && <Title mb="md" order={5}>{category}</Title>}
        </Group>
        {!category && props.posts.find(x => x.Folder) && <SimpleGrid cols={5} mb="md">
            {props.posts.sort(_sort)
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
            {props.posts
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