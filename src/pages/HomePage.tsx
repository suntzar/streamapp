import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Search, User, Loader2, Github, ChevronRight } from 'lucide-react';
import { searchContent, TMDBResult, getTMDBImageUrl } from '../utils/tmdb';
import { getThemePreference } from '../utils/theme';

export default function HomePage() {
  const navigate = useNavigate();
  const [themeColor] = useState(getThemePreference().color);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    navigate(`/${result.media_type}/${result.id}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-[hsl(var(--primary)/0.3)] relative overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-colors duration-1000" style={{ backgroundColor: 'hsl(var(--primary) / 0.15)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-colors duration-1000" style={{ backgroundColor: 'hsl(var(--primary-accent) / 0.1)' }} />
      </div>

      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tighter cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-accent)))' }}>
            <Play size={20} className="text-white fill-white ml-1" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 font-display font-extrabold text-2xl">StreamPlay</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="https://github.com/suntzar/streamplay" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-all"><Github size={20} /></a>
          <button 
            onClick={() => navigate('/settings')}
            className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center cursor-pointer hover:border-[hsl(var(--primary)/0.3)] transition-all group"
          >
            <User size={20} className="text-zinc-400 group-hover:text-[hsl(var(--primary))] transition-colors" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl text-center space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tighter leading-tight font-display">
              Descubra sua próxima <br/>
              <span className="text-transparent bg-clip-text transition-all duration-1000" style={{ backgroundImage: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary-accent)), hsl(var(--primary)))', backgroundSize: '200% auto' }}>
                Experiência
              </span>
            </h1>
            <p className="text-zinc-400 text-xl max-w-md mx-auto leading-relaxed font-medium">
              Pesquise por milhões de filmes e séries com o catálogo inteligente do TMDB integrado.
            </p>
          </div>

          <div ref={searchRef} className="w-full max-w-lg mx-auto relative">
            <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                placeholder="Busque por título..."
                className="w-full bg-zinc-900/50 border-2 border-white/5 rounded-2xl px-6 py-5 pr-14 text-lg text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[hsl(var(--primary)/0.5)] transition-all shadow-2xl backdrop-blur-sm"
              />
              <button
                type="button"
                onClick={() => handleSearch()}
                disabled={isSearching}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl flex items-center justify-center text-zinc-500 hover:text-white transition-all active:scale-90"
              >
                {isSearching ? <Loader2 size={24} className="animate-spin" /> : <Search size={24} />}
              </button>
            </div>

            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 right-0 mt-4 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-[100] max-h-[400px] overflow-y-auto scrollbar-hide backdrop-blur-xl divide-y divide-white/5 ring-1 ring-black"
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
                          alt="Poster"
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="text-base font-bold text-zinc-100 truncate group-hover:text-[hsl(var(--primary))] transition-colors">
                          {result.title || result.name}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-zinc-500">
                          <span className="font-mono">{(result.release_date || result.first_air_date || '').substring(0, 4)}</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold transition-colors" style={{ backgroundColor: 'hsl(var(--primary-muted) / 0.2)', color: 'hsl(var(--primary))' }}>
                            {result.media_type === 'movie' ? 'Filme' : 'Série'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 text-zinc-600 transition-opacity" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </main>

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
