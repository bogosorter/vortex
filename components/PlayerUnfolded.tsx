import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useEffect, useState, useRef } from 'react';
import TrackPlayer, { useProgress } from 'react-native-track-player';
import { Slider } from '@miblanchard/react-native-slider';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Color from 'color';
import useStore from '../utils/store';
import PlayerButton from './PlayerButton';
import PlaybackRate from './PlaybackRate';
import { darkColors } from '../utils/colors';

export default function PlayerUnfolded() {
    const episode = useStore(state => state.player.currentEpisode)!;
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);
    const seeking = useRef(false);
    const backgroundColor = new Color(episode.color).darken(0.5).string();
    const buttonColor = new Color(darkColors.onSurface).alpha(0.8).string();
    const playbackRate = useStore(state => state.player.playbackRate);

    useEffect(() => {
        const id = setInterval(async () => {
            if (seeking.current) return;
            const progress = await TrackPlayer.getProgress();
            setPosition(progress.position); 
            setDuration(progress.duration);
            setProgress(progress.position / progress.duration);
        }, 100);
        return () => clearInterval(id);
    }, []);

    return (
        <View style={styles.playerUnfolded}>
            <Text style={styles.title}>{episode.title}</Text>
            <Text style={styles.show}>{episode.showTitle}</Text>
            <Slider
                value={progress}
                containerStyle={styles.slider}
                minimumTrackTintColor={darkColors.onSurface}
                maximumTrackTintColor={new Color(darkColors.onSurface).alpha(0.5).toString()}
                thumbTintColor={darkColors.onSurface}
                onSlidingStart={() => seeking.current = true}
                onValueChange={(values) => {
                    setPosition(values[0] * duration);
                    setProgress(values[0]);
                }}
                onSlidingComplete={(values) => {
                    TrackPlayer.seekTo(values[0] * duration);
                    seeking.current = false;
                }}
            />
            <View style={styles.timeContainer}>
                <Text style={styles.time}>{formatTime(position)}</Text>
                <Text style={styles.time}>{formatTime(duration)}</Text>
            </View>
            <View style={styles.controlButtons}>
                <TouchableOpacity style={styles.buttonWrapper} onPress={() => TrackPlayer.seekBy(-10)}>
                    <MaterialIcons name={'replay-10'} size={40} color={buttonColor} />
                </TouchableOpacity>
                <PlayerButton color={backgroundColor} backgroundColor={darkColors.onSurface} />
                <TouchableOpacity style={styles.buttonWrapper} onPress={() => TrackPlayer.seekBy(30)}>
                    <MaterialIcons name={'forward-30'} size={40} color={buttonColor} />
                </TouchableOpacity>
            </View>
            <PlaybackRate />
        </View>
    )
}

function formatTime(time: number) {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor(time / 60) % 60;
    const seconds = Math.floor(time) % 60;
    return `${hours > 0 ? hours + ':' : ''}${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

const styles = StyleSheet.create({
    playerUnfolded: {
        display: 'flex',
        alignItems: 'center',
        padding: '10%',
        paddingTop: Dimensions.get('window').width
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: darkColors.onSurface,
        textAlign: 'center',
    },
    show: {
        fontSize: 18,
        color: new Color(darkColors.onSurface).alpha(0.7).toString(),
        textAlign: 'center'
    },
    slider: {
        width: '100%',
        height: 40,
        marginTop: 20
    },
    timeContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    time: {
        color: new Color(darkColors.onSurface).alpha(0.7).toString()
    },
    controlButtons: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 20
    },
    buttonWrapper: {
        height: 48,
        width: 48,
        alignItems: 'center',
        justifyContent: 'center'
    }
});