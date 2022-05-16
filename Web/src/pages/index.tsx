import Layout from '../components/layout';
import SEO from '../components/seo';
import FileRepository from "@server/repositories/FileRepository";
import {Author} from "@server/models";

export async function getServerSideProps() {
    const posts = await FileRepository.findAll({
        include: {
            model: Author,
            required: true
        }
    });
    if (!posts) {
        return {
            redirect: {
                destination: "/browser",
                permanent: false
            }
        }
    }
    return {
        redirect: {
            destination: `/files/${posts[~~(Math.random() * posts.length)].Id}`,
            permanent: false
        }
    };
}

function Page() {

    return <Layout>
        <SEO title="Home" siteTitle="Doki"
             description="Content for days"/>
    </Layout>
}

export default Page;