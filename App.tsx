import React, { useState, useRef } from 'react';
import { INITIAL_TWEET_DATA, INITIAL_CONFIG, TweetData, StoryConfig } from './types';
import { analyzeTweetUrl } from './services/gemini';
import StoryCanvas from './components/StoryCanvas';
import ControlPanel from './components/ControlPanel';
import LandingPage from './components/LandingPage';
import { ArrowRight, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
// @ts-ignore
import gifshot from 'gifshot';

export default function App() {
  // Navigation State
  const [showStudio, setShowStudio] = useState(false);

  // App Logic State
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0); // For GIF progress
  
  const [tweetData, setTweetData] = useState<TweetData>(INITIAL_TWEET_DATA);
  const [storyConfig, setStoryConfig] = useState<StoryConfig>(INITIAL_CONFIG);
  
  const [isDownloading, setIsDownloading] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    // Strict validation for X/Twitter URLs
    const twitterRegex = /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/\d+/;
    if (!twitterRegex.test(url.trim())) {
        setError("Please enter a valid X (Twitter) post URL.");
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const extractedData = await analyzeTweetUrl(url);
      setTweetData(prev => ({
        ...prev,
        ...extractedData,
        metrics: extractedData.metrics || prev.metrics
      }));
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const prepareCanvasForCapture = async (action: () => Promise<void>) => {
      if (!canvasRef.current) return;
      
      // Temporarily remove the user-defined scale (zoom) transform
      // Note: This does NOT remove parent CSS transforms (like the mobile scale-90),
      // so we must handle that in coordinate calculations.
      const originalTransform = canvasRef.current.style.transform;
      canvasRef.current.style.transform = 'none';
      
      // Allow DOM to update
      await new Promise(r => setTimeout(r, 50));
      
      try {
          await action();
      } finally {
          if (canvasRef.current) {
              canvasRef.current.style.transform = originalTransform;
          }
      }
  };

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    setIsDownloading(true);
    
    await prepareCanvasForCapture(async () => {
        if (!canvasRef.current) return;
        
        try {
            const scale = 2.7;

            const canvas = await html2canvas(canvasRef.current, {
                useCORS: true,
                scale: scale,
                backgroundColor: null, 
                allowTaint: true,
                logging: false,
                width: 400, 
                height: 711,
                // Critical for mobile: simulate a desktop viewport to prevent text reflow/overlap
                windowWidth: 1280, 
                windowHeight: 720
            });

            const image = canvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.href = image;
            link.download = `story-${tweetData.authorHandle}-${Date.now()}.png`;
            link.click();
        } catch (err) {
            console.error("Export failed", err);
            alert("Could not export image.");
        }
    });
    
    setIsDownloading(false);
  };

  const handleGenerateGif = async () => {
    if (!canvasRef.current) return;
    const videoElements = Array.from(canvasRef.current.querySelectorAll('video'));
    
    // If no videos, fallback to static image
    if (videoElements.length === 0) {
        handleDownload();
        return;
    }

    setIsDownloading(true);
    setProgress(0);

    await prepareCanvasForCapture(async () => {
        if (!canvasRef.current) return;
        
        try {
            // Target output dimensions (High Quality)
            const TARGET_WIDTH = 720;
            const TARGET_HEIGHT = 1280;
            
            // The canvas is CSS-sized to 400px width.
            // We want to scale everything up to TARGET_WIDTH (720px).
            // exportScaleFactor is the multiplier from "CSS Pixels (400px)" to "Output Pixels (720px)".
            const exportScaleFactor = TARGET_WIDTH / 400; // 1.8

            // 1. Calculate Coordinate Normalization Factor
            // The canvas might be visually scaled (e.g. 0.9 on mobile). 
            // We need to convert getBoundingClientRect() (Screen Pixels) back to CSS Pixels (400px base).
            const containerRect = canvasRef.current.getBoundingClientRect();
            // If the container is 360px wide on screen but 400px in CSS, factor is 400/360 = 1.11
            const screenToCssFactor = 400 / containerRect.width;

            // 2. Map Video Geometries
            // We do this BEFORE hiding them.
            const videoGeometries = videoElements.map(videoEl => {
                const videoRect = videoEl.getBoundingClientRect();
                
                // Calculate relative position in Screen Pixels
                const relX_Screen = videoRect.left - containerRect.left;
                const relY_Screen = videoRect.top - containerRect.top;

                // Convert to CSS Pixels (400px base)
                const x_Css = relX_Screen * screenToCssFactor;
                const y_Css = relY_Screen * screenToCssFactor;
                const w_Css = videoRect.width * screenToCssFactor;
                const h_Css = videoRect.height * screenToCssFactor;

                return {
                    el: videoEl,
                    // Convert CSS Pixels to Output Pixels (720px base)
                    x: x_Css * exportScaleFactor,
                    y: y_Css * exportScaleFactor,
                    w: w_Css * exportScaleFactor,
                    h: h_Css * exportScaleFactor
                };
            });

            // 3. Capture the static background (template)
            // Use visibility: hidden to ensure html2canvas captures "empty holes" where videos are
            // This prevents "doubling" where a frozen frame might be captured
            const prevVisibilities = videoElements.map(v => v.style.visibility);
            videoElements.forEach(v => v.style.visibility = 'hidden');
            
            const baseCanvas = await html2canvas(canvasRef.current, {
                useCORS: true,
                scale: exportScaleFactor, // Directly render at target resolution
                backgroundColor: null,
                logging: false,
                width: 400,
                height: 711,
                windowWidth: 1280 // Enforce desktop layout
            });
            
            // Restore visibility
            videoElements.forEach((v, i) => v.style.visibility = prevVisibilities[i]);

            // 4. Record Frames
            const frames: string[] = [];
            const FPS = 10;
            const DURATION = 5; // 5 seconds is usually enough for a story loop
            const TOTAL_FRAMES = FPS * DURATION;
            
            const compositeCanvas = document.createElement('canvas');
            compositeCanvas.width = TARGET_WIDTH;
            compositeCanvas.height = TARGET_HEIGHT;
            const ctx = compositeCanvas.getContext('2d');
            
            if (!ctx) throw new Error("Could not create context");
            
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // Ensure videos are playing for capture
            for (const v of videoElements) {
                // Mute during capture to allow autoplay policies
                v.muted = true; 
                if (v.paused) {
                    try { await v.play(); } catch (e) { console.warn("Video play failed", e); }
                }
            }

            let frameCount = 0;
            
            await new Promise<void>((resolve) => {
                const captureInterval = setInterval(() => {
                    if (frameCount >= TOTAL_FRAMES) {
                        clearInterval(captureInterval);
                        resolve();
                        return;
                    }

                    // Clear and Draw base template
                    ctx.clearRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
                    ctx.drawImage(baseCanvas, 0, 0);
                    
                    // Draw all video frames on top
                    videoGeometries.forEach(geo => {
                        try {
                             ctx.drawImage(
                                geo.el, 
                                geo.x, 
                                geo.y, 
                                geo.w, 
                                geo.h
                            );
                        } catch (e) {
                             // Ignore draw errors
                        }
                    });

                    frames.push(compositeCanvas.toDataURL('image/jpeg', 0.8));
                    
                    frameCount++;
                    setProgress(Math.round((frameCount / TOTAL_FRAMES) * 80)); // Fill up to 80%
                }, 1000 / FPS);
            });

            // 5. Compile GIF
            await new Promise<void>((resolve) => {
                 gifshot.createGIF({
                    images: frames,
                    gifWidth: TARGET_WIDTH / 2, // 360px width for GIF (optimization)
                    gifHeight: TARGET_HEIGHT / 2, // 640px height
                    interval: 1 / FPS,
                    numFrames: TOTAL_FRAMES,
                    sampleInterval: 10, 
                    frameDuration: 1, 
                 }, (obj: any) => {
                    if (!obj.error) {
                        const image = obj.image;
                        const link = document.createElement('a');
                        link.href = image;
                        link.download = `story-gif-${tweetData.authorHandle}-${Date.now()}.gif`;
                        link.click();
                        setProgress(100);
                    } else {
                        console.error("GIF generation error", obj.errorMsg);
                        alert("Could not generate GIF.");
                    }
                    resolve();
                 });
            });

        } catch (err) {
            console.error("GIF failed", err);
            alert("GIF generation failed. Please try downloading as Image instead.");
        }
    });

    setIsDownloading(false);
    setProgress(0);
  };

  if (!showStudio) {
      return <LandingPage onEnter={() => setShowStudio(true)} />;
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-black text-white overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-neutral-900/50 backdrop-blur-md z-20 shrink-0">
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setShowStudio(false)} 
                className="hover:bg-white/10 p-2 rounded-lg transition-colors"
                title="Back to Home"
            >
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-lg opacity-60 group-hover:opacity-100 transition duration-500 blur-[2px]"></div>
                    <div className="relative w-8 h-8 bg-black rounded-lg flex items-center justify-center border border-white/10">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                        </svg>
                    </div>
                </div>
            </button>
            <h1 className="font-bold text-lg tracking-tight text-white/90">
                X-to-Story <span className="hidden sm:inline text-xs font-normal text-gray-500 ml-2 border border-gray-700 px-1.5 py-0.5 rounded">Studio</span>
            </h1>
        </div>

        <form onSubmit={handleAnalyze} className="hidden md:flex items-center gap-2 w-[500px] relative group">
            <input 
                type="text" 
                placeholder="Paste Tweet URL (e.g. https://x.com/...)" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-full py-2.5 pl-5 pr-12 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-500"
            />
            <button 
                type="submit"
                disabled={isLoading || !url}
                className="absolute right-1.5 top-1.5 p-1.5 bg-blue-600 rounded-full hover:bg-blue-500 disabled:bg-neutral-600 transition-colors"
            >
                {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <ArrowRight size={16} />
                )}
            </button>
        </form>

        <a 
          href="https://github.com/HimBono" 
          target="_blank"
          rel="noreferrer"
          className="text-xs text-neutral-500 hover:text-white transition-colors"
        >
          Built for the Community
        </a>
      </header>
      
      {/* Mobile Input */}
      <div className="md:hidden p-4 border-b border-white/10 bg-neutral-900 shrink-0">
         <form onSubmit={handleAnalyze} className="flex gap-2">
            <input 
                type="text" 
                placeholder="Paste X post link..." 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-blue-500"
            />
            <button 
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white p-2 rounded-lg"
            >
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight size={20} />}
            </button>
         </form>
      </div>

      {/* Main Area */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden relative bg-neutral-950">
        
        {/* Error Toast */}
        {error && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2 z-50 backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-top-2 w-[90%] md:w-auto">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
                <button onClick={() => setError(null)} className="ml-2 hover:text-white"><span className="sr-only">Close</span>×</button>
            </div>
        )}

        {/* Canvas Area */}
        <div className="w-full lg:flex-1 lg:h-full relative flex flex-col items-center justify-start lg:justify-center py-8 lg:overflow-y-auto shrink-0 min-h-[500px] lg:min-h-0">
             <StoryCanvas 
                tweet={tweetData}
                config={storyConfig}
                canvasRef={canvasRef}
             />
        </div>

        {/* Sidebar Controls */}
        <ControlPanel 
            tweet={tweetData} 
            setTweet={setTweetData}
            config={storyConfig}
            setConfig={setStoryConfig}
            onDownload={handleDownload}
            onDownloadVideo={handleGenerateGif}
            isDownloading={isDownloading}
        />
      </main>
    </div>
  );
}