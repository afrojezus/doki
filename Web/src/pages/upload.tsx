import {
    ActionIcon,
    Aside,
    Button,
    Card,
    Divider,
    Group,
    MantineTheme,
    MediaQuery,
    ScrollArea,
    Stack,
    Text,
    Title,
    useMantineTheme
} from '@mantine/core';
import Layout, {Menubar} from '../components/layout';
import {getCookie, setCookies} from 'cookies-next';
import useSound from 'use-sound';
import {FormFile, UploadBox} from "@src/components/upload-forms";
import SEO from "@src/components/seo";
import {ComponentProps, useRef, useState} from "react";
import {Dropzone, DropzoneStatus} from '@mantine/dropzone';
import {File, Icon as TablerIcon, Upload, X} from 'tabler-icons-react';
import {showNotification} from '@mantine/notifications';
import FileRepository from "@server/repositories/FileRepository";
import {Author, File as OBJ} from "@server/models";
import {useRouter} from 'next/router';

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
        }
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
            <Text size="xl" inline>
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
    const [files, setFiles] = useState<File[]>([]);
    const [ready, setReady] = useState<FormFile[]>([]);

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
        setFiles(f);
        setReady(_r);
    }

    function createNewID() {
        const newId = Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER / 1e8));
        return props.posts.map((x) => x.Author.AuthorId === newId) ? Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER / 1e8)) : newId;
    }

    async function upload() {
        let id = props.id;
        if (id === null) {
            id = createNewID();
            setCookies('DokiIdentification', id, {maxAge: 60 * 60 * 24 * 30});
        }
        const form = new FormData();

        for (let k = 0; k < ready.length; k++) {
            form.append('File', ready[k].File);
            form.append('Folder', ready[k].Folder);
            form.append('NSFW', ready[k].NSFW ? "1" : "0");
            form.append('Tags', ready[k].Tags.join(",").trim().replaceAll(" ", "_"));
            form.append('Title', ready[k].Title);
            form.append('Description', ready[k].Description);
            form.append('Id', id.toString());
        }

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: form
            });
            const user = await res.json();

            console.log(user);
            showNotification({
                title: `Uploaded all ${ready.length} file(s)`,
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
            setReady([]);
            setFiles([]);
            router.push("/browser");
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

    return <Layout aside={
        <MediaQuery smallerThan="sm" styles={{display: 'none'}}>
            <Aside p="md" hiddenBreakpoint="sm" width={{lg: 300}}>
                <Menubar/>
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
                        <Text size="xs" weight={500}>{e.name}</Text>
                            <ActionIcon onClick={() => {
                                setFiles([...files.filter(x => x !== e)]);
                                setReady([...ready.filter(x => x.File !== e)])
                            }}><X size={14}/></ActionIcon>
                        </Group>
                    </Card>)}
                </Aside.Section>
                <Divider my="md" size="xs"/>
                <Aside.Section style={{flexFlow: 'row wrap', display: 'inline-flex'}}>
                    <Button onClick={upload} variant="light" fullWidth leftIcon={<Upload size={14}/>}>Upload
                        now</Button>
                </Aside.Section>
            </Aside></MediaQuery>}>
        <SEO title="Upload" siteTitle="Doki"
             description="Content for days"/>
        <Group position="apart" mb="md">
            <Title order={5}>
                Upload
            </Title>
            <Button variant="light" onClick={() => openRef.current()}>Add file(s)</Button>
        </Group>
        <Dropzone onDrop={onDrop} openRef={openRef}>
            {(status) => dropzoneChildren(status, theme)}
        </Dropzone>
        <Stack mt="md">
            {files.map((e, i) => <UploadBox rawFile={e} key={i} file={ready[i]} posts={props.posts} />)}
        </Stack>
    </Layout>;
}

export default Page;
