import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Color from 'color';
import PlayerButton from './PlayerButton';
import Artwork from './Artwork';
import useStore from '../utils/store';
import { navigationBarHeight } from '../utils/dimensions';
import colors from '../utils/colors';

export default function FoldedPlayer({onPress}: {onPress: () => void}) {
    const episode = useStore(state => state.player.currentEpisode)!;
    const progress = useStore(state => state.library.getPlaybackState(episode).position);
    const timeLeft = Math.round((episode.duration - progress) / 60);

    return (
        <TouchableOpacity style={styles.foldedPlayer} onPress={onPress}>
            <Artwork url={episode.artwork} size={60} margin={10} />
            <View style={styles.textWrapper}>
                <Text numberOfLines={1} style={styles.title}>{episode.title}</Text>
                <Text numberOfLines={1} style={styles.showTitle}>{episode.showTitle} • {timeLeft}m left</Text>
            </View>
            <View style={styles.buttonContainer}>
                <PlayerButton color={colors.surfaceVariant} backgroundColor={colors.onSurfaceVariant} />
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    foldedPlayer: {
        backgroundColor: colors.surfaceVariant,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: 80 + navigationBarHeight,
        flexDirection: 'row',
        paddingBottom: navigationBarHeight
    },
    textWrapper: {
        flex: 1,
        justifyContent: 'center'
    },
    title: {
        color: colors.onSurfaceVariant,
        fontSize: 16
    },
    showTitle: {
        color: new Color(colors.onSurfaceVariant).alpha(0.7).toString(),
        fontSize: 12
    },
    buttonContainer: {
        height: 80,
        width: 80,
        justifyContent: 'center',
        alignItems: 'center'
    }
});