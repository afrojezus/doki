import { Avatar, Badge, Box, Button, Checkbox, Group, Paper, Select, Stack, Text, TextInput, Title, Transition, useMantineTheme } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Space } from "@server/models/definitions/Space";
import SpaceRepository from "@server/repositories/SpaceRepository";
import { LinkButton, TouchableLink } from "@src/components/buttons";
import Emoji from "@src/components/emoji";
import Layout from "@src/components/layout";
import { NextPageContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { ComponentPropsWithoutRef, forwardRef, useState } from "react";

export async function getServerSideProps(nextPage: NextPageContext) {
    try {
        const spaces = await SpaceRepository.findAll();
        return {
            props: {
                spaces
            }
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

interface SpaceItemProps extends ComponentPropsWithoutRef<'div'> {
    image: string;
    label: string;
    description: string;
    priv: boolean;
}
const SpaceItem = forwardRef<HTMLDivElement, SpaceItemProps>(
    ({ image, label, description, priv, ...others }: SpaceItemProps, ref) => {
        return (
            <div ref={ref} {...others}>
                <Group noWrap>
                    <Avatar src={image ?? (priv ? "/assets/doki-logo-priv.png" : "/assets/doki-logo.png")} />
                    <div>
                        <Group>
                            <Text size="sm">{label}</Text>
                            {priv && <Badge color="red">password required</Badge>}
                        </Group>
                        <Text size="xs">{description}</Text>
                    </div>
                </Group>
            </div>
        );
    }
);

interface PageProps {
    spaces: Space[];
}

function Page({ spaces }: PageProps) {
    const theme = useMantineTheme();
    const router = useRouter();
    const form = useForm({
        initialValues: {
            Name: '',
            Description: '',
            Icon: '',
            Bg: '',
            Private: false,
            password: ''
        },
        validate: {
            Name: (value) => null,
            Description: (value) => null,
            password: (value, { Private }) => Private ? (/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(value) ? null : 'Invalid password') : null
        }
    });
    const tryConnect = async (values) => {
        try {
            const res = await fetch('/api/makeSpace', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ space: values })
            });
            const result = await res.json();
            if (result && (result as Space).Name === values.Name) {
                router.push('/');
            } else {
                throw result;
            }
        } catch (error) {
            console.error(error);
        }
    };
    return <Layout additionalMainStyle={{ background: form.values.Bg ? "transparent" : theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] }} flex header={<></>} footer={<></>}>
        <div className="bg-container">
            <img referrerPolicy="no-referrer" style={{ opacity: form.values.Bg ? 1 : 0 }} alt="" src={form.values.Bg} />
        </div>
        <Box sx={{ margin: 'auto' }}>
            <Paper onSubmit={form.onSubmit((values) => tryConnect(values))} component="form" p="xl" shadow="xl">
                <Stack>
                    <Group position="apart">
                        <Title className="use-m-font" order={3}>doki</Title>
                        {form.values.Icon ? <Avatar imageProps={{ referrerPolicy: "no-referrer" }} src={form.values.Icon} /> : form.values.Private ? <Avatar src="/assets/doki-logo-priv.png" /> : <Avatar src="/assets/doki-logo.png" />}
                    </Group>
                    <Text size="sm">Creating a new space is simple, just make sure you fill the required fields</Text>
                    <TextInput
                        required
                        label="Name"
                        placeholder="What's your space called?"
                        {...form.getInputProps('Name')}
                    />
                    <TextInput
                        required
                        label="Description"
                        placeholder="Describe your space, how is it like?"
                        {...form.getInputProps('Description')}
                    />
                    <TextInput
                        label="Icon (ONLY URL for now)"
                        placeholder="(Optional) Make your space stand out"
                        {...form.getInputProps('Icon')}
                    />
                    <TextInput
                        label="Background (ONLY URL for now)"
                        placeholder="(Optional) Make your space stand out"
                        {...form.getInputProps('Bg')}
                    />
                    <TextInput
                        disabled={!form.values.Private}
                        required={form.values.Private}
                        label="Password"
                        error="Minimum 1 number, 1 special character, 1 uppercase letter and 1 lowercase letter in a length of 8 characters"
                        placeholder="Required if you want your space to be private"
                        type="password"
                        {...form.getInputProps('password')}
                    />
                    <Checkbox
                        mt="md"
                        label="Make it private?"
                        {...form.getInputProps('Private', { type: "checkbox" })} />
                    <Group position="right">
                        <LinkButton href="/login" variant="subtle">Pick a space instead</LinkButton>
                        <Button type="submit">Create space</Button>
                    </Group>
                </Stack>
            </Paper>
            <Group position="apart">
                <TouchableLink link="/faq"><Text sx={{ "&:hover": { textDecoration: "underline" }, cursor: "pointer", filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size="xs">Frequently asked questions</Text></TouchableLink>
                <Group>
                    <Text size="xs" sx={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }}>Created by afroj with <Emoji
                        symbol={String.fromCodePoint(parseInt("2764", 16))}
                        label="Love" style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} /></Text>
                    <Text size="xs" sx={{ "&:hover": { textDecoration: "underline" }, cursor: "pointer", filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} onClick={() => window.open("https://github.com/tokumei-gr/doki")}>GitHub</Text>
                </Group>
            </Group>
        </Box>
    </Layout>;
}

export default Page;