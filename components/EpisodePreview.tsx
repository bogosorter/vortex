import { StyleSheet, View, Text, TouchableOpacity, ImageBackground, useWindowDimensions } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useNavigation } from '@react-navigation/native';
import Color from 'color';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';
import RenderHTML from 'react-native-render-html';
import useStore from '../utils/store';
import { navigationBarHeight } from '../utils/dimensions';
import { Episode } from '../utils/types';
import colors from '../utils/colors';

type Props = {
    episode: Episode;
    showArtwork?: boolean;
    drag?: () => void;
};

export default function EpisodePreview({ episode, showArtwork = true, drag }: Props) {
    const play = useStore(state => state.player.play);
    const playNext = useStore(state => state.player.playNext);
    const playLater = useStore(state => state.player.playLater);
    const download = useStore(state => state.downloads.add);
    const save = useStore(state => state.library.saveEpisode);
    const removeSaved = useStore(state => state.library.removeSavedEpisode);
    const saved = useStore(state => !!state.library.saved[episode.guid]);
    const removeFromQueue = useStore(state => state.player.removeFromQueue);
    const width = useWindowDimensions().width;
    const { showActionSheetWithOptions } = useActionSheet();
    const played = useStore(state => state.library.getPlaybackState(episode).played);
    const markPlayed = useStore(state => state.library.markPlayed);
    const unmarkPlayed = useStore(state => state.library.unmarkPlayed);

    const duration = Math.round(episode.duration / 60);
    const date = new Date(episode.date).toLocaleDateString();
    
    const navigation = useNavigation();
    function openDetails() {
        // @ts-ignore
        navigation.navigate('EpisodeDetails', { episode });
    }

    function showMenu() {
        showActionSheetWithOptions(
            {
                options: ['Play', 'Play Next', 'Play Later', 'Download', saved? 'Remove from saved' : 'Save', played? 'Mark as unplayed' : 'Mark as played'],
                cancelButtonIndex: -1,
                containerStyle: styles.menuContainer,
                textStyle: styles.menuItem
            },
            buttonIndex => {
                if (buttonIndex === 0) play(episode);
                if (buttonIndex === 1) playNext(episode);
                else if (buttonIndex === 2) playLater(episode);
                else if (buttonIndex === 3) download(episode);
                else if (buttonIndex === 4) {
                    if (saved) removeSaved(episode);
                    else save(episode);
                }
                else if (buttonIndex === 5) {
                    if (played) unmarkPlayed(episode);
                    else markPlayed(episode);
                }
            }
        );
    }

    function showRemoveMenu() {
        showActionSheetWithOptions(
            {
                options: ['Remove from queue'],
                cancelButtonIndex: -1,
                containerStyle: styles.menuContainer,
                textStyle: styles.menuItem
            },
            buttonIndex => {
                if (buttonIndex === 0) removeFromQueue(episode);
            }
        );
    }

    return (
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
                                    <FontAwesome5
                                        name={'play-circle'}
                                        size={56}
                                        color={'rgba(255, 255, 255, 0.7)'}
                                    />
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>
                    </View>
                )}
                <TouchableOpacity
                    onPress={openDetails}
                    style={styles.text}
                    onLongPress={showMenu}
                >
                    <Text style={styles.title} numberOfLines={1}>
                        {episode.title}
                    </Text>
                    <View style={styles.htmlContainer}>
                        <RenderHTML
                            source={{ html: episode.shortDescription }}
                            contentWidth={width - 100}
                            defaultTextProps={{
                                numberOfLines: 2
                            }}
                            tagsStyles={{
                                p: {
                                    marginTop: 0,
                                    textAlign: 'justify'
                                }
                            }}
                        />
                    </View>
                    <Text style={styles.info}>
                        {duration}m • {date}
                    </Text>
                </TouchableOpacity>
                {drag && (
                    <TouchableOpacity style={styles.more} onPress={showRemoveMenu} onLongPress={drag} delayLongPress={100}>
                        <Feather
                            name={'menu'}
                            size={24}
                            color={colors.onSurface}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
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
    htmlContainer: {
        height: 36,
        overflow: 'hidden'
    },
    info: {
        fontSize: 14,
        color: new Color(colors.onSurface).alpha(0.6).string()
    },
    buttonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)'
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
    },
    more: {
        width: 36,
        justifyContent: 'center',
        alignItems: 'center'
    }
});