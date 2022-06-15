import {
    Autocomplete,
    Badge,
    Button,
    Card,
    Checkbox,
    Group,
    Image,
    MultiSelect,
    Text,
    Textarea,
    TextInput,
    useMantineTheme
} from "@mantine/core";
import {useForm} from "@mantine/form";
import {displayFilename, getExt, pictureFormats, retrieveAllFolders, retrieveAllTags} from "../../utils/file";
import {Author, File as MFile} from "@server/models";
import {useCallback, useEffect, useState} from "react";
import {mutate} from "swr";
import {showNotification} from "@mantine/notifications";
import {CarCrash, Video} from "tabler-icons-react";
import {setCookies} from "cookies-next";

export interface FormFile {
    Title: string;
    Description: string;
    NSFW: boolean;
    File: File;
    Tags: string[];
    Folder: string;
}

export function UploadBoxD({file, posts}: { file: FormFile, posts: MFile[] }) {
    const theme = useMantineTheme();
    const [state, setState] = useState(file);

    useEffect(() => {
        file = state;
    }, [state]);

    return <Card sx={{display: "inline-flex", transition: "all .375s var(--animation-ease)"}}>
        <Card.Section mr="md" mb={-16} sx={{transition: "all .375s var(--animation-ease)"}}>
            <Image withPlaceholder placeholder={<Text size="xs" align="center">
                {getExt(state.File.name)}-format file
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
            }} src={URL.createObjectURL(state.File)} alt="" sx={{color: theme.primaryColor}}/>
        </Card.Section>
        <form style={{flex: 1}}>
            <Group position="apart">
                <Text size="xs">{state.Title}</Text>
                <Group>
                    <Checkbox size="xs" label="NSFW"
                              onChange={(e) => setState(prev => ({NSFW: e.target.checked, ...prev}))}
                              checked={state.NSFW}/>
                    <Text size="xs">{(state.File.size / 1e3 / 1e3).toFixed(2)} MB</Text>
                    <Badge>{getExt(state.File.name)}</Badge>
                </Group>
            </Group>
            <TextInput label="Title" placeholder="Call it something easy to forget, like 'Sneed'!"
                       required onChange={(e) => setState(prev => ({Title: e.target.value, ...prev}))}
                       value={state.Title}/>
            <Textarea
                label="Description"
                placeholder="Enter a description here"
                maxRows={4}
                autosize
                onChange={(e) => setState(prev => ({Description: e.target.value, ...prev}))} value={state.Description}
            />
            <MultiSelect required data={[...retrieveAllTags(posts)]} label="Tags" placeholder="Select or create a tag"
                         searchable creatable
                         getCreateLabel={(t) => `+ ${t}`}
                         onChange={(e) => setState(prev => ({Tags: e, ...prev}))} value={state.Tags}
            />
            <Autocomplete label="Category" placeholder="Enter category here"
                          data={retrieveAllFolders(posts)} onChange={(e) => setState(prev => ({Folder: e, ...prev}))}
                          value={state.Folder}/>
        </form>
    </Card>
}

export const locatePreview = (file: MFile) => pictureFormats.includes(getExt(file.FileURL)) ? `/${file.FileURL}` : `/${file.Thumbnail}`

