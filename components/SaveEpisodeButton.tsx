import { TouchableOpacity, View, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Color from 'color';
import useStore from '../utils/store';
import { Episode } from '../utils/types';
import { darkColors } from '../utils/colors';

export default function SaveEpisodeButton({episode}: {episode: Episode}) {
    const saved = useStore(state => state.library.saved[episode.guid]);
    const save = useStore(state => state.library.saveEpisode);
    const unsave = useStore(state => state.library.removeSavedEpisode);

    return (
        <TouchableOpacity onPress={() => {
            if (saved) unsave(episode);
            else save(episode);
        }}>
            <View style={styles.saveButton}>
                <MaterialIcons
                    name={saved? 'library-add-check' : 'library-add'}
                    size={30}
                    color={darkColors.onSurface}
                />
            </View>
        </TouchableOpacity>
    )
}


const styles = StyleSheet.create({
    saveButton: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
