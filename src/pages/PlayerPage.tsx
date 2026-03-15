import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
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

  const themeColor = searchParams.get('color') || getSavedThemeColor();
  const optOverlay = searchParams.get('overlay') === 'true';
  const optNextBtn = searchParams.get('nextEpisode') === 'true';
  const optAutoplayNext = searchParams.get('autoplayNextEpisode') === 'true';
  const optEpisodeSelector = searchParams.get('episodeSelector') === 'true';
  const optDub = searchParams.get('dub') === 'true';

  useEffect(() => {
    applyDynamicTheme(themeColor);
    
    if (type && id) {
      getContentDetails(type, id).then(details => {
        setContent(details);
        setIsLoading(false);
      });
    }
  }, [type, id, themeColor]);

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

  return (
    <div className="fixed inset-0 bg-black z-[9999] overflow-hidden">
      {/* Botão de Voltar Minimalista */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-10 left-6 z-[100] bg-black/40 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-all border border-white/10 group"
        title="Voltar"
      >
        <ArrowLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>

      {/* Camada de Loading Premium */}
      <AnimatePresence>
        {!isIframeLoaded && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-zinc-950 flex items-center justify-center"
          >
            {content?.backdrop_path && (
              <img 
                src={getTMDBBackdropUrl(content.backdrop_path)} 
                className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm"
                alt="Background"
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Loader2 size={32} className="text-[hsl(var(--primary))] animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="text-white font-display text-lg font-bold">
                  {content?.title || content?.name || 'Carregando...'}
                </h3>
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Iniciando transmissão segura</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Iframe Real */}
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
