import TrackPlayer, { Event } from 'react-native-track-player';
import useStore from '../utils/store';

export default async function PlaybackService() {
    TrackPlayer.addEventListener(Event.RemotePlay, TrackPlayer.play);
    TrackPlayer.addEventListener(Event.RemotePause, TrackPlayer.pause);
    TrackPlayer.addEventListener(Event.PlaybackQueueEnded, useStore.getState().player.onEnd);
    TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) => TrackPlayer.seekTo(position));
    TrackPlayer.addEventListener(Event.RemoteJumpForward, () => TrackPlayer.seekBy(30));
    TrackPlayer.addEventListener(Event.RemoteJumpBackward, () => TrackPlayer.seekBy(-10));
    TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => useStore.getState().player.updateState(state));
    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, ({position}) => useStore.getState().player.updateProgress(position));
}
