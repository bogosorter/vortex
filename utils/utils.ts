export function parseDuration(duration: string): number {
    if (duration.indexOf(':') === -1) return Number(duration);

    const split = duration.split(':');

    if (split.length == 2) {
        const minutes = parseInt(split[0]);
        const seconds = parseInt(split[1]);
        return seconds + (minutes * 60);
    } else {
        const hours = parseInt(split[0]);
        const minutes = parseInt(split[1]);
        const seconds = parseInt(split[2]);
        return seconds + (minutes * 60) + (hours * 60 * 60);
    }
}