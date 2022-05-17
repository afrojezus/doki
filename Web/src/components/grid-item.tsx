import {
    Badge,
    Card,
    Checkbox,
    Group,
    Paper,
    Space,
    Text,
    ThemeIcon,
    Image,
    useMantineTheme,
    Center, Stack
} from "@mantine/core";
import {File as FileIcon, Folder} from "tabler-icons-react";
import Link from "next/link";
import {File} from "@server/models";
import {displayFilename, getExt, pictureFormats, videoFormats} from "../../utils/file";
import {formatDate, ParseUnixTime} from "../../utils/date";
import {useRouter} from "next/router";

export function SmallGridItem({data}) {
    const theme = useMantineTheme();

    return <Link href={`/browser?f=${data}`} passHref><Paper sx={{
        transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
        ':hover': {
            border: `1px solid ${theme.colors.dark[0]}`,
            boxShadow: theme.shadows[3]
        }
    }} shadow="none" withBorder component="a">
        <Group>
            <Folder style={{marginLeft: 16}} size={24}/><Space/><Text size="sm" my="md">{data}</Text>
        </Group>
    </Paper>
    </Link>
}

function GridItem({
                      data,
                      editMode,
                      selected,
                      onSelect,
                      onUnselect
                  }: { data: File, editMode: boolean, selected: boolean, onSelect: (file: File) => void, onUnselect: (file: File) => void }) {
    const theme = useMantineTheme();
    const router = useRouter();

    const secondaryColor = theme.colorScheme === 'dark'
        ? theme.colors.dark[1]
        : theme.colors.gray[7];

    return <Card
        sx={{
            transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
            border: selected ? `4px solid ${theme.colors.blue[6]}` : undefined,
            ':hover': {
                border: `${selected ? 4 : 1}px solid ${editMode ? theme.colors.blue[6] : theme.colors.dark[0]}`,
                boxShadow: theme.shadows[3]
            },
            animation: "flyIn 0.375s cubic-bezier(.07, .95, 0, 1)",
            display: "inline-flex",
            flexFlow: "column wrap",
            '&>div': {
                flex: 1
            },
            cursor: "pointer"
        }} onClick={() => {

        if (editMode) {
            if (selected)
                onUnselect(data);
            else
                onSelect(data);
            return;
        } else {
            router.push(`/files/${data.Id}`);
        }
    }} shadow="md" withBorder>

        <Card.Section>
            {[...videoFormats, ...pictureFormats].includes(getExt(data.FileURL)) ?
                <Image src={`/${videoFormats.includes(getExt(data.FileURL)) ? data.Thumbnail : data.FileURL}`}
                       fit="cover" width="100%" height={160} alt=""/>
                : <ThemeIcon variant="gradient" sx={{width: "100%", height: 160}} radius={0}
                             gradient={{from: 'teal', to: 'blue', deg: 60}}>
                    <FileIcon size={48}/>
                </ThemeIcon>}


            <Checkbox readOnly size="lg" sx={{
                position: "absolute",
                top: editMode ? 16 : 0,
                left: editMode ? 16 : 0,
                opacity: editMode ? 1 : 0,
                pointerEvents: "none",
                transition: "all .375s cubic-bezier(.07, .95, 0, 1)"
            }} checked={selected}/>
        </Card.Section>
        <Stack spacing="xs">
            <Group position="apart" style={{marginBottom: 5, marginTop: theme.spacing.sm, flex: 1}}>
                <Text size="sm" sx={{fontFamily: "Manrope, sans-serif;", fontWeight: 700}}
                      weight={500}>{displayFilename(data)}</Text>
                {data.NSFW && <Badge color="red">
                    NSFW
                </Badge>}
            </Group>
            <Text size="xs" style={{color: secondaryColor}}>
                {data.Author.Name}
            </Text>
            <Group position="apart">
                <Text size="xs" style={{color: secondaryColor}}>
                    {formatDate(ParseUnixTime(data.UnixTime))}
                </Text>
                <Text size="xs" style={{color: secondaryColor}}>
                    {((data.Size) / 1e3 / 1e3).toFixed(2)} MB {getExt(data.FileURL)}
                </Text>
                <Text size="xs" style={{color: secondaryColor}}>
                    {(data.Views)} views
                </Text>
            </Group>
        </Stack>
    </Card>
}

export default GridItem;