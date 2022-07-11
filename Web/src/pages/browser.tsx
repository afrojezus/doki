import {
    Accordion,
    Button,
    Checkbox,
    Divider,
    Group,
    LoadingOverlay,
    Modal,
    Select, SimpleGrid,
    Stack,
    Text,
    TextInput,
    Title,
    useMantineTheme
} from '@mantine/core';
import GridItem from '../components/grid-item';
import Layout from '../components/layout';
import SEO from '../components/seo';
import {Author, File} from "@server/models";
import {useCallback, useContext, useEffect, useState} from "react";
import {Edit} from 'tabler-icons-react';
import {useRouter} from 'next/router';
import {getExt, retrieveAllFileTypes, retrieveAllTags} from "../../utils/file";
import Link from "next/link";
import {getCookie, hasCookie} from "cookies-next";
import {NextPageContext} from "next";
import useSWR, {useSWRConfig} from "swr";
import {showNotification} from "@mantine/notifications";
import {getLocale, LocaleContext} from "@src/locale";
import {EditBox} from '@src/components/upload-forms';
import {SeekForAuthor} from "../../utils/id_management";

interface PageProps {
    posts: File[];
    author: Author;
    filter: string[];
}

export async function getServerSideProps(nextPage: NextPageContext) {
    // TODO: Implement pagination as an alternative

    // this is slow as fuck.
    /*const posts = await FileRepository.findAll({
        include: {
            model: Author,
            required: true
        },
        limit: 10
    });*/

    const author = await SeekForAuthor(getCookie('DokiIdentification', nextPage));
    return {
        props: {
            // posts,
            author,
            filter: hasCookie('filtered', nextPage) ? JSON.parse(getCookie('filtered', nextPage) as string) : []
        }
    };
}

