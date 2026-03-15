import React, { useState, useEffect } from 'react';
import { Play, Search, User, ArrowLeft, Settings2, Tv, Film, Clapperboard, Activity } from 'lucide-react';
import { buildPlayerUrl, PlayerConfig } from './utils/urlBuilder';

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerUrl, setPlayerUrl] = useState('');
  const [progressData, setProgressData] = useState<{ progress: number; timestamp: number; duration: number } | null>(null);

  // Form State
  const [contentType, setContentType] = useState('movie');
  const [contentId, setContentId] = useState('');
  const [seasonNum, setSeasonNum] = useState('');
  const [episodeNum, setEpisodeNum] = useState('');
  const [themeColor, setThemeColor] = useState('');
  const [optOverlay, setOptOverlay] = useState(false);
  const [optNextBtn, setOptNextBtn] = useState(false);
  const [optAutoplayNext, setOptAutoplayNext] = useState(false);
  const [optEpisodeSelector, setOptEpisodeSelector] = useState(false);
  const [optDub, setOptDub] = useState(false);

  // Security: Override window.open for mobile/container environments
  useEffect(() => {
    const originalOpen = window.open;
    window.open = function() {
      console.warn('Blocked popup attempt by window.open');
      return null;
    };
    return () => {
      window.open = originalOpen;
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
      } catch (e) {
        // Safely ignore non-JSON messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handlePlay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentId) {
      alert('Por favor, insira um ID de conteúdo válido.');
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
  };

  if (isPlaying) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Safe area top for mobile notches */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-safe z-10 flex justify-between items-start pointer-events-none">
          <button 
            onClick={handleBack}
            className="pointer-events-auto bg-black/50 hover:bg-black/80 text-white p-3 rounded-full backdrop-blur-md transition-all flex items-center gap-2"
            aria-label="Voltar para configuração"
          >
            <ArrowLeft size={24} />
            <span className="hidden sm:inline font-medium">Voltar</span>
          </button>

          {progressData && (
            <div className="pointer-events-auto bg-black/60 text-white px-4 py-2 rounded-lg backdrop-blur-md text-sm font-mono flex items-center gap-2 border border-white/10">
              <Activity size={16} className="text-emerald-400" />
              <span>{(progressData.progress * 100).toFixed(2)}%</span>
            </div>
          )}
        </div>
        
        <iframe 
          src={playerUrl} 
          className="w-full h-full border-0"
          allowFullScreen
          title="Video Player"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-modals allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-storage-access-by-user-activation"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tighter">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Play size={18} className="text-white fill-white" />
          </div>
          <span>StreamPlay</span>
        </div>
        <div className="flex items-center gap-6">
          <button aria-label="Buscar" className="text-zinc-400 hover:text-white transition-colors">
            <Search size={20} />
          </button>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden">
            <User size={16} className="text-zinc-400" />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto">
        {/* Hero / Visual Area */}
        <div className="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 uppercase tracking-wider">
              <Settings2 size={14} />
              Configuração do Player
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight leading-tight">
              Prepare seu <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                conteúdo
              </span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-md leading-relaxed">
              Ajuste os parâmetros do player customizado. Escolha o tipo de mídia, IDs e opções de reprodução para gerar a experiência ideal.
            </p>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="w-full lg:w-1/2 p-6 lg:p-12 flex items-center">
          <div className="w-full max-w-md mx-auto bg-zinc-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm shadow-2xl">
            <form onSubmit={handlePlay} className="space-y-6">
              
              {/* Content Type */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-300">Tipo de Conteúdo</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'movie', label: 'Filme', icon: Film },
                    { id: 'tv', label: 'Série', icon: Tv },
                    { id: 'anime-show', label: 'Anime (Série)', icon: Clapperboard },
                    { id: 'anime-movie', label: 'Anime (Filme)', icon: Film },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setContentType(type.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                        contentType === type.id 
                          ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' 
                          : 'bg-zinc-950/50 border-white/5 text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                      }`}
                    >
                      <type.icon size={16} />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* IDs and Numbers */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="contentId" className="block text-sm font-medium text-zinc-300 mb-1.5">ID do Conteúdo *</label>
                  <input
                    id="contentId"
                    type="text"
                    required
                    value={contentId}
                    onChange={(e) => setContentId(e.target.value)}
                    placeholder="Ex: 12345"
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  />
                </div>

                {contentType === 'tv' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="seasonNum" className="block text-sm font-medium text-zinc-300 mb-1.5">Temporada</label>
                      <input
                        id="seasonNum"
                        type="number"
                        min="1"
                        value={seasonNum}
                        onChange={(e) => setSeasonNum(e.target.value)}
                        placeholder="1"
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
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
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                      />
                    </div>
                  </div>
                )}

                {contentType === 'anime-show' && (
                  <div>
                    <label htmlFor="episodeNumAnime" className="block text-sm font-medium text-zinc-300 mb-1.5">Episódio</label>
                    <input
                      id="episodeNumAnime"
                      type="number"
                      min="1"
                      value={episodeNum}
                      onChange={(e) => setEpisodeNum(e.target.value)}
                      placeholder="1"
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                )}
              </div>

              {/* Customization Options */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Settings2 size={16} />
                  Opções Visuais e Comportamento
                </h3>
                
                <div>
                  <label htmlFor="themeColor" className="block text-sm text-zinc-400 mb-1.5">Cor do Tema (Hex)</label>
                  <div className="flex gap-3">
                    <input
                      id="themeColor"
                      type="text"
                      value={themeColor}
                      onChange={(e) => setThemeColor(e.target.value)}
                      placeholder="Ex: ff0000"
                      className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-sm"
                    />
                    {themeColor && (
                      <div 
                        className="w-10 h-10 rounded-xl border border-white/10"
                        style={{ backgroundColor: themeColor.startsWith('#') ? themeColor : `#${themeColor}` }}
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-zinc-950/50 cursor-pointer hover:bg-white/5 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={optOverlay} 
                      onChange={(e) => setOptOverlay(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-700 text-indigo-500 focus:ring-indigo-500/50 bg-zinc-900"
                    />
                    <span className="text-sm text-zinc-300">Overlay Ativo</span>
                  </label>
                  
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-zinc-950/50 cursor-pointer hover:bg-white/5 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={optNextBtn} 
                      onChange={(e) => setOptNextBtn(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-700 text-indigo-500 focus:ring-indigo-500/50 bg-zinc-900"
                    />
                    <span className="text-sm text-zinc-300">Botão Próximo</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-zinc-950/50 cursor-pointer hover:bg-white/5 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={optAutoplayNext} 
                      onChange={(e) => setOptAutoplayNext(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-700 text-indigo-500 focus:ring-indigo-500/50 bg-zinc-900"
                    />
                    <span className="text-sm text-zinc-300">Autoplay Próximo</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-zinc-950/50 cursor-pointer hover:bg-white/5 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={optEpisodeSelector} 
                      onChange={(e) => setOptEpisodeSelector(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-700 text-indigo-500 focus:ring-indigo-500/50 bg-zinc-900"
                    />
                    <span className="text-sm text-zinc-300">Seletor de Episódio</span>
                  </label>

                  {(contentType === 'anime-show' || contentType === 'anime-movie') && (
                    <label className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-zinc-950/50 cursor-pointer hover:bg-white/5 transition-colors sm:col-span-2">
                      <input 
                        type="checkbox" 
                        checked={optDub} 
                        onChange={(e) => setOptDub(e.target.checked)}
                        className="w-4 h-4 rounded border-zinc-700 text-indigo-500 focus:ring-indigo-500/50 bg-zinc-900"
                      />
                      <span className="text-sm text-zinc-300">Versão Dublada</span>
                    </label>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 px-6 rounded-xl bg-white text-black font-bold text-lg hover:bg-zinc-200 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all flex items-center justify-center gap-2 mt-4"
              >
                <Play size={20} className="fill-black" />
                Assistir Agora
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
