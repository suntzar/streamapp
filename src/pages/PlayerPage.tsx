import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Activity, Loader2, Info, Calendar, Star, Clock } from 'lucide-react';
import { buildPlayerUrl, PlayerConfig } from '../utils/urlBuilder';
import { TMDBResult, getContentDetails, getTMDBBackdropUrl } from '../utils/tmdb';
import { applyDynamicTheme, getSavedThemeColor } from '../utils/theme';

export default function PlayerPage() {
  const navigate = useNavigate();
  const { type, id, season, episode } = useParams();
  const [searchParams] = useSearchParams();
  
  const [content, setContent] = useState<TMDBResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [progressData, setProgressData] = useState<{ progress: number; timestamp: number; duration: number } | null>(null);
  const [showUI, setShowUI] = useState(true);

  const themeColor = searchParams.get('color') || getSavedThemeColor();
  const optOverlay = searchParams.get('overlay') === 'true';
  const optNextBtn = searchParams.get('nextEpisode') === 'true';
  const optAutoplayNext = searchParams.get('autoplayNextEpisode') === 'true';
  const optEpisodeSelector = searchParams.get('episodeSelector') === 'true';
  const optDub = searchParams.get('dub') === 'true';

  useEffect(() => {
    applyDynamicTheme(themeColor);
    
    // Buscar detalhes do conteúdo para a UI personalizada
    if (type && id) {
      getContentDetails(type, id).then(details => {
        setContent(details);
        setIsLoading(false);
      });
    }
  }, [type, id, themeColor]);

  // Esconder UI automaticamente após alguns segundos de inatividade
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showUI && isIframeLoaded) {
      timeout = setTimeout(() => setShowUI(false), 4000);
    }
    return () => clearTimeout(timeout);
  }, [showUI, isIframeLoaded]);

  const config: PlayerConfig = {
    contentType: type || 'movie',
    contentId: id || '',
    seasonNum: season,
    episodeNum: episode,
    themeColor,
    optOverlay,
    optNextBtn,
    optAutoplayNext,
    optEpisodeSelector,
    optDub,
  };

  const playerUrl = buildPlayerUrl(config);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          if (data && typeof data.progress === 'number') {
            setProgressData({
              progress: data.progress,
              timestamp: data.timestamp || 0,
              duration: data.duration || 0
            });
          }
        } catch (e) {}
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black z-[9999] overflow-hidden cursor-none"
      onMouseMove={() => setShowUI(true)}
      style={{ cursor: showUI ? 'default' : 'none' }}
    >
      {/* Camada de UI Personalizada */}
      <AnimatePresence>
        {showUI && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-between p-6 sm:p-10"
          >
            {/* Header do Player */}
            <div className="flex justify-between items-start">
              <motion.button 
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                onClick={() => navigate(-1)}
                className="pointer-events-auto bg-white/10 hover:bg-white/20 text-white p-4 rounded-2xl backdrop-blur-md transition-all border border-white/10 flex items-center gap-3 group"
              >
                <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold text-sm uppercase tracking-widest">Sair</span>
              </motion.button>

              <div className="flex flex-col items-end gap-3 text-right max-w-[60%]">
                <motion.h2 
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  className="text-white font-display text-2xl sm:text-4xl font-black drop-shadow-2xl"
                >
                  {content?.title || content?.name || 'Carregando...'}
                </motion.h2>
                <div className="flex items-center gap-3">
                  {type === 'tv' && season && (
                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-bold border border-white/10 text-white">
                      T{season} : E{episode}
                    </span>
                  )}
                  {progressData && (
                    <div className="bg-black/60 text-white px-4 py-1 rounded-lg backdrop-blur-md text-xs font-black flex items-center gap-2 border border-white/10" style={{ color: 'hsl(var(--primary))' }}>
                      <Activity size={14} />
                      {(progressData.progress * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rodapé do Player (Info Extra) */}
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-6 text-white/40 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Streaming Estável
                </div>
                <div className="hidden sm:block">Videasy Custom v2.4</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camada de Loading / Poster */}
      <AnimatePresence>
        {(!isIframeLoaded || isLoading) && (
          <motion.div 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-zinc-950 flex items-center justify-center"
          >
            {content?.backdrop_path && (
              <img 
                src={getTMDBBackdropUrl(content.backdrop_path)} 
                className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm"
                alt="Background"
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-6 text-center">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center animate-bounce">
                <Loader2 size={40} className="text-[hsl(var(--primary))] animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-display text-xl font-bold">Preparando sua sessão</h3>
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Ajustando qualidade e conexões...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* O Player Real */}
      <iframe 
        src={playerUrl} 
        onLoad={() => setIsIframeLoaded(true)}
        className="w-full h-full border-none relative z-10"
        allowFullScreen
        allow="encrypted-media"
        title="Video Player"
      />
    </div>
  );
}
