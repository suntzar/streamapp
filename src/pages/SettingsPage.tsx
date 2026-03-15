import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Palette, Settings2, ShieldCheck, Save, Trash2, Github, ChevronRight, Smartphone } from 'lucide-react';
import { applyDynamicTheme, getThemePreference, saveThemePreference, getMaterialYouColor } from '../utils/theme';

export default function SettingsPage() {
  const navigate = useNavigate();
  const initialPrefs = getThemePreference();
  
  const [themeColor, setThemeColor] = useState(initialPrefs.color);
  const [useMaterialYou, setUseMaterialYou] = useState(initialPrefs.useMaterialYou);
  const [isSaved, setIsSaved] = useState(false);
  const [hasMaterialYou, setHasMaterialYou] = useState(false);

  // Check if Material You is available on this device
  useEffect(() => {
    if ((window as any).DynamicColor) {
      setHasMaterialYou(true);
    }
  }, []);

  // Effect to apply theme in real-time while previewing in settings
  useEffect(() => {
    async function updateTheme() {
      if (useMaterialYou) {
        const m3Color = await getMaterialYouColor();
        if (m3Color) {
          applyDynamicTheme(m3Color);
          return;
        }
      }
      applyDynamicTheme(themeColor);
    }
    updateTheme();
  }, [themeColor, useMaterialYou]);

  const handleSave = () => {
    saveThemePreference(themeColor, useMaterialYou);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    const defaultColor = '6366f1';
    setThemeColor(defaultColor);
    setUseMaterialYou(false);
    saveThemePreference(defaultColor, false);
    applyDynamicTheme(defaultColor);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-[hsl(var(--primary)/0.3)] relative overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full opacity-20 transition-colors duration-1000" style={{ backgroundColor: 'hsl(var(--primary))' }} />
      </div>

      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm uppercase tracking-widest font-display">Voltar</span>
        </button>
        <h1 className="text-xl font-bold font-display tracking-tighter">Ajustes</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto p-6 relative z-10 space-y-8">
        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Palette size={24} className="text-[hsl(var(--primary))]" />
            <h2 className="text-xl font-bold font-display uppercase tracking-widest">Personalização</h2>
          </div>

          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 lg:p-8 backdrop-blur-md space-y-8">
            
            {/* Material You Option (Only if supported or for preview) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Material You (Dinâmico)</label>
                {!hasMaterialYou && (
                  <span className="text-[8px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded-full font-black">NÃO SUPORTADO</span>
                )}
              </div>
              
              <button 
                onClick={() => setUseMaterialYou(!useMaterialYou)}
                className={`w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all active:scale-95 group relative overflow-hidden ${
                  useMaterialYou ? 'border-[hsl(var(--primary)/0.5)] bg-[hsl(var(--primary)/0.1)]' : 'border-white/5 bg-black/20'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${useMaterialYou ? 'bg-[hsl(var(--primary))] text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                    <Smartphone size={24} />
                  </div>
                  <div className="text-left">
                    <h3 className={`font-bold text-sm ${useMaterialYou ? 'text-[hsl(var(--primary))]' : 'text-zinc-300'}`}>Cores do Sistema</h3>
                    <p className="text-[10px] text-zinc-500 font-medium">Sincronizar com o papel de parede (Android 12+)</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${useMaterialYou ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] shadow-[0_0_10px_hsl(var(--primary))]' : 'border-zinc-700 bg-transparent'}`}>
                  {useMaterialYou && <ShieldCheck size={14} className="text-white" />}
                </div>
              </button>
            </div>

            {/* Manual Color Picker - Disabled if Material You is active */}
            <div className={`space-y-4 transition-opacity duration-300 ${useMaterialYou ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest px-1">Cor Personalizada</label>
              <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
                <div 
                  className="relative w-14 h-14 rounded-2xl overflow-hidden cursor-pointer shadow-lg border-2 border-white/10 active:scale-95 transition-transform" 
                  style={{ backgroundColor: themeColor.startsWith('#') ? themeColor : `#${themeColor}` }}
                >
                  <input 
                    type="color" 
                    value={themeColor.startsWith('#') ? themeColor : `#${themeColor}`} 
                    onChange={(e) => setThemeColor(e.target.value.replace('#', ''))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={themeColor.toUpperCase()}
                    onChange={(e) => setThemeColor(e.target.value.replace('#', ''))}
                    className="w-full bg-transparent font-mono text-xl font-bold text-zinc-100 focus:outline-none"
                    placeholder="HEX CODE"
                  />
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Toque no quadrado para escolher</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <button 
                onClick={handleSave}
                className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-sm bg-white text-black hover:bg-zinc-200 transition-all active:scale-95 shadow-xl"
              >
                {isSaved ? <ShieldCheck size={18} className="text-emerald-600" /> : <Save size={18} />}
                {isSaved ? 'SALVO COM SUCESSO' : 'SALVAR PREFERÊNCIAS'}
              </button>
              <button 
                onClick={handleReset}
                className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-sm bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white transition-all active:scale-95"
              >
                <Trash2 size={18} />
                RESTAURAR PADRÃO
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <Settings2 size={24} className="text-[hsl(var(--primary))]" />
            <h2 className="text-xl font-bold font-display uppercase tracking-widest">Sobre o App</h2>
          </div>

          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex justify-between items-center text-sm font-medium py-2 border-b border-white/5">
              <span className="text-zinc-500">Versão da Interface</span>
              <span className="text-zinc-300">v2.6.0-hybrid</span>
            </div>
            <div className="flex justify-between items-center text-sm font-medium py-2 border-b border-white/5">
              <span className="text-zinc-500">Motor de Reprodução</span>
              <span className="text-zinc-300">Videasy Custom v2.4</span>
            </div>
            <div className="flex justify-between items-center text-sm font-medium py-2">
              <span className="text-zinc-500">Status da API TMDB</span>
              <span className="flex items-center gap-1.5 text-emerald-500">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Conectado
              </span>
            </div>
          </div>

          <a 
            href="https://github.com/suntzar/streamplay" 
            target="_blank" 
            rel="noreferrer"
            className="flex items-center justify-between p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl hover:bg-indigo-500/20 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Github size={24} />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-bold text-indigo-100 font-display">Projeto no GitHub</h3>
                <p className="text-xs text-indigo-400/80 font-medium uppercase tracking-widest">Código fonte e licenças</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-indigo-500 group-hover:translate-x-1 transition-transform" />
          </a>
        </section>
      </main>

      <footer className="p-12 text-center space-y-2 relative z-10">
        <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em]">Design & Engenharia por IronCripto</p>
        <p className="text-zinc-800 text-[8px] font-black">SUNTZAR STREAMING SOLUTIONS © 2026</p>
      </footer>
    </div>
  );
}
