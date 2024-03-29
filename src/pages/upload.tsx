import {
    ActionIcon,
    Aside,
    Autocomplete,
    Badge,
    Box,
    Button,
    Card,
    Checkbox,
    Divider,
    Group,
    Image,
    MantineTheme,
    Modal,
    MultiSelect,
    Progress,
    ScrollArea,
    Stack,
    Text,
    Textarea,
    TextInput,
    Title,
    useMantineTheme
} from '@mantine/core';
import Layout, { Disk } from '../components/layout';
import { getCookie, setCookies } from 'cookies-next';
import useSound from 'use-sound';
import { FormFile, Importer } from "@src/components/upload-forms";
import SEO from "@src/components/seo";
import { ComponentProps, useCallback, useEffect, useRef, useState } from "react";
import { Dropzone } from '@mantine/dropzone';
import { File, File3d, Plus, Upload as IconUpload, X } from 'tabler-icons-react';
import { showNotification } from '@mantine/notifications';
import FileRepository from "@server/repositories/FileRepository";
import { Author, File as OBJ, Space } from "@server/models";
import { useRouter } from 'next/router';
import { getExt, retrieveAllFolders, retrieveAllTags } from 'utils/file';
import { withSessionSsr } from '@src/lib/session';
import useSWR from 'swr';
import { useForm } from '@mantine/form';

interface PageProps {
    id: number;
    posts: OBJ[];
    locale: string;
    space: Space;
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
        include: {
            model: Author,
            required: true
        },
        attributes: ["AuthorId", "Folder", "Tags"]
    });
    return {
        props: {
            space,
            id: getCookie('DokiIdentification', { req, res }) || null,
            posts,
            //   messages: (await import(`../../../${locale}nodemon.json`)).default
        }
    };
});

const fetcher = async (url) => {
    const res = await fetch(url);
    const data = await res.json();

    if (res.status !== 200) {
        throw new Error(data.message);
    }
    return data as Disk;
};

const UploadEditBox = ({ onChange, formFile, posts, ...rest }: { onChange: (e: FormFile) => void; formFile: FormFile; posts: any[]; }) => {
    const [preview] = useState<string | undefined>(URL.createObjectURL(formFile.File));
    return <Card {...rest}
        sx={{ display: "inline-flex", transition: "all .375s var(--animation-ease)" }}>
        <Card.Section mr="md" mb={-16} sx={{ transition: "all .375s var(--animation-ease)" }}>
            <Image withPlaceholder placeholder={<File3d />} fit="cover" styles={{
                root: {
                    width: "200px !important",
                    overflow: 'hidden',
                    display: "flex"
                },
                figure: {
                    flex: 1,
                    display: "flex"
                },
                imageWrapper: {
                    flex: 1,
                    display: "flex"
                },
                placeholder: {
                    flex: 1
                }
            }} width="100%" height="100%" radius={0} src={preview} alt="" />
        </Card.Section>
        <Box component="form" sx={{ flex: 1 }}>
            <Stack>
                <Group position="apart">
                    <Text size="xs">{formFile.Title}</Text>
                    <Group>
                        <Checkbox size="xs" label="NSFW" onChange={(m) => {
                            formFile.NSFW = m.target.checked;
                            onChange(formFile);
                        }} checked={formFile.NSFW} />
                        <Text size="xs">{(formFile.File.size / 1e3 / 1e3).toFixed(2)} MB</Text>
                        <Badge>{getExt(formFile.File.name)}</Badge>
                    </Group>
                </Group>
                <TextInput label="Title" placeholder="Call it something easy to forget, like 'Sneed'!"
                    required onChange={(m) => {
                        formFile.Title = m.target.value;
                        onChange(formFile);
                    }} value={formFile.Title} />
                <Textarea
                    label="Description"
                    placeholder="Enter a description here"
                    maxRows={4}
                    autosize
                    onChange={(m) => {
                        formFile.Description = m.target.value;
                        onChange(formFile);
                    }} value={formFile.Description}
                />
                <MultiSelect data={[...retrieveAllTags(posts)]} label="Tags"
                    styles={{
                        searchInput: {
                            fontFamily: 'inherit'
                        }
                    }}
                    placeholder="Select or create a tag" searchable creatable
                    onCreate={(query) => query.replace(/ /g, '_')}
                    getCreateLabel={(t) => `+ ${t}`}
                    onChange={(m) => {
                        formFile.Tags = m;
                        onChange(formFile);
                    }} defaultValue={formFile.Tags}
                />
                <Autocomplete label="Category" placeholder="Enter category here"
                    data={retrieveAllFolders(posts)} onChange={(m) => {
                        formFile.Folder = m;
                        onChange(formFile);
                    }} value={formFile.Folder} />
            </Stack>
        </Box>
    </Card>;
};

