import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Settings2, Calendar, Star, Info, Tv, Film, Clapperboard, User } from 'lucide-react';
import { TMDBResult, getContentDetails, getTMDBImageUrl, getTMDBBackdropUrl } from '../utils/tmdb';
import { getThemePreference } from '../utils/theme';

export default function DetailsPage() {
  const navigate = useNavigate();
  const { type, id } = useParams();
  
  const [content, setContent] = useState<TMDBResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [themeColor] = useState(getThemePreference().color);

  // Player Options
  const [seasonNum, setSeasonNum] = useState('1');
  const [episodeNum, setEpisodeNum] = useState('1');
  const [optOverlay, setOptOverlay] = useState(true);
  const [optEpisodeSelector, setOptEpisodeSelector] = useState(true);
  const [optDub, setOptDub] = useState(false);

  useEffect(() => {
    if (type && id) {
      getContentDetails(type, id).then(details => {
        setContent(details);
        setIsLoading(false);
      });
    }
  }, [type, id]);

  const handlePlay = () => {
    let path = `/player/${type}/${id}`;
    if (type === 'tv' || type === 'anime-show') {
      path = `/player/${type}/${id}/${seasonNum}/${episodeNum}`;
    }

    const params = new URLSearchParams();
    if (themeColor) params.append('color', themeColor);
    if (optOverlay) params.append('overlay', 'true');
    if (optEpisodeSelector) params.append('selector', 'true');
    if (optDub) params.append('dub', 'true');

    navigate(`${path}?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/10 border-t-[hsl(var(--primary))] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-[hsl(var(--primary)/0.3)] relative overflow-x-hidden">
      {/* Background Banner */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {content?.backdrop_path && (
          <img src={getTMDBBackdropUrl(content.backdrop_path)} className="w-full h-full object-cover opacity-20 blur-sm" style={{ objectPosition: 'center 20%' }} alt="Background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
      </div>

      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm uppercase tracking-widest font-display">Explorar</span>
        </button>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/settings')}
            className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center cursor-pointer hover:border-[hsl(var(--primary)/0.3)] transition-all group"
          >
            <User size={20} className="text-zinc-400 group-hover:text-[hsl(var(--primary))] transition-colors" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-accent)))' }}>
            <Play size={20} className="text-white fill-white ml-0.5" />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto relative z-10 p-6 lg:p-12 gap-12">
        {/* Poster and Basic Info */}
        <div className="w-full lg:w-1/2 flex flex-col gap-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm mx-auto lg:mx-0 rounded-[2.5rem] overflow-hidden shadow-2xl border-2 ring-8 ring-black/50"
            style={{ borderColor: 'hsl(var(--primary) / 0.3)' }}
          >
            <img src={getTMDBImageUrl(content?.poster_path || '')} className="w-full h-full object-cover" alt="Poster" />
          </motion.div>

          <div className="space-y-6">
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight font-display">
                {content?.title || content?.name}
              </h1>
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3 text-zinc-400">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 text-sm font-medium">
                  <Calendar size={16} />
                  {(content?.release_date || content?.first_air_date || '').substring(0, 4)}
                </span>
                <span className="px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wider" style={{ backgroundColor: 'hsl(var(--primary) / 0.2)', color: 'hsl(var(--primary))' }}>
                  {type === 'movie' ? 'Filme' : 'Série'}
                </span>
              </div>
            </div>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-xl text-center lg:text-left">
              {content?.overview || 'Sem descrição disponível.'}
            </p>
          </div>
        </div>

        {/* Configuration and Play */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md mx-auto bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 lg:p-10 backdrop-blur-2xl shadow-2xl space-y-8"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Settings2 size={24} className="text-[hsl(var(--primary))]" />
                <h2 className="text-xl font-bold font-display uppercase tracking-widest">Configuração</h2>
              </div>

              {/* Episodic Controls */}
              {(type === 'tv' || type === 'anime-show') && (
                <div className="grid grid-cols-2 gap-4">
                  {type === 'tv' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Temporada</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={seasonNum} 
                        onChange={(e) => setSeasonNum(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-zinc-100 focus:outline-none focus:border-[hsl(var(--primary)/0.3)] transition-all font-bold"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Episódio</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={episodeNum} 
                      onChange={(e) => setEpisodeNum(e.target.value)}
                      className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-zinc-100 focus:outline-none focus:border-[hsl(var(--primary)/0.3)] transition-all font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Feature Toggles */}
              <div className="grid grid-cols-1 gap-3">
                <button type="button" onClick={() => setOptOverlay(!optOverlay)} className="flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-95 group relative overflow-hidden" style={{ borderColor: optOverlay ? 'hsl(var(--primary) / 0.5)' : 'rgba(255,255,255,0.05)', backgroundColor: optOverlay ? 'hsl(var(--primary) / 0.1)' : 'rgba(0,0,0,0.2)' }}>
                  <span className={`text-xs font-bold transition-colors ${optOverlay ? 'text-[hsl(var(--primary))]' : 'text-zinc-500 group-hover:text-zinc-300'}`}>Overlay Estilo Netflix</span>
                  <div className={`w-2 h-2 rounded-full transition-all ${optOverlay ? 'scale-125 shadow-[0_0_8px_hsl(var(--primary))]' : 'scale-75 bg-zinc-800'}`} style={{ backgroundColor: optOverlay ? 'hsl(var(--primary))' : undefined }} />
                </button>
                
                <button type="button" onClick={() => setOptEpisodeSelector(!optEpisodeSelector)} className="flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-95 group relative overflow-hidden" style={{ borderColor: optEpisodeSelector ? 'hsl(var(--primary) / 0.5)' : 'rgba(255,255,255,0.05)', backgroundColor: optEpisodeSelector ? 'hsl(var(--primary) / 0.1)' : 'rgba(0,0,0,0.2)' }}>
                  <span className={`text-xs font-bold transition-colors ${optEpisodeSelector ? 'text-[hsl(var(--primary))]' : 'text-zinc-500 group-hover:text-zinc-300'}`}>Seletor de Episódios</span>
                  <div className={`w-2 h-2 rounded-full transition-all ${optEpisodeSelector ? 'scale-125 shadow-[0_0_8px_hsl(var(--primary))]' : 'scale-75 bg-zinc-800'}`} style={{ backgroundColor: optEpisodeSelector ? 'hsl(var(--primary))' : undefined }} />
                </button>

                {type.startsWith('anime') && (
                  <button type="button" onClick={() => setOptDub(!optDub)} className="flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-95 group relative overflow-hidden" style={{ borderColor: optDub ? 'hsl(var(--primary) / 0.5)' : 'rgba(255,255,255,0.05)', backgroundColor: optDub ? 'hsl(var(--primary) / 0.1)' : 'rgba(0,0,0,0.2)' }}>
                    <span className={`text-xs font-bold transition-colors ${optDub ? 'text-[hsl(var(--primary))]' : 'text-zinc-500 group-hover:text-zinc-300'}`}>Versão Dublada (DUB)</span>
                    <div className={`w-2 h-2 rounded-full transition-all ${optDub ? 'scale-125 shadow-[0_0_8px_hsl(var(--primary))]' : 'scale-75 bg-zinc-800'}`} style={{ backgroundColor: optDub ? 'hsl(var(--primary))' : undefined }} />
                  </button>
                )}
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              onClick={handlePlay}
              className="w-full py-6 px-8 rounded-[2rem] font-bold text-xl transition-all shadow-2xl flex items-center justify-center gap-3 relative overflow-hidden group font-display" 
              style={{ backgroundColor: 'hsl(var(--primary))', color: 'white' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Play size={28} className="fill-white" /> ASSISTIR AGORA
            </motion.button>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
