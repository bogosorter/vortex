import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import RNFS from 'react-native-fs';
import { MMKV } from 'react-native-mmkv';
import TrackPlayer, { State as PlayerState } from 'react-native-track-player';
import setupPlayer from './setupPlayer';
import { Show, Episode, PlaybackState, DownloadInfo, DownloadStatus } from './types';

type Store = {
    library: {
        shows: Show[];
        savedEpisodes: Episode[];
        playbackStates: { [key: string]: PlaybackState };

        subscribe: (show: Show) => void;
        unsubscribe: (show: Show) => void;
        saveEpisode: (episode: Episode) => void;
        removeSavedEpisode: (episode: Episode) => void;
        getPlaybackState: (episode: Episode) => PlaybackState;
        getFeed: () => Episode[];

        storeShows: () => void;
        loadShows: () => void;
        storeSavedEpisodes: () => void;
        loadSavedEpisodes: () => void;
        storePlaybackStates: () => void;
        loadPlaybackStates: () => void;
    },
    downloads: {
        downloadInfo: { [key: string]: DownloadInfo };

        add: (episode: Episode) => Promise<void>;
        remove: (episode: Episode) => Promise<void>;
        getInfo: (episode: Episode) => DownloadInfo;
        getPath: (episode: Episode) => string;
        createPath: (episode: Episode) => string;

        store: () => void;
        load: () => void;
    },
    player: {
        currentEpisode: Episode | null;
        state: PlayerState;

        play: (episode: Episode, start?: boolean) => Promise<void>;
        onEnd: () => Promise<void>;
        updateState: (state: PlayerState) => void;

        store: () => void;
        load: () => void;
    }
};

const storage = new MMKV();
const downloadDirectory = RNFS.DownloadDirectoryPath + '/downloads';

