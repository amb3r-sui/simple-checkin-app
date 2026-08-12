import React, { useState, useEffect } from 'react';
import { Zap, Clock, Database } from 'lucide-react';

export const Header: React.FC = () => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="glass-card mb-8 p-4 md:px-8 md:py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">ExpressCheck</h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-medium">
              <span className="live-indicator"></span> Live DB
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Instant Member Check-In Portal</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-2 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/50">
          <Database className="w-4 h-4 text-indigo-400" />
          <span>Supabase Connected</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/50">
          <Clock className="w-4 h-4 text-pink-400" />
          <span className="font-mono text-sm">{time || '00:00:00'}</span>
        </div>
      </div>
    </header>
  );
};
