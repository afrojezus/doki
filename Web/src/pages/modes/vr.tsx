import {useRouter} from "next/router";
import {
    ActionIcon
} from "@mantine/core";
import Layout from "@src/components/layout";
import SEO from "@src/components/seo";
import {ArrowBack} from "tabler-icons-react";


function Page() {
    const router = useRouter();
    // const theme = useMantineTheme();

    return <Layout>
        <SEO title="VR" siteTitle="Doki"
             description="Content for days"/>
        <ActionIcon sx={{animation: "flowDown 7s var(--animation-ease)"}} onClick={() => router.back()}><ArrowBack /></ActionIcon>

    </Layout>
}

export default Page;