function SearchInput({ onSubmit }) {
    const locale = useContext(LocaleContext);
    const [searchTerm, setSearchTerm] = useState<string>('');
    return <form onSubmit={(e) => {
        e.preventDefault();
        onSubmit(searchTerm);
    }}><TextInput value={searchTerm} placeholder={`${getLocale(locale).Browser["search"]}`} onChange={(v) => setSearchTerm(v.target.value)} /></form>
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
    //const mobile = useMediaQuery('(max-width: 450px)');
    const router = useRouter();
    const locale = useContext(LocaleContext);
    const {mutate} = useSWRConfig();
    const {data, error} = useSWR('/api/posts', fetcher);
    const [noFiles, setNoFiles] = useState<boolean>(false);
    const [sort, setSort] = useState<string>("Time");
    const [onlyUsers, setOnlyUsers] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [searchF, setSearchF] = useState('');
    const [category, setCategory] = useState(null);
    const [tag, setTag] = useState(null);
    const [type, setType] = useState(null);
    const [selected, setSelected] = useState<File[]>([]);
    const [editDetails, setEditDetails] = useState(false);
    const [willDelete, setWillDelete] = useState(false);

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
        if (error) {
            showNotification({
                color: "red",
                title: "Error loading view",
                message: error.message
            });
        } else {
            setNoFiles(data === undefined);
        }
    }, [data, error]);

    useEffect(() => {
        if (selected.length === 0) setEditDetails(false);
    }, [selected, editMode]);

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

    const toggleEditMode = useCallback(() => {
        if (editMode) {
            setSelected([]);
        }
        setEditMode(!editMode);
    }, [editMode]);

    function handleSearch(search) {
        setSearchF(search);
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
            await mutate('/api/posts');
        } catch (error) {
            console.error(error);
            showNotification({
                title: "Deletion failed!",
                message: error.message,
                color: "red"
            })
        } finally {
            setSelected([]);
            setWillDelete(false);
        }
    }

    return <Layout asideContent={
        <>
            <LoadingOverlay visible={noFiles}/>
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
                        <Button disabled={selected.length === 0} onClick={() => setEditDetails(true)}
                                variant="light">{`${getLocale(locale).Browser["edit-details"]}`}</Button>
                        <Button disabled={selected.length === 0} onClick={() => setWillDelete(true)} variant="light"
                                color="red">{`${getLocale(locale).Browser["delete-files"]}`}</Button>
                    </Stack>
                </Accordion.Item>
            </Accordion>
            <Divider label={`${getLocale(locale).Browser["view-options"]}`} mt="sm"/>
            <Select label={`${getLocale(locale).Browser["sort"]}`} mt="xs" value={sort} onChange={handleSelect}
                    data={["Time", "Size", "Views"]}/>
            <Checkbox disabled={!props.author} label={`${getLocale(locale).Browser["show-only"]}`} mt="sm"
                      checked={onlyUsers}
                      onChange={handleOnlyUser}/>
            {/*<Text size="xs" my="md">Scale</Text>
            <Slider label={scale} value={scale} onChange={onScaleChange} min={1} max={8} mb="md" />*/}
            <Divider label={`${getLocale(locale).Viewer["nc-category"]}`} mb="sm" my="md" />
            {data && <Stack spacing={0}>
                {data.sort(_sort)
                    .filter(f => onlyUsers && props.author ? f.AuthorId === props.author.AuthorId : f)
                    .filter((x) => x.Folder !== null).filter(f => !props.filter.includes(f.Folder)).map((x) => x.Folder).filter((value, index, self) => self.indexOf(value) === index).filter((x) => x !== null).map((elem, index) =>
                        <Link href={`/browser?f=${elem}`} key={index} passHref>
                            <Text size="xs" color={theme.colors.blue[4]} sx={{
                                textDecoration: "none",
                                cursor: "pointer",
                                "&:hover": {textDecoration: "underline"}
                            }}>{elem}</Text>
                        </Link>)}
            </Stack>}
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
            <Divider label={`${getLocale(locale).Browser["file-types"]}`} mb="sm" my="sm"/>
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
        </>
    }>
        <SEO title="Browser" siteTitle="Doki" description="Sneed"/>
        {!error && <LoadingOverlay visible={noFiles}/>}
        {noFiles && <>
            <Stack>
                <Title className="use-m-font fancy-transition1">O.O'</Title>
                <Text className="use-m-font fancy-transition1">There's no files here!</Text>
            </Stack>
        </>}
        {/*<Box sx={{width: '100%', height: `calc(100vh - 40px ${(tag || category || type) ? "- 56px" : ""})`, overflowX: 'hidden'}}>
            {data && <AutoSizer>
                {({height, width}) => (
                    <Grid
                        style={{
                            overflowX: 'hidden',
                            paddingBottom: 16
                        }}
                        height={height}
                        width={width}
                        rowHeight={300}
                        columnWidth={(width / scale)}
                        itemData={matrixData}
                        columnCount={scale}
                        rowCount={matrixData.length}
                    >
                        {(props) => <RenderGridItem {...props}
                                                    selected={editMode && selected.includes(props.data[props.rowIndex][props.columnIndex])}
                                                    editMode={editMode} onSelect={onSelect} onUnselect={onUnselect}
                                                    author={props.author}/>}
                    </Grid>
                )}
            </AutoSizer>}
        </Box>*/}
        {data && <SimpleGrid cols={5} breakpoints={[
            { maxWidth: 'lg', cols: 4, spacing: 'md' },
            { maxWidth: 'md', cols: 3, spacing: 'md' },
            { maxWidth: 'sm', cols: 2, spacing: 'sm' },
            { maxWidth: 'xs', cols: 1, spacing: 'sm' },
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
                    <GridItem author={props.author} editMode={editMode} selected={selected.includes(elem)}
                        onUnselect={(f) => setSelected(p => p.filter(x => x !== f))}
                        onSelect={(f) => setSelected(p => [...p, f])} data={elem} key={index} />)}
            </SimpleGrid>}

        <Modal size="xl" opened={editDetails} title="Edit details" onClose={() => setEditDetails(false)}
               styles={{
                   modal: {background: 'transparent'},
                   title: {color: 'white'},
                   body: {background: 'transparent', padding: 0, margin: 0},
                   close: {
                       color: 'white',
                       '&:hover': {
                           background: '#ffffff22'
                       }
                   },
               }}
        >
            <Stack>
                {selected && selected.map((e, i) => (
                    <EditBox author={props.author} cancel={() => setSelected(selected.filter(x => x.Id != e.Id))}
                             posts={data} file={e} key={i}/>
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

