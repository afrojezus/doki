import { Button, ScrollView, Text } from "react-native";

function HomeScreen({navigation}) {
    return (
        <ScrollView contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text>Sneed!</Text>
            <Button title="Show all content" onPress={() => navigation.navigate("Browser")} />
            </ScrollView>
        )
}

export default HomeScreen;