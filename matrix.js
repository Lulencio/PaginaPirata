// matrix.js - lluvia de símbolos estilo "Matrix"
export function initMatrix() {
  const c   = document.getElementById('matrix');
  if (!c) return;
  const ctx = c.getContext('2d');
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  const STORE = 'matrix-config';
  const CHARS_KEY = 'matrix-chars';

  const DEFAULTS = {
    fontSize: 18,
    speed: 1.2,
    trail: 0.12,
    density: 1.0,
    color: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#9b8cff'
  };
  const CFG = Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(STORE) || '{}'));

  const DEFAULT_CHARS = '01アイウエオカキクケコナニヌネノABCDEFGHIJKLMNOPQRSTUVWXYZ#$%&+-*/<>{}[]';
  let CHARS = localStorage.getItem(CHARS_KEY) || DEFAULT_CHARS;

  window.setMatrix = (opts={}) => {
    Object.assign(CFG, opts);
    localStorage.setItem(STORE, JSON.stringify(CFG));
  };
  window.setMatrixChars = (s='') => {
    CHARS = s.length ? s : DEFAULT_CHARS;
    localStorage.setItem(CHARS_KEY, CHARS);
  };

  let w=0, h=0, cols=0, drops=[];
  function resize(){
    w = window.innerWidth;  h = window.innerHeight;
    c.width  = Math.floor(w * DPR);
    c.height = Math.floor(h * DPR);
    c.style.width  = w + 'px';
    c.style.height = h + 'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);

    cols  = Math.max(1, Math.floor(w / (CFG.fontSize * CFG.density)));
    drops = Array(cols).fill(0).map(()=> Math.random() * (h/CFG.fontSize));
  }
  window.addEventListener('resize', resize, {passive:true});
  resize();

  function draw(){
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(0,0,0,${CFG.trail})`;
    ctx.fillRect(0, 0, w, h);

    ctx.globalAlpha = 0.95;
    ctx.fillStyle   = CFG.color;
    ctx.shadowColor = CFG.color;
    ctx.shadowBlur  = 0;
    ctx.font        = `${CFG.fontSize}px ui-monospace, monospace`;

    for(let i=0;i<drops.length;i++){
      const ch = CHARS[ Math.floor(Math.random()*CHARS.length) ];
      const x  = i * CFG.fontSize * CFG.density;
      const y  = drops[i] * CFG.fontSize;

      ctx.fillText(ch, x, y);

      drops[i] += CFG.speed;

      if (y > h) drops[i] = 0;
    }
    requestAnimationFrame(draw);
  }
  draw();
}