export function EditBox({
                            file,
                            posts,
                            author,
                            cancel
                        }: { file: MFile, posts: MFile[], author: Author, cancel: () => void }) {
    const theme = useMantineTheme();

    const form = useForm({
        initialValues: {
            Title: file.Title || '',
            Description: file.Description || '',
            NSFW: file.NSFW || false,
            Tags: file.Tags ? file.Tags.split(",") : [],
            Folder: file.Folder || ''
        },
        validate: {
            Title: (value: string) => value.length > 0 ? null : "Please enter a title",
            Tags: (value: string[]) => value.length > 0 ? null : "Please enter at least one tag"
        }
    });

    async function submit(e) {
        e.preventDefault();
        if (form.validate().hasErrors) return;
        try {
            const res = await fetch(`/api/update`, {
                body: JSON.stringify({
                    author: author,
                    file: {
                        ...file,
                        Title: form.values.Title,
                        Description: form.values.Description,
                        NSFW: form.values.NSFW,
                        Tags: form.values.Tags.join(","),
                        Folder: form.values.Folder
                    }
                }),
                method: 'POST'
            });
            const json = await res.json();
            showNotification({
                title: "File catalog updated",
                message: json.message,
                color: "green"
            });
            mutate('/api/posts');
        } catch (error) {
            console.error(error);
            showNotification({
                title: "Deletion failed!",
                message: error.message,
                color: "red"
            })
        } finally {
            cancel();
        }
    }

    return <Card sx={{display: "inline-flex", width: "100%", transition: "all .375s var(--animation-ease)"}}>
        <Card.Section mr="md" mb={-16} sx={{transition: "all .375s var(--animation-ease)"}}>
            <Image withPlaceholder placeholder={<Text size="xs" align="center">
                {getExt(file.FileURL)}-format file
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
            }} src={locatePreview(file)} alt="" sx={{color: theme.primaryColor}}/>
        </Card.Section>
        <form style={{flex: 1}} onSubmit={submit}>
            <Group position="apart">
                <Text size="xs">{file.Title ? file.Title : displayFilename(file)}</Text>
                <Group>
                    <Checkbox size="xs" label="NSFW" {...form.getInputProps("NSFW")} />
                    <Text size="xs">{(file.Size / 1e3 / 1e3).toFixed(2)} MB</Text>
                </Group>
            </Group>
            <TextInput label="Title" placeholder="Call it something easy to forget, like 'Sneed'!"
                       required {...form.getInputProps("Title")} />
            <Textarea
                label="Description"
                placeholder="Enter a description here"
                maxRows={4}
                autosize
                {...form.getInputProps("Description")}
            />
            <MultiSelect data={[...retrieveAllTags(posts)]} label="Tags" placeholder="Select or create a tag" searchable
                         creatable
                         getCreateLabel={(t) => `+ ${t}`}
                         {...form.getInputProps("Tags")}
            />
            <Autocomplete label="Category" placeholder="Enter category here"
                          data={retrieveAllFolders(posts)} {...form.getInputProps("Folder")} />
            <Group mt="md" position="right"><Button onClick={cancel} variant="light">Cancel</Button><Button
                type="submit">Save</Button></Group>
        </form>
    </Card>
}

// To be used within a modal
export const Importer = ({isUploading, setUploading, desc, type, id, createNewID, playSuccess, router}) => {
    const [url, setUrl] = useState<string>("");

    const verify = (): string | undefined => {
        if (type === 'yt') {
            const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            if (match && match[2].length == 11) {
                return match[2];
            }
        }

        return undefined;
    }

    const onChange = useCallback((e: { target: { value: string; }; }) => {
        setUrl(e.target.value)
    }, [url]);

    const onImport = useCallback(async () => {
        setUploading(true);

        if (id === null) {
            id = createNewID();
            setCookies('DokiIdentification', id, {maxAge: 60 * 60 * 24 * 30});
        }

        try {
            const spec = verify();
            const details = await fetch(`/api/import/${spec}`, {method: "POST", body: id});
            const user = await details.json();

            if (user) {
                showNotification({
                    title: "Imported!",
                    message: user.title,
                    color: "green",
                    icon: <Video/>
                })
                if (id === null || id === undefined) {
                    showNotification({
                        title: `Welcome to Doki, your profile is now ${user.Name}`,
                        message: "You can now manage your own uploads here."
                    })
                }
                playSuccess();
                await router.push("/browser");
            }
        } catch (error) {
            console.error(error);
            showNotification({
                title: "Importing failed!",
                message: error.response,
                color: "red",
                icon: <CarCrash/>
            })
        } finally {
            setUploading(false);
        }
    }, [url, isUploading, setUploading]);

    return (
        <>
            <TextInput value={url} onChange={onChange} my="md" label={desc} placeholder="Place the URL here"/>
            <Group position="right"><Button disabled={!verify()} onClick={onImport}
                                            loading={isUploading}>Import</Button></Group>
        </>
    )
}