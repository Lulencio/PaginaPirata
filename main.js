// main.js - inicializa los módulos cuando el DOM está listo
import { initSphere } from './sphere.js';
import { initEye } from './eye.js';
import { initMatrix } from './matrix.js';
import { initDraw } from './draw.js';
import { initHud } from './hud.js';

window.addEventListener('DOMContentLoaded', () => {
  initMatrix();
  initSphere();
  initEye();
  initDraw();
  initHud();
});
