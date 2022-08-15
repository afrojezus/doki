import {
    Badge,
    Box,
    Card,
    Checkbox,
    Group,
    Image,
    Paper,
    Space,
    Stack,
    Text,
    ThemeIcon,
    Tooltip,
    Transition,
    useMantineTheme
} from "@mantine/core";
import { File as FileIcon, Folder, User } from "tabler-icons-react";
import Link from "next/link";
import { Author, File } from "@server/models";
import { displayFilename, getExt, pictureFormats, videoFormats } from "../../utils/file";
import { formatDate, ParseUnixTime } from "../../utils/date";
import { useRouter } from "next/router";
import { TouchableCard } from "./buttons";
import { useMediaQuery } from "@mantine/hooks";

export function SmallGridItem({ data }) {
    const theme = useMantineTheme();

    return <Link href={`/browser?f=${data}`} passHref><Paper sx={{
        transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
        ':hover': {
            border: `1px solid ${theme.colors.dark[0]}`,
            boxShadow: theme.shadows[3]
        }
    }} shadow="none" withBorder component="a">
        <Group>
            <Folder style={{ marginLeft: 16 }} size={24} /><Space /><Text size="sm" my="md">{data}</Text>
        </Group>
    </Paper>
    </Link>;
}

function GridItem({
    data,
    editMode,
    selected,
    onSelect,
    onUnselect,
    style,
    author,
    onlyUsers = false
}: { data: File, editMode: boolean, selected: boolean, onSelect: (file: File) => void, onUnselect: (file: File) => void, style?: any, author?: Author, onlyUsers?: boolean; }) {
    const theme = useMantineTheme();
    const router = useRouter();

    const isMobile = useMediaQuery('only screen and (max-width: 1000px)');

    const secondaryColor = theme.colorScheme === 'dark'
        ? theme.colors.dark[1]
        : theme.colors.gray[7];

    /*useEffect(() => {
        if (data && locatePreview(data)) {

            const v = new Vibrant(locatePreview(data));
            v.getPalette().then((pal) => setPalette(pal));
        }
    }, [data]);*/

    return <TouchableCard
        className="flowDown"
        style={style}
        sx={{
            transition: "all 0.375s cubic-bezier(.07, .95, 0, 1)",
            border: selected ? `1px solid ${theme.colors.blue[6]}` : undefined,
            ':hover': {
                border: `1px solid ${editMode && data.Author.AuthorId == author.AuthorId ? theme.colors.blue[6] : theme.colorScheme === "dark" ? theme.colors.dark[3] : theme.colors.dark[0]}`,
                boxShadow: theme.shadows[3],
                '> * > .mantine-Image-root': {
                    opacity: 0.5
                }
            },
            display: "flex",
            flexDirection: "column",
            '&>div': {
                flex: 1
            },
            cursor: "pointer",
            ...(isMobile && {
                minHeight: 300
            }),
            maxHeight: 300
        }}
        link={`/view/${data.Id}`}
        onClick={() => {
            if (editMode) {
                if (!(data.Author.AuthorId == author.AuthorId)) return;
                if (selected)
                    onUnselect(data);
                else
                    onSelect(data);
                return;
            } else {
                router.push(`/view/${data.Id}`);
            }
        }} shadow="md" withBorder>

        <Card.Section>
            {[...videoFormats, ...pictureFormats].includes(getExt(data.FileURL)) ?
                <Image sx={{
                    filter: data.NSFW ? "blur(10px)" : undefined,
                    transition: "all .375s cubic-bezier(.07, .95, 0, 1)"
                }} src={`/${videoFormats.includes(getExt(data.FileURL)) ? data.Thumbnail : data.FileURL}`}
                    fit="cover" width="100%" height={130} alt="" />
                : <ThemeIcon variant="filled" sx={{ width: "100%", height: 130 }} radius={0}>
                    <FileIcon size={48} />
                </ThemeIcon>}


            <Checkbox readOnly size="lg" sx={{
                position: "absolute",
                top: editMode ? 16 : 0,
                left: editMode ? 16 : 0,
                opacity: editMode && data.Author.AuthorId == author.AuthorId ? 1 : 0,
                pointerEvents: "none",
                transition: "all .375s cubic-bezier(.07, .95, 0, 1)"
            }} checked={selected} />
        </Card.Section>
        <Stack spacing="xs">
            <Group position="apart" style={{ marginBottom: 5, marginTop: theme.spacing.sm, flex: 1 }}>
                <Text size="sm" sx={{
                    fontFamily: "Manrope, sans-serif;",
                    fontWeight: 700
                }}
                    weight={500}>{displayFilename(data)}</Text>
            </Group>
            <Group spacing={8}>
                <Text size="xs"
                    style={{ color: secondaryColor }}>
                    {data.Author.Name}
                </Text>
                {author && author.AuthorId === data.AuthorId &&
                    <Tooltip label="Your upload"><User size={16} /></Tooltip>}
            </Group>
            <Group position="apart">
                <Text size="xs"
                    style={{ color: secondaryColor }}>
                    {formatDate(ParseUnixTime(data.UnixTime))}
                </Text>
                <Text size="xs"
                    style={{ color: secondaryColor }}>
                    {((data.Size) / 1e3 / 1e3).toFixed(2)} MB {getExt(data.FileURL)}
                </Text>
                <Text size="xs"
                    style={{ color: secondaryColor }}>
                    {(data.Views)} views
                </Text>
            </Group>
            <Group position="apart">
                {data.Folder && <Badge color="yellow">{data.Folder}</Badge>}
                {data.NSFW && <Tooltip label="This file is rated not safe for work"><Badge color="red">
                    NSFW
                </Badge></Tooltip>}
            </Group>
        </Stack>
        <Transition mounted={selected} transition={{
            in: { opacity: 0.3 },
            out: { opacity: 0 },
            common: {},
            transitionProperty: 'opacity'
        }}>{(styles) => <Box style={styles} sx={{
            pointerEvents: 'none',
            background: `linear-gradient(180deg, ${theme.colors.blue[3]}, ${theme.colors.blue[6]})`,
            position: 'absolute',
            height: '100vh',
            width: '100%',
            top: 0,
            left: 0
        }}></Box>}</Transition>
    </TouchableCard>;
}

export default GridItem;