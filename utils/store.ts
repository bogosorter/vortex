import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import RNFS from 'react-native-fs';
import { MMKV } from 'react-native-mmkv';
import TrackPlayer, { State as PlayerState } from 'react-native-track-player';
import setupPlayer from './setupPlayer';
import { getEpisodes } from './rss';
import { Show, Episode, PlaybackState, DownloadInfo, DownloadStatus } from './types';

type Store = {
    library: {
        shows: Show[];
        savedEpisodes: Episode[];
        // Ensures that checking wether an episode is saved is fast
        saved: { [key: string]: boolean };
        playbackStates: { [key: string]: PlaybackState };

        subscribe: (show: Show) => void;
        unsubscribe: (show: Show) => void;
        saveEpisode: (episode: Episode) => void;
        removeSavedEpisode: (episode: Episode) => void;
        getPlaybackState: (episode: Episode) => PlaybackState;
        getAll: () => Episode[];
        getFeed: () => Episode[];
        refresh: () => Promise<void>;
        refreshShow: (show: Show) => Promise<void>;

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
        getDownloadedEpisodes: () => Episode[];
        clean: () => void;
        clearError: (episode: Episode) => void;

        store: () => void;
        load: () => void;
    },
    player: {
        currentEpisode: Episode | null;
        state: PlayerState;

        play: (episode: Episode, start?: boolean) => Promise<void>;
        onEnd: () => Promise<void>;
        updateState: (state: PlayerState) => Promise<void>;

        store: () => void;
        load: () => void;
    }
};

const storage = new MMKV();
const downloadDirectory = RNFS.DownloadDirectoryPath + '/vortex';

