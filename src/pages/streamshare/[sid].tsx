import Layout from "@src/components/layout";
import SEO from "@src/components/seo";
import { withSessionSsr } from "@src/lib/session";

export const getServerSideProps = withSessionSsr(async function ({
    req,
    res,
    ...other
}) {
    const space = req.session.space;
    if (space === undefined) {
        res.statusCode = 302;
        return {
            redirect: {
                destination: `/login`,
                permanent: false
            }
        };
    }
    return {
        props: {
            space
        }
    };
});
function Page({ space }) {

    return <Layout space={space}>
        <SEO title="Streamshare session" siteTitle="Doki"
            description="Content for days" />
    </Layout>;
}

export default Page;