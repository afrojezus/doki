import {
    Accordion,
    ActionIcon,
    Autocomplete,
    Button,
    Center,
    Checkbox,
    Divider,
    Grid,
    Group,
    LoadingOverlay,
    Modal,
    Pagination,
    Select, SimpleGrid,
    Stack,
    Text,
    TextInput,
    Title,
    Tooltip,
    Transition,
    useMantineTheme
} from '@mantine/core';
import GridItem from '../components/grid-item';
import Layout from '../components/layout';
import SEO from '../components/seo';
import { Author, File, Space } from "@server/models";
import { useCallback, useContext, useEffect, useState } from "react";
import { Edit, Refresh } from 'tabler-icons-react';
import { useRouter } from 'next/router';
import { getExt, retrieveAllFileTypes, retrieveAllTags } from "../../utils/file";
import Link from "next/link";
import { getCookie, hasCookie } from "cookies-next";
import { NextPageContext } from "next";
import useSWR, { useSWRConfig } from "swr";
import { showNotification } from "@mantine/notifications";
import { getLocale, LocaleContext } from "@src/locale";
import { EditBox } from '@src/components/upload-forms';
import { SeekForAuthor } from "../../utils/id_management";
import { withSessionSsr } from '@src/lib/session';
import useSound from 'use-sound';
import { TouchableLink } from '@src/components/buttons';

interface PageProps {
    posts: File[];
    author: Author;
    filter: string[];
    filteredTags: string[];
    space: Space;
    nsfw: boolean;
    userIsSpaceOwner: boolean;
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

    const author = await SeekForAuthor(getCookie('DokiIdentification', { req, res }));
    return {
        props: {
            space,
            author,
            userIsSpaceOwner: (author ? author.AuthorId === space.Owner : false),
            nsfw: hasCookie('allow-nsfw-content', { req, res }) ? getCookie('allow-nsfw-content', { req, res }) : false,
            filter: hasCookie('filtered', { req, res }) ? JSON.parse(getCookie('filtered', { req, res }) as string) : [],
            filteredTags: hasCookie('filtered-tags', { req, res }) ? JSON.parse(getCookie('filtered-tags', { req, res }) as string) : [],
        }
    };
});

function SearchInput({ onSubmit, data }) {
    const locale = useContext(LocaleContext);
    const [searchTerm, setSearchTerm] = useState<string>('');
    return <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(searchTerm);
    }}><Autocomplete data={data} autoFocus value={searchTerm} placeholder={`${getLocale(locale).Browser["search"]}`} onChange={(v) => setSearchTerm(v)} /></form>;
}

interface PostsResponse {
    posts: File[];
    all: File[];
    allTags: string[];
    allCategories: string[];
    allTypes: string[];
}

const fetcher = async (url) => {
    const res = await fetch(url);
    const data = await res.json();

    if (res.status !== 200) {
        throw new Error(data.message);
    }
    return data as PostsResponse;
};

