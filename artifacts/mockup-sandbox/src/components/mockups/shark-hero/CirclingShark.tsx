import React from 'react';

export function CirclingShark() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Geist:wght@400;500;600&display=swap" rel="stylesheet" />
      
      <div 
        className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden px-6 py-20"
        style={{ backgroundColor: '#FFFCF8', fontFamily: '"Geist", sans-serif' }}
      >
        <div className="max-w-4xl w-full flex flex-col items-center text-center relative z-10">
          
          <div className="relative mb-8 w-full flex flex-col items-center">
            <span 
              className="text-sm uppercase tracking-[0.25em] font-medium mb-8 block"
              style={{ color: '#A8998F' }}
            >
              Shark-tank-style scenario practice
            </span>
            
            <div className="relative inline-block">
              <h1 
                className="text-8xl md:text-[10rem] mb-4 relative z-10"
                style={{ 
                  fontFamily: '"Caveat", cursive',
                  color: '#1A1110',
                  lineHeight: 0.9,
                  letterSpacing: '-0.02em'
                }}
              >
                The Lenny Tank
              </h1>
              
              {/* Playful Logo-able Shark Silhouette */}
              <div className="absolute left-1/2 -translate-x-[45%] top-[60%] w-[320px] md:w-[480px] -z-10 pointer-events-none opacity-90">
                <svg viewBox="0 0 500 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto transform -rotate-6">
                  {/* Main Body */}
                  <path 
                    d="M450,100 C400,80 300,70 200,90 C150,100 80,120 40,150 C20,165 10,180 5,160 C5,130 15,100 40,80 C60,65 90,60 120,65 C170,75 220,85 270,80 C320,75 380,60 420,50 C440,45 460,50 470,70 C475,85 465,95 450,100 Z" 
                    fill="#E07432"
                  />
                  {/* Dorsal Fin */}
                  <path d="M220,85 C230,40 250,20 270,15 C270,40 255,65 245,80 Z" fill="#E07432"/>
                  {/* Pectoral Fin */}
                  <path d="M330,75 C310,105 290,130 270,140 C285,120 305,100 320,85 Z" fill="#E07432"/>
                  {/* Tail Fluke Top */}
                  <path d="M40,80 C20,50 15,20 10,0 C15,30 30,55 50,75 Z" fill="#E07432"/>
                  {/* Tail Fluke Bottom */}
                  <path d="M40,150 C20,180 15,210 10,230 C15,200 30,175 50,155 Z" fill="#E07432"/>
                  {/* Eye */}
                  <circle cx="430" cy="70" r="4.5" fill="#1A1110"/>
                  {/* Hint of Mouth */}
                  <path d="M465,82 C450,88 435,88 420,82" stroke="#FFFCF8" strokeWidth="2.5" strokeLinecap="round"/>
                  {/* Hint of Gill Slits */}
                  <path d="M370,75 L365,95 M380,72 L375,92 M390,69 L385,89" stroke="#FFFCF8" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                </svg>
              </div>
            </div>
          </div>
          
          <p className="text-xl md:text-2xl max-w-2xl mb-12 mt-12 md:mt-20 leading-relaxed z-10">
            <span style={{ color: '#7C6E66' }}>Practice the high-stakes decisions of your craft.</span>
            <br className="hidden md:block" />
            <span style={{ color: '#1A1110' }} className="font-medium mt-2 inline-block">Get feedback from people who've already lived them.</span>
          </p>
          
          <button 
            className="px-10 py-5 rounded-[12px] text-white font-medium text-lg hover:opacity-90 hover:-translate-y-1 transition-all flex items-center gap-3 shadow-lg shadow-orange-500/20"
            style={{ backgroundColor: '#E07432' }}
          >
            Pick your arena <span className="text-xl font-bold">→</span>
          </button>
          
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full text-center">
          <p className="text-sm tracking-wide" style={{ color: '#A8998F' }}>
            Inspired by the guests of <span className="font-semibold" style={{ color: '#E07432' }}>Lenny's Podcast</span>
          </p>
        </div>
      </div>
    </>
  );
}
