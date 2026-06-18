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
        {/* Cool Indigo/Violet Glow (Top-Right) */}
        <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vh] rounded-full bg-gradient-to-br from-[#4f46e5]/10 to-[#818cf8]/2 blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
        {/* Futuristic Cyan/Blue Glow (Left-Middle) */}
        <div className="absolute top-[20%] left-[-10%] w-[50vw] h-[50vh] rounded-full bg-gradient-to-tr from-[#06b6d4]/10 to-[#3b82f6]/2 blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        {/* Soft Ambient Violet Glow (Bottom-Right) */}
        <div className="absolute bottom-[-10%] right-[10%] w-[45vw] h-[45vh] rounded-full bg-gradient-to-t from-[#7c3aed]/8 to-transparent blur-[100px]" />
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
