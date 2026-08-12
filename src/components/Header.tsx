import { useState, useEffect } from 'react';
import { Zap, Clock, Database, Volume2, VolumeX, Wifi, WifiOff, Activity } from 'lucide-react';
import { isSoundEnabled, setSoundEnabled } from '../lib/sound';

export const Header = () => {
  const [time, setTime] = useState('');
  const [soundOn, setSoundOn] = useState(true);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    setSoundOn(isSoundEnabled());

    const tick = () =>
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(id);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  return (
    <header className="glass-card px-5 py-4 sm:px-6 sm:py-5 md:px-7 md:py-5 flex items-center justify-between mb-6 shadow-2xl border border-white/15 relative overflow-hidden backdrop-blur-2xl">
      {/* Brand logo & portal title */}
      <div className="flex items-center gap-3.5 sm:gap-4 relative z-10">
        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 border-2 border-white/35 shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center shrink-0 relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <Zap className="w-6 h-6 text-white stroke-[2.5] drop-shadow-md" />
        </div>
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none font-heading flex items-center gap-1.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
              Express<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-violet-300 font-black">Check</span>
            </h1>
            {isOnline ? (
              <span className="text-[10px] px-3 py-1 bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-black rounded-full flex items-center gap-1.5 uppercase tracking-wider shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                <span className="live-dot" /> Live System
              </span>
            ) : (
              <span className="text-[10px] px-3 py-1 bg-rose-500/20 border border-rose-400/50 text-rose-300 font-black rounded-full flex items-center gap-1.5 uppercase tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <WifiOff className="w-3 h-3 text-rose-300" /> Offline
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 font-semibold tracking-wide mt-1 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400 stroke-[2.5]" />
            Seamless Member Check-In Portal
          </p>
        </div>
      </div>

      {/* Top Controls & Status Pill Elements */}
      <div className="flex items-center gap-2 sm:gap-3 text-xs relative z-10">
        {/* Audio Toggle Button */}
        <button
          type="button"
          onClick={toggleSound}
          title={soundOn ? 'Audio & Haptic Feedback Active' : 'Muted'}
          className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all duration-200 active:scale-95 min-h-[40px] ${
            soundOn
              ? 'bg-indigo-500/25 border-indigo-400/60 text-white hover:bg-indigo-500/35 hover:border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.35)]'
              : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700'
          }`}
        >
          {soundOn ? (
            <>
              <Volume2 className="w-4 h-4 text-indigo-300 stroke-[2.5]" />
              <span className="hidden sm:inline font-black tracking-wide text-white">Audio On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-slate-400 stroke-[2.5]" />
              <span className="hidden sm:inline font-black tracking-wide text-slate-300">Muted</span>
            </>
          )}
        </button>

        {/* Database Indicator */}
        <div className="hidden md:flex items-center gap-2 bg-slate-950/90 px-3.5 py-2 rounded-xl border border-slate-800 text-slate-200 min-h-[40px] shadow-inner">
          {isOnline ? (
            <Wifi className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-rose-400 stroke-[2.5]" />
          )}
          <Database className="w-3.5 h-3.5 text-indigo-400 stroke-[2.5]" />
          <span className="font-black text-white tracking-wide text-xs">Supabase</span>
        </div>

        {/* Digital Clock */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-950/90 px-3.5 py-2 rounded-xl border border-slate-800 min-h-[40px] shadow-inner">
          <Clock className="w-3.5 h-3.5 text-violet-400 stroke-[2.5]" />
          <span className="font-mono text-xs tabular-nums text-white font-extrabold tracking-wider">
            {time || '--:--:--'}
          </span>
        </div>
      </div>
    </header>
  );
};


