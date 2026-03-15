import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Search, User, ArrowLeft, Settings2, Tv, Film, Clapperboard, Activity, Loader2, Calendar, Github, Info, Star, ChevronRight, X } from 'lucide-react';
import { buildPlayerUrl, PlayerConfig } from './utils/urlBuilder';
import { searchContent, TMDBResult, getTMDBImageUrl } from './utils/tmdb';
import { applyDynamicTheme, getSavedThemeColor } from './utils/theme';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerUrl, setPlayerUrl] = useState('');
  const [progressData, setProgressData] = useState<{ progress: number; timestamp: number; duration: number } | null>(null);

  // Form State
  const [contentType, setContentType] = useState('movie');
  const [contentId, setContentId] = useState('299534');
  const [seasonNum, setSeasonNum] = useState('');
  const [episodeNum, setEpisodeNum] = useState('');
  const [themeColor, setThemeColor] = useState(getSavedThemeColor());
  const [optOverlay, setOptOverlay] = useState(false);
  const [optNextBtn, setOptNextBtn] = useState(false);
  const [optAutoplayNext, setOptAutoplayNext] = useState(false);
  const [optEpisodeSelector, setOptEpisodeSelector] = useState(false);
  const [optDub, setOptDub] = useState(false);

  // TMDB State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedContent, setSelectedContent] = useState<TMDBResult | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Dynamic Theme Effect
  useEffect(() => {
    applyDynamicTheme(themeColor);
  }, [themeColor]);

  // Click Outside to close search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cordova/VoltBuilder Initialization
  useEffect(() => {
    const handleDeviceReady = () => {
      console.log('App pronto. Proteções ativas.');
      window.open = (url) => {
        console.log('Pop-up bloqueado: ' + url);
        return null;
      };
    };

    document.addEventListener('deviceready', handleDeviceReady, false);
    return () => {
      document.removeEventListener('deviceready', handleDeviceReady);
    };
  }, []);

  // Message Listener for Player Progress
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && typeof data.progress === 'number') {
          setProgressData({
            progress: data.progress,
            timestamp: data.timestamp || 0,
            duration: data.duration || 0
          });
        }
      } catch (e) {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    const results = await searchContent(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const selectResult = (result: TMDBResult) => {
    setSelectedContent(result);
    setContentId(result.id.toString());
    setContentType(result.media_type);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handlePlay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentId) {
      alert('Por favor, pesquise um conteúdo ou insira um ID válido.');
      return;
    }

    const config: PlayerConfig = {
      contentType,
      contentId,
      seasonNum,
      episodeNum,
      themeColor,
      optOverlay,
      optNextBtn,
      optAutoplayNext,
      optEpisodeSelector,
      optDub,
    };

    const url = buildPlayerUrl(config);
    setPlayerUrl(url);
    setIsPlaying(true);
    setProgressData(null);
  };

  const handleBack = () => {
    setIsPlaying(false);
    setPlayerUrl('');
    setProgressData(null);
  };

  if (isPlaying) {
    return (
      <div className="fixed inset-0 bg-black z-[9999]">
        <div className="absolute top-0 left-0 right-0 p-4 pt-safe z-50 flex justify-between items-start pointer-events-none">
          <motion.button 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleBack}
            className="pointer-events-auto bg-black/60 hover:bg-black/90 text-white p-3 rounded-full backdrop-blur-md transition-all flex items-center gap-2 border border-white/10"
            aria-label="Voltar para configuração"
          >
            <ArrowLeft size={24} />
            <span className="hidden sm:inline font-medium">Voltar</span>
          </motion.button>

          {progressData && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pointer-events-auto bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-md text-sm font-mono flex items-center gap-2 border border-white/10" style={{ borderColor: 'hsl(var(--primary) / 0.3)' }}>
              <Activity size={16} className="text-[hsl(var(--primary))]" />
              <span>{(progressData.progress * 100).toFixed(2)}%</span>
            </motion.div>
          )}
        </div>
        
        <iframe 
          key={playerUrl}
          src={playerUrl} 
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          title="Video Player"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-[hsl(var(--primary)/0.3)]">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-colors duration-1000" style={{ backgroundColor: 'hsl(var(--primary) / 0.15)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-colors duration-1000" style={{ backgroundColor: 'hsl(var(--primary-accent) / 0.1)' }} />
      </div>

      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 text-xl font-bold tracking-tighter"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-accent)))' }}>
            <Play size={20} className="text-white fill-white ml-1" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 font-display">StreamPlay</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <a href="https://github.com/suntzar/streamplay" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/20 transition-all">
            <Github size={20} />
          </a>
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center overflow-hidden transition-all hover:border-[hsl(var(--primary)/0.3)] cursor-pointer">
            <User size={20} className="text-zinc-400" />
          </div>
        </motion.div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto relative z-10">
        {/* Left Section: Info/Selected */}
        <div className="w-full lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border text-xs font-bold uppercase tracking-widest transition-colors" style={{ borderColor: 'hsl(var(--primary) / 0.3)', color: 'hsl(var(--primary))' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'currentColor' }} />
              Configuração Profissional
            </motion.div>

            <AnimatePresence mode="wait">
              {selectedContent ? (
                <motion.div 
                  key="selected"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <motion.div 
                      layoutId="poster"
                      className="w-32 h-48 rounded-2xl overflow-hidden shadow-2xl border-2 flex-shrink-0 bg-zinc-900 ring-4 ring-black/50" style={{ borderColor: 'hsl(var(--primary) / 0.3)' }}>
                      <img 
                        src={getTMDBImageUrl(selectedContent.poster_path)} 
                        alt={selectedContent.title || selectedContent.name}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <div className="space-y-3">
                      <h1 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight font-display">
                        {selectedContent.title || selectedContent.name}
                      </h1>                      <div className="flex flex-wrap items-center gap-3 text-zinc-400">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 text-sm font-medium">
                          <Calendar size={14} className="text-zinc-500" />
                          {(selectedContent.release_date || selectedContent.first_air_date || '').substring(0, 4)}
                        </span>
                        <span className="px-3 py-1 rounded-lg text-sm font-bold uppercase tracking-wider" style={{ backgroundColor: 'hsl(var(--primary) / 0.2)', color: 'hsl(var(--primary))' }}>
                          {selectedContent.media_type === 'movie' ? 'Filme' : 'Série'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-zinc-400 text-lg leading-relaxed line-clamp-4 max-w-xl">
                    {selectedContent.overview || 'Nenhuma descrição disponível para este título em português.'}
                  </p>
                  <button 
                    onClick={() => setSelectedContent(null)}
                    className="group inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 hover:border-white/20 transition-all active:scale-95"
                  >
                    <X size={16} className="text-zinc-500 group-hover:text-red-400 transition-colors" /> 
                    Limpar Escolha
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="hero"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[1.1] font-display">
                    O Cinema na <br/>
                    <span className="text-transparent bg-clip-text transition-all duration-1000" style={{ backgroundImage: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary-accent)), hsl(var(--primary)))', backgroundSize: '200% auto' }}>
                      Sua Mão
                    </span>
                  </h1>
                  <p className="text-zinc-400 text-xl max-w-md leading-relaxed font-medium">
                    Integre sua biblioteca do TMDB com o player customizado mais moderno do mercado. 
                  </p>
                  <div className="flex items-center gap-4 text-zinc-500">
                    <div className="flex -space-x-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-950 bg-zinc-800 flex items-center justify-center">
                          <User size={16} />
                        </div>
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-zinc-400">+500 usuários ativos</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="w-full lg:w-1/2 p-6 lg:p-12 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 lg:p-10 backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] relative overflow-visible"
          >
            <form onSubmit={handlePlay} className="space-y-8">
              
              {/* Search Section */}
              <div ref={searchRef} className="space-y-3 relative">
                <label className="text-sm font-bold text-zinc-400 flex items-center gap-2 px-1">
                  <Search size={16} className="text-[hsl(var(--primary))]" />
                  LOCALIZAR CONTEÚDO
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                    placeholder="Filme ou Série (ex: Interstellar)..."
                    className="w-full bg-black/40 border-2 border-white/5 rounded-2xl px-5 py-4 pr-12 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[hsl(var(--primary)/0.5)] transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => handleSearch()}
                    disabled={isSearching}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white transition-all active:scale-90"
                  >
                    {isSearching ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={24} />}
                  </button>
                </div>

                {/* Results Overlay */}
                <AnimatePresence>
                  {searchResults.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 right-0 mt-3 bg-zinc-900/95 border border-white/10 rounded-2xl shadow-2xl z-[100] max-h-[400px] overflow-y-auto scrollbar-hide backdrop-blur-xl divide-y divide-white/5 ring-1 ring-black"
                    >
                      {searchResults.map((result) => (
                        <button
                          key={`${result.media_type}-${result.id}`}
                          type="button"
                          onClick={() => selectResult(result)}
                          className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.03] text-left transition-all group"
                        >
                          <div className="w-14 h-20 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                            <img 
                              src={getTMDBImageUrl(result.poster_path)} 
                              className="w-full h-full object-cover"
                              alt={result.title || result.name}
                            />
                          </div>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="text-base font-bold text-zinc-100 truncate group-hover:text-[hsl(var(--primary))] transition-colors">
                              {result.title || result.name}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-zinc-500">
                              <span className="font-mono">{(result.release_date || result.first_air_date || '').substring(0, 4)}</span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-black transition-colors" style={{ backgroundColor: 'hsl(var(--primary-muted) / 0.2)', color: 'hsl(var(--primary))' }}>
                                {result.media_type === 'movie' ? 'Filme' : 'Série'}
                              </span>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight size={20} className="text-zinc-600" />
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ID & Details Section */}
              <div className="space-y-5">
                <div className={selectedContent ? 'opacity-40' : ''}>
                  <div className="flex justify-between items-center px-1 mb-2">
                    <label htmlFor="contentId" className="text-sm font-bold text-zinc-400">ID MANUAL</label>
                    <Info size={14} className="text-zinc-600" />
                  </div>
                  <input
                    id="contentId"
                    type="text"
                    required
                    value={contentId}
                    onChange={(e) => setContentId(e.target.value)}
                    placeholder="TMDb ID"
                    className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-zinc-100 focus:outline-none focus:border-[hsl(var(--primary)/0.3)] transition-all"
                  />
                </div>

                <AnimatePresence>
                  {contentType === 'tv' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase px-1">Temporada</label>
                        <input
                          type="number"
                          min="1"
                          value={seasonNum}
                          onChange={(e) => setSeasonNum(e.target.value)}
                          placeholder="1"
                          className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-3.5 text-zinc-100 focus:outline-none focus:border-[hsl(var(--primary)/0.3)] transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black tracking-widest text-zinc-500 uppercase px-1">Episódio</label>
                        <input
                          type="number"
                          min="1"
                          value={episodeNum}
                          onChange={(e) => setEpisodeNum(e.target.value)}
                          placeholder="1"
                          className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-3.5 text-zinc-100 focus:outline-none focus:border-[hsl(var(--primary)/0.3)] transition-all"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme & Extras */}
              <div className="space-y-6 pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-zinc-200">Personalização</h3>
                    <p className="text-[10px] text-zinc-500 font-medium">A cor afeta toda a interface do app</p>
                  </div>
                  <div className="flex items-center gap-3 bg-black/20 p-2 rounded-2xl border border-white/5">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-transform shadow-lg border border-white/10" style={{ backgroundColor: themeColor.startsWith('#') ? themeColor : `#${themeColor}` }}>
                      <input 
                        type="color" 
                        value={themeColor.startsWith('#') ? themeColor : `#${themeColor}`} 
                        onChange={(e) => setThemeColor(e.target.value.replace('#', ''))}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                      />
                    </div>
                    <input
                      type="text"
                      value={themeColor.toUpperCase()}
                      onChange={(e) => setThemeColor(e.target.value.replace('#', ''))}
                      className="w-20 bg-transparent text-center font-mono text-sm font-bold text-zinc-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'overlay', label: 'Overlay Netflix', state: optOverlay, set: setOptOverlay },
                    { id: 'selector', label: 'Seletor Ep.', state: optEpisodeSelector, set: setOptEpisodeSelector },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => opt.set(!opt.state)}
                      className="flex items-center justify-between p-4 rounded-2xl border-2 transition-all active:scale-95 group relative overflow-hidden"
                      style={{ 
                        borderColor: opt.state ? 'hsl(var(--primary) / 0.5)' : 'rgba(255,255,255,0.05)',
                        backgroundColor: opt.state ? 'hsl(var(--primary) / 0.1)' : 'rgba(0,0,0,0.2)'
                      }}
                    >
                      <span className={`text-xs font-bold transition-colors ${opt.state ? 'text-[hsl(var(--primary))]' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                        {opt.label}
                      </span>
                      <div className={`w-2 h-2 rounded-full transition-all ${opt.state ? 'scale-125 shadow-[0_0_8px_hsl(var(--primary))]' : 'scale-75 bg-zinc-800'}`} style={{ backgroundColor: opt.state ? 'hsl(var(--primary))' : undefined }} />
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02, brightness: 1.1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-5 px-8 rounded-2xl font-black text-xl tracking-tight transition-all shadow-[0_20px_40px_-12px_rgba(0,0,0,0.5)] flex items-center justify-center gap-3 relative overflow-hidden group font-display"
                style={{ 
                  backgroundColor: 'hsl(var(--primary))', 
                  color: 'white'
                } as React.CSSProperties}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <Play size={24} className="fill-white" />
                ASSISTIR AGORA
              </motion.button>
            </form>
          </motion.div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="p-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-zinc-600 text-[10px] font-bold uppercase tracking-widest relative z-10">
        <div className="flex items-center gap-6">
          <span>Videasy v2.4</span>
          <span>TMDB API Ready</span>
          <span className="text-[hsl(var(--primary))]">PWA Optimized</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Design by IronCripto</span>
          <div className="w-1 h-1 rounded-full bg-zinc-800" />
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}
