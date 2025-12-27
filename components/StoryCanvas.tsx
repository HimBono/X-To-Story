import React from 'react';
import { TweetData, StoryConfig, MediaItem } from '../types';
import { Heart, MessageCircle, Repeat2, Share, Verified, BarChart3 } from 'lucide-react';

interface StoryCanvasProps {
  tweet: TweetData;
  config: StoryConfig;
  canvasRef: React.RefObject<HTMLDivElement>;
}

const StoryCanvas: React.FC<StoryCanvasProps> = ({ tweet, config, canvasRef }) => {

  const getProxyUrl = (url: string, type: 'image' | 'video' | 'gif' = 'image') => {
    if (!url) return '';
    // Already proxied or local URLs - return as-is
    if (url.startsWith('blob:') || url.startsWith('data:') || url.includes('wsrv.nl')) return url;

    // Images: use wsrv.nl image proxy
    if (type === 'image') {
      return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=1000&fit=cover&output=png`;
    }

    // Videos/GIFs: return direct URL - video element can play cross-origin for display

    // Other video URLs: return as-is
    return url;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://picsum.photos/800/400?grayscale';
  };

  const getBackgroundStyle = () => {
    switch (config.backgroundType) {
      case 'solid': return { backgroundColor: config.backgroundValue };
      case 'gradient': return { background: config.backgroundValue };
      case 'image': return { backgroundImage: `url(${config.backgroundValue})`, backgroundSize: 'cover', backgroundPosition: 'center' };
      case 'blur':
        const bgImg = tweet.media[0]?.url || tweet.authorAvatarUrl;
        return {
          backgroundImage: `url(${getProxyUrl(bgImg)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      default: return { background: '#000' };
    }
  };

  const getCardStyle = () => {
    switch (config.cardTheme) {
      case 'light': return 'bg-white text-black border-gray-200';
      case 'dark': return 'bg-black text-white border-gray-800';
      case 'glass': return 'glass-card text-white border-white/20 shadow-2xl';
      default: return 'bg-black text-white';
    }
  };

  const isDarkOrGlass = config.cardTheme === 'dark' || config.cardTheme === 'glass';
  const borderColor = isDarkOrGlass ? 'border-white/10' : 'border-gray-200';
  const textColor = (config.cardTheme === 'light') ? 'text-black' : 'text-white';
  const subTextColor = (config.cardTheme === 'light') ? 'text-gray-500' : 'text-gray-400';
  const iconColor = (config.cardTheme === 'light') ? 'fill-black' : 'fill-white';

  const twitterFontStack = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

  const renderSingleMediaItem = (media: MediaItem, className: string) => {
    if (media.type === 'image') {
      return <img src={getProxyUrl(media.url, 'image')} alt="Media" className={`w-full h-full object-cover block ${className}`} crossOrigin="anonymous" onError={handleImageError} />;
    } else {
      // For videos/gifs - try to play video, fallback to thumbnail if blocked
      const thumbnailSrc = media.thumbnailUrl || media.url;
      return (
        <div className={`w-full h-full relative bg-black overflow-hidden ${className}`}>
          {/* Fallback thumbnail - behind video */}
          <img
            src={getProxyUrl(thumbnailSrc, 'image')}
            alt="Video thumbnail"
            className="w-full h-full object-cover block"
            style={{ position: 'absolute', inset: 0, zIndex: 1 }}
            crossOrigin="anonymous"
            onError={handleImageError}
          />
          {/* Video on top - plays through CORS proxy */}
          <video
            src={getProxyUrl(media.url, media.type)}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover block video-export-target"
            style={{ position: 'absolute', inset: 0, zIndex: 2 }}
            onError={(e) => {
              // Hide video on error, thumbnail will show through
              e.currentTarget.style.display = 'none';
            }}
          />
          {media.type === 'gif' && <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10" style={{ zIndex: 3 }}>GIF</div>}
        </div>
      );
    }
  };

  const renderMediaGrid = (mediaItems: MediaItem[], isQuote: boolean = false) => {
    if (!mediaItems || mediaItems.length === 0) return null;
    const marginClass = isQuote ? 'mt-2' : 'mt-3';
    const roundedClass = isQuote ? 'rounded-lg' : 'rounded-xl';
    const count = mediaItems.length;

    if (count === 1) {
      const item = mediaItems[0];
      return (
        <div className={`w-full overflow-hidden ${roundedClass} ${marginClass} border ${borderColor} relative z-10 block`}>
          {item.type === 'image' ? (
            <img src={getProxyUrl(item.url, 'image')} className="w-full h-auto max-h-[500px] object-cover block" crossOrigin="anonymous" onError={handleImageError} />
          ) : (
            <div className="w-full bg-black flex items-center justify-center relative" style={{ minHeight: '200px' }}>
              {/* Try video playback */}
              <video
                src={getProxyUrl(item.url, item.type)}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto max-h-[500px] object-contain block video-export-target"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              {/* Fallback thumbnail */}
              <img
                src={getProxyUrl(item.thumbnailUrl || item.url, 'image')}
                alt="Video thumbnail"
                className="w-full h-auto max-h-[500px] object-contain block"
                crossOrigin="anonymous"
                onError={handleImageError}
              />
              {item.type === 'gif' && <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 z-10">GIF</div>}
            </div>
          )}
        </div>
      );
    }

    let gridClass = count === 2 ? 'grid-cols-2' : 'grid-cols-2';
    return (
      <div className={`w-full aspect-[4/3] ${marginClass} ${roundedClass} overflow-hidden border ${borderColor} grid gap-0.5 relative z-10 bg-gray-100 ${gridClass}`}>
        {mediaItems.slice(0, 4).map((item, idx) => (
          <div key={idx} className={`relative overflow-hidden ${count === 3 && idx === 0 ? 'row-span-2' : ''}`}>
            {renderSingleMediaItem(item, "absolute inset-0")}
          </div>
        ))}
      </div>
    );
  };

  const hasAnyMetric = config.showLikes || config.showReplies || config.showReposts || config.showViews;

  return (
    <div className="w-full flex justify-center items-center py-4 md:py-8 overflow-visible">
      <div className="scale-[0.75] xs:scale-[0.85] sm:scale-90 md:scale-100 origin-center transition-transform duration-300">
        <div
          ref={canvasRef}
          id="story-canvas"
          className="relative overflow-hidden shadow-2xl flex items-center justify-center transition-all duration-300"
          style={{
            width: '400px',
            minHeight: '711px',
            height: 'auto',
            ...getBackgroundStyle(),
            fontFeatureSettings: '"tnum"'
          }}
        >
          {config.backgroundType === 'blur' && (
            <div
              className="absolute inset-0 backdrop-blur-3xl bg-black/30"
              style={{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}
            />
          )}

          <div className={`w-[90%] rounded-[1.5rem] p-6 border relative z-10 block shadow-2xl ${getCardStyle()}`} style={{ boxSizing: 'border-box', margin: '40px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', position: 'relative', zIndex: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src={getProxyUrl(tweet.authorAvatarUrl, 'image')}
                  alt="Avatar"
                  className={`border ${borderColor}`}
                  style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', borderRadius: '50%', objectFit: 'cover', display: 'block', flexShrink: 0 }}
                  crossOrigin="anonymous"
                  onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${tweet.authorName}`; }}
                />
                <div style={{ marginLeft: '10px' }}>
                  <div className={`font-bold ${textColor}`} style={{ fontSize: '14px', lineHeight: '18px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                    <span>{tweet.authorName}</span>
                    <Verified className="text-blue-400 fill-blue-400" style={{ width: '14px', height: '14px', marginLeft: '4px', flexShrink: 0 }} />
                  </div>
                  <div className={subTextColor} style={{ fontSize: '12px', lineHeight: '16px', whiteSpace: 'nowrap' }}>@{tweet.authorHandle}</div>
                </div>
              </div>
              <svg viewBox="0 0 24 24" className={iconColor} style={{ width: '20px', height: '20px', flexShrink: 0 }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
            </div>

            {config.showContent && <div className={`text-[15px] leading-[1.4] whitespace-pre-wrap mb-2.5 relative z-10 block ${textColor}`}>{tweet.content}</div>}

            {tweet.quotedTweet && (
              <div className={`mt-2.5 rounded-xl border ${borderColor} p-3 block overflow-hidden ${isDarkOrGlass ? 'bg-white/5' : 'bg-gray-50'}`}>
                <div className="flex items-center mb-1.5 relative z-10">
                  <img src={getProxyUrl(tweet.quotedTweet.authorAvatarUrl, 'image')} alt="Quote Avatar" className="w-4 h-4 rounded-full object-cover mr-1.5" crossOrigin="anonymous" />
                  <div className="flex items-center gap-1 text-[13px] font-bold min-w-0">
                    <span className={`truncate ${textColor}`}>{tweet.quotedTweet.authorName}</span>
                    <span className={`font-normal truncate ${subTextColor}`}>@{tweet.quotedTweet.authorHandle}</span>
                  </div>
                </div>
                {tweet.quotedTweet.content && <div className={`text-[14px] leading-[1.4] mb-1 block ${textColor}`}>{tweet.quotedTweet.content}</div>}
                {renderMediaGrid(tweet.quotedTweet.media, true)}
              </div>
            )}

            {!tweet.quotedTweet && renderMediaGrid(tweet.media)}
            {tweet.quotedTweet && tweet.media.length > 0 && renderMediaGrid(tweet.media)}

            <div className={`pt-3 mt-4 border-t ${borderColor} block`}>
              <div className={`text-[11px] mb-4 ${subTextColor} opacity-60 uppercase tracking-wide font-medium`}>{tweet.timestamp}</div>

              {hasAnyMetric && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-x-4">
                    {config.showReplies && (
                      <div className="flex items-center">
                        <MessageCircle className={`w-4 h-4 mr-1 ${subTextColor}`} />
                        <span className={`text-[13px] font-bold tabular-nums`} style={{ fontFamily: twitterFontStack }}>{tweet.metrics.replies || '0'}</span>
                      </div>
                    )}
                    {config.showReposts && (
                      <div className="flex items-center">
                        <Repeat2 className={`w-4 h-4 mr-1 ${subTextColor}`} />
                        <span className={`text-[13px] font-bold tabular-nums`} style={{ fontFamily: twitterFontStack }}>{tweet.metrics.reposts || '0'}</span>
                      </div>
                    )}
                    {config.showLikes && (
                      <div className="flex items-center">
                        <Heart className={`w-4 h-4 mr-1 ${subTextColor}`} />
                        <span className={`text-[13px] font-bold tabular-nums`} style={{ fontFamily: twitterFontStack }}>{tweet.metrics.likes || '0'}</span>
                      </div>
                    )}
                    {config.showViews && (
                      <div className="flex items-center">
                        <BarChart3 className={`w-4 h-4 mr-1 ${subTextColor}`} />
                        <span className={`text-[13px] font-bold tabular-nums`} style={{ fontFamily: twitterFontStack }}>{tweet.metrics.views || '0'}</span>
                      </div>
                    )}
                  </div>
                  <div className="opacity-40"><Share className={`w-4 h-4 ${subTextColor}`} /></div>
                </div>
              )}
            </div>
          </div>

          {config.showWatermark && <div className="absolute bottom-10 flex flex-col items-center opacity-60"><span className="text-[9px] uppercase tracking-[0.3em] font-extrabold text-white">X-to-Story</span></div>}
        </div>
      </div>
    </div>
  );
};

export default StoryCanvas;