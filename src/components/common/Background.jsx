import React, { useEffect, useRef } from 'react';
import MotionCanvas from '../MotionCanvas';

const Background = () => {
  const blobRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!blobRef.current) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight = window.innerHeight;
      const maxScroll = scrollHeight - clientHeight;
      
      const scrollPercent = maxScroll > 0 ? scrollY / maxScroll : 0;
      const hue = scrollPercent * 360;
      
      blobRef.current.style.filter = `hue-rotate(${hue}deg) blur(100px)`;
      blobRef.current.style.opacity = 0.4 + (scrollPercent * 0.2);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Base Layer */}
      <div className="mac-os-wallpaper" />
      
      {/* Cinematic Glowing Lights */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-3]">
        {/* Warm Cinematic Glow (Top-Right) */}
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vh] rounded-full bg-gradient-to-br from-[#ea580c]/20 to-[#fb923c]/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        {/* Cool Cinematic Glow (Left-Middle) */}
        <div className="absolute top-[20%] left-[-10%] w-[50vw] h-[50vh] rounded-full bg-gradient-to-tr from-[#3b82f6]/15 to-[#6366f1]/5 blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        {/* Soft Ambient Purple Glow (Bottom) */}
        <div className="absolute bottom-[-10%] left-[30%] w-[45vw] h-[45vh] rounded-full bg-gradient-to-t from-[#8b5cf6]/10 to-transparent blur-[100px]" />
      </div>
      
      {/* Motion Layer */}
      <MotionCanvas />
      
      {/* Liquid Layer */}
      <div className="blob-container" ref={blobRef}>
        <div className="blob blob-1"></div>
      </div>
    </>
  );
};

export default Background;
