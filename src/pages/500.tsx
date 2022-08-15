import Layout from "@src/components/layout";
import { Center, Group, Stack, Text } from "@mantine/core";
import SEO from "@src/components/seo";
import { LinkButton } from "@src/components/buttons";

export default function Custom500() {
    return <Layout flex header={<></>} footer={<></>}>
        <SEO description="I messed up.." title="500" siteTitle="Doki" />
        <Center m="auto">
            <Stack>
                <video autoPlay muted loop src="/assets/404.mp4" />
                <Group position="apart">
                    <Group>
                        <Text className="use-m-font" size="xl">500</Text>
                        <Text className="use-m-font">Server error!</Text>
                    </Group>
                    <LinkButton color="dark" href="/" className="use-m-font" variant="outline">Return to home</LinkButton>
                </Group>

                <Text size="xs">This incident has definitely been reported to God.</Text>
            </Stack>
        </Center>
    </Layout>;
}