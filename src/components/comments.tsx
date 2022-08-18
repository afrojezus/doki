import { ActionIcon, Aside, Avatar, Box, Button, Card, Center, Group, Menu, ScrollArea, Stack, Text, Textarea, Title, Transition, useMantineTheme } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Author, Comment, File } from "@server/models";
import { useCallback, useEffect } from "react";
import { Check, MoodHappy, X } from "tabler-icons-react";
import { IEmojiData, IEmojiPickerProps } from "emoji-picker-react";
import { formatDate, ParseUnixTime } from "utils/date";

import dynamic from "next/dynamic";
import useSWR, { mutate } from "swr";
const EmojiPickerNoSSRWrapper = dynamic<IEmojiPickerProps>(
    () => import("emoji-picker-react"),
    {
        ssr: false,
        loading: () => <p>Loading ...</p>,
    }
);

interface CommentBox {
    error?: Error;
    author: Author;
    file: File;
}
const fetcher = async (url) => {
    const res = await fetch(url, {
        method: "GET"
    });
    const data = await res.json();

    if (res.status !== 200) {
        throw new Error(data.message);
    }
    return data as Comment[];
};
export function CommentBox({ error, file, author }: CommentBox) {
    const { data } = useSWR(`/api/comments?id=${file.Id}`, fetcher, {
        refreshInterval: 1 * 1e3
    });
    const form = useForm({
        initialValues: {
            id: author?.AuthorId ?? null,
            fileId: file.Id,
            authorName: author?.Name ?? "Anon",
            message: ''
        },
        validate: {
            message: (value: string) => !value?.length ? "Cannot send an empty comment" : (/[&/\\#;+()$~%^'":*?<>{}]/g.test(value) ? "Invalid characters" : null),
        },
    });
    useEffect(() => {
        if (form.values.fileId !== file.Id) {
            form.setFieldValue("fileId", file.Id);
        }
        if (author && (form.values.id !== author.AuthorId)) {
            form.setFieldValue("id", author.AuthorId);
            form.setFieldValue("authorName", author.Name);
        }
    }, [file, author]);
    const onEmojiClick = useCallback((event, data: IEmojiData) => {
        form.setFieldValue("message", form.values.message + data.emoji);
    }, [form.values.message]);
    const submit = form.onSubmit(async (values) => {
        try {
            const response = await fetch(`/api/comments?id=${values.id}&authorName=${values.authorName}&fileId=${values.fileId}`, {
                method: "POST",
                body: values.message
            });
            if (!response.ok) throw new Error("The server was not happy with this comment");
            showNotification({ title: "Comment sent", message: "Your comment was delivered successfully for this file.", color: "green", icon: <Check /> });
            form.reset();
            await mutate(`/api/comments?id=${file.Id}`);
        } catch (error) {
            console.error(error);
            showNotification({ title: "Failed sending comment", message: error?.message, color: "red", icon: <X /> });
        }
    });
    return <>
        <Box component="form" onSubmit={submit}>
            <Textarea
                sx={(theme) => ({
                    "&>*>textarea": { backgroundColor: theme.colors.dark[5], borderColor: theme.colors.dark[4], color: theme.white }
                })}
                placeholder="Your comment"
                maxRows={2}
                autosize
                {...form.getInputProps("message")}
            />
            <Transition transition="fade" mounted={form.values.message.length > 0}>
                {(styles) => <Group style={styles} mt="sm" position="apart">
                    <Menu withArrow withinPortal>
                        <Menu.Target>
                            <ActionIcon title="Add emojis"><MoodHappy size={24} /></ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Label>
                                Emoji
                            </Menu.Label>
                            <EmojiPickerNoSSRWrapper pickerStyle={{
                                background: "transparent",
                                border: "none",
                                boxShadow: "none",
                            }} onEmojiClick={onEmojiClick} />
                        </Menu.Dropdown>
                    </Menu>
                    <Button type="submit">Send</Button>
                </Group>}</Transition>
        </Box>

        {error && <Text size="xs">Failed fetching comments {error?.message}</Text>}
        {data && data.length > 0 ?
            <Aside.Section mt="sm" grow component={ScrollArea} mx="-xs" px="xs">{data.sort((a, b) => b.Date - a.Date).map((c) => <Card className="flyIn" mb="sm" key={c.Id}>
                <Group>
                    <Avatar sx={{ alignSelf: "start" }} />
                    <Stack spacing={0}>
                        <Title className="use-m-font" order={6}>{c.AuthorName ?? "Anon"}</Title>
                        <Text size="xs">{formatDate(ParseUnixTime(c.Date))}</Text>
                        <Text mt="sm" size="xs">{c.Content}</Text>
                    </Stack>
                </Group>
            </Card>)}</Aside.Section> : <Stack sx={{ margin: "auto", textAlign: "center", opacity: 0.5 }}>
                <Title className='use-m-font'>O.O'</Title>
                <Text className='use-m-font'>No comments!</Text>
            </Stack>}
    </>;
}