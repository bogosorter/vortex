import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import TrackPlayer, { State } from 'react-native-track-player';
import { CircleSnail } from 'react-native-progress';
import useStore from '../utils/store';

export default function PlayerButton({color, backgroundColor}: {color: string, backgroundColor: string}) {
    const playerState = useStore(state => state.player.state);
    const onEnd = useStore(state => state.player.onEnd);
    const styles = getStyles(backgroundColor);
    
    if (playerState === State.Playing || playerState == State.Buffering) return (
        <TouchableOpacity onPress={(e) => {
            e.stopPropagation();
            TrackPlayer.pause();
        }}>
            <View style={styles.button}>
                <MaterialIcons name={'pause'} size={30} color={color} />
            </View>
        </TouchableOpacity>
    );
    if (playerState === State.Paused || playerState === State.Ready) return (
        <TouchableOpacity onPress={(e) => {
            e.stopPropagation();
            TrackPlayer.play();
        }}>
            <View style={styles.button}>
                <MaterialIcons name={'play-arrow'} size={30} color={color} />
            </View>
        </TouchableOpacity>
    );
    if (playerState === State.Error) return (
        <TouchableOpacity onPress={(e) => {
            e.stopPropagation();
            onEnd();
        }}>
            <View style={styles.button}>
                <MaterialIcons name={'error-outline'} size={30} color={color} />
            </View>
        </TouchableOpacity>
    );

    // State == loading (or other states that should never happen at this point...)
    return (
        <View style={styles.button}>
            <CircleSnail color={color} size={35} />
        </View>
    );
}

function getStyles(backgroundColor: string) {
    return StyleSheet.create({
        button: {
            height: 48,
            width: 48,
            borderRadius: 24,
            backgroundColor: backgroundColor,
            justifyContent: 'center',
            alignItems: 'center',
        }
    })
}