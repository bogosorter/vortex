import { StyleSheet, TextInput, View, FlatList, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import useStore from '../utils/store';
import EpisodePreview from './EpisodePreview';
import Artwork from './Artwork';
import { statusBarHeight } from '../utils/dimensions';
import colors from '../utils/colors';

import { RootStackParamList } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function Home({navigation}: Props) {
    const [query, setQuery] = useState('');
    const shows = useStore(store => store.library.shows);
    const feed = useStore(store => store.library.getFeed())
    
    return (
        <View style={styles.home}>
            <FlatList
                ListHeaderComponent={<>
                    <TextInput
                        style={styles.searchBox}
                        onChangeText={setQuery}
                        placeholder='Search'
                        onSubmitEditing={() => navigation.navigate('Search', {query})}
                    />
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {shows.map((show, index) => (
                            <TouchableOpacity key={index} onPress={() => {
                                navigation.navigate('ShowDetails', {show})
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
                renderItem={({item}) => <EpisodePreview episode={item} />}
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
    searchBox: {
        backgroundColor: colors.surfaceVariant,
        margin: 10,
        borderRadius: 10,
        height: 60,
        textAlign: 'center',
        color: colors.onSurfaceVariant,
        fontSize: 28
    }
});
