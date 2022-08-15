import Layout from '../components/layout';
import SEO from '../components/seo';
import FileRepository from "@server/repositories/FileRepository";
import { Author } from "@server/models";
import SpaceRepository from '@server/repositories/SpaceRepository';
import { withSessionSsr } from '@src/lib/session';
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

    const serverSpace = await SpaceRepository.findOne({
        where: {
            Id: space.Id
        }
    });

    const posts = await FileRepository.findAll({
        where: {
            Space: serverSpace.Id,
            NSFW: 0 // avoid nsfw on first load
        },
        include: {
            model: Author,
            required: true
        }
    });
    if (posts.length <= 0) {
        return {
            redirect: {
                destination: "/browser",
                permanent: false
            }
        };
    }
    return {
        redirect: {
            destination: `/view/${posts[~~(Math.random() * posts.length)].Id}`,
            permanent: false
        }
    };
});

function Page() {

    return <Layout>
        <SEO title="Home" siteTitle="Doki"
            description="Content for days" />
    </Layout>;
}

export default Page;