const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- ASCII hero: a radar sweep over a field of targets ---------- */
(() => {
  const cv = document.getElementById('ascii'), ctx = cv.getContext('2d');
  const RAMP = ' .·:-=+*#%@';
  let W, H, cols, rows, cw = 10, ch = 18, dpr, pings = [];
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cw = W < 700 ? 8 : 10; ch = cw * 1.8;
    cols = Math.ceil(W / cw); rows = Math.ceil(H / ch);
    ctx.font = `${cw * 1.35}px "Geist Mono", monospace`; ctx.textBaseline = 'top';
    // targets scattered across the field
    pings = Array.from({length: Math.round(cols * rows / 260)}, () => ({x: Math.random() * cols, y: Math.random() * rows, hit: -9}));
  }
  addEventListener('resize', size); size();
  const cx = () => cols * 0.68, cy = () => rows * 0.42;
  function frame(t) {
    t /= 1000;
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const sweep = (t * 0.55) % (Math.PI * 2), ox = cx(), oy = cy();
    for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
      const dx = (x - ox), dy = (y - oy) * 1.8, d = Math.hypot(dx, dy);
      let a = Math.atan2(dy, dx); if (a < 0) a += Math.PI * 2;
      let behind = (sweep - a + Math.PI * 2) % (Math.PI * 2);
      const trail = Math.max(0, 1 - behind / 1.4);
      const ring = Math.max(0, 1 - Math.abs(((d - t * 9) % 22 + 22) % 22 - 11) / 1.2) * 0.35;
      const noise = (Math.sin(x * 0.21 + t * 0.7) * Math.cos(y * 0.33 - t * 0.5) + 1) * 0.09;
      const fade = Math.max(0, 1 - d / (cols * 0.75));
      let v = (trail * 0.75 + ring + noise) * fade;
      if (v < 0.05) continue;
      v = Math.min(v, 0.99);
      ctx.fillStyle = `rgba(255,255,255,${0.08 + v * 0.55})`;
      ctx.fillText(RAMP[Math.floor(v * RAMP.length)], x * cw, y * ch);
    }
    // targets light up blue when the sweep passes, then decay; green when "booked"
    for (const p of pings) {
      const dx = p.x - ox, dy = (p.y - oy) * 1.8;
      let a = Math.atan2(dy, dx); if (a < 0) a += Math.PI * 2;
      const behind = (sweep - a + Math.PI * 2) % (Math.PI * 2);
      if (behind < 0.05 && t - p.hit > 2) { p.hit = t; p.booked = Math.random() < 0.12; }
      const age = t - p.hit; if (age > 3.5) continue;
      const k = 1 - age / 3.5;
      ctx.fillStyle = p.booked ? `rgba(98,192,115,${k})` : `rgba(82,168,255,${k})`;
      ctx.fillText(p.booked ? '◆' : '+', Math.round(p.x) * cw, Math.round(p.y) * ch);
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  document.fonts.ready.then(() => { size(); requestAnimationFrame(frame); });
})();

