import React, { useState, useRef } from 'react';
import { INITIAL_TWEET_DATA, INITIAL_CONFIG, TweetData, StoryConfig } from './types';
import { analyzeTweetUrl } from './services/gemini';
import StoryCanvas from './components/StoryCanvas';
import ControlPanel from './components/ControlPanel';
import LandingPage from './components/LandingPage';
import { ArrowRight, Share2, X } from 'lucide-react';
// @ts-ignore
import domtoimage from 'dom-to-image';
// @ts-ignore
import html2canvas from 'html2canvas';
// @ts-ignore
import gifshot from 'gifshot';

export default function App() {
  const [showStudio, setShowStudio] = useState(false);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const [tweetData, setTweetData] = useState<TweetData>(INITIAL_TWEET_DATA);
  const [storyConfig, setStoryConfig] = useState<StoryConfig>(INITIAL_CONFIG);

  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    const twitterRegex = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/\d+/;
    if (!twitterRegex.test(url.trim())) { setError("Please enter a valid X (Twitter) post URL."); return; }
    setIsLoading(true);
    setError(null);
    try {
      const extractedData = await analyzeTweetUrl(url);
      setTweetData(prev => ({
        ...prev,
        ...extractedData,
        metrics: { ...prev.metrics, ...extractedData.metrics }
      }));
    } catch (err: any) { setError(err.message || "Something went wrong."); } finally { setIsLoading(false); }
  };

  /**
   * Patches active video frames onto the capture canvas.
   * Calculates logical offsets to ensure centering regardless of CSS scale.
   * Note: Videos may fail to render if they have CORS restrictions.
   */
  const patchVideoFrames = (ctx: CanvasRenderingContext2D, renderScale: number) => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;
    const videos = Array.from(container.querySelectorAll('.video-export-target')) as HTMLVideoElement[];

    videos.forEach((video, index) => {
      // Skip videos that haven't loaded or have no dimensions
      if (video.readyState < 2 || video.videoWidth === 0) {
        console.warn(`Video ${index} not ready for capture (readyState: ${video.readyState})`);
        return;
      }

      let left = 0;
      let top = 0;
      let curr: HTMLElement | null = video;

      // Calculate the position relative to the 400x711 container
      while (curr && curr !== container) {
        left += curr.offsetLeft;
        top += curr.offsetTop;
        curr = curr.offsetParent as HTMLElement;
      }

      // Draw the current video frame onto the canvas
      try {
        ctx.drawImage(
          video,
          left * renderScale,
          top * renderScale,
          video.offsetWidth * renderScale,
          video.offsetHeight * renderScale
        );
      } catch (e) {
        // CORS or tainted canvas error - video can play but not be captured
        console.warn(`Video ${index} could not be captured (likely CORS restriction):`, e);
      }
    });
  };

  const captureCurrentFrame = async (engine: 'dom' | 'html2', quality: number = 0.9) => {
    if (!canvasRef.current) return null;
    const width = 400; // Template width
    const height = 711; // Template height
    const scale = engine === 'dom' ? 2 : 1;

    try {
      if (engine === 'dom') {
        // High quality PNG capture
        const dataUrl = await domtoimage.toPng(canvasRef.current, {
          width: width * scale,
          height: height * scale,
          style: {
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: `${width}px`,
            height: `${height}px`
          },
          bgcolor: '#000000',
        });

        return await new Promise<string>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = width * scale;
            c.height = height * scale;
            const ctx = c.getContext('2d');
            if (!ctx) { resolve(dataUrl); return; }
            ctx.drawImage(img, 0, 0);
            patchVideoFrames(ctx, scale);
            resolve(c.toDataURL('image/png', quality));
          };
          img.src = dataUrl;
        });
      } else {
        // Fast capture for GIF frames
        const finalCanvas = await html2canvas(canvasRef.current, {
          scale: 1,
          backgroundColor: null,
          logging: false,
          useCORS: true,
          allowTaint: true,
          width: width,
          height: height,
          scrollX: 0,
          scrollY: 0,
          onclone: (clonedDoc: Document) => {
            const el = clonedDoc.getElementById('story-canvas');
            if (el) {
              // Critical: reset position and scale in the clone for accurate html2canvas logic
              el.style.transform = 'none';
              el.style.position = 'fixed';
              el.style.top = '0';
              el.style.left = '0';
              el.style.margin = '0';
              // Remove scaling parents
              let p = el.parentElement;
              while (p) {
                p.style.transform = 'none';
                p.style.margin = '0';
                p.style.padding = '0';
                p = p.parentElement;
              }
            }
          }
        });
        const ctx = finalCanvas.getContext('2d');
        if (ctx) patchVideoFrames(ctx, 1);
        return finalCanvas.toDataURL('image/jpeg', 0.6);
      }
    } catch (err) {
      return null;
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const dataUrl = await captureCurrentFrame('dom', 1.0);
      if (dataUrl) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `story-${tweetData.authorHandle}-${Date.now()}.png`;
        link.click();
      }
    } catch (err) { alert("Export failed."); } finally { setIsDownloading(false); }
  };

  const handleGenerateGif = async () => {
    if (!canvasRef.current) return;
    setIsDownloading(true);
    setProgress(0);
    try {
      const frames: string[] = [];
      const TOTAL_FRAMES = 40;
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const frameStart = Date.now();
        const frameData = await captureCurrentFrame('html2', 0.5);
        if (frameData) frames.push(frameData);
        setProgress(Math.round((i / TOTAL_FRAMES) * 100));

        const frameProcessingTime = Date.now() - frameStart;
        const waitTime = Math.max(0, 100 - frameProcessingTime);
        await new Promise(r => setTimeout(r, waitTime));
      }

      if (frames.length === 0) throw new Error("No frames captured");

      gifshot.createGIF({
        images: frames,
        gifWidth: 400,
        gifHeight: 711,
        interval: 0.1,
        numFrames: frames.length,
        sampleInterval: 10
      }, (obj: any) => {
        if (!obj.error) {
          const link = document.createElement('a');
          link.href = obj.image;
          link.download = `story-${tweetData.authorHandle}-${Date.now()}.gif`;
          link.click();
        }
        setIsDownloading(false); setProgress(0);
      });
    } catch (err) {
      setIsDownloading(false);
      setProgress(0);
    }
  };

  if (!showStudio) return <LandingPage onEnter={() => setShowStudio(true)} />;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Minimal Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setShowStudio(false)}
            className="flex items-center gap-2 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors"
          >
            <Share2 size={18} />
            <span className="font-bold text-sm tracking-tight">X-to-Story</span>
          </button>

          {/* URL Input - Desktop */}
          <form onSubmit={handleAnalyze} className="hidden md:flex items-center w-full max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Paste X link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-full py-2.5 px-5 text-sm focus:outline-none focus:border-blue-500 placeholder:text-neutral-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-full transition-all active:scale-90 hover:bg-blue-500 disabled:opacity-50"
            >
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight size={16} />}
            </button>
          </form>

          <div className="w-24" /> {/* Spacer for balance */}
        </div>

        {/* URL Input - Mobile */}
        <form onSubmit={handleAnalyze} className="md:hidden px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Paste X link here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-full py-2.5 px-5 text-sm focus:outline-none focus:border-blue-500 placeholder:text-neutral-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-full transition-all active:scale-90 hover:bg-blue-500 disabled:opacity-50"
            >
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight size={16} />}
            </button>
          </div>
        </form>
      </header>

      {/* Error Toast */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500 text-red-200 px-4 py-2 rounded-lg z-50 flex items-center gap-2 shadow-xl">
          {error}
          <button onClick={() => setError(null)} className="hover:bg-red-500/20 p-1 rounded"><X size={14} /></button>
        </div>
      )}

      {/* Download Overlay */}
      {isDownloading && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="w-full max-w-xs space-y-4">
            <div className="w-16 h-16 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <h4 className="font-bold text-xl">{progress > 0 ? `Capturing: ${progress}%` : 'Processing...'}</h4>
            <p className="text-sm text-gray-400">Please keep this tab open.</p>
            {progress > 0 && <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} /></div>}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">

          {/* Canvas Section */}
          <div className="w-full lg:w-auto flex flex-col items-center">
            <div className="bg-neutral-900/50 rounded-2xl p-4 border border-white/5">
              <StoryCanvas tweet={tweetData} config={storyConfig} canvasRef={canvasRef} />
            </div>
          </div>

          {/* Controls Section */}
          <div className="w-full lg:w-[340px] shrink-0">
            <ControlPanel
              tweet={tweetData}
              setTweet={setTweetData}
              config={storyConfig}
              setConfig={setStoryConfig}
              onDownload={handleDownload}
              onDownloadVideo={handleGenerateGif}
              isDownloading={isDownloading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}