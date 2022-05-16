import {
    Autocomplete,
    Badge,
    Button,
    Card,
    Group,
    Image,
    Text,
    Textarea,
    TextInput,
    useMantineTheme
} from "@mantine/core";
import {useForm} from "@mantine/form";
import useSound from "use-sound";
import {getExt} from "../../utils/file";

export interface FormFile {
    Title: string;
    Description: string;
    NSFW: boolean;
    File: File;
    Tags: string;
    Folder: string;
}

export function UploadBox({rawFile, callback}: { rawFile: File, callback: (form: FormFile) => void }) {
    const theme = useMantineTheme();
    const [playAccept] = useSound("/assets/accept.wav");

    const form = useForm({
        initialValues: {
            Title: rawFile.name,
            Description: "",
            NSFW: false,
            File: rawFile,
            Tags: "",
            Folder: ""
        },
        validate: {
            Title: (value: string) => value.length > 0 ? null : "Please enter a title"
        }
    });

    function handleSaveForm() {
        if (!form.validate().hasErrors) {
            callback(form.values);
            playAccept();
        }
    }

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
        <form style={{flex: 1}} onSubmit={form.onSubmit((values) => console.log(values))}>
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
            <Textarea
                label="Tags"
                placeholder="Separate tags by commas"
                maxRows={2}
                autosize
                {...form.getInputProps("Tags")}
            />
            <Autocomplete label="Category" placeholder="Enter category here"
                          data={["Sneed", "Feed"]} {...form.getInputProps("Folder")} />
            <Button mt="md" fullWidth onClick={handleSaveForm}>Save</Button>
        </form>
    </Card>
}