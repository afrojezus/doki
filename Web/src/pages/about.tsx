import {Aside, Group, MediaQuery, ScrollArea, Stack, Text, Title} from '@mantine/core';
import Layout, {Menubar, Tabbar} from '../components/layout';
import {LinkButton} from "@src/components/buttons";

/*export async function getStaticProps({locale}) {
    return {
        props: {
//            messages: (await import(`../../../${locale}nodemon.json`)).default
        }
    }
}*/

function Page() {
    return <Layout aside={
        <MediaQuery smallerThan="sm" styles={{display: 'none'}}>
            <Aside p="md" hiddenBreakpoint="sm" width={{lg: 300}}>
                <Menubar/>
                <Aside.Section grow component={ScrollArea} mx="-xs" px="xs">
                    <Stack>
                        <LinkButton href="https://github.com/tokumei-gr/doki" variant="default">Git
                            repository</LinkButton>
                        <LinkButton href="https://twitter.com/dokiwebsite" variant="default">Twitter</LinkButton>
                    </Stack>
                </Aside.Section>
                <Tabbar/>
            </Aside></MediaQuery>}>
        <Group mb="md">
            <Title order={5}>
                About doki
            </Title>
        </Group>

        <div style={{
            position: "relative",
            height: 300,
            width: "100%",
            display: "flex",
            background: "linear-gradient(to bottom right, #200302 0%, #d030ff 100%)",
            borderRadius: 16
        }}>
            <Title align="center" m="auto" sx={{zIndex: 1000, textShadow: "0 2px 6px rgba(0,0,0,.2)", color: "white"}}>Content
                for days</Title>
            <img src="/assets/uoh.gif"
                 style={{objectFit: "contain", width: "100%", height: "100%", position: "absolute", opacity: 0.15}}/>
        </div>

        <Stack my="md">
            <Text>Doki is a content provider for all sorts of files including support for many varieties of media
                content that can be binged through.</Text>
            <Text>The source code can be obtained and adapted for anybody wishing to host their own Doki server. The
                code is free and open source.</Text>
        </Stack>
    </Layout>;
}

export default Page;
