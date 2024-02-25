// Module that handles fetching and parsing of podcast feeds

// Parsing a podcast's RSS feed with the existing libraries has proven to be
// either impossible in react-native or too slow. I wrote up a custom version
// that takes advantage of the fact that podcasts' feeds have a very specific
// structure.

// This is still experimental and may not work with all feeds. The code is also
// a little messy

import { Show, Episode, ShowPreview } from './types';
import { parseDuration } from './utils';

export async function getShow(preview: ShowPreview) {
    const rss = await getRSS(preview.feedUrl);
    if (rss === -1) return -1;

    const title = getFirst(rss, 'title')!;
    const link = getFirst(rss, 'link')!;
    const author = getFirst(rss, 'itunes:author')!;
    const description = getFirst(rss, 'description')!;
    const episodes = getAll(rss, 'item')!;

    const show = {
        title,
        description,
        author,
        link,
        artwork: preview.artwork,
        color: await preview.color,
        episodes:  [],
        feedUrl: preview.feedUrl
    } as Show;
    show.episodes = episodes.map((episode) => parseEpisode(show, episode));

    return show;
}

export async function getEpisodes(show: Show) {
    const rss = await getRSS(show.feedUrl);
    if (rss === -1) return -1;
    const result = getAll(rss, 'item').map((episode) => parseEpisode(show, episode));
    return result;
}

function parseEpisode(show: Show, rss: string) {
    const title = getFirst(rss, 'title')!;
    let description = getFirst(rss, 'description')!;
    if (description.startsWith('<![CDATA[')) description = description.substring(9, description.length - 3);
    const shortDescription = getFirst(rss, 'itunes:summary') || description;
    const date = new Date(getFirst(rss, 'pubDate')!).getTime();
    const duration = parseDuration(getFirst(rss, 'itunes:duration')!);
    const guid = title;
    const url = getAttribute(rss, 'enclosure', 'url')!;
    return {
        title,
        description,
        shortDescription,
        showTitle: show.title,
        artwork: show.artwork,
        date,
        duration,
        color: show.color,
        guid,
        url
    } as Episode;
}

function getFirst(rss: string, tagName: string) {
    const tagStart = `<${tagName}`; // Keep in mind that the tag may have attributes
    const tagEnd = `</${tagName}>`;

    let startIndex = rss.indexOf(tagStart);
    if (startIndex === -1) return null;
    startIndex = rss.indexOf('>', startIndex) + 1;
    const endIndex = rss.indexOf(tagEnd);

    return rss.substring(startIndex, endIndex);
}

function getAll(rss: string, tagName: string) {
    const tagStart = `<${tagName}`;
    const tagEnd = `</${tagName}>`;

    const tags = [];
    let currentIndex = 0;

    while (currentIndex < rss.length) {
        let startIndex = rss.indexOf(tagStart, currentIndex);
        if (startIndex === -1) break;
        startIndex = rss.indexOf('>', startIndex);
        const endIndex = rss.indexOf(tagEnd, currentIndex) + 1;
        tags.push(rss.substring(startIndex, endIndex));
        currentIndex = endIndex + tagEnd.length;
    }

    return tags;
}

function getAttribute(rss: string, tagName: string, attributeName: string) {
    const start = `<${tagName}`;
    const attributeStart = `${attributeName}="`;

    let startIndex = rss.indexOf(start);
    if (startIndex === -1) return null;
    startIndex = rss.indexOf(attributeStart, startIndex) + attributeStart.length;
    const endIndex = rss.indexOf('"', startIndex + attributeStart.length);

    return rss.substring(startIndex, endIndex);
}

async function getRSS(feedUrl: string) {
    try {
        const request = await fetch(feedUrl, {
            headers: {
                'user-agent': 'vortex'
            }
        });
        return await request.text();
    } catch {
        return -1;
    }
}

