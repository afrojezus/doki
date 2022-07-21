import {Aside, Button, Card, Group, Image, SimpleGrid, Text, Title} from "@mantine/core";
import Layout from "@src/components/layout";
import SEO from "@src/components/seo";
import {Plus} from "tabler-icons-react";
import {useState} from "react";

function Page() {

    const [streams] = useState([1, 2, 3]);

    return <Layout hiddenAside={true} asideContent={<>
        <Aside.Section>
            <Text>Under construction!</Text>
        </Aside.Section>
    </>}>
        <SEO title="Streamshare" siteTitle="Doki"
             description="Content for days"/>
        <Text size="xs">Join or host a stream with friends on Doki</Text>
        <Group my="xl" spacing={8}><Button leftIcon={<Plus/>} size="xl">Host</Button><Button variant="outline"
                                                                                             size="xl">Join</Button></Group>
        <Title order={3}>Current streams</Title>
        <SimpleGrid cols={3}>
            {streams.map((e) =>
                <Card key={e}>
                    <Card.Section>
                        <Image height={300} withPlaceholder/>
                    </Card.Section>
                    <Title mt="md" order={5}>Stream</Title>
                </Card>
            )}
        </SimpleGrid>
        <Title my="md" order={3}>How does it work?</Title>
        <Text>Sharestreams are hosted sessions in which the hoster shares their session on the site together with 1 or
            more people.
            <br/>
            These streams function just like the viewer, but includes a real-time feed of the participants and a
            real-time chat.
            <br/>
            Currently under construction! Come back at a later time!
        </Text>
    </Layout>
}

export default Page;