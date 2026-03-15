import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DetailsPage from './pages/DetailsPage';
import PlayerPage from './pages/PlayerPage';
import SettingsPage from './pages/SettingsPage';
import { applyDynamicTheme, getThemePreference, getMaterialYouColor } from './utils/theme';

// --- APP CONTENT WRAPPER ---
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  // Função centralizada para inicializar o tema
  const initTheme = async () => {
    const prefs = getThemePreference();
    if (prefs.useMaterialYou) {
      const m3Color = await getMaterialYouColor();
      if (m3Color) {
        applyDynamicTheme(m3Color);
        console.log('StreamPlay: Tema Material You aplicado.');
        return;
      }
    }
    applyDynamicTheme(prefs.color);
    console.log('StreamPlay: Tema personalizado aplicado.');
  };

  // Inicializa tema no mount (para browser/fallback)
  useEffect(() => {
    initTheme();
  }, []);

  useEffect(() => {
    const handleDeviceReady = () => {
      console.log('StreamPlay: App pronto. Proteções ativas.');
      
      // Reinicializa o tema após o deviceready para garantir acesso ao plugin
      initTheme();

      (window as any).open = () => null;
      document.addEventListener("backbutton", onBackKeyDown, false);
    };

    const onBackKeyDown = (e: any) => {
      e.preventDefault();
      if (location.pathname !== "/") {
        navigate(-1);
      } else {
        if ((navigator as any).app) {
          (navigator as any).app.exitApp();
        }
      }
    };

    document.addEventListener('deviceready', handleDeviceReady, false);
    return () => {
      document.removeEventListener('deviceready', handleDeviceReady);
      document.removeEventListener('backbutton', onBackKeyDown);
    };
  }, [location, navigate]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/:type/:id" element={<DetailsPage />} />
      <Route path="/player/:type/:id" element={<PlayerPage />} />
      <Route path="/player/:type/:id/:season/:episode" element={<PlayerPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
