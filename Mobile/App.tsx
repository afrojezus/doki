import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './Views/Home';
import BrowserScreen from './Views/Browser';
import SettingsScreen from './Views/Settings';

const Tab = createBottomTabNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Tab.Navigator initialRouteName="Home">
                <Tab.Screen name="Home" component={HomeScreen} options={{title: "Viewer"}} />
                <Tab.Screen name="Browser" component={BrowserScreen} options={{ title: "All content" }} />
                <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
                </Tab.Navigator>
            </NavigationContainer>
  );
}
