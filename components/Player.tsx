import { useRef, useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import FoldedPlayer from './FoldedPlayer';
import PlayerUnfolded from './PlayerUnfolded';
import PlayerUnfoldedBackground from './PlayerUnfoldedBackground';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet/';
import useStore from '../utils/store';
import { navigationBarHeight } from '../utils/dimensions';
import colors from '../utils/colors';

export default function Player() {
    const episode = useStore(state => state.player.currentEpisode);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [unfolded, setUnfolded] = useState(false);
    useMemo(() => setUnfolded(false), [episode]);

    const styles = getStyles(!!episode);

    if (!episode) return <View style={styles.placeholder} />;
    return (<>
        <FoldedPlayer onPress={() => setUnfolded(true)} />
        {unfolded && <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={['90%']}
            backgroundComponent={PlayerUnfoldedBackground}
            backdropComponent={(props) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} />}
            onChange={(index) => setUnfolded(index === 0)}
            enablePanDownToClose
        >
            <PlayerUnfolded />
        </BottomSheet>}
    </>)
}

function getStyles(playing: boolean) {
    return StyleSheet.create({
        placeholder: {
            height: navigationBarHeight,
            backgroundColor: playing? colors.surfaceVariant: colors.surface
        }
    });
}
