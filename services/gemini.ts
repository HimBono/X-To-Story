import { GoogleGenAI } from "@google/genai";
import { TweetData, MediaItem } from "../types";

const processEnv = (typeof process !== 'undefined' && process.env) ? process.env : {};
const API_KEY = processEnv.API_KEY || '';

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
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// --- FxTwitter Strategy ---

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
          
          if (mediaObj.photos) {
              mediaObj.photos.forEach((p: any) => items.push({ type: 'image', url: p.url }));
          }
          if (mediaObj.videos) {
              mediaObj.videos.forEach((v: any) => items.push({ type: 'video', url: v.url }));
          }
          
          // If mixed/mosaic, they usually appear in photos/videos lists anyway in this API
          return items;
      };

      // 1. Main Tweet Media
      let media: MediaItem[] = [];
      if (t.media) {
          media = extractMediaList(t.media);
      }

      // 2. Quoted Tweet Extraction
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
              metrics: { likes: '0', reposts: '0' },
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
              reposts: formatMetric(t.retweets)
          },
          media,
          quotedTweet
      };
  } catch (e) {
      console.warn("FxTwitter fetch error", e);
      return null;
  }
};

// --- Gemini Strategy (Fallback) ---

const fetchFromGemini = async (url: string): Promise<Partial<TweetData>> => {
  if (!API_KEY) throw new Error("API Key missing");
  const ai = new GoogleGenAI({ apiKey: API_KEY });

  const prompt = `
    I have a URL to a post on X: ${url}
    Perform a Google Search to find content.
    Extract the following fields into a raw JSON object:
    - authorName, authorHandle, content, timestamp
    - likes, reposts (estimates are fine)
    - media: Array of objects { type: 'image' | 'video' | 'gif', url: string }
    - quotedTweet: If this is a quote tweet, provide an object with { authorName, authorHandle, content, media: [...] }. Otherwise null.
    
    Return ONLY raw JSON. No markdown.
  `;

  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] }
  });

  let text = response.text || '';
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error("Invalid JSON from Gemini");
  
  const data = JSON.parse(text.substring(start, end + 1));
  
  let quotedTweet: TweetData | undefined;
  if (data.quotedTweet) {
      quotedTweet = {
          authorName: data.quotedTweet.authorName || 'Unknown',
          authorHandle: data.quotedTweet.authorHandle || 'unknown',
          authorAvatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.quotedTweet.authorName || 'Q')}`,
          content: data.quotedTweet.content || '',
          timestamp: '',
          metrics: { likes: '0', reposts: '0' },
          media: Array.isArray(data.quotedTweet.media) ? data.quotedTweet.media : []
      };
  }

  return {
      authorName: data.authorName,
      authorHandle: data.authorHandle,
      content: data.content,
      timestamp: data.timestamp || new Date().toLocaleDateString(),
      metrics: {
        likes: data.likes || '0',
        reposts: data.reposts || '0'
      },
      media: Array.isArray(data.media) ? data.media : [],
      authorAvatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.authorName)}&background=random`,
      quotedTweet
  };
};

// --- Main Export ---

export const analyzeTweetUrl = async (url: string): Promise<Partial<TweetData>> => {
    // 1. Try FxTwitter API first
    const fxResult = await fetchFromFxTwitter(url);
    if (fxResult) {
        return fxResult;
    }

    // 2. Fallback to Gemini Search
    try {
        return await fetchFromGemini(url);
    } catch (e) {
        console.error(e);
        throw new Error("Could not fetch tweet data. Please check the URL or try again.");
    }
};