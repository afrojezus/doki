import {
    Autocomplete,
    Badge,
    Button,
    Card,
    Group,
    Image, MultiSelect,
    Text,
    Textarea,
    TextInput,
    useMantineTheme
} from "@mantine/core";
import {useForm} from "@mantine/form";
import {getExt, retrieveAllFolders, retrieveAllTags} from "../../utils/file";
import {File as MFile} from "@server/models";

export interface FormFile {
    Title: string;
    Description: string;
    NSFW: boolean;
    File: File;
    Tags: string[];
    Folder: string;
}

export function UploadBox({rawFile, file, posts}: { rawFile: File, file: FormFile, posts: MFile[] }) {
    const theme = useMantineTheme();

    const form = useForm({
        initialValues: {
            Title: rawFile.name,
            Description: "",
            NSFW: false,
            File: rawFile,
            Tags: [],
            Folder: ""
        },
        validate: {
            Title: (value: string) => value.length > 0 ? null : "Please enter a title",
            Tags: (value: string[]) => value.length > 0 ? null : "Please enter at least one tag"
        }
    });

    return <Card sx={{display: "inline-flex"}}>
        <Card.Section mr="md" mb={-16}>
            <Image withPlaceholder placeholder={<Text size="xs" align="center">
                {getExt(rawFile.name)}-format file
            </Text>} radius={0} styles={{
                root: {
                    width: 300,
                    height: "100%",
                    background: theme.primaryColor
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
            }} src={URL.createObjectURL(rawFile)} alt="" sx={{color: theme.primaryColor}}/>
        </Card.Section>
        <form style={{flex: 1}} onChange={(e) => {
            e.preventDefault();
            if (!form.validate().hasErrors) {
                file.Title = form.values.Title;
                file.Description = form.values.Description;
                file.Folder = form.values.Folder;
                file.NSFW = form.values.NSFW;
                file.Tags = form.values.Tags;
            }
        }
        }>
            <Group position="apart">
                <Text size="xs">{rawFile.name}</Text>
                <Group>
                    <Text size="xs">{(rawFile.size / 1e3 / 1e3).toFixed(2)} MB</Text>
                    <Badge>{getExt(rawFile.name)}</Badge>
                    {form.getInputProps("NSFW").value ? <Badge color="red">NSFW</Badge> : undefined}
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
            <MultiSelect data={[...retrieveAllTags(posts)]} label="Tags" placeholder="Select or create a tag" searchable creatable
                getCreateLabel={(t) => `+ ${t}`}
                         {...form.getInputProps("Tags")}
            />
            <Autocomplete label="Category" placeholder="Enter category here"
                          data={retrieveAllFolders(posts)} {...form.getInputProps("Folder")} />
        </form>
    </Card>
}