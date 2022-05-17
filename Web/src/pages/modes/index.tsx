import Layout from "@src/components/layout";
import SEO from "@src/components/seo";
import {
    ActionIcon, Button,
    Center,
    Container,
    Group,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Title, UnstyledButton,
    useMantineTheme
} from "@mantine/core";
import {ArrowBack, DeviceTv, Friends, Photo} from "tabler-icons-react";
import {useRouter} from "next/router";
import useSound from "use-sound";

export async function getStaticProps({locale}) {
    return {
        props: {
            messages: (await import(`../../../${locale}.json`)).default
        }
    }
}

function Page() {
    const router = useRouter();
    const theme = useMantineTheme();
    const [play] = useSound("/assets/mode_select.wav", {volume: 0.5});

    function handleTV() {
        play();
        router.push("/modes/tv");
    }

    function handleVR() {
        play();
        router.push("/modes/vr");
    }

    function handleBooru() {
        play();
        router.push("/modes/booru");
    }

    return <Layout>
        <SEO title="Modes" siteTitle="Doki"
             description="Content for days"/>
        <ActionIcon sx={{animation: "flowDown 7s var(--animation-ease)"}} onClick={() => router.back()}><ArrowBack /></ActionIcon>
        <Container size="xl">
            <Paper sx={{
                animation: "flowDown 4s var(--animation-ease)",
                position: "absolute", padding: 10, marginLeft: -20, marginTop: 0, background: theme.colors.blue[3], opacity: 0.5}} shadow="xl">

            </Paper>
            <Paper sx={{
                animation: "flowDown 5s var(--animation-ease)",
                position: "absolute", padding: 20, marginLeft: -10, marginTop: 10, background: theme.colors.indigo[3], opacity: 0.5}} shadow="xl">

            </Paper>
            <Paper sx={{
                animation: "flowDown 6s var(--animation-ease)",
                position: "absolute", padding: 32, marginLeft: 0, marginTop: 20, background: theme.colors.grape[3], opacity: 0.5}} shadow="xl">

            </Paper>
            <Center inline>
                <Title sx={{fontFamily: "Manrope, sans-serif;", fontWeight: 800, animation: "flowDown 6s var(--animation-ease)", fontSize: "4em", zIndex: 3}}>Modes</Title>
            </Center>
            <Stack>
                <Title className="use-m-font" sx={{animation: "flowDown 7s var(--animation-ease)"}} order={4}>Welcome to modes, this is where you can choose a specialized mode of Doki to enhance your experience.</Title>

                <SimpleGrid cols={3} sx={{animation: "flowDown 4s var(--animation-ease)"}}>
                    <UnstyledButton onClick={handleTV}>
                    <Stack>
                        <Paper withBorder shadow="xl" p="xl" sx={{display: "flex", height: 300, background: theme.fn.linearGradient(180, theme.colors.indigo[2], '#fff')}}>
                            <DeviceTv size={150} style={{margin: "auto", color: "black"}} />
                        </Paper>
                        <Text size="xl" className="use-m-font">
                            TV
                        </Text>
                        <Text className="use-m-font">
                            Experience
                            a binge-worthy
                            stream of content
                            with a layout
                            tailored for your TV
                        </Text>
                    </Stack>
                    </UnstyledButton>
                    <UnstyledButton disabled onClick={handleVR} sx={{opacity: 0.5}}>
                    <Stack>
                        <Paper withBorder shadow="xl" p="xl" sx={{display: "flex", height: 300, background: theme.fn.linearGradient(180, theme.colors.dark[1], '#fff')}}>
                            <Paper sx={{display: "flex", margin: "auto", width: 200, borderRadius: 40}} shadow="xl" p="md">
                            <Text size="xl" className="use-m-font" sx={{margin: "auto", fontSize: "3em", fontWeight: 800}}>VR</Text>
                            </Paper>
                        </Paper>
                        <Text size="xl" className="use-m-font">
                            VR
                        </Text>
                        <Text className="use-m-font">
                            Transcend
                            all dimensions
                            with this layout
                            exclusively designed
                            to work with VR headsets
                        </Text>
                    </Stack>
                    </UnstyledButton>
                    <UnstyledButton disabled onClick={handleBooru} sx={{opacity: 0.5}}>
                    <Stack>
                        <Paper withBorder shadow="xl" p="xl" sx={{display: "flex", height: 300, background: theme.fn.linearGradient(180, theme.colors.pink[2], '#fff')}}>
                            <Friends size={150} style={{margin: "auto", color: "black"}} />
                        </Paper>
                        <Text size="xl" className="use-m-font">
                            Streamshare
                        </Text>
                        <Text className="use-m-font">
                            Stream your session to your friends and watch together
                        </Text>
                    </Stack>
                    </UnstyledButton>
                </SimpleGrid>
            </Stack>
        </Container>
    </Layout>
}

export default Page;