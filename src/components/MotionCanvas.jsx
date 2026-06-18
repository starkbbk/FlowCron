import React, { useEffect, useRef } from 'react';

const MotionCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // ── Respect prefers-reduced-motion ─────────────────────────────
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // ── Scroll physics ───────────────────────────────────────────────
    let targetScrollY = window.scrollY;
    let currentScrollY = window.scrollY;
    let scrollVelocity = 0;

    const handleScroll = () => { targetScrollY = window.scrollY; };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      initEntities();
    };
    window.addEventListener('resize', handleResize);

    // ── Mouse repulsion state ────────────────────────────────────────
    const mouse = { x: -9999, y: -9999, active: false };

    // Repulsion config — subtle and elegant
    const REPULSION_RADIUS   = isMobile ? 80  : 150;  // px — force field radius
    const REPULSION_STRENGTH = isMobile ? 0.4 : 0.7;  // 0–1 multiplier on force
    const RETURN_SPEED       = 0.06;                  // spring constant — lower = slower return

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => { mouse.active = false; mouse.x = -9999; mouse.y = -9999; };

    // Only attach on non-editor pages — editor canvas has its own pointer logic
    const isEditorPage = window.location.pathname.includes('/edit');
    if (!isEditorPage && !prefersReduced) {
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    }

    // ── Color zones (scroll-based color shift) ───────────────────────
    const zones = [
      { br: 10, bg: 10, bb: 15, pr:   0, pg: 150, pb: 255 }, // Blue
      { br: 30, bg: 10, bb: 50, pr: 168, pg:  85, pb: 247 }, // Purple
      { br: 10, bg: 40, bb: 30, pr:  16, pg: 250, pb: 150 }, // Green
      { br: 50, bg: 10, bb: 20, pr: 255, pg:  50, pb: 100 }, // Pink/Red
      { br: 10, bg: 10, bb: 15, pr:   0, pg: 150, pb: 255 }, // Blue
    ];

    const lerp = (a, b, t) => (1 - t) * a + t * b;

    const getCurrentColors = () => {
      const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, height * 2);
      const maxScroll = docHeight - height;
      let pct = maxScroll > 0 ? currentScrollY / maxScroll : 0;
      pct = Math.max(0, Math.min(1, pct));
      let scaled = pct * (zones.length - 1);
      let idx = Math.min(Math.floor(scaled), zones.length - 2);
      let frac = scaled - idx;
      const z1 = zones[idx], z2 = zones[idx + 1];
      return {
        bg: `rgb(${lerp(z1.br,z2.br,frac)},${lerp(z1.bg,z2.bg,frac)},${lerp(z1.bb,z2.bb,frac)})`,
        pColor: `${lerp(z1.pr,z2.pr,frac)},${lerp(z1.pg,z2.pg,frac)},${lerp(z1.pb,z2.pb,frac)}`
      };
    };

    // ── Entity pools ─────────────────────────────────────────────────
    let particles = [];
    let bokehs    = [];
    let waves     = [];
    let streaks   = [];
    let auroras   = [];

    const initEntities = () => {
      const count = isMobile ? 80 : 200;
      particles = [];
      for (let i = 0; i < count; i++) {
        const ox = Math.random() * width;
        const oy = Math.random() * height;
        particles.push({
          x:   ox,
          y:   oy,
          ox,           // origin X — home position
          oy,           // origin Y — home position
          vx:  (Math.random() - 0.5) * 1,
          vy:  (Math.random() - 0.5) * 1 + 0.3,
          dx:  0,       // repulsion displacement X
          dy:  0,       // repulsion displacement Y
          history: [],
          size: Math.random() * 2.5 + 0.8,
        });
      }

      bokehs = [];
      for (let i = 0; i < 15; i++) {
        bokehs.push({
          x:     Math.random() * width,
          y:     Math.random() * height,
          radius: Math.random() * 30 + 5,
          speed:  Math.random() * 0.3 + 0.1,
          angle:  Math.random() * Math.PI * 2,
        });
      }

      waves = [];
      for (let i = 0; i < 5; i++) {
        waves.push({
          yBase:     Math.random() * height * 0.8 + height * 0.1,
          amplitude: Math.random() * 80 + 40,
          frequency: Math.random() * 0.003 + 0.001,
          speed:     Math.random() * 0.015 + 0.005,
          offset:    Math.random() * Math.PI * 2,
        });
      }

      auroras = [];
      for (let i = 0; i < 3; i++) {
        auroras.push({
          x:      Math.random() * width,
          y:      Math.random() * height,
          radius: Math.random() * width * 0.3 + width * 0.2,
          vx:     (Math.random() - 0.5) * 0.3,
          vy:     (Math.random() - 0.5) * 0.3,
        });
      }
    };
    initEntities();

    let time = 0;

    // ── Main render loop ─────────────────────────────────────────────
    const render = () => {
      time += 1;

      // Scroll physics
      const diff = targetScrollY - currentScrollY;
      currentScrollY += diff * 0.1;
      scrollVelocity  = diff * 0.1;
      const speedMul  = 1 + Math.abs(scrollVelocity) * 0.4;

      const colors = getCurrentColors();
      ctx.clearRect(0, 0, width, height);

      // 1. AURORA BLOBS ───────────────────────────────────────────────
      auroras.forEach(aurora => {
        aurora.x += aurora.vx * speedMul;
        aurora.y += aurora.vy * speedMul;
        if (aurora.x < -aurora.radius)        aurora.vx *= -1;
        if (aurora.x > width + aurora.radius) aurora.vx *= -1;
        if (aurora.y < -aurora.radius)        aurora.vy *= -1;
        if (aurora.y > height + aurora.radius) aurora.vy *= -1;

        const g = ctx.createRadialGradient(aurora.x, aurora.y, 0, aurora.x, aurora.y, aurora.radius);
        g.addColorStop(0, `rgba(${colors.pColor},0.05)`);
        g.addColorStop(1, `rgba(${colors.pColor},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(aurora.x, aurora.y, aurora.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. WAVE LINES ─────────────────────────────────────────────────
      ctx.lineWidth = 1;
      waves.forEach(wave => {
        wave.offset += wave.speed * speedMul * 0.2;
        ctx.beginPath();
        const distortion = scrollVelocity * 0.8;
        for (let x = 0; x <= width; x += 30) {
          const y = wave.yBase + Math.sin(x * wave.frequency + wave.offset) * (wave.amplitude + distortion);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${colors.pColor},0.04)`;
        ctx.stroke();
      });

      // 3. LIGHT STREAKS ──────────────────────────────────────────────
      if (Math.random() < 0.005 * speedMul) {
        streaks.push({
          x: Math.random() * width,
          y: -50,
          vx: Math.random() * 8 + 4,
          vy: Math.random() * 8 + 8,
          length: Math.random() * 150 + 50,
          alpha: 0.2,
        });
      }
      for (let i = streaks.length - 1; i >= 0; i--) {
        const s = streaks[i];
        s.x += s.vx * speedMul;
        s.y += s.vy * speedMul;
        s.alpha -= 0.004;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - s.length * (s.vx / s.vy), s.y - s.length);
        const sg = ctx.createLinearGradient(s.x, s.y, s.x - s.length * (s.vx / s.vy), s.y - s.length);
        sg.addColorStop(0, `rgba(${colors.pColor},${s.alpha})`);
        sg.addColorStop(1, `rgba(${colors.pColor},0)`);
        ctx.strokeStyle = sg;
        ctx.lineWidth = 1;
        ctx.stroke();
        if (s.alpha <= 0 || s.y > height + s.length) streaks.splice(i, 1);
      }

      // 4. BOKEH CIRCLES ──────────────────────────────────────────────
      bokehs.forEach(bokeh => {
        bokeh.angle += 0.005 * speedMul;
        const bx = bokeh.x + Math.sin(bokeh.angle) * 10;
        const by = bokeh.y + Math.cos(bokeh.angle) * 10 - scrollVelocity * 0.1;
        ctx.beginPath();
        ctx.arc(bx, by, bokeh.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${colors.pColor},0.03)`;
        ctx.fill();
      });

      // 5. PARTICLES + MOUSE REPULSION ────────────────────────────────
      ctx.lineWidth = 1;
      particles.forEach(p => {
        // ── a) Drift (natural movement) ───────────────────────────
        p.ox += p.vx * speedMul;
        p.oy += (p.vy - scrollVelocity * 0.2) * speedMul;

        // Wrap origin
        if (p.ox < 0)      p.ox = width;
        if (p.ox > width)  p.ox = 0;
        if (p.oy < 0)      p.oy = height;
        if (p.oy > height) p.oy = 0;

        // ── b) Repulsion force ─────────────────────────────────────
        if (!prefersReduced && mouse.active) {
          const dx   = p.ox - mouse.x;
          const dy   = p.oy - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < REPULSION_RADIUS && dist > 0) {
            // Smooth falloff — stronger when closer, zero at edge
            const falloff = 1 - dist / REPULSION_RADIUS;
            // Ease the falloff for a silkier feel
            const easedFalloff = falloff * falloff;
            const force = easedFalloff * REPULSION_STRENGTH * 60; // px push
            p.dx += (dx / dist) * force;
            p.dy += (dy / dist) * force;
          }
        }

        // ── c) Spring return — dx/dy decay toward 0 ───────────────
        p.dx *= (1 - RETURN_SPEED);
        p.dy *= (1 - RETURN_SPEED);

        // ── d) Final rendered position ────────────────────────────
        p.x = p.ox + p.dx;
        p.y = p.oy + p.dy;

        // ── e) Trail ─────────────────────────────────────────────
        p.history.push({ x: p.x, y: p.y });
        const maxHistory = Math.min(40, 10 + Math.abs(scrollVelocity) * 0.8);
        if (p.history.length > maxHistory) p.history.shift();

        if (p.history.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.history[0].x, p.history[0].y);
          for (let i = 1; i < p.history.length; i++) {
            const h  = p.history[i];
            const hp = p.history[i - 1];
            if (Math.abs(h.x - hp.x) > width / 2 || Math.abs(h.y - hp.y) > height / 2) {
              ctx.moveTo(h.x, h.y);
            } else {
              ctx.lineTo(h.x, h.y);
            }
          }
          ctx.strokeStyle = `rgba(${colors.pColor},0.25)`;
          ctx.stroke();
        }

        // ── f) Dot ────────────────────────────────────────────────
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle   = `rgba(${colors.pColor},0.65)`;
        ctx.shadowBlur  = 8;
        ctx.shadowColor = `rgba(${colors.pColor},0.8)`;
        ctx.fill();
        ctx.shadowBlur  = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('scroll',     handleScroll);
      window.removeEventListener('resize',     handleResize);
      window.removeEventListener('mousemove',  handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      id="motionCanvas"
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        zIndex: -2,
        pointerEvents: 'none',
      }}
    />
  );
};

export default MotionCanvas;
