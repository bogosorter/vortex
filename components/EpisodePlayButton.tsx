import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Color from 'color';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TrackPlayer, { State } from 'react-native-track-player';
import useStore from '../utils/store';
import { Episode } from '../utils/types';
import colors from '../utils/colors';

export default function EpisodePlayButton({episode}: {episode: Episode}) {
    const play = useStore((state) => state.player.play);
    const playing = useStore(
        (state) => state.player.state === State.Playing && state.player.currentEpisode!.guid === episode.guid
    );
    
    const color = new Color(episode.color).darken(0.5).hex();
    const styles = getStyles(episode.color);

    return (
        <TouchableOpacity onPress={() => {
            if (playing) TrackPlayer.pause();
            else play(episode);
        }}>
            <View style={styles.playButton}>
                <MaterialIcons
                    name={playing ? 'pause' : 'play-arrow'}
                    size={30}
                    color={color}
                />
            </View>
        </TouchableOpacity>
    )
}

function getStyles(color: string) {
    return StyleSheet.create({
        playButton: {
            height: 48,
            width: 48,
            backgroundColor: colors.onSurface,
            borderRadius: 24,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }
    });
}

