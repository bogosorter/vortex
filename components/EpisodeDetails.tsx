import { StyleSheet, Text, View } from 'react-native';
import { statusBarHeight, navigationBarHeight } from '../utils/dimensions';
import colors from '../utils/colors';

export default function EpisodeDetails() {
    return (
        <View style={styles.episodeDetails}>
            <Text>Episode Details</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    episodeDetails: {
        flex: 1,
        backgroundColor: colors.surface,
        paddingTop: statusBarHeight,
        paddingBottom: navigationBarHeight
    }
});
