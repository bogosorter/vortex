import { TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { CircleSnail } from 'react-native-progress';
import useStore from '../utils/store';
import { Episode, DownloadStatus } from '../utils/types';
import { darkColors } from '../utils/colors';

export default function DownloadButton({episode}: {episode: Episode}) {
    const downloadInfo = useStore(state => state.downloads.getInfo(episode));
    const download = useStore(state => state.downloads.add);
    const remove = useStore(state => state.downloads.remove);

    if (downloadInfo.status === DownloadStatus.DOWNLOADED) return (
        <TouchableOpacity onPress={() => remove(episode)}>
            <MaterialIcons name='download-done' size={30} color={darkColors.onSurface} />
        </TouchableOpacity>
    );

    if (downloadInfo.status === DownloadStatus.DOWNLOADING) return (
        <CircleSnail size={30} color={darkColors.onSurface} />
    );

    if (downloadInfo.status === DownloadStatus.ERROR) return (
        <TouchableOpacity onPress={() => remove(episode)}>
            <MaterialIcons name='error' size={30} color={darkColors.onSurface} />
        </TouchableOpacity>
    );

    return (
        <TouchableOpacity onPress={() => download(episode)}>
            <MaterialIcons name='download' size={30} color={darkColors.onSurface} />
        </TouchableOpacity>
    );
}