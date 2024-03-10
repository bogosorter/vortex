import { StyleSheet, View, Text } from 'react-native';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import EpisodePreview from './EpisodePreview';
import useStore from '../utils/store';
import colors from '../utils/colors';
import { Episode } from '../utils/types';

export default function Queue() {
    const queue = useStore(state => state.player.queue);
    const setQueue = useStore(state => state.player.setQueue);

    function renderItem({ item, drag }: RenderItemParams<Episode>) {
        return (
            <ScaleDecorator>
                <EpisodePreview
                    episode={item}
                    drag={drag}
                />
            </ScaleDecorator>
        );
    }

    if (queue.length === 0) return (
        <View style={styles.center}>
            <MaterialIcons name='queue-music' size={80} color={colors.onSurface} />
            <Text style={styles.empty}>Queue is empty</Text>
        </View>
    )

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
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surface
    },
    empty: {
        fontSize: 30,
        marginTop: 20,
        color: colors.onSurface
    }
})