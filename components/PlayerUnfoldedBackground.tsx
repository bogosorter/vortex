import { ImageBackground, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomSheetBackgroundProps } from '@gorhom/bottom-sheet';
import Animated from 'react-native-reanimated';
import Color from 'color';
import useStore from '../utils/store';

export default function PlayerUnfoldedBackground({ style }: BottomSheetBackgroundProps) {
    const episode = useStore(state => state.player.currentEpisode)!;
    const backgroundColor = new Color(episode.color).darken(0.5).string();
    const styles = getStyles(backgroundColor);

    return (
        <Animated.View pointerEvents='none' style={[styles.background, style]}>
            <ImageBackground src={episode.artwork} style={styles.artwork}>
                <View style={styles.artworkDarkener}>
                    <LinearGradient
                        colors={['transparent', 'transparent', backgroundColor]}
                        style={{ flex: 1 }}
                    />
                </View>
            </ImageBackground>
        </Animated.View>
    )
}

function getStyles(backgroundColor: string) {
    return StyleSheet.create({
        background: {
            overflow: 'hidden',
            backgroundColor,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30
        },
        artwork: {
            width: '100%',
            aspectRatio: 1
        },
        artworkDarkener: {
            width: '100%',
            aspectRatio: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.4)'
        }
    })
}