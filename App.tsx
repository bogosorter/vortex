import { StyleSheet, View, StatusBar, Appearance } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { setBackgroundColorAsync, setPositionAsync, setButtonStyleAsync } from 'expo-navigation-bar';
import Home from './components/Home';
import Search from './components/Search';
import ShowDetails from './components/ShowDetails';
import EpisodeDetails from './components/EpisodeDetails';
import { Show, Episode } from './utils/types';
import colors from './utils/colors';

export type RootStackParamList = {
  Home: undefined;
  Search: {query: string };
  ShowDetails: {show: Show};
  EpisodeDetails: {episode: Episode};
};
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    const barStyle = Appearance.getColorScheme() === 'dark'? 'light-content' : 'dark-content';
    return (
        <NavigationContainer>
            <StatusBar barStyle={barStyle} backgroundColor='transparent' translucent />
            <View style={styles.app}>
                <Stack.Navigator initialRouteName='Home'>
                    <Stack.Screen
                        name='Home'
                        component={Home}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='Search'
                        component={Search}
                        options={({route}) => ({
                            title: route.params.query,
                            headerStyle: {backgroundColor: colors.surface},
                            headerTintColor: colors.onSurface,
                        })}
                    />
                    <Stack.Screen
                        name='ShowDetails'
                        component={ShowDetails}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name='EpisodeDetails'
                        component={EpisodeDetails}
                        options={{ headerShown: false }}
                    />
                </Stack.Navigator>
            </View>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    app: {
        backgroundColor: colors.surface,
        flex: 1
    }
});

// A little trick ;)
// For some reason, when the navigation bar's color is set to transparent, a
// translucent background color is set by default (notice the difference between
// transparent and translucent). We've got to trick it into thinking that the
// background is not transparent. Values smaller than 0.002 are not accepted.
setBackgroundColorAsync('rgba(0, 0, 0, 0.002)');
setPositionAsync('absolute');
setButtonStyleAsync(Appearance.getColorScheme() === 'dark' ? 'light' : 'dark');