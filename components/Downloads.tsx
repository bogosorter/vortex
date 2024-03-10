import { View, Text, FlatList, StyleSheet } from 'react-native';
import EpisodePreview from './EpisodePreview';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useStore from '../utils/store';
import colors from '../utils/colors';

export default function Downloads() {
    const downloads = useStore(state => state.downloads.downloads);

    if (downloads.length === 0) return (
        <View style={styles.center}>
            <MaterialIcons name='download' size={80} color={colors.onSurface} />
            <Text style={styles.noDownloads}>No downloads</Text>
        </View>
    )

    return (
        <FlatList
            data={downloads}
            keyExtractor={item => item.guid}
            renderItem={({ item }) => <EpisodePreview episode={item} />}
            style={styles.downloadedEpisodes}
        />
    );
}

const styles = StyleSheet.create({
    downloadedEpisodes: {
        flex: 1,
        backgroundColor: colors.surface
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surface
    },
    noDownloads: {
        fontSize: 30,
        marginTop: 20,
        color: colors.onSurface
    }
});