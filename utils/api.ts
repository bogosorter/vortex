import { parseXml } from './parser';
import { getColors } from 'react-native-image-colors';
import { AndroidImageColors } from 'react-native-image-colors/build/types';
import { Episode, Show, ShowPreview } from '../utils/types';
import colors from '../utils/colors';

// Vortex uses the iTunes Search API to find podcasts. This API, however, is
// somewhat limited in that it doesn't return information on some key fields
// (such as the show's description) and it's results are delayed. Therefore,
// Vortex resorts to using the podcast's RSS feed once it has its URL.

export async function searchShow(term: string) {
    const result =  await fetch('https://itunes.apple.com/search?' + new URLSearchParams({
        term,
        limit: '20',
        media: 'podcast'
    }));
    const json = await result.json();
    const shows: ShowPreview[] = json.results.map((show: any) => {
        return {
            artwork: show.artworkUrl600,
            feedUrl: show.feedUrl,
            color: (async () => {
                const imageColors = await getColors(show.artworkUrl600, {
                    fallback: colors.surface
                }) as AndroidImageColors;
                return imageColors.dominant;
            })(),
            xml: getXml(show.feedUrl)
        } as ShowPreview;
    })
    return shows;
}

export async function getXml(feedUrl: string) {
    const request = await fetch(feedUrl, {
        headers: {
            'user-agent': 'vortex'
        }
    });
    const text = await request.text();
    return await parseXml(text);
}

export async function getShow(showPreview: ShowPreview) {
    const xml = await showPreview.xml;
    const channel = xml.rss.channel[0];
    const show: Show = {
        title: channel.title[0],
        description: channel.description[0],
        author: channel['itunes:author'][0],
        artwork: showPreview.artwork,
        color: await showPreview.color,
        feedUrl: showPreview.feedUrl,
        episodes: []
    };
    show.episodes = await getEpisodes(show, xml);
    return show;
}

export async function getEpisodes(show: Show, xml?: any) {
    if (!xml) xml = await getXml(show.feedUrl);
    const channel = xml.rss.channel[0];
    const episodes: Episode[] = channel.item.map((item: any) => {
        return {
            title: item.title[0],
            description: item.description[0],
            shortDescription: (item['itunes:summary'] || item.description)[0],
            showTitle: channel.title[0],
            artwork: show.artwork,
            date: new Date(item.pubDate[0]).getTime(),
            duration: convertITunesDurationToSeconds((item['itunes:duration'] || ['0:0:0'])[0]),
            color: show.color,
            guid: item.guid[0]._,
            url: item.enclosure[0].$.url
        } as Episode;
    });
    return episodes;
}

function convertITunesDurationToSeconds(duration: string) {
    const split = duration.split(':');
    const hours = parseInt(split[0]);
    const minutes = parseInt(split[1]);
    const seconds = parseInt(split[2]);
    return seconds + (minutes * 60) + (hours * 60 * 60);
}
