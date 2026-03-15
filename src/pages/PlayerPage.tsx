import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { buildPlayerUrl } from '../utils/urlBuilder';
import { TMDBResult, getContentDetails, getTMDBBackdropUrl } from '../utils/tmdb';
import { getThemePreference } from '../utils/theme';

export default function PlayerPage() {
  const navigate = useNavigate();
  const { type, id, season, episode } = useParams();
  const [searchParams] = useSearchParams();
  
  const [content, setContent] = useState<TMDBResult | null>(null);
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);

  const themeColor = searchParams.get('color') || getThemePreference().color;
  const optOverlay = searchParams.get('overlay') === 'true';
  const optEpisodeSelector = searchParams.get('selector') === 'true';
  const optDub = searchParams.get('dub') === 'true';

  useEffect(() => {
    if (type && id) {
      getContentDetails(type, id).then(details => {
        if (details) setContent(details);
      });
    }
  }, [type, id]);

  const playerUrl = buildPlayerUrl({
    contentType: type || 'movie',
    contentId: id || '',
    seasonNum: season,
    episodeNum: episode,
    themeColor,
    optOverlay,
    optEpisodeSelector,
    optDub,
  });

  return (
    <div className="fixed inset-0 bg-black z-[9999] overflow-hidden">
      {/* Overlay controls - only back button */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-10 left-6 z-[100] bg-black/40 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-all border border-white/10 group"
        title="Voltar"
      >
        <ArrowLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>

      {/* Loading Screen */}
      {!isIframeLoaded && (
        <div className="absolute inset-0 z-50 bg-zinc-950 flex items-center justify-center">
          {content?.backdrop_path && (
            <img 
              src={getTMDBBackdropUrl(content.backdrop_path)} 
              className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md"
              alt="Background"
            />
          )}
          <div className="relative z-10 flex flex-col items-center gap-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Loader2 size={32} className="text-[hsl(var(--primary))] animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-display text-lg font-bold">
                {content?.title || content?.name || 'Iniciando...'}
              </h3>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">Preparando Player</p>
            </div>
          </div>
        </div>
      )}

      {/* The Iframe - Essential attributes only */}
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
