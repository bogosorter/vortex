import { StyleSheet, Text, View } from 'react-native';
import { statusBarHeight, navigationBarHeight } from '../utils/dimensions';
import colors from '../utils/colors';

export default function Home() {
    return (
        <View style={styles.home}>
            <Text>Home</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    home: {
        flex: 1,
        backgroundColor: colors.surface,
        paddingTop: statusBarHeight,
        paddingBottom: navigationBarHeight
    }
});
