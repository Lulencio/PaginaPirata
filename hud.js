// hud.js - persistencia HUD y nota (localStorage)
export function initHud() {
  const h  = document.getElementById('headline');
  const s  = document.getElementById('subline');
  const KH = 'hud-headline', KS = 'hud-subline';

  if (h) {
    h.textContent = localStorage.getItem(KH) || h.textContent;
    h.addEventListener('input', ()=> localStorage.setItem(KH, h.textContent));
  }
  if (s) {
    s.textContent = localStorage.getItem(KS) || s.textContent;
    s.addEventListener('input', ()=> localStorage.setItem(KS, s.textContent));
  }

  const note = document.getElementById('note');
  const KEY  = 'hud-note';
  if (note) {
    note.innerHTML = localStorage.getItem(KEY) || '';
    note.addEventListener('input', () => localStorage.setItem(KEY, note.innerHTML));
  }
}
