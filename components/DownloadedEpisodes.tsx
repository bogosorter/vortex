import { FlatList, StyleSheet } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import EpisodePreview from './EpisodePreview';
import useStore from '../utils/store';
import colors from '../utils/colors';

export default function DownloadedEpisodes() {
    const downloads = useStore(
        useShallow(state => state.downloads.getDownloadedEpisodes())
    );

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
});