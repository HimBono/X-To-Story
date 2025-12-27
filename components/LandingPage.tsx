import React, { useState } from 'react';
import { ArrowRight, Share2, Smartphone, Download, Palette, Sparkles, Zap, ChevronDown, ChevronUp } from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => (
  <div
    className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
  >
    <button
      onClick={onClick}
      className="w-full px-6 py-5 flex items-center justify-between text-left"
    >
      <span className="font-medium text-white">{question}</span>
      {isOpen ? (
        <ChevronUp size={20} className="text-gray-400 shrink-0" />
      ) : (
        <ChevronDown size={20} className="text-gray-400 shrink-0" />
      )}
    </button>
    <div className={`grid transition-all duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
      <div className="overflow-hidden">
        <p className="px-6 pb-5 text-gray-400 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);

  const faqs = [
    {
      question: "Why can't I share Tweets to Instagram Stories?",
      answer: "Recently, X (formerly Twitter) removed the direct sharing integration with Instagram Stories, particularly impacting Android users. This change has made it difficult to share text posts, memes, and videos directly to your story without taking messy screenshots."
    },
    {
      question: "What formats can I export?",
      answer: "You can export your stories as high-quality PNG images that are perfectly sized for Instagram Stories. The quality is crystal clear with no pixelation."
    },
    {
      question: "Is there a limit to how many posts I can convert?",
      answer: "No limits at all. X-to-Story is completely free to use with unlimited conversions. Use it as much as you need."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30 overflow-x-hidden">

      {/* Animated Aurora Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-neutral-950" />

        {/* Aurora layers */}
        <div className="absolute top-0 left-1/4 w-[800px] h-[600px] bg-gradient-to-br from-purple-600/20 via-blue-600/10 to-transparent rounded-full blur-[120px] animate-aurora-1" />
        <div className="absolute top-1/4 right-0 w-[600px] h-[500px] bg-gradient-to-bl from-pink-500/15 via-purple-600/10 to-transparent rounded-full blur-[100px] animate-aurora-2" />
        <div className="absolute bottom-0 left-0 w-[700px] h-[400px] bg-gradient-to-tr from-blue-600/15 via-cyan-500/10 to-transparent rounded-full blur-[120px] animate-aurora-3" />

        {/* Floating orbs */}
        <div className="absolute top-[20%] left-[15%] w-3 h-3 bg-blue-400/60 rounded-full blur-[2px] animate-float-slow" />
        <div className="absolute top-[35%] right-[20%] w-2 h-2 bg-purple-400/60 rounded-full blur-[1px] animate-float-medium" />
        <div className="absolute top-[60%] left-[40%] w-4 h-4 bg-pink-400/40 rounded-full blur-[3px] animate-float-fast" />
        <div className="absolute top-[75%] right-[35%] w-2 h-2 bg-cyan-400/50 rounded-full blur-[1px] animate-float-slow" />
        <div className="absolute top-[15%] right-[40%] w-3 h-3 bg-indigo-400/50 rounded-full blur-[2px] animate-float-medium" />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">

        {/* Hero Section */}
        <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
          <div className="max-w-4xl mx-auto text-center space-y-6">

            {/* Logo */}
            <div className="flex items-center justify-center gap-2 mb-2 animate-fade-in-up">
              <Share2 className="text-white" size={22} />
              <span className="font-bold text-lg tracking-tight">X-to-Story</span>
            </div>

            {/* Headline */}
            <h1 className="headline-font text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.15] animate-fade-in-up animation-delay-200">
              Share X posts to{' '}
              <span className="relative inline-block">
                <span className="instagram-font text-transparent bg-clip-text bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] animate-gradient-x">
                  Instagram
                </span>
                <span className="absolute -inset-1 bg-gradient-to-r from-[#833AB4]/20 via-[#FD1D1D]/20 to-[#FCB045]/20 blur-xl -z-10" />
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-xl mx-auto leading-relaxed animate-fade-in-up animation-delay-300 px-4">
              Did the "Share to Instagram Stories" button disappear? We fixed it.
              Generate stunning, high-quality templates instantly.
            </p>

            {/* CTA Button with Wave Effect */}
            <div className="pt-2 animate-fade-in-up animation-delay-400">
              <button
                onClick={onEnter}
                className="wave-button group relative inline-flex items-center gap-2.5 bg-white text-black px-6 py-3 sm:px-8 sm:py-3.5 rounded-full font-bold text-sm sm:text-base overflow-hidden"
              >
                {/* Wave layers */}
                <span className="wave-layer wave-1"></span>
                <span className="wave-layer wave-2"></span>
                <span className="wave-layer wave-3"></span>

                {/* Button content */}
                <span className="relative z-10 flex items-center gap-3">
                  Open Studio
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-500" />
                </span>
              </button>
            </div>

            {/* Trust indicators */}
            <p className="text-xs sm:text-sm text-gray-500 animate-fade-in-up animation-delay-500">
              Free to use • No sign-up required • Works on any device
            </p>
          </div>
        </main>

        {/* Features Section */}
        <section className="py-12 sm:py-16 px-6">
          <div className="max-w-4xl mx-auto">

            {/* Section header */}
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3">
                Everything you need to share
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto text-xs sm:text-sm">
                A complete toolkit for transforming your X posts into Instagram-ready stories
              </p>
            </div>

            {/* Feature cards grid - 3 cards now */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Feature 1 */}
              <div className="group relative p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-500">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="text-blue-400" size={20} />
                  </div>
                  <h3 className="font-semibold text-base mb-1.5">Instant Convert</h3>
                  <p className="text-xs text-gray-400">Paste any X link and get a beautiful template in seconds</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-500">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Palette className="text-pink-400" size={20} />
                  </div>
                  <h3 className="font-semibold text-base mb-1.5">Custom Themes</h3>
                  <p className="text-xs text-gray-400">Gradients, blur, dark mode, and more styling options</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-500 sm:col-span-2 lg:col-span-1">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="text-green-400" size={20} />
                  </div>
                  <h3 className="font-semibold text-base mb-1.5">High Quality</h3>
                  <p className="text-xs text-gray-400">Crystal clear exports, no pixelation or compression</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 sm:py-16 px-6 relative">
          {/* Background accent */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent pointer-events-none" />

          <div className="max-w-4xl mx-auto relative">

            {/* Section header */}
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3">
                Three simple steps
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">
                From X post to Instagram Story in under a minute
              </p>
            </div>

            {/* Steps */}
            <div className="grid md:grid-cols-3 gap-8 md:gap-4">

              {/* Step 1 */}
              <div className="relative group">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Smartphone className="text-blue-400" size={22} />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center">1</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1.5">Paste Link</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Copy the link from any post on X and paste it into our studio
                  </p>
                </div>
                {/* Connector line */}
                <div className="hidden md:block absolute top-8 sm:top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-blue-500/50 to-purple-500/50" />
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Palette className="text-purple-400" size={22} />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-purple-500 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center">2</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1.5">Customize</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Choose your background, theme, and enable dark mode or glassmorphism
                  </p>
                </div>
                {/* Connector line */}
                <div className="hidden md:block absolute top-8 sm:top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-purple-500/50 to-pink-500/50" />
              </div>

              {/* Step 3 */}
              <div className="group">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/30 mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Download className="text-pink-400" size={22} />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-pink-500 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center">3</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1.5">Export</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Download as a high-resolution image ready for Instagram
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 sm:py-16 px-6">
          <div className="max-w-xl mx-auto">

            {/* Section header */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3">
                Questions? Answers.
              </h2>
            </div>

            {/* FAQ items */}
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <FAQItem
                  key={index}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openFAQ === index}
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-12 sm:py-16 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900/10 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-2xl mx-auto text-center relative">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">
              Ready to start sharing?
            </h2>
            <p className="text-gray-400 mb-6 text-sm sm:text-base">
              Join thousands of creators who use X-to-Story every day
            </p>
            <button
              onClick={onEnter}
              className="wave-button-gradient group relative inline-flex items-center gap-2.5 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white px-6 py-3 sm:px-8 sm:py-3.5 rounded-full font-bold text-sm sm:text-base overflow-hidden shadow-xl shadow-purple-500/20"
            >
              {/* Wave layers for gradient button */}
              <span className="wave-layer-dark wave-1"></span>
              <span className="wave-layer-dark wave-2"></span>

              <span className="relative z-10 flex items-center gap-2.5">
                Open Studio — It's Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-500" />
              </span>
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 px-6 border-t border-white/5">
          <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">

            {/* Buy me a coffee */}
            <a
              href="https://buymeacoffee.com/himbono"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-105 transition-transform duration-300"
            >
              <img
                src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                alt="Buy Me A Coffee"
                className="h-[50px] w-auto"
              />
            </a>

            {/* Logo and disclaimer */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-gray-500">
                <Share2 size={16} />
                <span className="text-sm font-medium">X-to-Story</span>
              </div>
              <p className="text-xs text-gray-600">Not affiliated with X Corp or Meta</p>
            </div>
          </div>
        </footer>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        /* Unique display font for headline - Syne is modern and techy, matching X aesthetics */
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Pacifico&display=swap');
        
        .headline-font {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
        }
        
        .instagram-font {
          font-family: 'Pacifico', cursive;
          font-weight: 400;
        }
        
        /* Aurora animations */
        @keyframes aurora-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.3; }
          33% { transform: translate(30px, -30px) rotate(5deg); opacity: 0.5; }
          66% { transform: translate(-20px, 20px) rotate(-5deg); opacity: 0.4; }
        }
        
        @keyframes aurora-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.25; }
          33% { transform: translate(-40px, 20px) rotate(-3deg); opacity: 0.4; }
          66% { transform: translate(30px, -40px) rotate(3deg); opacity: 0.3; }
        }
        
        @keyframes aurora-3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.2; }
          50% { transform: translate(50px, -20px) rotate(5deg); opacity: 0.35; }
        }
        
        /* Floating orb animations */
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        /* Gradient text animation */
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        /* Fade in up animation */
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Wave animation for button */
        @keyframes wave {
          0% {
            transform: translateX(-100%) rotate(0deg);
          }
          50% {
            transform: translateX(0%) rotate(180deg);
          }
          100% {
            transform: translateX(100%) rotate(360deg);
          }
        }
        
        @keyframes wave-gentle {
          0%, 100% {
            transform: translateY(100%) scale(1.5);
            border-radius: 40%;
          }
          50% {
            transform: translateY(60%) scale(1.8);
            border-radius: 45%;
          }
        }
        
        /* Animation classes */
        .animate-aurora-1 { animation: aurora-1 20s ease-in-out infinite; }
        .animate-aurora-2 { animation: aurora-2 25s ease-in-out infinite; }
        .animate-aurora-3 { animation: aurora-3 30s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 4s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 3s ease-in-out infinite; }
        .animate-gradient-x { 
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite; 
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .animation-delay-100 { animation-delay: 0.1s; opacity: 0; }
        .animation-delay-200 { animation-delay: 0.2s; opacity: 0; }
        .animation-delay-300 { animation-delay: 0.3s; opacity: 0; }
        .animation-delay-400 { animation-delay: 0.4s; opacity: 0; }
        .animation-delay-500 { animation-delay: 0.5s; opacity: 0; }
        
        /* Wave button styles */
        .wave-button {
          position: relative;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
        }
        
        .wave-button:hover {
          transform: scale(1.02);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }
        
        .wave-button:active {
          transform: scale(0.98);
        }
        
        .wave-layer {
          position: absolute;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(180deg, 
            transparent 0%, 
            rgba(59, 130, 246, 0.1) 40%,
            rgba(139, 92, 246, 0.15) 60%,
            rgba(236, 72, 153, 0.1) 100%
          );
          border-radius: 40%;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        
        .wave-button:hover .wave-layer {
          opacity: 1;
        }
        
        .wave-button:hover .wave-1 {
          animation: wave-gentle 2s ease-in-out infinite;
        }
        
        .wave-button:hover .wave-2 {
          animation: wave-gentle 2.5s ease-in-out infinite;
          animation-delay: 0.3s;
        }
        
        .wave-button:hover .wave-3 {
          animation: wave-gentle 3s ease-in-out infinite;
          animation-delay: 0.6s;
        }
        
        /* Wave button gradient variant */
        .wave-button-gradient {
          position: relative;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
        }
        
        .wave-button-gradient:hover {
          transform: scale(1.02);
          box-shadow: 0 20px 50px rgba(131, 58, 180, 0.4);
        }
        
        .wave-button-gradient:active {
          transform: scale(0.98);
        }
        
        .wave-layer-dark {
          position: absolute;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(180deg, 
            transparent 0%, 
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.05) 100%
          );
          border-radius: 40%;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        
        .wave-button-gradient:hover .wave-layer-dark {
          opacity: 1;
        }
        
        .wave-button-gradient:hover .wave-1 {
          animation: wave-gentle 2s ease-in-out infinite;
        }
        
        .wave-button-gradient:hover .wave-2 {
          animation: wave-gentle 2.5s ease-in-out infinite;
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;