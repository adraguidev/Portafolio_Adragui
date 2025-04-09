import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import './i18n';

// Import fonts
const loadFonts = () => {
  // Add Inter font from Google Fonts
  const interLink = document.createElement('link');
  interLink.rel = 'stylesheet';
  interLink.href =
    'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.15/index.css';
  document.head.appendChild(interLink);

  // Add Clash Display from Fontshare
  const clashLink = document.createElement('link');
  clashLink.rel = 'stylesheet';
  clashLink.href =
    'https://api.fontshare.com/v2/css?f[]=clash-display@600,700,500&display=swap';
  document.head.appendChild(clashLink);

  // Add Remix icons
  const remixIconsLink = document.createElement('link');
  remixIconsLink.rel = 'stylesheet';
  remixIconsLink.href =
    'https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css';
  document.head.appendChild(remixIconsLink);
};

// Set page title
document.title = 'Adrián Aguirre | Portafolio Profesional';

// Load fonts
loadFonts();

// Componente de carga mientras se inicializa i18n
const Loader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense fallback={<Loader />}>
      <App />
    </Suspense>
  </React.StrictMode>
);
