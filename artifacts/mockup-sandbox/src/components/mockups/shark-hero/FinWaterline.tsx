import React from 'react';
import { ArrowRight } from 'lucide-react';

export function FinWaterline() {
  return (
    <div 
      className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-sans" 
      style={{ backgroundColor: '#FFFCF8', color: '#1A1110' }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap" rel="stylesheet" />
      
      <div className="w-full max-w-4xl mx-auto px-6 flex flex-col items-center relative z-10">
        
        {/* Eyebrow */}
        <div 
          className="uppercase tracking-[0.2em] text-[11px] font-semibold mb-12 sm:mb-20" 
          style={{ color: '#A8998F' }}
        >
          Shark-tank-style scenario practice
        </div>

        {/* Hero Visual + Headline Area */}
        <div className="relative w-full h-56 sm:h-72 mb-10 flex flex-col items-center justify-end">
          
          {/* Headline */}
          <h1 
            className="absolute z-10 whitespace-nowrap"
            style={{ 
              fontFamily: '"Caveat", cursive', 
              fontSize: 'clamp(4.5rem, 12vw, 9rem)',
              lineHeight: 1,
              color: '#1A1110',
              top: '10%',
              left: '50%',
              transform: 'translateX(-50%)',
              textShadow: '0 4px 20px rgba(255, 252, 248, 0.8)' // subtle glow to lift off fin
            }}
          >
            The Lenny Tank
          </h1>

          {/* Fin Illustration */}
          <div className="relative z-0 w-full flex items-end justify-center">
            <svg viewBox="0 0 240 140" className="w-48 sm:w-64 h-auto" style={{ overflow: 'visible' }}>
              {/* Main fin shape */}
              <path 
                d="M 140 10 C 110 40 70 80 30 140 L 210 140 C 180 100 160 50 140 10 Z" 
                fill="#E07432" 
              />
              {/* Inner detail line */}
              <path 
                d="M 140 10 C 120 50 115 90 125 140" 
                stroke="#B85C22" 
                strokeWidth="2" 
                fill="none" 
              />
              {/* Ripples */}
              <path d="M 0 140 Q 15 132 30 140" fill="none" stroke="#1A1110" strokeWidth="1" opacity="0.4" />
              <path d="M 210 140 Q 225 132 240 140" fill="none" stroke="#1A1110" strokeWidth="1" opacity="0.4" />
            </svg>
          </div>
          
          {/* Waterline */}
          <div className="absolute bottom-0 w-[200vw] h-[1px] left-1/2 -translate-x-1/2" style={{ backgroundColor: '#1A1110', opacity: 0.8 }}></div>
        </div>

        {/* Subtitle */}
        <p className="text-center max-w-lg text-[17px] sm:text-xl mb-10 leading-relaxed balance-text">
          <span style={{ color: '#7C6E66' }}>Practice the high-stakes decisions of your craft.</span>
          <br className="hidden sm:block" />
          {' '}
          <span style={{ color: '#1A1110', fontWeight: 500 }}>Get feedback from people who've already lived them.</span>
        </p>

        {/* CTA */}
        <button 
          className="group flex items-center gap-2 px-8 py-3.5 rounded-[10px] text-white font-medium transition-all hover:-translate-y-0.5 shadow-sm hover:shadow-md"
          style={{ backgroundColor: '#E07432' }}
        >
          Pick your arena
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Footer */}
        <div className="mt-24 text-[13px]" style={{ color: '#A8998F' }}>
          Inspired by the guests of <span style={{ color: '#E07432', fontWeight: 600 }}>Lenny's Podcast</span>
        </div>
      </div>
    </div>
  );
}
