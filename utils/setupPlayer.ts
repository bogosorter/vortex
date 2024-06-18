import TrackPlayer, { Capability, AppKilledPlaybackBehavior } from 'react-native-track-player';

export default async function setupPlayer() {
    // There's no way to check if the player is already set up
    try {
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
            progressUpdateEventInterval: 5
        });
    } catch (_) {}
}
