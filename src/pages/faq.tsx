import { Center, Group, Text, Stack, Button } from "@mantine/core";
import { LinkButton } from "@src/components/buttons";
import Layout from "@src/components/layout";
import SEO from "@src/components/seo";
import { useRouter } from "next/router";

export default function Page() {
    const router = useRouter();
    return <Layout flex header={<></>} footer={<></>}>
        <SEO description="Frequently asked questions" title="FAQ" siteTitle="Doki" />
        <Center m="auto">
            <Stack>
                <Group>
                    <Text className="use-m-font" size="xl">doki</Text>
                    <Text className="use-m-font">Frequently asked questions</Text>
                </Group>
                <Text size="md">Who exactly is this website for?</Text>
                <Text size="xs">Doki is for anyone who wants to have a space on the wider web to store files and share among friends.</Text>
                <Text size="md">What are 'spaces'?</Text>
                <Text size="xs">Spaces are your own channel within the platform, think of it like a file server that is entirely your own.</Text>
                <Text size="md">Are my files kept safe?</Text>
                <Text size="xs">If your space is private, it is kept safe and secure and nobody can find them without the password.</Text>
                <Text size="md">Are there any restrictions?</Text>
                <Text size="xs">There are restrictions on how big your files are and what the content entails. Use common sense when you upload.</Text>
                <Group position="right">
                    <Button onClick={() => router.back()} className="use-m-font" variant="outline">Go back</Button>
                </Group>
            </Stack>
        </Center>
    </Layout>;
}