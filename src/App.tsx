import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DetailsPage from './pages/DetailsPage';
import PlayerPage from './pages/PlayerPage';
import SettingsPage from './pages/SettingsPage';

// --- APP CONTENT WRAPPER ---
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleDeviceReady = () => {
      console.log('StreamPlay: App pronto. Proteções ativas.');
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

// --- APP ROOT ---
export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}
