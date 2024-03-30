import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import useStore from '../utils/store';
import { darkColors } from '../utils/colors';

export default function PlaybackRate() {
    const rate = useStore(state => state.player.playbackRate);

    function changeRate() {
        const rates = [0.5, 0.6, 0.75, 0.9, 1, 1.25, 1.5, 2, 2.5, 3];
        const index = rates.indexOf(rate);
        const nextIndex = (index + 1) % rates.length;
        useStore.getState().player.setPlaybackRate(rates[nextIndex]);
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={changeRate}>
                <Text style={styles.text}>{rate}x</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20
    },
    button: {
        padding: 5,
        borderRadius: 10,
        width: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
    },
    text: {
        color: darkColors.onSurface,
        textAlign: 'center',
        fontSize: 16
    }
});
