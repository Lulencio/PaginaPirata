// sphere.js - esfera wireframe (Canvas 2D)
export function initSphere() {
  const canvas = document.getElementById('sphere');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const CONFIG = {
    latSteps: 16,
    lonSteps: 24,
    lineWidth: 0.35,
    glow: 10,
    color: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
    spinX: 0.004,
    spinY: 0.001,
    fov: 450,
    radiusRatio: 0.25,
    centerX: 0.88,
    centerY: 0.25
  };

  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  let cx=0, cy=0, radius=0;
  function resize(){
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width  = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);

    radius = Math.min(w, h) * CONFIG.radiusRatio;
    cx = w * (CONFIG.centerX ?? 0.5);
    cy = h * (CONFIG.centerY ?? 0.5);
  }
  window.addEventListener('resize', resize, {passive:true});
  resize();

  // malla base
  const base = [];
  for (let i=0; i<=CONFIG.latSteps; i++){
    const v   = i/CONFIG.latSteps;
    const phi = v*Math.PI - Math.PI/2;
    const ring = [];
    for (let j=0; j<=CONFIG.lonSteps; j++){
      const u = j/CONFIG.lonSteps;
      const th = u * Math.PI*2;
      const x = Math.cos(phi) * Math.cos(th);
      const y = Math.sin(phi);
      const z = Math.cos(phi) * Math.sin(th);
      ring.push({x,y,z});
    }
    base.push(ring);
  }

  const rotY = (p,a)=>{ const s=Math.sin(a),c=Math.cos(a); return {x:c*p.x+s*p.z,y:p.y,z:-s*p.x+c*p.z}; };
  const rotX = (p,a)=>{ const s=Math.sin(a),c=Math.cos(a); return {x:p.x,y:c*p.y-s*p.z,z:s*p.y+c*p.z}; };
  const camZ = 3;
  function project(p){
    const x=p.x*radius, y=p.y*radius, z=p.z*radius;
    const zCam = (camZ*radius) - z;
    const s = CONFIG.fov / zCam;
    return { x: cx + x*s, y: cy + y*s };
  }

  function drawPolyline(pts){
    if(pts.length<2) return;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for(let i=1;i<pts.length;i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  }

  let rx=0, ry=0;
  function frame(){
    ctx.clearRect(0,0,canvas.width/DPR,canvas.height/DPR);

    ctx.lineWidth   = CONFIG.lineWidth;
    ctx.strokeStyle = CONFIG.color;
    ctx.shadowColor = CONFIG.color;
    ctx.shadowBlur  = CONFIG.glow;

    rx += CONFIG.spinX;
    ry += CONFIG.spinY;

    for (const ring of base){
      const pts = ring.map(p => project( rotY( rotX(p,rx), ry) ));
      drawPolyline(pts);
    }
    for (let j=0; j<base[0].length; j++){
      const col = [];
      for (let i=0; i<base.length; i++){
        const p = base[i][j];
        col.push( project( rotY( rotX(p,rx), ry) ) );
      }
      drawPolyline(col);
    }

    ctx.shadowBlur = 0;
    requestAnimationFrame(frame);
  }
  frame();
}
