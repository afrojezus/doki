import {useRouter} from "next/router";
import {
    ActionIcon,
    Center,
    Container,
    Paper,
    SimpleGrid,
    Stack, Text,
    Title,
    UnstyledButton,
    useMantineTheme
} from "@mantine/core";
import Layout from "@src/components/layout";
import SEO from "@src/components/seo";
import {ArrowBack, DeviceTv, Photo} from "tabler-icons-react";

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

    return <Layout>
        <SEO title="Booru" siteTitle="Doki"
             description="Content for days"/>
        <ActionIcon sx={{animation: "flowDown 7s var(--animation-ease)"}} onClick={() => router.back()}><ArrowBack /></ActionIcon>

    </Layout>
}

export default Page;