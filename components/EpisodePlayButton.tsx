import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Color from 'color';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import TrackPlayer, { State } from 'react-native-track-player';
import useStore from '../utils/store';
import { Episode } from '../utils/types';

export default function EpisodePlayButton({ episode }: { episode: Episode }) {
    const play = useStore((state) => state.player.play);
    const playing = useStore(
        (state) => state.player.state === State.Playing && state.player.currentEpisode!.guid === episode.guid
    );

    const color = new Color(episode.color).darken(0.5).hex();

    return (
        <TouchableOpacity onPress={() => {
            if (playing) TrackPlayer.pause();
            else play(episode);
        }}>
            <View style={styles.playButton}>
                <FontAwesome6
                    name={playing ? 'pause-circle' : 'play-circle'}
                    size={148}
                    color={'rgba(255, 255, 255, 0.8)'}
                />
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    playButton: {
        justifyContent: 'center',
        alignItems: 'center',
    }
});
