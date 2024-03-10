import { FlatList, StyleSheet, View, Text } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EpisodePreview from './EpisodePreview';
import useStore from '../utils/store';
import colors from '../utils/colors';

export default function SavedEpisodes() {
    const episodes = useStore(state => state.library.savedEpisodes);

    if (episodes.length === 0) {
        return (
            <View style={styles.center}>
                <MaterialIcons name='library-add-check' size={80} color={colors.onSurface} />
                <Text style={styles.empty}>No saved episodes</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={episodes}
            keyExtractor={item => item.guid}
            renderItem={({ item }) => <EpisodePreview episode={item} />}
            style={styles.savedEpisodes}
        />
    );
}

const styles = StyleSheet.create({
    savedEpisodes: {
        flex: 1,
        backgroundColor: colors.surface
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surface,
        height: 200
    },
    empty: {
        fontSize: 30,
        marginTop: 20,
        color: colors.onSurface
    }
});