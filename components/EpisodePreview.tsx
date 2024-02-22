import { StyleSheet, View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Color from 'color';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import HTML from './HTML';
import useStore from '../utils/store';
import { Episode } from '../utils/types';
import colors from '../utils/colors';

type Props = {
    episode: Episode;
    showArtwork?: boolean;
};

export default function EpisodePreview({ episode, showArtwork = true }: Props) {
    const play = useStore(state => state.player.play);

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
                <View style={styles.previewBody}>
                    {showArtwork && (
                        <View style={styles.artworkContainer}>
                            <ImageBackground style={styles.artwork} src={episode.artwork}>
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity onPress={(e) => {
                                        e.stopPropagation();
                                        play(episode);
                                    }}>
                                        <View style={styles.roundButton}>
                                            <MaterialIcons
                                                name={'play-arrow'}
                                                size={36}
                                                color={colors.onSurface}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </ImageBackground>
                        </View>
                    )}
                    <View style={styles.text}>
                        <Text style={styles.title} numberOfLines={1}>
                            {episode.title}
                        </Text>
                        <Text style={styles.description} numberOfLines={2}>
                            <HTML html={episode.description} />
                        </Text>
                        <Text style={styles.info}>
                            {duration}m • {date}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    preview: {
        padding: 10,
        backgroundColor: colors.surface,
        borderBottomWidth: 2,
        borderBottomColor: colors.surfaceVariant
    },
    previewBody: {
        flexDirection: 'row',
    },
    artworkContainer: {
        marginRight: 10,
        borderRadius: 4,
        overflow: 'hidden'
    },
    artwork: {
        height: 80,
        aspectRatio: 1
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
    },
    buttonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    roundButton: {
        height: 48,
        width: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center'
    }
});