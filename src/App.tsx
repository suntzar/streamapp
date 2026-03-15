import React, { useState, useEffect } from 'react';
import { Play, Search, User, ArrowLeft, Settings2, Tv, Film, Clapperboard, Activity, Loader2, Calendar, Github, Info, Star } from 'lucide-react';
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

  // Dynamic Theme Effect
  useEffect(() => {
    applyDynamicTheme(themeColor);
  }, [themeColor]);

  // Cordova/VoltBuilder Initialization
  useEffect(() => {
    const handleDeviceReady = () => {
      console.log('App pronto. Proteções ativas.');
      // Bloqueia tentativas do Videasy de abrir novas abas de anúncios
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
        // According to documentation, messages are sent as JSON strings
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && typeof data.progress === 'number') {
          setProgressData({
            progress: data.progress,
            timestamp: data.timestamp || 0,
            duration: data.duration || 0
          });
        }
      } catch (e) {
        // Ignorar mensagens não formatadas ou erros de parsing
      }
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
        {/* Controls Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-safe z-50 flex justify-between items-start pointer-events-none">
          <button 
            onClick={handleBack}
            className="pointer-events-auto bg-black/60 hover:bg-black/90 text-white p-3 rounded-full backdrop-blur-md transition-all flex items-center gap-2 border border-white/10"
            aria-label="Voltar para configuração"
          >
            <ArrowLeft size={24} />
            <span className="hidden sm:inline font-medium">Voltar</span>
          </button>

          {progressData && (
            <div className="pointer-events-auto bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-md text-sm font-mono flex items-center gap-2 border border-white/10" style={{ borderColor: 'hsl(var(--primary) / 0.3)' }}>
              <Activity size={16} className="text-[hsl(var(--primary))]" />
              <span>{(progressData.progress * 100).toFixed(2)}%</span>
            </div>
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
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tighter">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-colors" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-accent)))' }}>
            <Play size={18} className="text-white fill-white" />
          </div>
          <span>StreamPlay</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="https://github.com/suntzar/streamplay" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">
            <Github size={20} />
          </a>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden transition-colors" style={{ borderColor: 'hsl(var(--primary) / 0.2)' }}>
            <User size={16} className="text-zinc-400" />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        {/* Hero / Visual Area */}
        <div className="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none transition-colors" style={{ background: 'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.15), transparent 70%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 blur-[120px] rounded-full pointer-events-none transition-colors" style={{ backgroundColor: 'hsl(var(--primary) / 0.2)' }} />
          
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border text-xs font-medium uppercase tracking-wider transition-colors" style={{ borderColor: 'hsl(var(--primary) / 0.3)', color: 'hsl(var(--primary))' }}>
              <Settings2 size={14} />
              Configuração do Player
            </div>

            {selectedContent ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="flex gap-4">
                  <div className="w-24 h-36 rounded-xl overflow-hidden shadow-2xl border flex-shrink-0 bg-zinc-900 transition-colors" style={{ borderColor: 'hsl(var(--primary) / 0.2)' }}>
                    <img 
                      src={getTMDBImageUrl(selectedContent.poster_path)} 
                      alt={selectedContent.title || selectedContent.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                      {selectedContent.title || selectedContent.name}
                    </h1>
                    <div className="flex items-center gap-3 text-zinc-400 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {(selectedContent.release_date || selectedContent.first_air_date || '').substring(0, 4)}
                      </span>
                      <span className="px-2 py-0.5 rounded text-zinc-300 text-xs font-bold uppercase transition-colors" style={{ backgroundColor: 'hsl(var(--primary-muted) / 0.3)' }}>
                        {selectedContent.media_type === 'movie' ? 'Filme' : 'Série'}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-zinc-400 text-sm max-w-md leading-relaxed line-clamp-3">
                  {selectedContent.overview || 'Sem descrição disponível.'}
                </p>
                <button 
                  onClick={() => setSelectedContent(null)}
                  className="text-xs font-medium flex items-center gap-1 transition-colors" style={{ color: 'hsl(var(--primary))' }}
                >
                  <ArrowLeft size={12} /> Limpar seleção
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight leading-tight">
                  Seu Catálogo <br/>
                  <span className="text-transparent bg-clip-text transition-colors" style={{ backgroundImage: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary-accent)))' }}>
                    Inteligente
                  </span>
                </h1>
                <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
                  Pesquise pelo título e nós encontramos tudo para você. IDs, posters e detalhes agora integrados via TMDB.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Form */}
        <div className="w-full lg:w-1/2 p-6 lg:p-12 flex items-center">
          <div className="w-full max-w-md mx-auto bg-zinc-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm shadow-2xl relative overflow-visible">
            <form onSubmit={handlePlay} className="space-y-6">
              
              {/* TMDB Search */}
              <div className="space-y-3 relative">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Search size={14} />
                  Pesquisar no TMDB
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                    placeholder="Ex: Jack Reacher..."
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 pr-12 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 transition-all"
                    style={{ '--tw-ring-color': 'hsl(var(--primary) / 0.5)' } as React.CSSProperties}
                  />
                  <button
                    type="button"
                    onClick={() => handleSearch()}
                    disabled={isSearching}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-white transition-colors"
                  >
                    {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  </button>
                </div>

                {/* Search Results Overlay */}
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-[60] max-h-72 overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-200" style={{ borderColor: 'hsl(var(--primary) / 0.2)' }}>
                    {searchResults.map((result) => (
                      <button
                        key={`${result.media_type}-${result.id}`}
                        type="button"
                        onClick={() => selectResult(result)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 text-left transition-colors border-b border-white/5 last:border-0"
                      >
                        <div className="w-10 h-14 rounded-md overflow-hidden bg-zinc-800 flex-shrink-0">
                          <img 
                            src={getTMDBImageUrl(result.poster_path)} 
                            className="w-full h-full object-cover"
                            alt={result.title || result.name}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-zinc-100 truncate">
                            {result.title || result.name}
                          </div>
                          <div className="text-xs text-zinc-500 flex items-center gap-2">
                            <span>{(result.release_date || result.first_air_date || '').substring(0, 4)}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold transition-colors" style={{ backgroundColor: 'hsl(var(--primary-muted) / 0.3)', color: 'hsl(var(--primary))' }}>
                              {result.media_type === 'movie' ? 'Filme' : 'Série'}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Manual ID Input (Optional/ReadOnly when selected) */}
              <div className="space-y-4">
                <div className={selectedContent ? 'opacity-50' : ''}>
                  <label htmlFor="contentId" className="block text-sm font-medium text-zinc-300 mb-1.5">ID do Conteúdo (TMDB)</label>
                  <input
                    id="contentId"
                    type="text"
                    required
                    value={contentId}
                    onChange={(e) => setContentId(e.target.value)}
                    placeholder="Ex: 299534"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 transition-all"
                    style={{ '--tw-ring-color': 'hsl(var(--primary) / 0.5)' } as React.CSSProperties}
                  />
                </div>

                {contentType === 'tv' && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                    <div>
                      <label htmlFor="seasonNum" className="block text-sm font-medium text-zinc-300 mb-1.5">Temporada</label>
                      <input
                        id="seasonNum"
                        type="number"
                        min="1"
                        value={seasonNum}
                        onChange={(e) => setSeasonNum(e.target.value)}
                        placeholder="1"
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 transition-all"
                        style={{ '--tw-ring-color': 'hsl(var(--primary) / 0.5)' } as React.CSSProperties}
                      />
                    </div>
                    <div>
                      <label htmlFor="episodeNum" className="block text-sm font-medium text-zinc-300 mb-1.5">Episódio</label>
                      <input
                        id="episodeNum"
                        type="number"
                        min="1"
                        value={episodeNum}
                        onChange={(e) => setEpisodeNum(e.target.value)}
                        placeholder="1"
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 transition-all"
                        style={{ '--tw-ring-color': 'hsl(var(--primary) / 0.5)' } as React.CSSProperties}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Customization Options */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Settings2 size={16} />
                  Opções Visuais
                </h3>
                
                <div className="flex items-center gap-3">
                  <label htmlFor="themeColor" className="text-sm text-zinc-400">Cor do Tema:</label>
                  <div className="flex-1 flex gap-2">
                    <input
                      id="themeColor"
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      placeholder="E50914"
                      className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 py-2 text-zinc-100 focus:outline-none focus:ring-1 transition-all font-mono text-sm"
                      style={{ '--tw-ring-color': 'hsl(var(--primary) / 0.5)' } as React.CSSProperties}
                    />
                    <input 
                      type="color" 
                      value={themeColor.startsWith('#') ? themeColor : `#${themeColor}`} 
                      onChange={(e) => setThemeColor(e.target.value.replace('#', ''))}
                      className="w-10 h-10 rounded-xl border border-white/10 bg-transparent cursor-pointer overflow-hidden p-0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-zinc-950/50 cursor-pointer hover:bg-white/5 transition-all group">
                    <input 
                      type="checkbox" 
                      checked={optOverlay} 
                      onChange={(e) => setOptOverlay(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-700 focus:ring-offset-0 bg-zinc-900 transition-colors"
                      style={{ accentColor: 'hsl(var(--primary))' }}
                    />
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">Overlay</span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-zinc-950/50 cursor-pointer hover:bg-white/5 transition-all group">
                    <input 
                      type="checkbox" 
                      checked={optEpisodeSelector} 
                      onChange={(e) => setOptEpisodeSelector(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-700 focus:ring-offset-0 bg-zinc-900 transition-colors"
                      style={{ accentColor: 'hsl(var(--primary))' }}
                    />
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">Seletor</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-xl font-bold text-lg hover:brightness-110 focus:outline-none focus:ring-4 transition-all flex items-center justify-center gap-2 shadow-lg"
                style={{ 
                  backgroundColor: 'hsl(var(--primary))', 
                  color: 'white',
                  '--tw-ring-color': 'hsl(var(--primary) / 0.3)' 
                } as React.CSSProperties}
              >
                <Play size={20} className="fill-white" />
                Assistir Agora
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
