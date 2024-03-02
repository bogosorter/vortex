import { TouchableOpacity, StyleSheet } from 'react-native';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import EpisodePreview from './EpisodePreview';
import useStore from '../utils/store';
import colors from '../utils/colors';
import { Episode } from '../utils/types';

export default function Queue() {
    const queue = useStore(state => state.player.queue);
    const setQueue = useStore(state => state.player.setQueue);

    function renderItem({ item, isActive, drag }: RenderItemParams<Episode>) {
        return (
            <ScaleDecorator>
                <EpisodePreview
                    episode={item}
                    drag={drag}
                />
            </ScaleDecorator>
        );
    }

    return (
        <DraggableFlatList
            data={queue}
            keyExtractor={item => item.guid}
            renderItem={renderItem}
            style={{ flex: 1 }}
            activationDistance={20}
            onDragEnd={({ data }) => setQueue(data)}
            containerStyle={styles.queue}
        />
    )
}

const styles = StyleSheet.create({
    queue: {
        flex: 1,
        backgroundColor: colors.surface
    }
})