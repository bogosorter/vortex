import { StyleSheet, View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useState, useMemo } from 'react';
import { CircleSnail } from 'react-native-progress';
import Artwork from './Artwork';
import Feather from 'react-native-vector-icons/Feather';
import { searchShow } from '../utils/api';
import { getShow } from '../utils/rss';
import { ShowPreview } from '../utils/types';
import colors from '../utils/colors';

import { RootStackParamList } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export default function Search({ route, navigation }: Props) {
    const [result, setResult] = useState<ShowPreview[] | -1>([]);
    const [searching, setSearching] = useState(true);
    useMemo(async () => {
        const shows = await searchShow(route.params.query);
        setResult(shows);
        setSearching(false);
    }, []);

    const content = searching ? (
        <View style={styles.center}>
            <CircleSnail size={100} thickness={8} indeterminate={true} color={colors.onSurface} />
        </View>
    ) : result === -1? (
        <View style={styles.center}>
            <Feather name='wifi-off' size={80} color={colors.onSurface} />
        </View>
    ) : result.length === 0? (
        <View style={styles.center}>
            <Feather name='search' size={80} color={colors.onSurface} />
            <Text style={styles.noResult}>No results</Text>
        </View>
    ) : (
        <ScrollView contentContainerStyle={styles.scrollView}>
            {result.map((showPreview, index) => (
                <TouchableOpacity key={index} onPress={async () => {
                    const show = await getShow(showPreview);
                    if (show === -1) {
                        setResult(-1);
                        return;
                    }
                    navigation.navigate('ShowDetails', {show})
                }}>
                    <Artwork
                        url={showPreview.artwork}
                        size={150}
                        margin={10}
                    />
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    return (
        <View style={styles.search}>
            {content}
        </View>
    );
}

const styles = StyleSheet.create({
    search: {
        flex: 1,
        backgroundColor: colors.surface
    },
    scrollView: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly'
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    noResult: {
        fontSize: 30,
        marginTop: 20,
        color: colors.onSurface
    }
});
