import { StyleSheet, View, Text, TouchableOpacity, ImageBackground, useWindowDimensions } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useNavigation } from '@react-navigation/native';
import Color from 'color';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import RenderHTML from 'react-native-render-html';
import useStore from '../utils/store';
import { navigationBarHeight } from '../utils/dimensions';
import { Episode } from '../utils/types';
import colors from '../utils/colors';

type Props = {
    episode: Episode;
    showArtwork?: boolean;
};

export default function EpisodePreview({ episode, showArtwork = true }: Props) {
    const play = useStore(state => state.player.play);
    const playLater = useStore(state => state.player.playLater);
    const download = useStore(state => state.downloads.add);
    const width = useWindowDimensions().width;
    const { showActionSheetWithOptions } = useActionSheet();

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
                options: ['Play', 'Play Later', 'Download'],
                cancelButtonIndex: 2,
                containerStyle: styles.menuContainer,
                textStyle: styles.menuItem
            },
            buttonIndex => {
                if (buttonIndex === 0) play(episode);
                else if (buttonIndex === 1) playLater(episode);
                else if (buttonIndex === 2) download(episode);
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
                    <TouchableOpacity onPress={openDetails} style={styles.text} onLongPress={showMenu}>
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
    }
});