function Page(props: PageProps) {
    const { data, error } = useSWR(() => `/api/disk`, fetcher);
    const router = useRouter();
    const [playSuccess] = useSound("/assets/upload-successful.wav", {
        volume: 0.25
    });
    const [playError] = useSound("/assets/error.wav", {
        volume: 0.25
    });
    const theme = useMantineTheme();
    const openRef = useRef<() => void>();
    const [uploading, setUploading] = useState<boolean>(false);
    const [files, setFiles] = useState<FormFile[]>([]);

    const [open, setOpen] = useState({ type: '', opened: false });

    function onDrop(f: File[]) {
        let _r = [];
        f.forEach(f => {
            _r.push({
                Title: f.name.split(".")[0],
                Description: "",
                NSFW: false,
                File: f,
                Tags: [],
                Folder: ""
            });
        });
        setFiles(_r);
    }

    function createNewID() {
        const newId = Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER / 1e8));
        return props.posts.map((x) => x.Author.AuthorId === newId) ? Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER / 1e8)) : newId;
    }

    async function upload() {
        setUploading(true);
        let id = props.id;
        if (id === null) {
            id = createNewID();
            setCookies('DokiIdentification', id, { maxAge: 60 * 60 * 24 * 30 });
        }
        const form = new FormData();

        for (let k = 0; k < files.length; k++) {
            form.append('File', files[k].File);
            form.append('Folder', files[k].Folder);
            form.append('NSFW', files[k].NSFW ? "1" : "0");
            form.append('Tags', files[k].Tags.join(",").trim().replaceAll(" ", "_"));
            form.append('Title', files[k].Title);
            form.append('Description', files[k].Description);
            form.append('Id', id.toString());
        }

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: form
            });
            const user = await res.json();

            showNotification({
                title: `Uploaded all ${files.length} file(s)`,
                message: "They should show up when you browse for view now.",
                color: "green"
            });
            if (props.id === null || props.id === undefined) {
                showNotification({
                    title: `Welcome to Doki, your profile is now ${user.Name}`,
                    message: "You can now manage your own uploads here."
                });
            }
            playSuccess();
            setFiles([]);
            await router.push("/browser");
        } catch (e) {
            console.error(e);
            showNotification({
                title: "Upload failed!",
                message: e.message,
                color: "red"
            });
            playError();
        }
    }

    const onFileChange = useCallback((e: FormFile) => {
        setFiles([...files]);
    }, [files]);

    return <Layout space={props.space} hideTabbar noScrollArea navbar={<>
        <Aside.Section>
            <Stack>
                <Title order={6} id="#clause">
                    Uploaders' Clause
                </Title>
                <Text size="xs">
                    - NSFW content must be marked as NSFW. NSFW content without this mark will be removed.
                    <br />
                    - Gore and related violent content is not tolerated and will be removed if found.
                    <br />
                    - Content revealing abuse of minors of any form is not tolerated and will be removed.
                    <br />
                    - If not specified, the content must adhere to Dutch law.
                </Text>
            </Stack>
        </Aside.Section>
        <Divider label="Upload queue" my="md" size="xs" />
        <Aside.Section grow component={ScrollArea} mx="-xs" px="xs">
            {files.map((e, i) => <Card mb="md" key={i}>
                <Group position="apart">
                    <Text size="xs" weight={500}>{e.Title}</Text>
                    <ActionIcon onClick={() => {
                        setFiles([...files.filter(x => x !== e)]);
                    }}><X size={14} /></ActionIcon>
                </Group>
            </Card>)}
        </Aside.Section></>}>
        <SEO title="Upload" siteTitle="Doki"
            description="Content for days" />
        <Group position="apart" mb="md">
            <Stack spacing={0}>
                <Text size="xs">{`Total space of server: ${data ? (data.totalSpace / 1e3 / 1e3 / 1e3).toFixed(2) : 0} GB. ${data ? (data.freeSpace / 1e3 / 1e3 / 1e3).toFixed(2) : 0} GB available.`}</Text>
                <Progress sx={{ minWidth: 150 }} value={data ? Math.floor(data.freeSpace / 1e3 / 1e3 / 1e3) : 0} />
            </Stack>
            <Group>
                <Button disabled onClick={() => setOpen({ type: 'twt', opened: true })} variant="light" color="cyan">Import
                    from Twitter</Button>
                <Button onClick={() => setOpen({ type: 'yt', opened: true })} variant="light" color="red">Import from
                    Youtube</Button>
                <Button leftIcon={<Plus size={14} />} variant="light" onClick={() => openRef.current()}>Add file(s)</Button>
            </Group>
        </Group>
        <Dropzone onDrop={onDrop} openRef={openRef}>
            <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
                <Dropzone.Accept>
                    <IconUpload
                        size={50}
                        color={theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]}
                    />
                </Dropzone.Accept>
                <Dropzone.Reject>
                    <X
                        size={50}
                        color={theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]}
                    />
                </Dropzone.Reject>
                <Dropzone.Idle>
                    <File size={50} />
                </Dropzone.Idle>
                <div>
                    <Text size="xl" className="use-m-font" inline>
                        Drag files here or click to select files
                    </Text>
                    <Text size="sm" color="dimmed" inline mt={7}>
                        Attach as many files as you like, each file should not exceed 1 GB
                    </Text>
                </div>
            </Group>
        </Dropzone>
        <Stack mt="md">
            {files.map((e) => <UploadEditBox onChange={onFileChange} posts={props.posts} key={e.File.name} formFile={e} />)}
            <Group position="right">
                <Button disabled={files.length === 0} loading={uploading} onClick={upload} variant="light"
                    leftIcon={<IconUpload size={14} />}>Upload
                    now</Button>
            </Group>
        </Stack>

        <Modal title="Import from Youtube" opened={open.type === 'yt' && open.opened}
            onClose={() => setOpen({ type: '', opened: false })}>
            <Text size="xs">When importing from Youtube, ensure you got the right permissions to do so.</Text>
            <Importer isUploading={uploading} setUploading={setUploading} desc="Youtube link" type="yt" id={props.id}
                createNewID={createNewID} playSuccess={playSuccess} router={router} />
        </Modal>

        <Modal title="Import from Twitter" opened={open.type === 'twt' && open.opened}
            onClose={() => setOpen({ type: '', opened: false })}>
            <Text size="xs">When importing from Twitter, ensure you got the right permissions to do so.</Text>
            <Importer isUploading={uploading} setUploading={setUploading} desc="Twitter link" type="twt" id={props.id}
                createNewID={createNewID} playSuccess={playSuccess} router={router} />
        </Modal>
    </Layout>;
}

export default Page;
