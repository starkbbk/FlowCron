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
        {/* Top-Right Blue Glow Orb */}
        <div 
          className="absolute top-[-20%] right-[-10%] w-[80vw] h-[80vh] rounded-full opacity-90 blur-[130px]" 
          style={{ 
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.18), transparent 60%)' 
          }} 
        />
        {/* Bottom-Left Cyan Glow Orb */}
        <div 
          className="absolute bottom-[-20%] left-[-10%] w-[80vw] h-[80vh] rounded-full opacity-90 blur-[130px]" 
          style={{ 
            background: 'radial-gradient(circle, rgba(34, 211, 238, 0.12), transparent 60%)' 
          }} 
        />
        {/* Center Blue Ambient Glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vh] rounded-full opacity-80 blur-[140px]" 
          style={{ 
            background: 'radial-gradient(circle, rgba(10, 132, 255, 0.06), transparent 70%)' 
          }} 
        />
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
