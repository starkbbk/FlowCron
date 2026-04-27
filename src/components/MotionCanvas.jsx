import React, { useEffect, useRef } from 'react';

const MotionCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // SCROLL PHYSICS
    let targetScrollY = window.scrollY;
    let currentScrollY = window.scrollY;
    let scrollVelocity = 0;
    
    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initEntities();
    };
    window.addEventListener('resize', handleResize);

    // COLOR ZONES (Bg Red, Green, Blue | Particle Red, Green, Blue)
    // More distinct colors to ensure the user notices the change
    const zones = [
      { br: 10, bg: 10, bb: 15, pr: 0, pg: 150, pb: 255 },   // Blue
      { br: 30, bg: 10, bb: 50, pr: 168, pg: 85, pb: 247 },  // Purple
      { br: 10, bg: 40, bb: 30, pr: 16, pg: 250, pb: 150 },  // Green
      { br: 50, bg: 10, bb: 20, pr: 255, pg: 50, pb: 100 },  // Pink/Red
      { br: 10, bg: 10, bb: 15, pr: 0, pg: 150, pb: 255 }    // Blue
    ];

    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

    const getCurrentColors = () => {
      const docHeight = Math.max(
        document.body.scrollHeight, 
        document.documentElement.scrollHeight, 
        height * 2
      );
      const maxScroll = docHeight - height;
      let percent = maxScroll > 0 ? currentScrollY / maxScroll : 0;
      percent = Math.max(0, Math.min(1, percent));

      let scaled = percent * (zones.length - 1);
      let index = Math.floor(scaled);
      index = Math.max(0, Math.min(zones.length - 2, index));
      let fraction = scaled - index;

      const z1 = zones[index];
      const z2 = zones[index + 1];

      return {
        bg: `rgb(${lerp(z1.br, z2.br, fraction)}, ${lerp(z1.bg, z2.bg, fraction)}, ${lerp(z1.bb, z2.bb, fraction)})`,
        pColor: `${lerp(z1.pr, z2.pr, fraction)}, ${lerp(z1.pg, z2.pg, fraction)}, ${lerp(z1.pb, z2.pb, fraction)}`
      };
    };

    let particles = [];
    let bokehs = [];
    let waves = [];
    let streaks = [];
    let auroras = [];

    const initEntities = () => {
      particles = [];
      for(let i=0; i<100; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 1,
          vy: (Math.random() - 0.5) * 1 + 0.3,
          history: [],
          size: Math.random() * 2 + 1
        });
      }

      bokehs = [];
      for(let i=0; i<15; i++) {
        bokehs.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 30 + 5,
          speed: Math.random() * 0.3 + 0.1,
          angle: Math.random() * Math.PI * 2
        });
      }

      waves = [];
      for(let i=0; i<5; i++) {
        waves.push({
          yBase: Math.random() * height * 0.8 + height * 0.1,
          amplitude: Math.random() * 80 + 40,
          frequency: Math.random() * 0.003 + 0.001,
          speed: Math.random() * 0.015 + 0.005,
          offset: Math.random() * Math.PI * 2
        });
      }

      auroras = [];
      for(let i=0; i<3; i++) {
        auroras.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * width * 0.3 + width * 0.2,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3
        });
      }
    };
    initEntities();

    let time = 0;

    const render = () => {
      time += 1;
      
      let diff = targetScrollY - currentScrollY;
      currentScrollY += diff * 0.1; 
      scrollVelocity = diff * 0.1;
      let speedMultiplier = 1 + Math.abs(scrollVelocity) * 0.1;
      
      const colors = getCurrentColors();

      // We don't want to fill the whole background as we have mac-os-wallpaper
      // Instead, we clear with a very high transparency to allow trailing or just clear
      ctx.clearRect(0, 0, width, height);

      // 1. AURORA BLOBS
      auroras.forEach((aurora) => {
        aurora.x += aurora.vx * speedMultiplier;
        aurora.y += aurora.vy * speedMultiplier;
        if(aurora.x < -aurora.radius) aurora.vx *= -1;
        if(aurora.x > width + aurora.radius) aurora.vx *= -1;
        if(aurora.y < -aurora.radius) aurora.vy *= -1;
        if(aurora.y > height + aurora.radius) aurora.vy *= -1;

        const grad = ctx.createRadialGradient(aurora.x, aurora.y, 0, aurora.x, aurora.y, aurora.radius);
        grad.addColorStop(0, `rgba(${colors.pColor}, 0.05)`);
        grad.addColorStop(1, `rgba(${colors.pColor}, 0)`);
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(aurora.x, aurora.y, aurora.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. WAVE LINES
      ctx.lineWidth = 1;
      waves.forEach((wave) => {
        wave.offset += wave.speed * speedMultiplier * 0.2;
        ctx.beginPath();
        let scrollDistortion = scrollVelocity * 0.3;
        
        for(let x = 0; x <= width; x += 30) {
          let y = wave.yBase + Math.sin(x * wave.frequency + wave.offset) * (wave.amplitude + scrollDistortion);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${colors.pColor}, 0.04)`;
        ctx.stroke();
      });

      // 3. LIGHT STREAKS
      if (Math.random() < 0.005 * speedMultiplier) {
        streaks.push({
          x: Math.random() * width,
          y: -50,
          vx: Math.random() * 8 + 4,
          vy: Math.random() * 8 + 8,
          length: Math.random() * 150 + 50,
          alpha: 0.2
        });
      }
      
      for(let i=streaks.length-1; i>=0; i--) {
        let s = streaks[i];
        s.x += s.vx * speedMultiplier;
        s.y += s.vy * speedMultiplier;
        s.alpha -= 0.004;

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.length * (s.vx/s.vy), s.y - s.length);
        
        const streakGrad = ctx.createLinearGradient(s.x, s.y, s.x - s.length * (s.vx/s.vy), s.y - s.length);
        streakGrad.addColorStop(0, `rgba(${colors.pColor}, ${s.alpha})`);
        streakGrad.addColorStop(1, `rgba(${colors.pColor}, 0)`);
        
        ctx.strokeStyle = streakGrad;
        ctx.lineWidth = 1;
        ctx.stroke();

        if (s.alpha <= 0 || s.y > height + s.length) streaks.splice(i, 1);
      }

      // 4. BOKEH CIRCLES
      bokehs.forEach(bokeh => {
        bokeh.angle += 0.005 * speedMultiplier;
        let bx = bokeh.x + Math.sin(bokeh.angle) * 10;
        let by = bokeh.y + Math.cos(bokeh.angle) * 10;
        by -= scrollVelocity * 0.1; 

        ctx.beginPath();
        ctx.arc(bx, by, bokeh.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colors.pColor}, 0.03)`;
        ctx.fill();
      });

      // 5. PARTICLES
      ctx.lineWidth = 1;
      particles.forEach(p => {
        p.x += p.vx * speedMultiplier;
        p.y += (p.vy - scrollVelocity * 0.2) * speedMultiplier; 

        if(p.x < 0) p.x = width;
        if(p.x > width) p.x = 0;
        if(p.y < 0) p.y = height;
        if(p.y > height) p.y = 0;

        p.history.push({x: p.x, y: p.y});
        const maxHistory = Math.min(20, 8 + Math.abs(scrollVelocity) * 0.4); 
        if (p.history.length > maxHistory) p.history.shift();

        if (p.history.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.history[0].x, p.history[0].y);
          for (let i=1; i<p.history.length; i++) {
             if (Math.abs(p.history[i].x - p.history[i-1].x) > width/2 || Math.abs(p.history[i].y - p.history[i-1].y) > height/2) {
                 ctx.moveTo(p.history[i].x, p.history[i].y);
             } else {
                 ctx.lineTo(p.history[i].x, p.history[i].y);
             }
          }
          ctx.strokeStyle = `rgba(${colors.pColor}, 0.25)`;
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx.fillStyle = `rgba(${colors.pColor}, 0.65)`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${colors.pColor}, 0.8)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas id="motionCanvas" ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -2, pointerEvents: 'none' }} />;
};

export default MotionCanvas;
