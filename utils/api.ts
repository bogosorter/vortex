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
            })()
        } as ShowPreview;
    })
    return shows;
}
