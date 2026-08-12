import { History, UserCheck, Clock, Sparkles } from 'lucide-react';
import type { Person } from '../types';
import { formatPhone } from '../lib/phone';

interface Props {
  people: Person[];
  isLoading: boolean;
  highlightedId?: string | null;
}

const relTime = (iso: string | null) => {
  if (!iso) return '';
  try {
    const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 10) return 'Just now';
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
};

const maskPhone = (phone: string) => {
  const formatted = formatPhone(phone);
  if (formatted.length > 7) {
    return formatted.slice(0, -4) + '••••';
  }
  return '••••';
};

export const RecentActivity = ({ people, isLoading, highlightedId }: Props) => (
  <div className="glass-card h-full flex flex-col shadow-xl overflow-hidden">
    <div className="flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-slate-800/80">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <History className="w-4 h-4 text-indigo-400" />
        Recent Activity
      </h3>
      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Feed
      </span>
    </div>

    <div className="flex-1 overflow-y-auto px-3.5 py-3.5 max-h-[460px]">
      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-14 bg-slate-800/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : people.length === 0 ? (
        <div className="text-center py-14 px-4 text-slate-500">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-600">
            <UserCheck className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-300">No Check-Ins Yet Today</p>
          <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
            Check-ins will appear here live as members check in.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {people.map(p => {
            const isHighlighted = p.id === highlightedId;
            return (
              <div
                key={p.id}
                className={`rounded-xl px-3.5 py-3 flex items-center justify-between transition-all duration-300 ${
                  isHighlighted
                    ? 'bg-gradient-to-r from-emerald-500/20 via-indigo-500/20 to-purple-500/20 border-2 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-[1.01]'
                    : 'bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                      isHighlighted
                        ? 'bg-emerald-500 text-white border-emerald-300 animate-bounce-short'
                        : 'bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border-indigo-500/30 text-indigo-300'
                    }`}
                  >
                    {isHighlighted ? (
                      <Sparkles className="w-4 h-4 text-white" />
                    ) : (
                      p.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-semibold truncate transition ${
                        isHighlighted ? 'text-emerald-300 font-extrabold text-sm' : 'text-slate-100'
                      }`}
                    >
                      {p.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">{maskPhone(p.phone)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0 ml-2">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span className={isHighlighted ? 'text-emerald-400 font-bold' : ''}>
                    {relTime(p.checked_in_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  </div>
);
