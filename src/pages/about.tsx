import { Aside, Box, Group, MediaQuery, ScrollArea, Stack, Text, Title } from '@mantine/core';
import Layout, { Menubar, Tabbar } from '../components/layout';
import { LinkButton } from "@src/components/buttons";
import { withSessionSsr } from '@src/lib/session';

/*export async function getStaticProps({locale}) {
    return {
        props: {
//            messages: (await import(`../../../${locale}nodemon.json`)).default
        }
    }
}*/

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
    return <Layout space={space} navbar={
        <Stack>
            <LinkButton href="https://github.com/tokumei-gr/doki" variant="default">Git
                repository</LinkButton>
            <LinkButton href="https://twitter.com/dokiwebsite" variant="default">Twitter</LinkButton>
        </Stack>}>

        <Box sx={{
            position: "relative",
            height: 300,
            width: "100%",
            display: "flex",
            background: `url(\"${space.Bg}\")`,
            borderRadius: 16
        }}>
            <Title className='use-m-font' align="center" m="auto" sx={{ zIndex: 1000, textShadow: "0 2px 6px rgba(0,0,0,.2)", color: "white" }}>Content
                for days</Title>
        </Box>

        <Stack my="md">
            <Text>Doki is a content provider for all sorts of files including support for many varieties of media
                content that can be binged through.</Text>
            <Text>The source code can be obtained and adapted for anybody wishing to host their own Doki server. The
                code is free and open source.</Text>
        </Stack>
    </Layout>;
}

export default Page;
