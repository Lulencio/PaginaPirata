// eye.js - ojo retro "halftone" que sigue el mouse
export function initEye() {
  const cvs = document.getElementById('eye');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const ACCENT = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent').trim() || '#9b8cff';

  const CFG = {
    // centrado por defecto
    cx: 0.5,
    cy: 0.5,
    eyeR:   0.15,
    aspect: 0.62,
    iris:   0.44,
    pupil:  0.20,
    maxLook:0.28,
    cell:   6,
    glow:  10,
    line:  1.2
  };

  let W=0, H=0, R=0, ex=0, ey=0;
  function resize(){
    W = window.innerWidth; H = window.innerHeight;
    cvs.width  = Math.floor(W * DPR);
    cvs.height = Math.floor(H * DPR);
    cvs.style.width = W+'px'; cvs.style.height = H+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);

    R  = Math.min(W,H) * CFG.eyeR;
    ex = W * CFG.cx;
    ey = H * CFG.cy;
  }
  window.addEventListener('resize', resize, {passive:true});
  resize();

  let mx = ex, my = ey;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, {passive:true});
  window.addEventListener('touchmove', e => {
    if(e.touches && e.touches[0]){ mx = e.touches[0].clientX; my = e.touches[0].clientY; }
  }, {passive:true});

  const BAYER = [
    [0,  8,  2, 10],
    [12, 4, 14,  6],
    [3, 11,  1,  9],
    [15, 7, 13,  5]
  ].map(row => row.map(v => (v+0.5)/16));

  function inEye(x,y){
    const rx = R, ry = R*CFG.aspect;
    const dx = (x-ex)/rx, dy = (y-ey)/ry;
    return (dx*dx + dy*dy) <= 1;
  }

  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }

  function draw(){
    ctx.clearRect(0,0,W,H);

    // Contorno
    const rx = R, ry = R*CFG.aspect;
    ctx.save();
    ctx.lineWidth = CFG.line;
    ctx.strokeStyle = ACCENT;
    ctx.shadowColor = ACCENT;
    ctx.shadowBlur  = CFG.glow;
    ctx.beginPath();
    ctx.ellipse(ex, ey, rx, ry, 0, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();

    // Centro iris/pupila mirando al mouse
    const vx = mx - ex, vy = my - ey;
    const mag = Math.hypot(vx, vy) || 1;
    const maxOff = R * CFG.maxLook;
    const ix = ex + (vx/mag) * maxOff;
    const iy = ey + (vy/mag) * maxOff;

    // Iris y pupila (trazo)
    ctx.save();
    ctx.lineWidth = CFG.line;
    ctx.strokeStyle = ACCENT;
    ctx.shadowColor = ACCENT;
    ctx.shadowBlur  = CFG.glow;

    const rIris  = R * CFG.iris;
    const rPupil = R * CFG.pupil;

    ctx.beginPath();
    ctx.arc(ix, iy, rIris, 0, Math.PI*2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ix, iy, rPupil, 0, Math.PI*2);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = ACCENT;
    const hl = Math.max(2, Math.floor(CFG.cell*0.8));
    ctx.fillRect(Math.round(ix - rIris*0.35), Math.round(iy - rIris*0.35), hl, hl);
    ctx.restore();

    // Dithering dentro del ojo
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(ex, ey, rx, ry, 0, 0, Math.PI*2);
    ctx.clip();

    ctx.fillStyle = ACCENT;
    ctx.shadowBlur = 0;

    const x0 = Math.floor((ex - rx) / CFG.cell) * CFG.cell;
    const y0 = Math.floor((ey - ry) / CFG.cell) * CFG.cell;
    const x1 = Math.ceil((ex + rx) / CFG.cell) * CFG.cell;
    const y1 = Math.ceil((ey + ry) / CFG.cell) * CFG.cell;

    for(let y=y0; y<y1; y+=CFG.cell){
      for(let x=x0; x<x1; x+=CFG.cell){
        if(!inEye(x+CFG.cell*0.5, y+CFG.cell*0.5)) continue;

        const d = Math.hypot((x+CFG.cell*0.5)-ix, (y+CFG.cell*0.5)-iy);
        const maxD = R;
        let coverage = clamp(1 - (d / maxD), 0, 1);
        coverage = Math.pow(coverage, 1.2);

        const bx = (x/CFG.cell) & 3;
        const by = (y/CFG.cell) & 3;
        if (coverage > BAYER[by][bx]){
          const s = Math.max(1, Math.floor(CFG.cell*0.45));
          ctx.fillRect(x + ((CFG.cell-s)>>1), y + ((CFG.cell-s)>>1), s, s);
        }
      }
    }
    ctx.restore();

    requestAnimationFrame(draw);
  }
  draw();
}
