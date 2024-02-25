export type Episode = {
    title: string;
    description: string;
    shortDescription: string;
    showTitle: string;
    artwork: string;
    date: number;
    duration: number;
    color: string;
    guid: string;
    url: string;
};

export type Show = {
    title: string;
    description: string;
    author: string;
    link?: string;
    artwork: string;
    color: string;
    episodes: Episode[];
    feedUrl: string;
};

export type ShowPreview = {
    artwork: string;
    feedUrl: string;
    color: Promise<string>;
};

export type PlaybackState = {
    position: number;
    played: boolean;
};

export enum DownloadStatus {
    NOT_DOWNLOADED,
    DOWNLOADING,
    DOWNLOADED,
    ERROR
};

export type DownloadInfo = {
    status: DownloadStatus;
    id: number;
    date: number;
    progress: number;
};
