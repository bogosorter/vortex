import { StyleSheet, Text, View } from 'react-native';
import { statusBarHeight, navigationBarHeight } from '../utils/dimensions';
import colors from '../utils/colors';

export default function ShowDetails() {
    return (
        <View style={styles.showDetails}>
            <Text>Show Details</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    showDetails: {
        flex: 1,
        backgroundColor: colors.surface,
        paddingTop: statusBarHeight,
        paddingBottom: navigationBarHeight
    }
});
