import { useState, useEffect } from 'react';
import { Zap, Clock, Database, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
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
    <header className="glass-card px-4 py-3.5 md:px-7 md:py-4.5 flex items-center justify-between mb-6 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-extrabold tracking-tight text-white">ExpressCheck</h1>
            {isOnline ? (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-semibold">
                <span className="live-dot" /> Live
              </span>
            ) : (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1 font-semibold">
                <WifiOff className="w-3 h-3" /> Offline Mode
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide">Member Check-In Portal</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-400">
        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          title={soundOn ? 'Sound & Haptics Enabled' : 'Sound & Haptics Muted'}
          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 min-h-[38px] ${
            soundOn
              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-500 hover:text-slate-300'
          }`}
        >
          {soundOn ? (
            <>
              <Volume2 className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Audio On</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4" />
              <span className="hidden sm:inline">Muted</span>
            </>
          )}
        </button>

        {/* Database indicator */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 min-h-[38px]">
          {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-rose-400" />}
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span>Supabase</span>
        </div>

        {/* Clock */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 min-h-[38px]">
          <Clock className="w-3.5 h-3.5 text-violet-400" />
          <span className="font-mono text-xs tabular-nums text-slate-200">{time || '--:--:--'}</span>
        </div>
      </div>
    </header>
  );
};
