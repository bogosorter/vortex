import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useMemo } from 'react';
import { CircleSnail } from 'react-native-progress';
import Artwork from './Artwork';
import { searchShow, getShow } from '../utils/api';
import { navigationBarHeight } from '../utils/dimensions';
import { ShowPreview } from '../utils/types';
import colors from '../utils/colors';

import { RootStackParamList } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
type Props = NativeStackScreenProps<RootStackParamList, 'Search'>;

export default function Search({ route, navigation }: Props) {
    const [result, setResult] = useState<ShowPreview[]>([]);
    const [searching, setSearching] = useState(false);
    useMemo(async () => {
        const shows = await searchShow(route.params.query);
        setResult(shows);
        setSearching(false);
    }, []);

    const content = searching ? (
        <View style={styles.loadingCircle}>
            <CircleSnail size={40} indeterminate={true} color={colors.onSurface} />
        </View>
    ) : (
        <ScrollView contentContainerStyle={styles.scrollView}>
            {result.map((showPreview, index) => (
                <TouchableOpacity key={index} onPress={async () => {
                    const show = await getShow(showPreview);
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
        backgroundColor: colors.surface,
        paddingBottom: navigationBarHeight
    },
    scrollView: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly'
    },
    loadingCircle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
