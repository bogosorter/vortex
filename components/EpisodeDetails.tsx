import { StyleSheet, Text, View, ScrollView, ImageBackground, useWindowDimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useActionSheet } from '@expo/react-native-action-sheet';
import Feather from 'react-native-vector-icons/Feather';
import Color from 'color';
import DownloadButton from './DownloadButton';
import RenderHTML from 'react-native-render-html';
import EpisodePlayButton from './EpisodePlayButton';
import colors, { darkColors } from '../utils/colors';
import { episodeMenu } from '../utils/episodeMenu';

import { RootStackParamList } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
type Props = NativeStackScreenProps<RootStackParamList, 'EpisodeDetails'>;

export default function EpisodeDetails({ route }: Props) {
    const episode = route.params.episode;
    
    const width = useWindowDimensions().width;
    const { showActionSheetWithOptions } = useActionSheet();

    const backgroundColor = new Color(episode.color).darken(0.5).hex();
    const styles = getStyles(backgroundColor);
    const duration = Math.round(episode.duration / 60);
    const date = new Date(episode.date).toLocaleDateString();

    function showMenu() {
        episodeMenu(showActionSheetWithOptions, episode);
    }

    return (
        <View style={styles.episodeDetails}>
            <ScrollView stickyHeaderIndices={[1]}>
                <ImageBackground src={episode.artwork} style={styles.artwork}>
                    <View style={styles.artworkDarkener}>
                        <LinearGradient
                            colors={['transparent', 'transparent', backgroundColor]}
                            style={styles.linearGradient}
                        >
                            <EpisodePlayButton episode={episode} />
                        </LinearGradient>
                    </View>
                </ImageBackground>
                <View style={styles.headerWrapper}>
                    <View style={styles.header}>
                        <View style={styles.headerText}>
                            <Text style={styles.show}>{date} • {duration}m</Text>
                            <Text style={styles.title}>{episode.title}</Text>
                            <Text style={styles.show}>{episode.showTitle}</Text>
                        </View>
                        <DownloadButton episode={episode} color={backgroundColor} />
                    </View>
                    <TouchableOpacity onPress={showMenu}>
                        <Feather
                            name={'more-horizontal'}
                            color={colors.onSurface}
                            size={30}
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.descriptionContainer}>
                    <RenderHTML
                        source={{ html: episode.description }}
                        contentWidth={width}
                        baseStyle={{
                            color: colors.onSurface,
                            textAlign: 'justify'
                        }}
                        tagsStyles={{
                            a: {
                                color: colors.primary,
                                fontWeight: 'bold'
                            },
                            p: {
                                textAlign: 'justify'
                            }
                        }}
                    />
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
            justifyContent: 'center',
            padding: 20,
            backgroundColor: backgroundColor,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
        },
        header: {
            paddingTop: 60,
            paddingBottom: 15,
            flexDirection: 'row',
            alignItems: 'center'
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
        },
        linearGradient: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
        }
    });
}
