import TrackPlayer, { Capability, AppKilledPlaybackBehavior } from 'react-native-track-player';

export default async function setupPlayer() {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
        capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SeekTo,
            Capability.JumpForward,
            Capability.JumpBackward,
        ],
        android: {
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.JumpForward
        ],
    });
}
