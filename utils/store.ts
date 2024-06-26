import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import RNFS from 'react-native-fs';
import { MMKV } from 'react-native-mmkv';
import TrackPlayer, { State as PlayerState } from 'react-native-track-player';
import setupPlayer from './setupPlayer';
import { getEpisodes } from './rss';
import { Show, Episode, PlaybackState, DownloadInfo, DownloadStatus } from './types';
import userAgent from './userAgent';

type Store = {
    library: {
        shows: Show[];
        savedEpisodes: Episode[];
        // Ensures that checking whether an episode is saved is fast
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
        markAsPlayed: (episode: Episode) => void;
        markAsUnplayed: (episode: Episode) => void;

        storeShows: () => void;
        loadShows: () => void;
        storeSavedEpisodes: () => void;
        loadSavedEpisodes: () => void;
        storePlaybackStates: () => void;
        loadPlaybackStates: () => void;
    },
    downloads: {
        downloads: Episode[];
        downloadInfo: { [key: string]: DownloadInfo };

        add: (episode: Episode) => Promise<void>;
        remove: (episode: Episode) => Promise<void>;
        getInfo: (episode: Episode) => DownloadInfo;
        getPath: (episode: Episode) => string;
        createPath: (episode: Episode) => string;
        clean: () => void;
        clearError: (episode: Episode) => void;

        store: () => void;
        load: () => void;
    },
    player: {
        currentEpisode: Episode | null;
        state: PlayerState;
        queue: Episode[];
        playbackRate: number;

        play: (episode: Episode, start?: boolean) => Promise<void>;
        onEnd: () => Promise<void>;
        updateState: (state: PlayerState) => void;
        updateProgress: (progress: number) => void;
        playNext: (episode: Episode) => void;
        playLater: (episode: Episode) => void;
        setQueue: (queue: Episode[]) => void;
        removeFromQueue: (episode: Episode) => void;
        setPlaybackRate: (rate: number) => void;
        loadPlaybackRate: () => void;

        store: () => void;
        load: () => void;
        storeQueue: () => void;
        loadQueue: () => void;
    }
};

