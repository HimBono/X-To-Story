import React from 'react';
import { ArrowRight, Share2, Smartphone, Download, Palette, HelpCircle, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-purple-500/30">
      
      {/* Minimal Header */}
      <header className="px-6 h-20 flex items-center justify-between max-w-5xl mx-auto w-full z-10">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Share2 className="text-white" size={20} />
          X-to-Story
        </div>
        <button 
            onClick={onEnter}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Launch App
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start pt-20 px-6 text-center max-w-4xl mx-auto pb-16">
        
        {/* Main Value Prop */}
        <div className="mb-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-medium mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Fixing the Android Sharing Bug
           </span>
           <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Share X posts to <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045]">
                Instagram
              </span>
           </h1>
           <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
              Did the "Share to Instagram Stories" button disappear from X? We fixed it. Generate clean, high-quality templates with video & GIF support.
           </p>
        </div>

        {/* Action */}
        <button 
          onClick={onEnter}
          className="group bg-white text-black px-8 py-4 rounded-full font-bold text-base md:text-lg hover:bg-gray-200 transition-all active:scale-95 flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] relative z-20"
        >
          Open Studio
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>

        {/* How it works */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full border-t border-white/10 pt-12">
            <div className="space-y-2">
               <div className="flex items-center gap-2 text-white font-medium">
                  <Smartphone size={18} className="text-blue-400" />
                  <span>1. Paste Link</span>
               </div>
               <p className="text-sm text-gray-500 leading-relaxed">Copy the link from any post on X (Twitter) and paste it into our studio.</p>
            </div>
            <div className="space-y-2">
               <div className="flex items-center gap-2 text-white font-medium">
                  <Palette size={18} className="text-green-400" />
                  <span>2. Customize</span>
               </div>
               <p className="text-sm text-gray-500 leading-relaxed">Choose your background, theme, and enable dark mode or glassmorphism.</p>
            </div>
             <div className="space-y-2">
               <div className="flex items-center gap-2 text-white font-medium">
                  <Download size={18} className="text-purple-400" />
                  <span>3. Export</span>
               </div>
               <p className="text-sm text-gray-500 leading-relaxed">Download as a high-res Image or a GIF if the tweet has motion.</p>
            </div>
        </div>

        {/* SEO Content / FAQ Section */}
        <div className="mt-24 w-full text-left max-w-3xl mx-auto space-y-12 border-t border-white/10 pt-16">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <HelpCircle className="text-gray-400" size={24} />
                    Why can't I share Tweets to Instagram Stories?
                </h2>
                <p className="text-gray-400 leading-relaxed">
                    Recently, X (formerly Twitter) removed the direct sharing integration with Instagram Stories, particularly impacting Android users. This change has made it difficult to share text posts, memes, and videos directly to your story without taking messy screenshots.
                </p>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="text-gray-400" size={24} />
                    The Better Way to Share
                </h2>
                <p className="text-gray-400 leading-relaxed">
                    X-to-Story isn't just a screenshot tool. It recreates the tweet using high-quality rendering, allowing you to:
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-500 text-sm">
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full"/> Export high-quality PNGs without pixelation</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-purple-500 rounded-full"/> Include GIFs and Videos in your export</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-green-500 rounded-full"/> Customize backgrounds (Gradients, Solid, Blur)</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full"/> Remove clutter and focus on the content</li>
                </ul>
            </div>
        </div>

      </main>
      
      <footer className="py-7 text-center border-t border-white/5 flex flex-col items-center gap-4">
        <a 
          href="https://buymeacoffee.com/himbono" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:scale-105 transition-transform"
        >
            <img 
              src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" 
              alt="Buy Me A Coffee" 
              className="h-[50px] w-auto"
            />
        </a>
        <p className="text-xs text-gray-600">Not affiliated with X Corp or Meta</p>
      </footer>
    </div>
  );
};

export default LandingPage;