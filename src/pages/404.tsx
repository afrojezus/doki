import Layout from "@src/components/layout";
import {Center, Group, Stack, Text} from "@mantine/core";
import SEO from "@src/components/seo";
import {LinkButton} from "@src/components/buttons";

export default function Custom404() {
    return <Layout aside={<></>}>
        <SEO description="I couldn't find the page" title="404" siteTitle="Doki" />
        <Center>
            <Stack>
            <video autoPlay muted loop src="/assets/404.mp4" />
                <Group position="apart">
                    <Group>
                        <Text className="use-m-font" size="xl">404</Text>
                        <Text className="use-m-font">Page not found!</Text>
                    </Group>
                    <LinkButton color="dark" href="/" className="use-m-font" variant="outline">Return to home</LinkButton>
                </Group>

                <Text size="xs">This incident has been reported to God.</Text>
            </Stack>
        </Center>
    </Layout>
}