const storage = new MMKV();
const downloadDirectory = RNFS.DocumentDirectoryPath + '/vortex';

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
            if (get().library.saved[episode.guid]) return;
            set(state => {
                state.library.savedEpisodes.unshift(episode);
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
            const result: Episode[] = [];
            
            result.push(...get().library.savedEpisodes);
            result.push(...get().downloads.downloads.filter(episode => !get().library.saved[episode.guid]));
            result.push(...get().library.shows.flatMap(show => show.episodes).filter(episode => {
                const isSaved = get().library.saved[episode.guid];
                const isDownloaded = get().downloads.getInfo(episode).status === DownloadStatus.DOWNLOADED;
                return !isSaved && !isDownloaded;
            }));

            return result.sort((a, b) => b.date - a.date);
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
        markAsPlayed: (episode) => {
            const playbackState = get().library.getPlaybackState(episode);
            set(state => {
                state.library.playbackStates[episode.guid] = {
                    ...playbackState,
                    played: true
                };
            });
            get().library.storePlaybackStates();
        },
        markAsUnplayed: (episode) => {
            const playbackState = get().library.getPlaybackState(episode);
            set(state => {
                state.library.playbackStates[episode.guid] = {
                    ...playbackState,
                    played: false
                };
            });
            get().library.storePlaybackStates();
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
        downloads: [] as Episode[],
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
                    'User-Agent': userAgent
                },
                progressInterval: 200,
                progress: (e) => {
                    const p = e.bytesWritten / e.contentLength;
                    set(state => {
                        state.downloads.downloadInfo[episode.guid].progress = p
                    });
                }
            });

            try {
                const result = await download.promise;
                if (result.statusCode === 200) {
                    set(state => {
                        state.downloads.downloadInfo[episode.guid].status = DownloadStatus.DOWNLOADED;
                        state.downloads.downloadInfo[episode.guid].date = Date.now();
                        state.downloads.downloads.unshift(episode);
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
            await RNFS.unlink(get().downloads.getPath(episode));
            set(state => {
                state.downloads.downloadInfo[episode.guid].status = DownloadStatus.NOT_DOWNLOADED;
                state.downloads.downloads = state.downloads.downloads.filter(e => e.guid !== episode.guid);
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
        clean: () => {
            for (const episode of get().downloads.downloads) {
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
            storage.set('downloads', JSON.stringify(get().downloads.downloads));
        },
        load: () => {
            const downloadInfo = JSON.parse(storage.getString('downloadInfo') || '{}');
            const downloads = JSON.parse(storage.getString('downloads') || '[]');
            set(state => {
                state.downloads.downloadInfo = downloadInfo as { [key: string]: DownloadInfo };
                state.downloads.downloads = downloads as Episode[];
            });
        }
    },

    player: {
        currentEpisode: null as Episode | null,
        state: PlayerState.None as PlayerState,
        queue: [] as Episode[],
        playbackRate: 1,

        play: async (episode, start = true) => {
            if (get().player.currentEpisode) await get().player.playNext(get().player.currentEpisode!);

            set(state => {
                state.player.currentEpisode = episode;
            });            

            await TrackPlayer.reset();
            await TrackPlayer.add({
                title: episode.title,
                artist: episode.showTitle,
                url: get().downloads.getPath(episode),
                artwork: episode.artwork,
                duration: episode.duration,
                userAgent: userAgent,
            });

            const playbackState = get().library.getPlaybackState(episode);
            await TrackPlayer.seekTo(playbackState.played? 0 : playbackState.position);
            if (start) await TrackPlayer.play();

            get().player.store();
            get().player.removeFromQueue(episode);
        },
        onEnd: async () => {
            const episode = get().player.currentEpisode!;
            set(state => {
                state.library.playbackStates[episode.guid].position = 0;
                state.library.playbackStates[episode.guid].played = true;
                state.player.currentEpisode = null;
            });

            const queue = get().player.queue;
            if (queue.length) {
                const next = queue[0];
                set(state => {
                    state.player.queue.shift();
                });
                get().player.play(next);
            }
            else await TrackPlayer.reset();
        },
        updateState: (playerState) => {
            set(state => {
                state.player.state = playerState;
            });
        },
        updateProgress: (progress) => {
            const episode = get().player.currentEpisode;
            if (!episode) return;
            
            const playbackState = get().library.getPlaybackState(episode);
            set(state => {
                state.library.playbackStates[episode.guid] = {
                    ...playbackState,
                    position: progress
                };
                if (episode.duration - progress < 10) state.library.playbackStates[episode.guid].played = true;
            });
            get().library.storePlaybackStates();
        },
        playNext: (episode) => {
            get().player.removeFromQueue(episode);
            set(state => {
                state.player.queue.unshift(episode);
            });
            get().player.storeQueue();
        },
        playLater: (episode) => {
            get().player.removeFromQueue(episode);
            set(state => {
                state.player.queue.push(episode);
            });
            get().player.storeQueue();
        },
        setQueue: (queue) => {
            set(state => {
                state.player.queue = queue;
            });
            get().player.storeQueue();
        },
        removeFromQueue: (episode) => {
            set(state => {
                state.player.queue = state.player.queue.filter(e => e.guid !== episode.guid);
            });
            get().player.storeQueue();
        },
        setPlaybackRate: (rate) => {
            set(state => {
                state.player.playbackRate = rate;
            });
            TrackPlayer.setRate(rate);
            storage.set('playbackRate', String(rate));
        },
        loadPlaybackRate: () => {
            const rate = Number(storage.getString('playbackRate') || '1');
            set(state => {
                state.player.playbackRate = rate;
            });
            TrackPlayer.setRate(rate);
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
        },
        storeQueue: () => {
            storage.set('downloadQueue', JSON.stringify(get().player.queue));
        },
        loadQueue: () => {
            const queue = JSON.parse(storage.getString('downloadQueue') || '[]');
            set(state => {
                state.player.queue = queue;
            });
        }
    }
})));

useStore.getState().library.loadShows();
useStore.getState().library.loadSavedEpisodes();
useStore.getState().library.loadPlaybackStates();
useStore.getState().downloads.load();
useStore.getState().downloads.clean();
useStore.getState().player.loadQueue();
(async () => {
    await setupPlayer();
    useStore.getState().player.load();
    useStore.getState().player.loadPlaybackRate();
})();

export default useStore