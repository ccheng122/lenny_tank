import React from "react";

export function SharkFromBelow() {
  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#FFFCF8", fontFamily: "'Geist', sans-serif" }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Geist:wght@300..800&display=swap');
      `}} />
      
      {/* Background with underwater depth effect */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
          <defs>
            <linearGradient id="waterDepth" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFCF8" stopOpacity="0" />
              <stop offset="60%" stopColor="#EAD9CB" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1A1110" stopOpacity="0.8" />
            </linearGradient>
            
            <linearGradient id="lightRays" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#FEF0E2" stopOpacity="0.6" />
              <stop offset="40%" stopColor="#EAD9CB" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#FFFCF8" stopOpacity="0" />
            </linearGradient>
            
            <radialGradient id="sunGlow" cx="50%" cy="0%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="40%" stopColor="#FEF0E2" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#FFFCF8" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {/* Base depth gradient */}
          <rect width="100%" height="100%" fill="url(#waterDepth)" />
          
          {/* Sun glow at surface */}
          <rect width="100%" height="50%" fill="url(#sunGlow)" />
          
          {/* Light Rays */}
          <g opacity="0.6">
            <polygon points="45,0 55,0 80,100 20,100" fill="url(#lightRays)" />
            <polygon points="30,0 40,0 10,100 -20,100" fill="url(#lightRays)" opacity="0.5" />
            <polygon points="60,0 70,0 120,100 90,100" fill="url(#lightRays)" opacity="0.5" />
          </g>
        </svg>
      </div>

      {/* Shark Silhouette from below */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-90 transform translate-y-10 scale-110">
        <svg viewBox="0 0 800 600" className="w-[80vw] max-w-[1000px] h-auto" style={{ filter: "drop-shadow(0px 30px 40px rgba(26, 17, 16, 0.4))" }}>
          {/* Shark Body Silhouette - majestic, wide fins, viewed from below */}
          <path 
            d="M 400 50 
               C 420 80, 440 150, 445 220 
               C 550 240, 680 270, 720 310 
               C 700 320, 580 320, 450 310
               C 445 420, 430 480, 460 550
               C 400 530, 400 530, 340 550
               C 370 480, 355 420, 350 310
               C 220 320, 100 320, 80 310
               C 120 270, 250 240, 355 220
               C 360 150, 380 80, 400 50 Z" 
            fill="#1A1110" 
          />
          {/* Subtle underbelly shading */}
          <path 
            d="M 400 60 
               C 415 85, 430 150, 435 220 
               C 500 235, 600 260, 650 290 
               C 630 295, 550 295, 440 290
               C 435 380, 420 450, 440 510
               C 400 495, 400 495, 360 510
               C 380 450, 365 380, 360 290
               C 250 295, 170 295, 150 290
               C 200 260, 300 235, 365 220
               C 370 150, 385 85, 400 60 Z" 
            fill="#231A18" 
          />
        </svg>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-20 w-full max-w-4xl mx-auto min-h-screen justify-between">
        
        {/* Top Content: Eyebrow, Title, Subtitle */}
        <div className="flex flex-col items-center mt-12 md:mt-24">
          <span 
            className="tracking-[0.2em] text-xs font-semibold uppercase mb-6"
            style={{ color: "#A8998F" }}
          >
            Shark-tank-style scenario practice
          </span>
          
          <h1 
            className="text-7xl md:text-8xl lg:text-9xl mb-8 -rotate-2"
            style={{ 
              fontFamily: "'Caveat', cursive",
              color: "#1A1110",
              lineHeight: 0.9,
              textShadow: "0 4px 24px rgba(255, 252, 248, 0.8)"
            }}
          >
            The Lenny Tank
          </h1>
          
          <p className="text-lg md:text-xl max-w-2xl text-balance leading-relaxed">
            <span style={{ color: "#7C6E66" }}>Practice the high-stakes decisions of your craft. </span>
            <span style={{ color: "#1A1110", fontWeight: 500 }}>Get feedback from people who've already lived them.</span>
          </p>
        </div>

        {/* Bottom Content: CTA and Footer */}
        <div className="flex flex-col items-center mb-12 mt-auto pt-32">
          <button 
            className="group flex items-center gap-2 px-8 py-4 rounded-full font-medium text-white transition-all hover:scale-105 active:scale-95"
            style={{ 
              backgroundColor: "#E07432", 
              boxShadow: "0 10px 30px -10px rgba(224, 116, 50, 0.6)"
            }}
          >
            Pick your arena 
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
          
          <p 
            className="mt-8 text-sm"
            style={{ color: "#A8998F" }}
          >
            Inspired by the guests of <span style={{ color: "#E07432", fontWeight: 500 }}>Lenny's Podcast</span>
          </p>
        </div>
        
      </div>
    </div>
  );
}
