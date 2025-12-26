export interface MediaItem {
  type: 'image' | 'video' | 'gif';
  url: string;
}

export interface TweetData {
  authorName: string;
  authorHandle: string;
  authorAvatarUrl: string;
  content: string;
  timestamp: string;
  metrics: {
    likes: string;
    reposts: string;
    replies: string;
    views: string;
  };
  media: MediaItem[];
  quotedTweet?: TweetData;
}

export interface StoryConfig {
  backgroundType: 'solid' | 'gradient' | 'image' | 'blur';
  backgroundValue: string; // Hex code, gradient string, or image URL
  cardTheme: 'light' | 'dark' | 'glass';
  scale: number;
  showWatermark: boolean;
  showContent: boolean;
  showLikes: boolean;
  showReplies: boolean;
  showReposts: boolean;
  showViews: boolean;
}

export const INITIAL_TWEET_DATA: TweetData = {
  authorName: 'Elon Musk',
  authorHandle: 'elonmusk',
  authorAvatarUrl: 'https://picsum.photos/200',
  content: 'Twitter is now X. Deal with it.',
  timestamp: '10:30 AM · Jul 24, 2023',
  metrics: {
    likes: '1.2M',
    reposts: '450K',
    replies: '82K',
    views: '42M'
  },
  media: [],
};

export const INITIAL_CONFIG: StoryConfig = {
  backgroundType: 'gradient',
  backgroundValue: 'linear-gradient(to bottom right, #4f46e5, #06b6d4)',
  cardTheme: 'dark',
  scale: 1,
  showWatermark: true,
  showContent: true,
  showLikes: true,
  showReplies: true,
  showReposts: true,
  showViews: true,
};