const useStore = create<Store>()(immer((set, get) => ({
    library: {
        shows: [] as Show[],
        savedEpisodes: [] as Episode[],
        playbackStates: {} as { [key: string]: PlaybackState },

        subscribe: (show) => {
            set(state => {
                state.library.shows.push(show);
            });
            get().library.storeShows();
        },
        unsubscribe: (show) => {
            set(state => {
                state.library.shows = state.library.shows.filter(s => s.feedUrl !== show.feedUrl);
            });
            get().library.storeShows();
        },
        saveEpisode: (episode) => {
            set(state => {
                state.library.savedEpisodes.push(episode);
            });
            get().library.storeSavedEpisodes();
        },
        removeSavedEpisode: (episode) => {
            set(state => {
                state.library.savedEpisodes = state.library.savedEpisodes.filter(e => e.guid !== episode.guid);
            });
            get().library.storeSavedEpisodes();
        },
        getPlaybackState: (episode) => {
            return get().library.playbackStates[episode.guid] || { position: 0, played: false } as PlaybackState;
        },
        getFeed: () => {
            return get().library.shows.flatMap(show => show.episodes).concat(get().library.savedEpisodes).sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
        },

        storeShows: () => {
            storage.set('shows', JSON.stringify(get().library.shows));
        },
        loadShows: () => {
            const shows = storage.getString('shows');
            if (shows) {
                set(state => {
                    state.library.shows = JSON.parse(shows) as Show[];
                });
            }
        },
        storeSavedEpisodes: () => {
            storage.set('savedEpisodes', JSON.stringify(get().library.savedEpisodes));
        },
        loadSavedEpisodes: () => {
            const savedEpisodes = storage.getString('savedEpisodes');
            if (savedEpisodes) {
                set(state => {
                    state.library.savedEpisodes = JSON.parse(savedEpisodes) as Episode[];
                });
            }
        },
        storePlaybackStates: () => {
            storage.set('playbackStates', JSON.stringify(get().library.playbackStates));
        },
        loadPlaybackStates: () => {
            const playbackStates = storage.getString('playbackStates');
            if (playbackStates) {
                set(state => {
                    state.library.playbackStates = JSON.parse(playbackStates) as { [key: string]: PlaybackState };
                });
            }
        }
    },

    downloads: {
        downloadInfo: {} as { [key: string]: DownloadInfo },

        add: async (episode) => {
            const downloadInfo = get().downloads.getInfo(episode);
            downloadInfo.status = DownloadStatus.DOWNLOADING;
            set(state => {
                state.downloads.downloadInfo[episode.guid] = downloadInfo;
            });

            await RNFS.mkdir(downloadDirectory);
            const path = get().downloads.createPath(episode);
            console.log(path);
            const download = RNFS.downloadFile({ fromUrl: episode.url, toFile: path });
            
            const result = await download.promise;
            const status = result.statusCode === 200 ? DownloadStatus.DOWNLOADED : DownloadStatus.ERROR;
            set(state => {
                state.downloads.downloadInfo[episode.guid].status = status;
            })
            get().downloads.store();
        },
        remove: async (episode) => {
            const path = get().downloads.getPath(episode);
            await RNFS.unlink(path);
            set(state => {
                state.downloads.downloadInfo[episode.guid].status = DownloadStatus.NOT_DOWNLOADED;
            });
            get().downloads.store();
        },
        getInfo: (episode) => {
            const info = get().downloads.downloadInfo[episode.guid];
            if (info) return info;
            return { status: DownloadStatus.NOT_DOWNLOADED, id: -1 } as DownloadInfo;
        },
        getPath: (episode) => {
            const downloadInfo = get().downloads.getInfo(episode);
            if (downloadInfo.id !== -1) return downloadDirectory + `/${downloadInfo.id}.mp3`;
            return episode.url;
        },
        createPath: (episode) => {
            const downloadInfo = get().downloads.getInfo(episode);
            if (downloadInfo.id !== -1) return downloadDirectory + `/${downloadInfo.id}.mp3`;
            const id = (storage.getNumber('downloadId') || -1) + 1;
            set(state => {
                state.downloads.downloadInfo[episode.guid] = {...downloadInfo, id};
            });
            get().downloads.store();
            return downloadDirectory + `/${id}.mp3`;
        },

        store: () => {
            storage.set('downloadInfo', JSON.stringify(get().downloads.downloadInfo));
        },
        load: () => {
            const downloadInfo = JSON.parse(storage.getString('downloadInfo') || '{}');
            set(state => {
                state.downloads.downloadInfo = downloadInfo as { [key: string]: DownloadInfo };
            });
        }
    },

    player: {
        currentEpisode: null as Episode | null,
        state: PlayerState.None as PlayerState,

        play: async (episode, start = true) => {
            set(state => {
                state.player.currentEpisode = episode;
            });
            await TrackPlayer.reset();
            await TrackPlayer.add({
                title: episode.title,
                artist: episode.showTitle,
                url: get().downloads.getPath(episode),
                artwork: episode.artwork,
                duration: episode.duration
            });
            const playbackState = get().library.getPlaybackState(episode);
            await TrackPlayer.seekTo(playbackState.position);
            if (start) await TrackPlayer.play();
            get().player.store();
        },
        onEnd: async () => {
            const episode = get().player.currentEpisode!;
            const playbackState = get().library.getPlaybackState(episode);
            playbackState.played = true;
            playbackState.position = 0;
            set(state => {
                state.library.playbackStates[episode.guid] = playbackState;
                state.player.currentEpisode = null;
            });
            await TrackPlayer.stop();
            await TrackPlayer.reset();
            get().library.storePlaybackStates();
        },
        updateState: (playerState) => {
            set(state => {
                state.player.state = playerState;
            });
        },

        store: () => {
            storage.set('currentEpisode', JSON.stringify(get().player.currentEpisode));
        },
        load: () => {
            const currentEpisode = JSON.parse(storage.getString('currentEpisode') || 'null');
            set(state => {
                state.player.currentEpisode = currentEpisode;
            });
            if (currentEpisode) get().player.play(currentEpisode, false);
        }
    }
})));

useStore.getState().library.loadShows();
useStore.getState().library.loadSavedEpisodes();
useStore.getState().library.loadPlaybackStates();
useStore.getState().downloads.load();
(async () => {
    await setupPlayer();
    useStore.getState().player.load();
})();

export default useStore;