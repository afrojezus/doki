import {
    ActionIcon,
    Aside,
    Autocomplete,
    Badge,
    Button,
    Card,
    Checkbox,
    Divider,
    Group,
    Image,
    MantineTheme,
    Modal,
    MultiSelect,
    ScrollArea,
    Stack,
    Text,
    Textarea,
    TextInput,
    Title,
    useMantineTheme
} from '@mantine/core';
import Layout from '../components/layout';
import {getCookie, setCookies} from 'cookies-next';
import useSound from 'use-sound';
import {FormFile, Importer} from "@src/components/upload-forms";
import SEO from "@src/components/seo";
import {ComponentProps, useRef, useState} from "react";
import {Dropzone, DropzoneStatus} from '@mantine/dropzone';
import {File, Icon as TablerIcon, Upload, X} from 'tabler-icons-react';
import {showNotification} from '@mantine/notifications';
import FileRepository from "@server/repositories/FileRepository";
import {Author, File as OBJ} from "@server/models";
import {useRouter} from 'next/router';
import {getExt, retrieveAllFolders, retrieveAllTags} from 'utils/file';

interface PageProps {
    id: number;
    posts: OBJ[];
    locale: string;
}


export async function getServerSideProps({req, res}) {
    const posts = await FileRepository.findAll({
        include: {
            model: Author,
            required: true
        },
        attributes: ["AuthorId", "Folder", "Tags"]
    });
    return {
        props: {
            id: getCookie('DokiIdentification', {req, res}) || null,
            posts,
            //   messages: (await import(`../../../${locale}nodemon.json`)).default
        }
    }
}

function getIconColor(status: DropzoneStatus, theme: MantineTheme) {
    return status.accepted
        ? theme.colors[theme.primaryColor][theme.colorScheme === 'dark' ? 4 : 6]
        : status.rejected
            ? theme.colors.red[theme.colorScheme === 'dark' ? 4 : 6]
            : theme.colorScheme === 'dark'
                ? theme.colors.dark[0]
                : theme.colors.gray[7];
}

function ImageUploadIcon({
                             status,
                             ...props
                         }: ComponentProps<TablerIcon> & { status: DropzoneStatus }) {
    if (status.accepted) {
        return <Upload {...props} />;
    }

    if (status.rejected) {
        return <X {...props} />;
    }

    return <File {...props} />;
}


function dropzoneChildren(status: DropzoneStatus, theme: MantineTheme) {
    return <Group position="center" spacing="xl" style={{minHeight: 220, pointerEvents: 'none'}}>
        <ImageUploadIcon status={status} style={{color: getIconColor(status, theme)}} size={80}/>

        <div>
            <Text size="xl" className="use-m-font" inline>
                Drag files here or click to select files
            </Text>
            <Text size="sm" color="dimmed" inline mt={7}>
                Attach as many files as you like, each file should not exceed 5 GB
            </Text>
        </div>
    </Group>
}