function Page(props: PageProps) {
    const [playChange] = useSound("/assets/info.wav", {
        volume: 0.25
    });

    const theme = useMantineTheme();
    const router = useRouter();
    const locale = useContext(LocaleContext);
    const { mutate } = useSWRConfig();
    const [loading, setLoading] = useState(true);
    const [activePage, setPage] = useState(1);
    const [category, setCategory] = useState(null);
    const [tag, setTag] = useState(null);
    const [type, setType] = useState(null);
    const [onlyUsers, setOnlyUsers] = useState<boolean>(false);
    const [sort, setSort] = useState<string>("Time");
    const [searchF, setSearchF] = useState('');
    const { data, error } = useSWR(`/api/posts?page=${activePage}&sort=${sort}${category ? "&category=" + category : ''}${tag ? "&tag=" + tag : ''}${type ? "&type=" + type : ''}${(onlyUsers && props.author) ? "&author=" + props.author.AuthorId : ''}${"&nsfw=" + props.nsfw}`, fetcher);
    const [noFiles, setNoFiles] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [selected, setSelected] = useState<File[]>([]);
    const [editDetails, setEditDetails] = useState(false);
    const [willDelete, setWillDelete] = useState(false);

    useEffect(() => {
        if (router.query["f"]) {
            setCategory(router.query["f"]);
        } else {
            setCategory(null);
        }

        if (router.query["t"]) {
            setTag(router.query["t"]);
        } else {
            setTag(null);
        }

        if (router.query["type"]) {
            setType(router.query["type"]);
        } else {
            setType(null);
        }
        mutate(`/api/posts?page=${activePage}&sort=${sort}${category ? "&category=" + category : ''}${tag ? "&tag=" + tag : ''}${type ? "&type=" + type : ''}${(onlyUsers && props.author) ? "&author=" + props.author.AuthorId : ''}${"&nsfw=" + props.nsfw}`);
    }, [router.query]);

    useEffect(() => {
        if (error) {
            showNotification({
                color: "red",
                title: "Error loading view",
                message: error.message
            });
        } else {
            setNoFiles(data === undefined);
            setLoading(Boolean(!data));
        }
    }, [data, error]);

    useEffect(() => {
        if (selected.length === 0) setEditDetails(false);
    }, [selected, editMode]);

    function handleSelect(value) {
        setSort(value);
        mutate(`/api/posts?page=${activePage}&sort=${sort}${category ? "&category=" + category : ''}${tag ? "&tag=" + tag : ''}${type ? "&type=" + type : ''}${(onlyUsers && props.author) ? "&author=" + props.author.AuthorId : ''}${"&nsfw=" + props.nsfw}`);
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

    const toggleEditMode = useCallback(() => {
        if (editMode) {
            setSelected([]);
        }
        setEditMode(!editMode);
    }, [editMode]);

    function handleSearch(search) {
        router.push(`/browser?t=${search}`);
    }

    async function deleteSelected() {
        try {
            const res = await fetch(`/api/delete`, {
                body: JSON.stringify({
                    author: props.author,
                    files: selected
                }),
                method: 'POST'
            });
            const json = await res.json();
            showNotification({
                title: "File catelog updated",
                message: json.message,
                color: "green"
            });
            playChange();
            await mutate(`/api/posts?page=${activePage}&sort=${sort}${category ? "&category=" + category : ''}${tag ? "&tag=" + tag : ''}${type ? "&type=" + type : ''}${(onlyUsers && props.author) ? "&author=" + props.author.AuthorId : ''}${"&nsfw=" + props.nsfw}`);
        } catch (error) {
            console.error(error);
            showNotification({
                title: "Deletion failed!",
                message: error.message,
                color: "red"
            });
        } finally {
            setSelected([]);
            setWillDelete(false);
        }
    }

    const setNewPage = (page: number) => {
        if (page !== activePage) {
            setLoading(true);
            setPage(page);
        }
    };
    return <Layout additionalMainStyle={{ display: "flex" }} space={props.space} navbar={
        <>
            <Group mb="md" position="apart">
                <Text size="xs">{(data && data.all.length) ?? 0} file(s) on the server</Text>
                <Tooltip label="Refresh grid"><ActionIcon onClick={() => mutate('/api/posts')}><Refresh size={14} /></ActionIcon></Tooltip>
            </Group>
            <Pagination mb="md" page={activePage} size="xs" onChange={setNewPage} styles={{ item: { fontFamily: 'Manrope' } }} total={(data && (onlyUsers ?
                Math.floor(data.posts.filter(f => onlyUsers && props.author ? f.AuthorId === props.author.AuthorId : f).length / 25 + 1) :
                type ? Math.floor(data.all.filter(x => getExt(x.FileURL) === type).length / 25 + 1) :
                    category ? Math.floor(data.all.filter(x => x.Folder && x.Folder === category).length / 25 + 1) :
                        tag ? Math.floor(data.all.filter(x => x.Tags && x.Tags.includes(tag)).length / 25 + 1) :
                            Math.floor(data.all.length / 25 + 1))) ?? 0} withEdges grow />
            <SearchInput data={data ? data.allTags : []} onSubmit={handleSearch} />
            <Transition mounted={Boolean(props.author)} transition="slide-down">{(styles) => <Accordion style={styles} mt="md" sx={{
                backgroundColor: theme.colorScheme === "light" ? theme.white : theme.colors.dark[5],
                borderRadius: 4
            }} onChange={toggleEditMode}>
                <Accordion.Item style={{ border: "none" }} value="edit">
                    <Accordion.Control sx={{ border: "none", fontSize: 12 }} icon={<Edit size={16} />}>{getLocale(locale).Browser["edit-mode"]}</Accordion.Control>
                    <Accordion.Panel>
                        <Stack>
                            {props.userIsSpaceOwner && <Text size="xs">You own this space, therefore you can edit any files here</Text>}
                            <Text size="xs">{selected.length}{` ${getLocale(locale).Browser["selected"]}`}</Text>
                            <Button disabled={selected.length === 0} onClick={() => setEditDetails(true)}
                                variant="light">{`${getLocale(locale).Browser["edit-details"]}`}</Button>
                            <Button disabled={selected.length === 0} onClick={() => setWillDelete(true)} variant="light"
                                color="red">{`${getLocale(locale).Browser["delete-files"]}`}</Button>
                        </Stack>
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion>}</Transition>
            <Divider label={`${getLocale(locale).Browser["view-options"]}`} mt="sm" />
            <Select label={`${getLocale(locale).Browser["sort"]}`} mt="xs" value={sort} onChange={handleSelect}
                data={["Time", "Size", "Views"]} />
            <Checkbox disabled={!props.author} label={`${getLocale(locale).Browser["show-only"]}`} mt="sm"
                checked={onlyUsers}
                onChange={handleOnlyUser} />
            {/*<Text size="xs" my="md">Scale</Text>
            <Slider label={scale} value={scale} onChange={onScaleChange} min={1} max={8} mb="md" />*/}
            {data && <Transition transition="slide-down" mounted={Boolean(data.allCategories.length > 0)}>{(styles) => <Divider style={styles} label={`${getLocale(locale).Viewer["nc-category"]}`} mb="sm" my="md" />}</Transition>}
            {data && <Transition mounted={Boolean(data.allCategories.length > 0)} transition="slide-down">{(styles) => <Stack style={styles} spacing={0}>
                {data.allCategories.filter(x => !props.filter.includes(x)).map((elem, index) =>
                    <TouchableLink link={`/browser?f=${elem}`} key={index} passHref>
                        <Text size="xs" color={theme.colors.blue[4]} sx={{
                            textDecoration: "none",
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" }
                        }}>{elem}</Text>
                    </TouchableLink>)}
            </Stack>}</Transition>}
            {data && <Transition mounted={Boolean(data.allTags.length > 0)} transition="slide-down">{(styles) => <Divider style={styles} label={`${getLocale(locale).Browser["tags"]}`} mb="sm" my="sm" />}</Transition>}
            {data && <Transition mounted={Boolean(data.allTags.length > 0)} transition="slide-down">{(styles) => <Stack style={styles} spacing={0}>
                {data.allTags.filter(x => !props.filteredTags.includes(x)).map((t, i) =>
                    <TouchableLink link={`/browser?t=${t}`} key={i} passHref>
                        <Text size="xs" color={theme.colors.blue[4]} sx={{
                            textDecoration: "none",
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" }
                        }}>{t}</Text>
                    </TouchableLink>)}
            </Stack>}</Transition>}
            {data && <Transition mounted={Boolean(data.allTypes.length > 0)} transition="slide-down">{(styles) => <Divider style={styles} label={`${getLocale(locale).Browser["file-types"]}`} mb="sm" my="sm" />}</Transition>}
            {data && <Transition mounted={Boolean(data.allTypes.length > 0)} transition="slide-down">{(styles) => <Stack style={styles} spacing={0}>
                {data.allTypes.map((t, i) =>
                    <TouchableLink link={`/browser?type=${t}`} key={i}>
                        <Text size="xs" color={theme.colors.blue[4]} sx={{
                            textDecoration: "none",
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" }
                        }}>{t}</Text>
                    </TouchableLink>)}
            </Stack>}</Transition>}
        </>
    }>
        <SEO title="Browser" siteTitle="Doki" description="Content for days" />
        {data && data.posts.length > 0 ? <div className="grid">
            {!loading && data && data.posts
                .sort(_sort)
                .filter(f => onlyUsers && props.author ? f.AuthorId === props.author.AuthorId : f)
                .filter(x => !props.filteredTags.includes(x.Tags))
                .filter(x => !props.filter.includes(x.Folder))
                .map((elem, index) =>
                    <Transition mounted={Boolean(elem)} transition="fade" key={index}>
                        {(styles) => <GridItem style={styles} spaceOwner={props.userIsSpaceOwner} onlyUsers={onlyUsers} author={props.author} editMode={editMode} selected={selected.includes(elem)}
                            onUnselect={(f) => setSelected(p => p.filter(x => x !== f))}
                            onSelect={(f) => setSelected(p => [...p, f])} data={elem} />}</Transition>)}
        </div> : <Stack sx={{ margin: "auto", textAlign: "center" }}>
            <Title className='use-m-font'>O.O'</Title>
            <Text className='use-m-font'>There's no files!</Text>
        </Stack>}

        <Modal size="xl" opened={editDetails} title="Edit details" onClose={() => setEditDetails(false)}
            styles={{
                modal: { background: 'transparent', boxShadow: 'none' },
                title: { color: 'white', filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` },
                body: { background: 'transparent', padding: 0, margin: 0, filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` },
                close: {
                    color: 'white',
                    '&:hover': {
                        background: '#ffffff22'
                    },
                    filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))`
                },
            }}
        >
            <Stack>
                {selected && selected.map((e, i) => (
                    <EditBox onUpdated={() => mutate(`/api/posts?page=${activePage}&sort=${sort}${category ? "&category=" + category : ''}${tag ? "&tag=" + tag : ''}${type ? "&type=" + type : ''}${(onlyUsers && props.author) ? "&author=" + props.author.AuthorId : ''}${"&nsfw=" + props.nsfw}`)} author={props.author} cancel={() => setSelected(selected.filter(x => x.Id != e.Id))}
                        posts={data.posts} file={e} key={i} />
                ))}
            </Stack>
        </Modal>

        <Modal centered opened={willDelete} title="Delete file(s)" onClose={() => setWillDelete(false)}>
            <Group position='apart'>
                <Text size="xs">Are you sure you want to delete these files?</Text>
                <Button onClick={deleteSelected} color="red" variant="light">Delete file(s)</Button></Group>
        </Modal>
    </Layout>;
}

export default Page;

