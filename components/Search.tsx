import { StyleSheet, Text, View } from 'react-native';
import { statusBarHeight, navigationBarHeight } from '../utils/dimensions';
import colors from '../utils/colors';

export default function Search() {
    return (
        <View style={styles.search}>
            <Text>Search</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    search: {
        flex: 1,
        backgroundColor: colors.surface,
        paddingTop: statusBarHeight,
        paddingBottom: navigationBarHeight
    }
});
