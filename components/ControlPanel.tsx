import React, { useState } from 'react';
import { TweetData, StoryConfig } from '../types';
import { Upload, X, Video, Image as ImageIcon, ChevronDown, ChevronUp, Check } from 'lucide-react';

interface ControlPanelProps {
    tweet: TweetData;
    setTweet: (t: TweetData) => void;
    config: StoryConfig;
    setConfig: (c: StoryConfig) => void;
    onDownload: () => void;
    onDownloadVideo: () => void;
    isDownloading: boolean;
}

const Toggle: React.FC<{ label: string, active: boolean, onChange: (val: boolean) => void }> = ({ label, active, onChange }) => (
    <div className="flex items-center justify-between py-1.5">
        <label className="text-sm text-gray-300">{label}</label>
        <button
            onClick={() => onChange(!active)}
            className={`w-10 h-6 rounded-full transition-colors relative ${active ? 'bg-blue-600' : 'bg-neutral-700'}`}
        >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${active ? 'left-5' : 'left-1'}`} />
        </button>
    </div>
);

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
                const type = file.type.startsWith('video') ? 'video' : 'image';
                setTweet({ ...tweet, media: [{ type, url }] });
            }
        }
    };

    const themes: Array<{ id: StoryConfig['cardTheme'], label: string }> = [
        { id: 'dark', label: 'Dark' },
        { id: 'light', label: 'Light' },
        { id: 'glass', label: 'Glass' }
    ];

    const backgrounds: Array<{ type: StoryConfig['backgroundType'], value: string, label: string }> = [
        { type: 'gradient', value: 'linear-gradient(to bottom right, #4f46e5, #06b6d4)', label: 'Indigo Cyan' },
        { type: 'gradient', value: 'linear-gradient(to bottom right, #ec4899, #8b5cf6)', label: 'Pink Purple' },
        { type: 'gradient', value: 'linear-gradient(to bottom right, #f59e0b, #ef4444)', label: 'Orange Red' },
        { type: 'solid', value: '#000000', label: 'Black' },
        { type: 'solid', value: '#ffffff', label: 'White' },
        { type: 'blur', value: '', label: 'Blur Media' },
    ];

    const hasMotion = tweet.media.some(m => m.type === 'video' || m.type === 'gif');

    return (
        <div className="w-full bg-neutral-900 border border-white/10 rounded-2xl p-6 flex flex-col gap-6">

            {/* Actions */}
            <div className="flex flex-col gap-3">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Export</h3>
                <div className="grid grid-cols-1 gap-2">
                    <button
                        onClick={onDownload}
                        disabled={isDownloading}
                        className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg"
                    >
                        {isDownloading ? (
                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <ImageIcon size={20} />
                                <span>Download Image</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Global Styles */}
            <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Global Styles</h3>

                <div className="space-y-1">
                    <Toggle label="Show Watermark" active={config.showWatermark} onChange={(v) => setConfig({ ...config, showWatermark: v })} />
                </div>

                <div className="space-y-2 mt-4">
                    <label className="text-xs text-gray-500 font-bold uppercase">Card Theme</label>
                    <div className="grid grid-cols-3 gap-2">
                        {themes.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setConfig({ ...config, cardTheme: t.id })}
                                className={`p-2 rounded-lg text-sm border transition-all ${config.cardTheme === t.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-neutral-800 border-neutral-700 text-gray-400 hover:bg-neutral-700'}`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs text-gray-500 font-bold uppercase">Background</label>
                    <div className="grid grid-cols-3 gap-2">
                        {backgrounds.map((bg, idx) => (
                            <button
                                key={idx}
                                onClick={() => setConfig({ ...config, backgroundType: bg.type, backgroundValue: bg.value })}
                                className={`h-10 rounded-lg border transition-all relative overflow-hidden flex items-center justify-center ${config.backgroundValue === bg.value && config.backgroundType === bg.type ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-neutral-900' : 'border-white/10'}`}
                                style={{ background: bg.type === 'gradient' || bg.type === 'solid' ? bg.value : '#333' }}
                            >
                                {config.backgroundValue === bg.value && config.backgroundType === bg.type && <Check size={14} className={bg.value === '#ffffff' ? 'text-black' : 'text-white'} />}
                                {bg.type === 'blur' && <span className="text-[10px] text-white/70 font-medium absolute">Blur</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Visibility & Metadata */}
            <div className="border-t border-white/10 pt-6">
                <button
                    onClick={() => setIsContentExpanded(!isContentExpanded)}
                    className="w-full flex items-center justify-between text-sm font-bold text-gray-400 uppercase tracking-wider hover:text-white transition-colors"
                >
                    <span>Edit Metadata & Visibility</span>
                    {isContentExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {isContentExpanded && (
                    <div className="flex flex-col gap-5 mt-4 animate-in fade-in slide-in-from-top-2 duration-200 pb-4">
                        {/* Content text remains editable as it is essential for manual fixes */}
                        <div className="space-y-2">
                            <Toggle label="Show Text Content" active={config.showContent} onChange={(v) => setConfig({ ...config, showContent: v })} />
                            {config.showContent && (
                                <textarea
                                    value={tweet.content}
                                    onChange={(e) => setTweet({ ...tweet, content: e.target.value })}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 resize-none h-24 mt-2"
                                    placeholder="Edit tweet content..."
                                />
                            )}
                        </div>

                        {/* Metrics are now exclusively toggle-controlled as requested */}
                        <div className="space-y-2">
                            <label className="text-xs text-gray-500 font-bold uppercase tracking-widest">Metric Visibility</label>
                            <div className="grid grid-cols-1 gap-1 border border-white/5 rounded-xl p-3 bg-white/[0.02]">
                                <Toggle label="Show Likes" active={config.showLikes} onChange={(v) => setConfig({ ...config, showLikes: v })} />
                                <Toggle label="Show Replies" active={config.showReplies} onChange={(v) => setConfig({ ...config, showReplies: v })} />
                                <Toggle label="Show Reposts" active={config.showReposts} onChange={(v) => setConfig({ ...config, showReposts: v })} />
                                <Toggle label="Show Views" active={config.showViews} onChange={(v) => setConfig({ ...config, showViews: v })} />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="text-xs text-gray-500 font-bold uppercase">Override Media Assets</label>
                            <div className="grid grid-cols-2 gap-2">
                                <label className="cursor-pointer bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg p-2 text-center text-[10px] text-gray-400 font-bold uppercase transition-colors">
                                    User Avatar
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                                </label>
                                <label className="cursor-pointer bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg p-2 text-center text-[10px] text-gray-400 font-bold uppercase transition-colors">
                                    Post Media
                                    <input type="file" className="hidden" accept="image/*,video/*" onChange={(e) => handleFileChange(e, 'media')} />
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ControlPanel;