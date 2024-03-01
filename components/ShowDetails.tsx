import { useMemo } from 'react';
import { StyleSheet, Text, View, FlatList, ImageBackground, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Color from 'color';
import EpisodePreview from './EpisodePreview';
import SubscribeButton from './SubscribeButton';
import useStore from '../utils/store';
import colors, { darkColors } from '../utils/colors';

import { RootStackParamList } from '../App';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
type Props = NativeStackScreenProps<RootStackParamList, 'ShowDetails'>;

export default function ShowDetails({route}: Props) {
    const refresh = useStore(store => store.library.refreshShow);

    const show = route.params.show;
    const backgroundColor = new Color(show.color).darken(0.5).string();
    const styles = getStyles(backgroundColor);

    useMemo(() => refresh(show), []);

    return (
        <View style={styles.showDetails}>
            <FlatList
                ListHeaderComponent={
                    <ImageBackground src={show.artwork} style={styles.artwork}>
                        <View style={styles.artworkDarkener}>
                            <LinearGradient
                                colors={['transparent', 'transparent', backgroundColor]}
                                style={{ flex: 1 }}
                            />
                        </View>
                    </ImageBackground>
                }
                /* The element 0 is due to some gymnastics required to have a sticky
                header */
                data={[0, ...show.episodes]}
                renderItem={({ item }) => {
                    if (typeof item === 'number') return (
                        <View style={styles.headerWrapper}>
                            <View style={styles.header}>
                                <View style={styles.headerText}>
                                    <Text style={styles.title}>{show.title}</Text>
                                    <Text style={styles.author}>{show.author}</Text>
                                </View>
                                <SubscribeButton show={show} />
                            </View>
                        </View>
                    );
                    return <EpisodePreview episode={item} showArtwork={false} />;
                }}
                stickyHeaderIndices={[1]}
                refreshControl={<RefreshControl refreshing={false} onRefresh={() => refresh(show)} />}
            />
        </View>
    );
}

function getStyles(backgroundColor: string) {
    return StyleSheet.create({
        showDetails: {
            flex: 1,
            backgroundColor: colors.surface
        },
        artwork: {
            width: '100%',
            aspectRatio: 1
        },
        artworkDarkener: {
            width: '100%',
            aspectRatio: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.4)'
        },
        headerWrapper: {
            minHeight: 150,
            justifyContent: 'flex-end',
            padding: 20,
            backgroundColor: backgroundColor,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
        },
        header: {
            paddingTop: 60,
            paddingBottom: 15,
            display: 'flex',
            flexDirection: 'row'
        },
        headerText: {
            flex: 1,
        },
        title: {
            fontSize: 20,
            fontWeight: 'bold',
            color: darkColors.onSurface
        },
        author: {
            fontSize: 16,
            color: new Color(darkColors.onSurface).alpha(0.8).string()
        }
    });
}