const useStore = create<Store>()(immer((set, get) => ({
    library: {
        shows: [] as Show[],
        savedEpisodes: [] as Episode[],
        saved: {} as { [key: string]: boolean },
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
                state.library.saved[episode.guid] = true;
            });
            get().library.storeSavedEpisodes();
        },
        removeSavedEpisode: (episode) => {
            set(state => {
                state.library.savedEpisodes = state.library.savedEpisodes.filter(e => e.guid !== episode.guid);
                state.library.saved[episode.guid] = false;
            });
            get().library.storeSavedEpisodes();
        },
        getPlaybackState: (episode) => {
            return get().library.playbackStates[episode.guid] || { position: 0, played: false } as PlaybackState;
        },
        getAll: () => {
            const savedEpisodes = get().library.savedEpisodes;
            const episodesFromShows = get().library.shows.flatMap(show => show.episodes);
            const saved = get().library.saved;
            const result = savedEpisodes.concat(episodesFromShows.filter(episode => !saved[episode.guid]));
            return result.sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            );
        },
        getFeed: () => {
            const all = get().library.getAll();
            return all.filter(episode => !get().library.getPlaybackState(episode).played);
        },
        refresh: async () => {
            const shows = get().library.shows;
            const result = await Promise.all(shows.map(async (show) => {
                const episodes = await getEpisodes(show);
                if (episodes === -1) return show;
                return { ...show, episodes };
            }));

            set(state => {
                state.library.shows = result;
            });
            get().library.storeShows();
        },
        refreshShow: async (show) => {
            const index = get().library.shows.findIndex(s => s.feedUrl === show.feedUrl);
            // Don't refresh shows that don't belong to the user's subscriptions
            if (index == -1) return;

            const episodes = await getEpisodes(show);
            if (episodes === -1) return;

            set(state => {
                const index = state.library.shows.findIndex(s => s.feedUrl === show.feedUrl);
                state.library.shows[index].episodes = episodes;
            });
            get().library.storeShows();
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
            storage.set('saved', JSON.stringify(get().library.saved));
        },
        loadSavedEpisodes: () => {
            const savedEpisodes = storage.getString('savedEpisodes');
            const saved = storage.getString('saved');
            if (savedEpisodes) {
                set(state => {
                    state.library.savedEpisodes = JSON.parse(savedEpisodes);
                    // saved will never be null if savedEpisodes is not null
                    state.library.saved = JSON.parse(saved!);
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
            if (downloadInfo.status === DownloadStatus.DOWNLOADED) return;
            downloadInfo.status = DownloadStatus.DOWNLOADING;
            set(state => {
                state.downloads.downloadInfo[episode.guid] = downloadInfo;
            });

            await RNFS.mkdir(downloadDirectory);
            const path = get().downloads.createPath(episode);
            const download = RNFS.downloadFile({
                fromUrl: episode.url,
                toFile: path,
                headers: {
                    'user-agent': 'vortex'
                },
                progressInterval: 200,
                progress: (e) => {
                    const p = e.bytesWritten / e.contentLength;
                    set(state => state.downloads.downloadInfo[episode.guid].progress = p)
                }
            });

            try {
                const result = await download.promise;
                if (result.statusCode === 200) {
                    set(state => {
                        state.downloads.downloadInfo[episode.guid].status = DownloadStatus.DOWNLOADED;
                        state.downloads.downloadInfo[episode.guid].date = Date.now();
                    })
                } else {
                    set(state => {
                        state.downloads.downloadInfo[episode.guid].status = DownloadStatus.ERROR;
                    })
                }
            } catch(_) {
                set(state => {
                    state.downloads.downloadInfo[episode.guid].status = DownloadStatus.ERROR;
                })
            }
            get().downloads.store();
        },
        remove: async (episode) => {
            const downloadInfo = get().downloads.getInfo(episode);
            if (downloadInfo.status != DownloadStatus.DOWNLOADED) return;
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
            return { status: DownloadStatus.NOT_DOWNLOADED, id: -1, date: -1, progress: 0 } as DownloadInfo;
        },
        getPath: (episode) => {
            const downloadInfo = get().downloads.getInfo(episode);
            if (downloadInfo.status === DownloadStatus.DOWNLOADED) return downloadDirectory + `/${downloadInfo.id}.mp3`;
            return episode.url;
        },
        createPath: (episode) => {
            const downloadInfo = get().downloads.getInfo(episode);
            if (downloadInfo.id !== -1) return downloadDirectory + `/${downloadInfo.id}.mp3`;
            const id = Number(storage.getString('downloadId') || '-1') + 1;
            storage.set('downloadId', String(id));
            set(state => {
                state.downloads.downloadInfo[episode.guid] = {...downloadInfo, id};
            });
            get().downloads.store();
            return downloadDirectory + `/${id}.mp3`;
        },
        getDownloadedEpisodes: () => {
            const result = [];
            for (const episode of get().library.getAll()) {
                const info = get().downloads.getInfo(episode);
                if (info.status === DownloadStatus.DOWNLOADED) result.push(episode);
            }
            return result;
        },
        clean: () => {
            for (const episode of get().downloads.getDownloadedEpisodes()) {
                const downloadInfo = get().downloads.getInfo(episode);
                const downloadAge = Date.now() - downloadInfo.date;
                // Remove downloads after two weeks
                if (downloadAge > 2 * 7 * 24 * 60 * 60 * 1000) get().downloads.remove(episode);
            }
        },
        clearError: (episode) => {
            set(state => {
                state.downloads.downloadInfo[episode.guid].status = DownloadStatus.NOT_DOWNLOADED
            });
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

            // The position has to be retrieved before the track player is
            // initialized because the initialization process may change its value
            const position = get().library.getPlaybackState(episode).position;

            await TrackPlayer.reset();
            await TrackPlayer.add({
                title: episode.title,
                artist: episode.showTitle,
                url: get().downloads.getPath(episode),
                artwork: episode.artwork,
                duration: episode.duration,
                userAgent: 'vortex',
            });
            await TrackPlayer.seekTo(position);
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
        updateState: async (playerState) => {
            set(state => {
                state.player.state = playerState;
            });

            const episode = get().player.currentEpisode;
            if (episode) {
                const playbackState = get().library.getPlaybackState(episode);
                const progress = await TrackPlayer.getProgress();
                set(state => {
                    state.library.playbackStates[episode.guid] = {
                        ...playbackState,
                        position: progress.position,
                        // An episode is complete when there is less than 5% of
                        // it left (usually for credits, etc.)
                        played: progress.position / progress.duration > 0.95
                    };
                });
                get().library.storePlaybackStates();
            }
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
useStore.getState().downloads.clean();
(async () => {
    await setupPlayer();
    useStore.getState().player.load();
})();

export default useStore;