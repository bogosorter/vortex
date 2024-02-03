import { StyleSheet, TextInput, View } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { statusBarHeight, navigationBarHeight } from '../utils/dimensions';
import colors from '../utils/colors';

import { RootStackParamList } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function Home({navigation}: Props) {
    const [query, setQuery] = useState('');

    return (
        <View style={styles.home}>
            <TextInput
                style={styles.searchBox}
                onChangeText={setQuery}
                placeholder='Search'
                onSubmitEditing={() => navigation.navigate('Search', {query})}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    home: {
        flex: 1,
        backgroundColor: colors.surface,
        paddingTop: statusBarHeight,
        paddingBottom: navigationBarHeight
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
