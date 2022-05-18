import {useRouter} from "next/router";
import {
    ActionIcon
} from "@mantine/core";
import Layout from "@src/components/layout";
import SEO from "@src/components/seo";
import {ArrowBack} from "tabler-icons-react";

function Page() {
    const router = useRouter();

    return <Layout>
        <SEO title="Booru" siteTitle="Doki"
             description="Content for days"/>
        <ActionIcon sx={{animation: "flowDown 7s var(--animation-ease)"}} onClick={() => router.back()}><ArrowBack /></ActionIcon>

    </Layout>
}

export default Page;
