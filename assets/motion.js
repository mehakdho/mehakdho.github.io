// Lextron-inspired motion: hero parallax, scroll-driven live card, count-up numbers.
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // hero parallax: the dot field drifts slower than the page
  const cv = document.getElementById('ascii');
  if (cv && !reduce) {
    let raf = 0;
    addEventListener('scroll', () => raf ||= requestAnimationFrame(() => {
      raf = 0; const y = scrollY;
      if (y < innerHeight * 1.3) cv.style.transform = `translateY(${(y * .3).toFixed(1)}px)`;
    }), {passive: true});
  }

  // sticky live card: the step crossing the middle of the screen is the active one
  const steps = [...document.querySelectorAll('.stages-steps li')];
  const frames = [...document.querySelectorAll('.stages-card .frame')];
  if (steps.length) {
    let cur = -1;
    const set = i => {
      if (i === cur) return; cur = i;
      steps.forEach((el, n) => el.classList.toggle('on', n === i));
      frames.forEach((el, n) => el.classList.toggle('on', n === i));
    };
    const pick = () => {
      // phone: the card is pinned on top, so switch on the step just below it
      const card = document.querySelector('.stages-card');
      const line = innerWidth <= 860 && card ? card.getBoundingClientRect().bottom + 60 : innerHeight * .5;
      let i = 0; steps.forEach((el, n) => { if (el.getBoundingClientRect().top < line) i = n; });
      set(i);
    };
    addEventListener('scroll', pick, {passive: true}); addEventListener('resize', pick); pick();
  }

  // count-up on the big numbers, once, when they come into view
  const nums = document.querySelectorAll('.metrics .v, .win .big');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const node = [...e.target.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.textContent));
    if (!node || reduce) return;
    const m = node.textContent.match(/([^\d]*)([\d.,]+)(.*)/), end = parseFloat(m[2].replace(/,/g, '')), dec = (m[2].split('.')[1] || '').length;
    const t0 = performance.now(), dur = 1400;
    const tick = t => {
      const k = Math.min(1, (t - t0) / dur), v = end * (1 - Math.pow(1 - k, 3));
      node.textContent = m[1] + v.toLocaleString('en-US', {minimumFractionDigits: dec, maximumFractionDigits: dec}) + m[3];
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), {threshold: .4});
  nums.forEach(n => io.observe(n));
})();
