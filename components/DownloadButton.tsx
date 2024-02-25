import { View, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Circle } from 'react-native-progress';
import useStore from '../utils/store';
import { Episode, DownloadStatus } from '../utils/types';
import { darkColors } from '../utils/colors';

export default function DownloadButton({episode, color}: {episode: Episode, color: string}) {
    const downloadInfo = useStore(state => state.downloads.getInfo(episode));
    const download = useStore(state => state.downloads.add);
    const remove = useStore(state => state.downloads.remove);
    const clearError = useStore(state => state.downloads.clearError);

    if (downloadInfo.status === DownloadStatus.DOWNLOADED) return (
        <TouchableOpacity onPress={() => remove(episode)}>
            <View style={styles.button}>
                <MaterialIcons name='download-done' size={30} color={color} />
            </View>
        </TouchableOpacity>
    );

    if (downloadInfo.status === DownloadStatus.DOWNLOADING) return (
        <View style={styles.button}>
            <Circle progress={downloadInfo.progress} size={30} color={color} />
        </View>
    );

    if (downloadInfo.status === DownloadStatus.ERROR) return (
        <View style={styles.button}>
            <TouchableOpacity onPress={() => clearError(episode)}>
                <MaterialIcons name='error' size={30} color={color} />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.button}>
            <TouchableOpacity onPress={() => download(episode)}>
                <MaterialIcons name='download' size={30} color={color} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 48,
        width: 48,
        borderRadius: 24,
        backgroundColor: darkColors.onSurface,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
