import { Avatar, Badge, Box, Button, Center, Group, Loader, LoadingOverlay, Paper, Select, Stack, Text, TextInput, Title, Transition, useMantineTheme } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Space } from "@server/models/definitions/Space";
import SpaceRepository from "@server/repositories/SpaceRepository";
import { LinkButton, TouchableLink } from "@src/components/buttons";
import Emoji from "@src/components/emoji";
import Layout from "@src/components/layout";
import { NextPageContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { ComponentPropsWithoutRef, forwardRef, useState } from "react";
import { Check, FaceIdError, X } from "tabler-icons-react";

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
    const [selectedSpace, setSelectedSpace] = useState(spaces[0]);
    const [loading, setLoading] = useState(false);
    const form = useForm({
        initialValues: {
            password: ''
        },
        validate: {
            password: (value) => selectedSpace.Private ? (value.length > 8 ? null : 'Invalid password') : null
        }
    });
    const changeSpace = (n: string) => {
        setSelectedSpace(spaces.find((s) => s.Name === n));
    };
    const tryConnect = async ({ password }) => {
        try {
            const res = await fetch('/api/setSpace', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ space: selectedSpace, password })
            });
            const result = await res.json();
            if (result && (result as Space).Id === selectedSpace.Id) {
                showNotification({
                    title: `Welcome to ${selectedSpace.Name}`,
                    message: `Taking you to the first random file`,
                    icon: <Check />,
                    color: "green"
                });
                setLoading(true);
                setTimeout(() =>
                    router.push('/'), 1000);
            } else {
                throw result;
            }
        } catch (error) {
            console.error(error);
            showNotification({
                title: "Failed!",
                message: `Did you type your password correctly? Server responded with \"${error.message}\"`,
                icon: <X />,
                color: "red"
            });
            setLoading(false);
        }
    };
    return <Layout additionalMainStyle={{ background: selectedSpace.Bg ? "transparent" : theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] }} flex header={<></>} footer={<></>}>
        <div className="bg-container">
            {spaces.map((x) => <img referrerPolicy="no-referrer" key={x.Id} style={{ opacity: loading ? 0 : (selectedSpace.Id === x.Id && x.Bg) ? 1 : 0 }} alt="" src={x.Bg} />)}
        </div>
        <Box m="auto">
            <Transition mounted={loading} transition="scale">
                {(styles) => <Center style={styles} sx={{ justifyContent: "center", alignItems: "center" }}><Stack><Avatar size="xl" src={selectedSpace.Icon ? selectedSpace.Icon : selectedSpace.Private ? "/assets/doki-logo-priv.png" : "/assets/doki-logo.png"} /><Loader sx={{ margin: "auto" }} /></Stack></Center>}
            </Transition>
            <Transition mounted={!loading} transition="scale">
                {(styles) => <Paper style={styles} onSubmit={form.onSubmit((values) => tryConnect(values))} component="form" p="xl" shadow="xl">
                    <Stack>
                        <Group position="apart">
                            <Title className="use-m-font" order={3}>doki</Title>
                            {selectedSpace.Icon ? <Avatar imageProps={{ referrerPolicy: "no-referrer" }} src={selectedSpace.Icon} /> : selectedSpace.Private ? <Avatar src="/assets/doki-logo-priv.png" /> : <Avatar src="/assets/doki-logo.png" />}
                        </Group>
                        <Text size="sm">The doki platform is built upon spaces, please select a space to begin:</Text>
                        <Select
                            value={selectedSpace.Name}
                            onChange={changeSpace}
                            placeholder="Spaces"
                            withinPortal
                            shadow="xl"
                            data={spaces.map((x) => ({
                                description: x.Description,
                                image: x.Icon,
                                value: x.Name,
                                label: x.Name,
                                priv: x.Private
                            }))}
                            itemComponent={SpaceItem}
                        />
                        <TextInput
                            disabled={!selectedSpace.Private}
                            required={selectedSpace.Private}
                            label="Password"
                            placeholder="Password for the space"
                            type="password"
                            {...form.getInputProps('password')}
                        />
                        <Group position="right">

                            <Transition transition="fade" mounted={form.values.password.length > 0}>
                                {(styles) => <Button style={styles} onClick={() => form.reset()} variant="subtle">Clear</Button>}
                            </Transition>
                            <LinkButton href="/signup" variant="subtle">Create a new space</LinkButton>
                            <Button type="submit">Continue</Button>
                        </Group>
                    </Stack>
                </Paper>}
            </Transition>
            <Transition mounted={!loading} transition="fade">
                {(styles) => <Group style={styles} position="apart">
                    <TouchableLink link="/faq"><Text sx={{ "&:hover": { textDecoration: "underline" }, cursor: "pointer", filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} size="xs">Frequently asked questions</Text></TouchableLink>
                    <Group>
                        <Text size="xs" sx={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }}>Created by afroj with <Emoji
                            symbol={String.fromCodePoint(parseInt("2764", 16))}
                            label="Love" style={{ filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} /></Text>
                        <Text size="xs" sx={{ "&:hover": { textDecoration: "underline" }, cursor: "pointer", filter: `drop-shadow(0px 5px 2px rgb(0 0 0 / 0.4))` }} onClick={() => window.open("https://github.com/tokumei-gr/doki")}>GitHub</Text>
                    </Group>
                </Group>}
            </Transition>
        </Box>
    </Layout>;
}

export default Page;