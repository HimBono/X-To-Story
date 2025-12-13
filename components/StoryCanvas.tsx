import React from 'react';
import { TweetData, StoryConfig, MediaItem } from '../types';
import { Heart, MessageCircle, Repeat2, Share, Verified } from 'lucide-react';

interface StoryCanvasProps {
  tweet: TweetData;
  config: StoryConfig;
  canvasRef: React.RefObject<HTMLDivElement>;
}

const StoryCanvas: React.FC<StoryCanvasProps> = ({ tweet, config, canvasRef }) => {
  
  const getProxyUrl = (url: string) => {
      if (!url) return '';
      if (url.startsWith('data:') || url.includes('wsrv.nl')) return url;
      return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=200&h=200&fit=cover`;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://picsum.photos/800/400?grayscale';
  };

  const getBackgroundStyle = () => {
    switch (config.backgroundType) {
      case 'solid':
        return { backgroundColor: config.backgroundValue };
      case 'gradient':
        return { background: config.backgroundValue };
      case 'image':
        return { 
          backgroundImage: `url(${config.backgroundValue})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        };
      case 'blur':
         const bgImg = tweet.media[0]?.url || tweet.authorAvatarUrl;
        return { 
          backgroundImage: `url(${bgImg})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
        };
      default:
        return { background: '#000' };
    }
  };

  const getCardStyle = () => {
    switch (config.cardTheme) {
      case 'light':
        return 'bg-white text-black border-gray-200';
      case 'dark':
        return 'bg-black text-white border-gray-800';
      case 'glass':
        return 'bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl';
      default:
        return 'bg-black text-white';
    }
  };

  const isDarkOrGlass = config.cardTheme === 'dark' || config.cardTheme === 'glass';
  const borderColor = isDarkOrGlass ? 'border-white/10' : 'border-gray-200';
  
  // Logic to force black text if Glass theme is used on a White background
  const isWhiteBg = config.backgroundType === 'solid' && config.backgroundValue.toLowerCase() === '#ffffff';
  const forceBlackText = config.cardTheme === 'glass' && isWhiteBg;
  
  const textColor = (config.cardTheme === 'light' || forceBlackText) ? 'text-black' : 'text-white';
  const subTextColor = (config.cardTheme === 'light' || forceBlackText) ? 'text-gray-500' : 'text-gray-400';
  const iconColor = (config.cardTheme === 'light' || forceBlackText) ? 'fill-black' : 'fill-white';

  const renderSingleMediaItem = (media: MediaItem, className: string) => {
      if (media.type === 'image') {
          return (
             <img 
                src={media.url} 
                alt="Media" 
                className={`w-full h-full object-cover block ${className}`}
                crossOrigin="anonymous"
                onError={handleImageError}
            />
          );
      } else {
          return (
             <div className={`w-full h-full relative bg-black flex items-center justify-center overflow-hidden ${className}`}>
                <video 
                    src={media.url}
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover block"
                    onError={(e) => console.error("Video load error", e)}
                />
                {media.type === 'gif' && (
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 z-10">
                        GIF
                    </div>
                )}
             </div>
          );
      }
  };

  const renderMediaGrid = (mediaItems: MediaItem[], isQuote: boolean = false) => {
      if (!mediaItems || mediaItems.length === 0) return null;

      const marginClass = isQuote ? 'mt-2' : 'mt-3';
      const roundedClass = isQuote ? 'rounded-lg' : 'rounded-xl';
      const count = mediaItems.length;

      // Single Item
      if (count === 1) {
          const item = mediaItems[0];
          // Determine aspect ratio container or just render image
          // For simplicity we use standard block flow but with max height cap
          return (
            <div className={`w-full overflow-hidden ${roundedClass} ${marginClass} border ${borderColor} relative z-10 block`}>
               {item.type === 'image' ? (
                   <img 
                       src={item.url} 
                       className="w-full h-auto max-h-[500px] object-cover block"
                       crossOrigin="anonymous"
                       onError={handleImageError}
                   />
               ) : (
                    <div className="w-full bg-black flex items-center justify-center">
                        <video 
                            src={item.url}
                            autoPlay loop muted playsInline crossOrigin="anonymous"
                            className="w-full h-auto max-h-[500px] object-contain block"
                        />
                         {item.type === 'gif' && (
                            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 z-10">
                                GIF
                            </div>
                        )}
                    </div>
               )}
            </div>
          );
      }

      // Multi-Item Grid (Mosaic)
      // We force a specific aspect ratio container for the grid to look good
      // Standard 16:9 or 3:2 container usually works well for grids
      
      let gridClass = '';
      if (count === 2) gridClass = 'grid-cols-2';
      if (count === 3) gridClass = 'grid-cols-2'; // 3 is special handled below
      if (count === 4) gridClass = 'grid-cols-2 grid-rows-2';

      return (
          <div className={`w-full aspect-[4/3] ${marginClass} ${roundedClass} overflow-hidden border ${borderColor} grid gap-0.5 relative z-10 bg-gray-100 ${gridClass}`}>
              {mediaItems.slice(0, 4).map((item, idx) => {
                  let cellClass = '';
                  // Custom Logic for 3 items: 1st item takes full height left col
                  if (count === 3) {
                      if (idx === 0) cellClass = 'row-span-2';
                  }
                  return (
                      <div key={idx} className={`relative overflow-hidden ${cellClass}`}>
                          {renderSingleMediaItem(item, "absolute inset-0")}
                      </div>
                  );
              })}
          </div>
      );
  };

  return (
    <div className="w-full flex justify-center items-center py-8 overflow-hidden min-h-full">
      {/* 
        This wrapper applies a scale transform on mobile devices to ensure the 400px canvas 
        fits within narrow viewports (e.g. 320px-390px). 
        The 'scale-90' is arbitrary but safe for most modern phones. 
        'md:scale-100' resets it on desktop.
      */}
      <div className="scale-90 md:scale-100 origin-top md:origin-center transition-transform duration-300">
          <div 
            ref={canvasRef}
            id="story-canvas"
            className="relative overflow-hidden shadow-2xl flex items-center justify-center transition-all duration-300"
            style={{
              width: '400px', 
              height: '711px', 
              ...getBackgroundStyle(),
              transform: `scale(${config.scale})`,
              transformOrigin: 'center center'
            }}
          >
            {config.backgroundType === 'blur' && (
              <div className="absolute inset-0 backdrop-blur-3xl bg-black/30" />
            )}

            {/* The Main Tweet Card */}
            <div 
              className={`
                w-[90%] rounded-[1.5rem] p-6 border relative z-10 block shadow-2xl
                ${getCardStyle()}
              `}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-3 relative z-20">
                    <div className="flex items-center gap-2.5">
                        <img 
                            src={getProxyUrl(tweet.authorAvatarUrl)} 
                            alt="Avatar" 
                            className={`w-10 h-10 rounded-full object-cover border ${borderColor}`}
                            crossOrigin="anonymous"
                            onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${tweet.authorName}`; }}
                        />
                        <div className="flex flex-col">
                            <div className={`flex items-center gap-1 font-bold text-[14px] leading-tight ${textColor}`}>
                                {tweet.authorName}
                                <Verified className="w-3.5 h-3.5 text-blue-400 fill-blue-400 text-white" />
                            </div>
                            <div className={`text-[12px] ${subTextColor}`}>
                                @{tweet.authorHandle}
                            </div>
                        </div>
                    </div>
                    {/* X Logo */}
                    <svg viewBox="0 0 24 24" aria-hidden="true" className={`w-5 h-5 ${iconColor}`}>
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                </div>

                {/* Main Content */}
                {config.showContent && (
                    <div className={`text-[15px] leading-snug whitespace-pre-wrap mb-2.5 relative z-10 block ${textColor}`}>
                        {tweet.content}
                    </div>
                )}

                {/* Quoted Tweet */}
                {tweet.quotedTweet && (
                    <div className={`mt-2.5 rounded-xl border ${borderColor} p-3 block overflow-hidden ${isDarkOrGlass ? 'bg-white/5' : 'bg-gray-50'}`}>
                        {/* Quoted Header - Compact & Fix Truncation */}
                        <div className="flex items-center mb-1.5 relative z-10 max-w-full">
                            <img 
                                src={getProxyUrl(tweet.quotedTweet.authorAvatarUrl)} 
                                alt="Quote Avatar" 
                                className="w-4 h-4 rounded-full object-cover mr-1.5 flex-shrink-0"
                                crossOrigin="anonymous"
                            />
                            {/* Username container with leading-snug and min-w-0 to fix clipping */}
                            <div className="flex items-center gap-1 text-[13px] font-bold leading-snug min-w-0 flex-1 overflow-hidden">
                                <span className={`truncate ${textColor}`}>{tweet.quotedTweet.authorName}</span>
                                <span className={`font-normal truncate ${subTextColor}`}>@{tweet.quotedTweet.authorHandle}</span>
                            </div>
                            <span className={`flex-shrink-0 mx-1 text-[13px] ${subTextColor}`}>·</span>
                        </div>
                        
                        {/* Quoted Text */}
                        {tweet.quotedTweet.content && (
                            <div className={`text-[14px] leading-snug mb-1 block ${textColor}`}>
                                {tweet.quotedTweet.content}
                            </div>
                        )}

                        {/* Quoted Media */}
                        {renderMediaGrid(tweet.quotedTweet.media, true)}
                    </div>
                )}

                {/* Main Tweet Media (if not quoted) */}
                {!tweet.quotedTweet && renderMediaGrid(tweet.media)}
                
                {/* Fallback (if quoted but has own media - rare but happens) */}
                {tweet.quotedTweet && tweet.media.length > 0 && renderMediaGrid(tweet.media)}

                {/* Date & Metrics - Compact Footer */}
                <div className={`pt-3 mt-3 border-t ${borderColor} ${subTextColor} block`}>
                    <div className="text-[12px] mb-2 opacity-80">
                        {tweet.timestamp}
                    </div>
                    <div className={`flex items-center justify-between text-[13px] ${forceBlackText ? 'text-black/80' : 'text-gray-300'}`}>
                      <div className="flex gap-5">
                            <div className="flex items-center gap-1.5">
                                <Heart className="w-3.5 h-3.5" /> 
                                <span className="font-medium">{tweet.metrics.likes}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Repeat2 className="w-3.5 h-3.5" /> 
                                <span className="font-medium">{tweet.metrics.reposts}</span>
                            </div>
                      </div>
                      <div className="flex gap-3 opacity-80">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <Share className="w-3.5 h-3.5" />
                      </div>
                    </div>
                </div>
            </div>

            {/* Watermark (Optional) */}
            {config.showWatermark && (
                <div className="absolute bottom-12 flex flex-col items-center opacity-70 drop-shadow-lg">
                    <div className="flex items-center gap-1.5 text-white/90">
                        <span className="text-[9px] uppercase tracking-[0.2em] font-bold">X-to-Story</span>
                    </div>
                </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default StoryCanvas;