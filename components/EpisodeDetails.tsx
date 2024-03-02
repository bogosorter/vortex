import { StyleSheet, Text, View, ScrollView, ImageBackground, useWindowDimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useActionSheet } from '@expo/react-native-action-sheet';
import Feather from 'react-native-vector-icons/Feather';
import Color from 'color';
import DownloadButton from './DownloadButton';
import RenderHTML from 'react-native-render-html';
import EpisodePlayButton from './EpisodePlayButton';
import useStore from '../utils/store';
import colors, { darkColors } from '../utils/colors';
import { navigationBarHeight } from '../utils/dimensions';

import { RootStackParamList } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
type Props = NativeStackScreenProps<RootStackParamList, 'EpisodeDetails'>;

export default function EpisodeDetails({ route }: Props) {
    const play = useStore(state => state.player.play);
    const playNext = useStore(state => state.player.playNext);
    const playLater = useStore(state => state.player.playLater);
    const download = useStore(state => state.downloads.add);
    const save = useStore(state => state.library.saveEpisode);
    const width = useWindowDimensions().width;
    const { showActionSheetWithOptions } = useActionSheet();

    const episode = route.params.episode;
    const backgroundColor = new Color(episode.color).darken(0.5).hex();
    const styles = getStyles(backgroundColor);

    function showMenu() {
        showActionSheetWithOptions(
            {
                options: ['Play', 'Play Next', 'Play Later', 'Download', 'Save'],
                cancelButtonIndex: 2,
                containerStyle: styles.menuContainer,
                textStyle: styles.menuItem
            },
            buttonIndex => {
                if (buttonIndex === 0) play(episode);
                else if (buttonIndex === 1) playNext(episode);
                else if (buttonIndex === 2) playLater(episode);
                else if (buttonIndex === 3) download(episode);
                else if (buttonIndex === 4) save(episode);
            }
        );
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
        },
        menuContainer: {
            backgroundColor: colors.surface,
            padding: 10,
            paddingBottom: navigationBarHeight,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30
        },
        menuItem: {
            color: colors.onSurface
        }
    });
}
