import { FlatList, StyleSheet } from 'react-native';
import EpisodePreview from './EpisodePreview';
import useStore from '../utils/store';
import colors from '../utils/colors';

export default function SavedEpisodes() {
    const episodes = useStore(state => state.library.savedEpisodes);

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
});