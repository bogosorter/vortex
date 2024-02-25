import { useState, useMemo } from 'react';
import { StyleSheet, TextInput, View, FlatList, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useStore from '../utils/store';
import { useShallow } from 'zustand/react/shallow';
import EpisodePreview from './EpisodePreview';
import Artwork from './Artwork';
import { statusBarHeight } from '../utils/dimensions';
import colors from '../utils/colors';

import { RootStackParamList } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function Home({ navigation }: Props) {
    const [query, setQuery] = useState('');
    const shows = useStore(store => store.library.shows);
    const feed = useStore(useShallow(store => store.library.getFeed()))
    const refresh = useStore(store => store.library.refresh);

    useMemo(() => refresh(), []);

    return (
        <View style={styles.home}>
            <FlatList
                ListHeaderComponent={<>
                    <View style={styles.header}>
                        <TextInput
                            style={styles.searchBox}
                            onChangeText={setQuery}
                            placeholder='Search'
                            onSubmitEditing={() => navigation.navigate('Search', { query })}
                        />
                        <TouchableOpacity onPress={() => navigation.navigate('SavedEpisodes')}>
                            <View style={styles.navigationButton}>
                                <MaterialIcons name='library-add-check' size={28} color={colors.onSurfaceVariant} />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('DownloadedEpisodes')}>
                            <View style={styles.navigationButton}>
                                <MaterialIcons name='download' size={28} color={colors.onSurfaceVariant} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {shows.map((show, index) => (
                            <TouchableOpacity key={index} onPress={() => {
                                navigation.navigate('ShowDetails', { show })
                            }}>
                                <Artwork
                                    url={show.artwork}
                                    size={160}
                                    margin={10}
                                />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </>}
                data={feed}
                renderItem={({ item }) => <EpisodePreview episode={item} />}
                keyExtractor={item => item.guid}
                refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    home: {
        flex: 1,
        backgroundColor: colors.surface,
        paddingTop: statusBarHeight
    },
    header: {
        flexDirection: 'row',
        margin: 10,
        marginTop: 20,
        backgroundColor: colors.surfaceVariant,
        borderRadius: 10,
        height: 60,
        paddingRight: 10
    },
    searchBox: {
        height: 60,
        color: colors.onSurfaceVariant,
        fontSize: 30,
        padding: 0,
        flex: 1,
        paddingLeft: 20
    },
    navigationButton: {
        height: 60,
        width: 45,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
});