function Page(props: PageProps) {
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

    const [open, setOpen] = useState({type: '', opened: false});

    function onDrop(f: File[]) {
        let _r = [];
        f.forEach(f => {
            _r.push({
                Title: f.name,
                Description: "",
                NSFW: false,
                File: f,
                Tags: [],
                Folder: ""
            });
        })
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
            setCookies('DokiIdentification', id, {maxAge: 60 * 60 * 24 * 30});
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
            })
            if (props.id === null || props.id === undefined) {
                showNotification({
                    title: `Welcome to Doki, your profile is now ${user.Name}`,
                    message: "You can now manage your own uploads here."
                })
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
            })
            playError();
        }
    }

    return <Layout hideTabbar noScrollArea asideContent={<>
        <Aside.Section>
            <Stack>
                <Title order={6} id="#clause">
                    Uploaders' Clause
                </Title>
                <Text size="xs">
                    - NSFW content must be marked as NSFW. NSFW content without this mark will be removed.
                    <br/>
                    - Gore and related violent content is not tolerated and will be removed if found.
                    <br/>
                    - Content revealing abuse of minors of any form is not tolerated and will be removed.
                    <br/>
                    - If not specified, the content must adhere to Dutch law.
                </Text>
            </Stack>
        </Aside.Section>
        <Divider label="Upload queue" my="md" size="xs"/>
        <Aside.Section grow component={ScrollArea} mx="-xs" px="xs">
            {files.map((e, i) => <Card mb="md" key={i}>
                <Group position="apart">
                    <Text size="xs" weight={500}>{e.Title}</Text>
                    <ActionIcon onClick={() => {
                        setFiles([...files.filter(x => x !== e)]);
                    }}><X size={14}/></ActionIcon>
                </Group>
            </Card>)}
        </Aside.Section>
        <Divider my="md" size="xs"/>
        <Aside.Section style={{flexFlow: 'row wrap', display: 'inline-flex'}}>
            <Button disabled={files.length === 0} loading={uploading} onClick={upload} variant="light" fullWidth
                    leftIcon={<Upload size={14}/>}>Upload
                now</Button>
        </Aside.Section></>}>
        <SEO title="Upload" siteTitle="Doki"
             description="Content for days"/>
        <Group position="apart" mb="md">
            <Title order={5}>
                Upload
            </Title>
            <Group>
                <Button disabled onClick={() => setOpen({type: 'twt', opened: true})} variant="light" color="cyan">Import
                    from Twitter</Button>
                <Button onClick={() => setOpen({type: 'yt', opened: true})} variant="light" color="red">Import from
                    Youtube</Button>
                <Button variant="light" onClick={() => openRef.current()}>Add file(s)</Button>
            </Group>
        </Group>
        <Dropzone onDrop={onDrop} openRef={openRef}>
            {(status) => dropzoneChildren(status, theme)}
        </Dropzone>
        <Stack mt="md">
            {files.map((e, i) => <Card key={i}
                                       sx={{display: "inline-flex", transition: "all .375s var(--animation-ease)"}}>
                <Card.Section mr="md" mb={-16} sx={{transition: "all .375s var(--animation-ease)"}}>
                    <Image withPlaceholder placeholder={<Text size="xs" align="center">
                        {getExt(e.File.name)}-format file
                    </Text>} radius={0} styles={{
                        root: {
                            width: 300,
                            height: "100%",
                            background: theme.primaryColor,
                            transition: "all .375s var(--animation-ease)"
                        },
                        imageWrapper: {
                            height: "100%"
                        },
                        placeholder: {},
                        figure: {
                            height: "100%"
                        },
                        image: {
                            height: "100% !important",
                            position: "absolute",
                            top: 0,
                            left: 0
                        }
                    }} src={URL.createObjectURL(e.File)} alt="" sx={{color: theme.primaryColor}}/>
                </Card.Section>
                <form style={{flex: 1}}>
                    <Group position="apart">
                        <Text size="xs">{e.Title}</Text>
                        <Group>
                            <Checkbox size="xs" label="NSFW" onChange={(m) => {
                                e.NSFW = m.target.checked;
                                setFiles([...files])
                            }} checked={e.NSFW}/>
                            <Text size="xs">{(e.File.size / 1e3 / 1e3).toFixed(2)} MB</Text>
                            <Badge>{getExt(e.File.name)}</Badge>
                        </Group>
                    </Group>
                    <TextInput label="Title" placeholder="Call it something easy to forget, like 'Sneed'!"
                               required onChange={(m) => {
                        e.Title = m.target.value;
                        setFiles([...files])
                    }} value={e.Title}/>
                    <Textarea
                        label="Description"
                        placeholder="Enter a description here"
                        maxRows={4}
                        autosize
                        onChange={(m) => {
                            e.Description = m.target.value;
                            setFiles([...files])
                        }} value={e.Description}
                    />
                    <MultiSelect required data={[...retrieveAllTags(props.posts)]} label="Tags"
                                 placeholder="Select or create a tag" searchable creatable
                                 getCreateLabel={(t) => `+ ${t}`}
                                 onChange={(m) => {
                                     e.Tags = m;
                                     setFiles([...files])
                                 }} value={e.Tags}
                    />
                    <Autocomplete label="Category" placeholder="Enter category here"
                                  data={retrieveAllFolders(props.posts)} onChange={(m) => {
                        e.Folder = m;
                        setFiles([...files])
                    }} value={e.Folder}/>
                </form>
            </Card>)}
        </Stack>

        <Modal title="Import from Youtube" opened={open.type === 'yt' && open.opened}
               onClose={() => setOpen({type: '', opened: false})}>
            <Text size="xs">When importing from Youtube, ensure you got the right permissions to do so.</Text>
            <Importer isUploading={uploading} setUploading={setUploading} desc="Youtube link" type="yt" id={props.id}
                      createNewID={createNewID} playSuccess={playSuccess} router={router}/>
        </Modal>

        <Modal title="Import from Twitter" opened={open.type === 'twt' && open.opened}
               onClose={() => setOpen({type: '', opened: false})}>
            <Text size="xs">When importing from Twitter, ensure you got the right permissions to do so.</Text>
            <Importer isUploading={uploading} setUploading={setUploading} desc="Twitter link" type="twt" id={props.id}
                      createNewID={createNewID} playSuccess={playSuccess} router={router}/>
        </Modal>
    </Layout>;
}

export default Page;
