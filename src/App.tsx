import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlayerPage from './pages/PlayerPage';

// --- APP CONTENT WRAPPER ---
// Gerencia a inicialização global e o botão de voltar físico
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleDeviceReady = () => {
      console.log('StreamPlay: App pronto. Proteções ativas.');
      
      // Bloqueia tentativas do player de abrir janelas externas (anúncios)
      (window as any).open = (url: string) => {
        console.warn('Pop-up bloqueado:', url);
        return null;
      };

      // Escuta o botão físico de voltar do Android/iOS (Cordova)
      document.addEventListener("backbutton", onBackKeyDown, false);
    };

    const onBackKeyDown = (e: any) => {
      e.preventDefault();
      
      // Se não estiver na raiz, navega para o path anterior
      if (location.pathname !== "/") {
        navigate(-1);
      } else {
        // Se estiver na home, sai do aplicativo
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
      <Route path="/:type/:id" element={<HomePage />} />
      <Route path="/:type/:id/:season/:episode" element={<HomePage />} />
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
