import { StyleSheet } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import useStore from './store';
import { Episode } from './types';
import { navigationBarHeight } from './dimensions';
import colors from './colors';

type ActionSheet = ReturnType<typeof useActionSheet>['showActionSheetWithOptions'];

export default function episodeMenu(actionSheet: ActionSheet, episode: Episode) {
    const saved = !!useStore.getState().library.saved[episode.guid];
    const played = !!useStore.getState().library.getPlaybackState(episode).played;

    actionSheet(
        {
            options: [
                'Play',
                'Play Next',
                'Play Later',
                'Download',
                saved ? 'Remove from saved' : 'Save',
                played ? 'Mark as unplayed' : 'Mark as played'
            ],
            cancelButtonIndex: 2,
            containerStyle: styles.menuContainer,
            textStyle: styles.menuItem
        },
        (buttonIndex: number | undefined) => {
            if (buttonIndex === 0) useStore.getState().player.play(episode);
            else if (buttonIndex === 1) useStore.getState().player.playNext(episode);
            else if (buttonIndex === 2) useStore.getState().player.playLater(episode);
            else if (buttonIndex === 3) useStore.getState().downloads.add(episode);
            else if (buttonIndex === 4) {
                if (saved) useStore.getState().library.removeSavedEpisode(episode);
                else useStore.getState().library.saveEpisode(episode);
            }
            else if (buttonIndex === 5) {
                if (played) useStore.getState().library.markAsUnplayed(episode);
                else useStore.getState().library.markAsPlayed(episode);
            }
        }
    );
}

const styles = StyleSheet.create({
    menuContainer: {
        backgroundColor: colors.surface,
        padding: 10,
        paddingBottom: navigationBarHeight,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30
    },
    menuItem: {
        color: colors.onSurface
    }
});
