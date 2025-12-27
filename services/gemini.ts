import { TweetData, MediaItem } from "../types";

// --- Helpers ---

const formatFxTimestamp = (isoDate: string) => {
    try {
        const date = new Date(isoDate);
        return date.toLocaleString('en-US', {
            hour: 'numeric', minute: 'numeric', hour12: true,
            month: 'short', day: 'numeric', year: 'numeric'
        }).replace(',', ' ·');
    } catch (e) {
        return isoDate;
    }
};

const formatMetric = (num: number) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

// --- FxTwitter API ---

const fetchFromFxTwitter = async (url: string): Promise<TweetData | null> => {
    const regex = /(?:twitter|x)\.com\/([^\/]+)\/status\/(\d+)/;
    const match = url.match(regex);

    if (!match) return null;
    const [_, handle, id] = match;

    const apiUrl = `https://api.fxtwitter.com/${handle}/status/${id}`;

    try {
        const res = await fetch(apiUrl);
        if (!res.ok) return null;

        const json = await res.json();
        if (json.code !== 200 || !json.tweet) return null;

        const t = json.tweet;

        const extractMediaList = (mediaObj: any): MediaItem[] => {
            const items: MediaItem[] = [];

            // Handle photos
            if (mediaObj.photos) {
                mediaObj.photos.forEach((p: any) => items.push({ type: 'image', url: p.url }));
            }

            // Handle videos - FxTwitter puts both videos AND gifs in the videos array
            // GIFs have type: 'gif', regular videos have type: 'video'
            if (mediaObj.videos) {
                mediaObj.videos.forEach((v: any) => {
                    const isGif = v.type === 'gif';
                    items.push({
                        type: isGif ? 'gif' : 'video',
                        url: v.url,
                        thumbnailUrl: v.thumbnail_url,
                    });
                });
            }

            // Fallback: if there's a single media item with type
            if (items.length === 0 && mediaObj.all) {
                mediaObj.all.forEach((m: any) => {
                    if (m.type === 'photo') items.push({ type: 'image', url: m.url });
                    else if (m.type === 'video') items.push({ type: 'video', url: m.thumbnail_url || m.url, thumbnailUrl: m.thumbnail_url });
                    else if (m.type === 'gif') items.push({ type: 'gif', url: m.url, thumbnailUrl: m.thumbnail_url });
                });
            }

            return items;
        };

        let media: MediaItem[] = [];
        if (t.media) {
            media = extractMediaList(t.media);
        }

        let quotedTweet: TweetData | undefined;
        if (t.quote) {
            let qMedia: MediaItem[] = [];
            if (t.quote.media) {
                qMedia = extractMediaList(t.quote.media);
            }

            quotedTweet = {
                authorName: t.quote.author.name,
                authorHandle: t.quote.author.screen_name,
                authorAvatarUrl: t.quote.author.avatar_url,
                content: t.quote.text,
                timestamp: '',
                metrics: { likes: '0', reposts: '0', replies: '0', views: '0' },
                media: qMedia
            };
        }

        return {
            authorName: t.author.name,
            authorHandle: t.author.screen_name,
            authorAvatarUrl: t.author.avatar_url,
            content: t.text,
            timestamp: formatFxTimestamp(t.created_at),
            metrics: {
                likes: formatMetric(t.likes),
                reposts: formatMetric(t.retweets),
                replies: formatMetric(t.replies),
                views: formatMetric(t.views)
            },
            media,
            quotedTweet
        };
    } catch (e) {
        console.warn("FxTwitter fetch error", e);
        return null;
    }
};

export const analyzeTweetUrl = async (url: string): Promise<Partial<TweetData>> => {
    const fxResult = await fetchFromFxTwitter(url);
    if (fxResult) {
        return fxResult;
    }

    throw new Error("Could not fetch tweet data. Please check the URL or try again.");
};