// ─────────────────────────────────────────────
//  frontend/src/main.js
//  Functional Fitness — Entry Point
// ─────────────────────────────────────────────

import './styles/main.css';       // Global CSS Custom Properties + base styles
import { initRouter } from './router.js';

// Boot the SPA once the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initRouter();
});