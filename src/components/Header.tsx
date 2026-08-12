import { useState, useEffect } from 'react';
import { Zap, Clock, Database } from 'lucide-react';

export const Header = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="glass-card px-5 py-4 md:px-8 md:py-5 flex items-center justify-between mb-6">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold tracking-tight text-white">ExpressCheck</h1>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-semibold">
              <span className="live-dot" /> Live
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium tracking-wide">Member Check-In Portal</p>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/40">
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span>Supabase</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/40">
          <Clock className="w-3.5 h-3.5 text-violet-400" />
          <span className="font-mono text-xs tabular-nums">{time || '--:--:--'}</span>
        </div>
      </div>
    </header>
  );
};
