// Module that handles fetching and parsing of podcast feeds
// Messy code :)

import { Show, Episode, ShowPreview } from './types';
import { parseXml } from './parser';
import { parseDuration } from './utils';
import userAgent from '../utils/userAgent';

export async function getShow(preview: ShowPreview) {
    const rss = await getRSS(preview.feedUrl);
    if (rss === -1) return -1;
    const channel = rss.rss.channel[0];

    if (!channel.title) return -1;
    const title = channel.title[0];
    const encodedContent = channel['content:encoded']? channel['content:encoded'][0] : null;
    const description = encodedContent || channel.description? channel.description[0] : '';
    const author = channel['itunes:author']? channel['itunes:author'][0] : '';
    const link = channel.link? channel.link[0] : '';
    const artwork = preview.artwork;
    const color = await preview.color;
    const feedUrl = preview.feedUrl;
    const show: Show = {
        title,
        description,
        author,
        link,
        artwork,
        color,
        episodes: [],
        feedUrl
    };

    const episodes = await getEpisodes(show, rss);
    if (episodes === -1) return -1;
    show.episodes = episodes;

    return show;
}

export async function getEpisodes(show: Show, rss?: any) {
    if (!rss) {
        rss = await getRSS(show.feedUrl);
        if (rss === -1) return -1;
    }
    const channel = rss.rss.channel[0];

    let episodes: Episode[] = channel.item.map((episode: any) => {
        if (!episode.title) return null;
        const title = episode.title[0];
        const encodedContent = episode['content:encoded']? episode['content:encoded'][0] : null;
        const description = encodedContent || episode.description? episode.description[0] : '';
        const shortDescription = episode['itunes:summary']? episode['itunes:summary'][0] : description;
        const showTitle = show.title;
        const artwork = show.artwork;
        const date = episode.pubDate? new Date(episode.pubDate[0]).getTime() : 0;
        const duration = parseDuration(episode['itunes:duration']? episode['itunes:duration'][0] : '0');
        const color = show.color;
        if (!episode.guid) return null;
        const guid = episode.guid[0]._;
        if (!episode.enclosure) return null;
        const url = episode.enclosure[0].$.url;

        return {
            title,
            description,
            shortDescription,
            showTitle,
            artwork,
            date,
            duration,
            color,
            guid,
            url
        };
    });

    episodes = episodes.filter(episode => episode !== null);
    episodes = episodes.sort((a, b) => b.date - a.date);
    return episodes;
}

async function getRSS(feedUrl: string) {
    try {
        const request = await fetch(feedUrl, {
            headers: {
                'User-Agent': userAgent
            }
        });
        const text = await request.text();
        return parseXml(text);
    } catch {
        return -1;
    }
}

