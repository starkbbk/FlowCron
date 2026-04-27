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
