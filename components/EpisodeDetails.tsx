import { StyleSheet, Text, View, ScrollView, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Color from 'color';
import DownloadButton from './DownloadButton';
import HTML from './HTML';
import EpisodePlayButton from './EpisodePlayButton';
import SaveEpisodeButton from './SaveEpisodeButton';
import colors, { darkColors } from '../utils/colors';

import { RootStackParamList } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
type Props = NativeStackScreenProps<RootStackParamList, 'EpisodeDetails'>;

export default function EpisodeDetails({ route }: Props) {
    const episode = route.params.episode;
    const backgroundColor = new Color(episode.color).darken(0.5).hex();
    const styles = getStyles(backgroundColor);

    return (
        <View style={styles.episodeDetails}>
            <ScrollView stickyHeaderIndices={[1]}>
                <ImageBackground src={episode.artwork} style={styles.artwork}>
                    <View style={styles.artworkDarkener}>
                        <LinearGradient
                            colors={['transparent', 'transparent', backgroundColor]}
                            style={{ flex: 1 }}
                        />
                    </View>
                </ImageBackground>
                <View style={styles.headerWrapper}>
                    <View style={styles.header}>
                        <View style={styles.headerText}>
                            <Text style={styles.title}>{episode.title}</Text>
                            <Text style={styles.show}>{episode.showTitle}</Text>
                        </View>
                        <EpisodePlayButton episode={episode} />
                    </View>
                    <View style={styles.buttons}>
                        <DownloadButton episode={episode} />
                        <SaveEpisodeButton episode={episode} />
                    </View>
                </View>
                <View style={styles.descriptionContainer}>
                    <HTML html={episode.description} />
                </View>
            </ScrollView>
        </View>
    );
}

function getStyles(backgroundColor: string) {
    return StyleSheet.create({
        episodeDetails: {
            flex: 1,
            backgroundColor: colors.surface
        },
        artwork: {
            width: '100%',
            aspectRatio: 1,
            justifyContent: 'flex-end'
        },
        artworkDarkener: {
            width: '100%',
            aspectRatio: 1,
            position: 'absolute',
            backgroundColor: 'rgba(0, 0, 0, 0.4)'
        },
        headerWrapper: {
            minHeight: 150,
            justifyContent: 'flex-end',
            padding: 20,
            backgroundColor: backgroundColor,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
        },
        header: {
            paddingTop: 60,
            paddingBottom: 15,
            display: 'flex',
            flexDirection: 'row'
        },
        headerText: {
            flex: 1,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: darkColors.onSurface
        },
        show: {
            fontSize: 16,
            color: new Color(darkColors.onSurface).alpha(0.8).string()
        },
        descriptionContainer: {
            margin: 20
        },
        buttons: {
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 20
        }
    });
}
