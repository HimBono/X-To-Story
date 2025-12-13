import React, { useState } from 'react';
import { TweetData, StoryConfig } from '../types';
import { Upload, X, Video, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';

interface ControlPanelProps {
  tweet: TweetData;
  setTweet: (t: TweetData) => void;
  config: StoryConfig;
  setConfig: (c: StoryConfig) => void;
  onDownload: () => void;
  onDownloadVideo: () => void;
  isDownloading: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  tweet, setTweet, config, setConfig, onDownload, onDownloadVideo, isDownloading 
}) => {
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'avatar' | 'media') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (field === 'avatar') {
        setTweet({ ...tweet, authorAvatarUrl: url });
      } else {
        // Replace existing media with single upload
        const type = file.type.startsWith('video') ? 'video' : 'image';
        setTweet({ ...tweet, media: [{ type, url }] });
      }
    }
  };

  const themes: Array<{id: StoryConfig['cardTheme'], label: string}> = [
      { id: 'dark', label: 'Dark' },
      { id: 'light', label: 'Light' },
      { id: 'glass', label: 'Glass' }
  ];

  const backgrounds: Array<{type: StoryConfig['backgroundType'], value: string, label: string}> = [
      { type: 'gradient', value: 'linear-gradient(to bottom right, #4f46e5, #06b6d4)', label: 'Indigo Cyan' },
      { type: 'gradient', value: 'linear-gradient(to bottom right, #ec4899, #8b5cf6)', label: 'Pink Purple' },
      { type: 'gradient', value: 'linear-gradient(to bottom right, #f59e0b, #ef4444)', label: 'Orange Red' },
      { type: 'solid', value: '#000000', label: 'Black' },
      { type: 'solid', value: '#ffffff', label: 'White' },
      { type: 'blur', value: '', label: 'Blur Media' },
  ];
  
  const hasMedia = tweet.media.length > 0 || (tweet.quotedTweet && tweet.quotedTweet.media.length > 0);

  return (
    <div className="w-full lg:w-[400px] lg:h-full h-auto bg-neutral-900 border-t lg:border-t-0 lg:border-l border-white/10 p-6 flex flex-col gap-8 shrink-0 lg:overflow-y-auto">
        
        {/* Actions */}
        <div className="flex flex-col gap-3">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Export</h3>
             <div className="flex gap-2">
                <button 
                    onClick={onDownload}
                    disabled={isDownloading}
                    className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                    {isDownloading ? (
                        <span className="text-sm">...</span>
                    ) : (
                        <>
                            <ImageIcon size={18} />
                            <span className="text-sm">Image</span>
                        </>
                    )}
                </button>
                
                <button 
                    onClick={onDownloadVideo}
                    disabled={!hasMedia || isDownloading}
                    className={`flex-1 font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2 border
                        ${hasMedia 
                            ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500' 
                            : 'bg-transparent border-neutral-700 text-neutral-500 cursor-not-allowed'}
                    `}
                    title={!hasMedia ? "No video/gif detected to export" : "Record 6s GIF of template"}
                >
                    {isDownloading ? (
                       <span className="text-sm animate-pulse">Rec...</span>
                    ) : (
                       <>
                        <Video size={18} />
                        <span className="text-sm">GIF (6s)</span>
                       </>
                    )}
                </button>
             </div>
             
             <p className="text-xs text-gray-500 text-center">
                GIF recording takes about 6-10 seconds to process.
                In Development expect bugs.
             </p>
        </div>

        {/* Style Editor */}
        <div className="flex flex-col gap-4">
             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Style</h3>
             
             {/* Content Toggle */}
             <div className="flex items-center justify-between py-1">
                <label className="text-sm text-gray-300">Show Text Content</label>
                <button 
                    onClick={() => setConfig({...config, showContent: !config.showContent})}
                    className={`w-10 h-6 rounded-full transition-colors relative ${config.showContent ? 'bg-blue-600' : 'bg-neutral-700'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${config.showContent ? 'left-5' : 'left-1'}`} />
                </button>
             </div>

             <div className="space-y-2">
                 <label className="text-xs text-gray-500">Card Theme</label>
                 <div className="grid grid-cols-3 gap-2">
                     {themes.map(t => (
                         <button
                            key={t.id}
                            onClick={() => setConfig({...config, cardTheme: t.id})}
                            className={`p-2 rounded-lg text-sm border transition-all ${config.cardTheme === t.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-neutral-800 border-neutral-700 text-gray-400 hover:bg-neutral-700'}`}
                         >
                             {t.label}
                         </button>
                     ))}
                 </div>
             </div>

             <div className="space-y-2">
                 <label className="text-xs text-gray-500">Background</label>
                 <div className="grid grid-cols-3 gap-2">
                     {backgrounds.map((bg, idx) => (
                         <button
                            key={idx}
                            onClick={() => setConfig({...config, backgroundType: bg.type, backgroundValue: bg.value})}
                            className={`h-10 rounded-lg border transition-all relative overflow-hidden ${config.backgroundValue === bg.value && config.backgroundType === bg.type ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-neutral-900' : 'border-white/10'}`}
                            style={{ background: bg.type === 'gradient' || bg.type === 'solid' ? bg.value : '#333' }}
                         >
                             {bg.type === 'blur' && <span className="text-[10px] text-white/70 font-medium">Blur</span>}
                             {bg.type === 'solid' && bg.value === '#ffffff' && <span className="text-[10px] text-black/50 font-medium">White</span>}
                         </button>
                     ))}
                 </div>
             </div>

             <div className="flex items-center justify-between">
                <label className="text-sm text-gray-300">Show Watermark</label>
                <button 
                    onClick={() => setConfig({...config, showWatermark: !config.showWatermark})}
                    className={`w-10 h-6 rounded-full transition-colors relative ${config.showWatermark ? 'bg-blue-600' : 'bg-neutral-700'}`}
                >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${config.showWatermark ? 'left-5' : 'left-1'}`} />
                </button>
             </div>
        </div>

        {/* Content Editor (Collapsed by default) */}
        <div className="border-t border-white/10 pt-6">
            <button 
                onClick={() => setIsContentExpanded(!isContentExpanded)}
                className="w-full flex items-center justify-between text-sm font-bold text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
            >
                <span>Advanced Customization</span>
                {isContentExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {isContentExpanded && (
                <div className="flex flex-col gap-4 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Tweet Text</label>
                        <textarea 
                            value={tweet.content}
                            onChange={(e) => setTweet({...tweet, content: e.target.value})}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 resize-none h-24"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500">Display Name</label>
                            <input 
                                type="text"
                                value={tweet.authorName}
                                onChange={(e) => setTweet({...tweet, authorName: e.target.value})}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500">Handle</label>
                            <input 
                                type="text"
                                value={tweet.authorHandle}
                                onChange={(e) => setTweet({...tweet, authorHandle: e.target.value})}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-gray-500">Upload Media (Fix/Override)</label>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="cursor-pointer bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg p-2 text-center text-xs text-gray-300 transition-colors">
                                Upload Avatar
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                            </label>
                            <label className="cursor-pointer bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg p-2 text-center text-xs text-gray-300 transition-colors">
                                Upload Media
                                <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleFileChange(e, 'media')} />
                            </label>
                        </div>
                        {tweet.media.length > 0 && (
                            <button 
                                onClick={() => setTweet({...tweet, media: []})}
                                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                            >
                                <X size={12} /> Remove Attachment
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default ControlPanel;