// draw.js - módulo de dibujo (capa superior)
export function initDraw() {
  const cvs = document.getElementById('draw');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  const ACCENT = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#9b8cff';

  let w=0, h=0, drawing=false, erasing=false, last=null, size=6;

  function resizePreserving(){
    const tmp = document.createElement('canvas');
    tmp.width = cvs.width; tmp.height = cvs.height;
    tmp.getContext('2d').drawImage(cvs, 0, 0);

    w = window.innerWidth; h = window.innerHeight;
    cvs.width  = Math.floor(w * DPR);
    cvs.height = Math.floor(h * DPR);
    cvs.style.width  = w + 'px';
    cvs.style.height = h + 'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);

    ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, 0, 0, w, h);
  }
  window.addEventListener('resize', resizePreserving, {passive:true});
  resizePreserving();

  function stroke(from, to){
    ctx.lineJoin = 'round';
    ctx.lineCap  = 'round';
    ctx.lineWidth = size;

    if (erasing){
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = '#000';
      ctx.shadowBlur = 0;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = ACCENT;
      ctx.shadowColor = ACCENT;
      ctx.shadowBlur = 12;
    }
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  const pos = e => { if (e.touches?.[0]) e = e.touches[0]; return {x:e.clientX, y:e.clientY}; };
  const down= e => { drawing=true; last=pos(e); };
  const move= e => { if(!drawing) return; const p=pos(e); stroke(last,p); last=p; e.preventDefault(); };
  const up  = () => { drawing=false; last=null; };

  cvs.addEventListener('mousedown', down);  cvs.addEventListener('mousemove', move);  window.addEventListener('mouseup', up);
  cvs.addEventListener('touchstart', down, {passive:false});
  cvs.addEventListener('touchmove',  move, {passive:false});
  window.addEventListener('touchend', up);

  const sizeInp  = document.getElementById('size');
  const btnBrush = document.getElementById('brush');
  const btnEraser= document.getElementById('eraser');
  const btnClear = document.getElementById('clear');
  const btnSave  = document.getElementById('save');

  sizeInp.addEventListener('input', e => size = +e.target.value);
  btnBrush.onclick  = () => { erasing=false; };
  btnEraser.onclick = () => { erasing=true;  };
  btnClear.onclick  = () => { ctx.clearRect(0,0,w,h); };
  btnSave.onclick   = () => {
    const a  = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g,'-');
    a.download = `sketch-${ts}.png`;
    a.href     = cvs.toDataURL('image/png');
    a.click();
  };

  window.addEventListener('keydown', (e)=>{
    if(e.key === 'e' || e.key === 'E') erasing = true;
    if(e.key === 'b' || e.key === 'B') erasing = false;
    if(e.key === '+' || e.key === '=') sizeInp.value = size = Math.min(40, size+1);
    if(e.key === '-' || e.key === '_') sizeInp.value = size = Math.max(1, size-1);
    if((e.ctrlKey || e.metaKey) && e.key.toLowerCase()==='s'){ e.preventDefault(); btnSave.click(); }
    if(e.key === 'Delete') btnClear.click();
  });
}
