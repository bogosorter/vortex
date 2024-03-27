// Module that handles fetching and parsing of podcast feeds

// Parsing a podcast's RSS feed with the existing libraries has proven to be
// either impossible in react-native or too slow. I wrote up a custom version
// that takes advantage of the fact that podcasts' feeds have a very specific
// structure.

// This is still experimental and may not work with all feeds. The code is also
// a little messy

import { Show, Episode, ShowPreview } from './types';
import { parseXml } from './parser';
import { parseDuration } from './utils';

export async function getShow(preview: ShowPreview) {
    const rss = await getRSS(preview.feedUrl);
    if (rss === -1) return -1;
    const channel = rss.rss.channel[0];

    const show: Show = {
        title: channel.title[0],
        description: channel.description[0],
        author: channel['itunes:author'][0],
        link: channel.link[0],
        artwork: preview.artwork,
        color: await preview.color,
        episodes: [],
        feedUrl: preview.feedUrl
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

    const episodes: Episode[] = channel.item.map((episode: any) => {
        return {
            title: episode.title[0],
            description: episode.description[0],
            shortDescription: (episode['itunes:summary'] || episode.description)[0],
            showTitle: show.title,
            artwork: show.artwork,
            date: new Date(episode.pubDate[0]).getTime(),
            duration: parseDuration(episode['itunes:duration'][0]),
            color: show.color,
            guid: episode.title[0],
            url: episode.enclosure[0].$.url
        };
    });
    
    return episodes.sort((a, b) => b.date - a.date);
}

async function getRSS(feedUrl: string) {
    try {
        const request = await fetch(feedUrl, {
            headers: {
                'user-agent': 'vortex'
            }
        });
        const text = await request.text();
        return parseXml(text);
    } catch {
        return -1;
    }
}

