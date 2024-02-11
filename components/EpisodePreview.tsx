import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Color from 'color';
import Artwork from './Artwork';
import { Episode } from '../utils/types';
import colors from '../utils/colors';

type Props = {
    episode: Episode;
    showArtwork?: boolean;
};

export default function EpisodePreview({ episode, showArtwork = true }: Props) {
    const duration = Math.round(episode.duration / 60);
    const date = new Date(episode.date).toLocaleDateString();
    
    const navigation = useNavigation();
    function openDetails() {
        // @ts-ignore
        return navigation.navigate('EpisodeDetails', { episode });
    }

    return (
        <TouchableOpacity onPress={openDetails}>
            <View style={styles.preview}>
                {showArtwork && (
                    <View style={styles.artworkContainer}>
                        <Artwork url={episode.artwork} size={80} margin={0} />
                    </View>
                )}
                <View style={styles.text}>
                    <Text style={styles.title} numberOfLines={1}>
                        {episode.title}
                    </Text>
                    <Text style={styles.description} numberOfLines={2}>
                        {episode.shortDescription}
                    </Text>
                    <Text style={styles.info}>
                        {duration}m • {date}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    preview: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: colors.surface,
        borderBottomWidth: 2,
        borderBottomColor: colors.surfaceVariant
    },
    artworkContainer: {
        marginRight: 10
    },
    text: {
        flex: 1
    },
    title: {
        fontSize: 16,
        color: colors.onSurface,
        fontWeight: 'bold'
    },
    description: {
        fontSize: 14,
        color: new Color(colors.onSurface).alpha(0.8).string(),
        textAlign: 'justify'
    },
    info: {
        fontSize: 14,
        color: new Color(colors.onSurface).alpha(0.6).string()
    }
});