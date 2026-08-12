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
  <div className="glass-card h-full flex flex-col shadow-2xl shadow-indigo-950/40 overflow-hidden border border-white/15 backdrop-blur-2xl">
    {/* Feed Header */}
    <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-800/80 bg-slate-950/80">
      <h3 className="text-base font-black text-white flex items-center gap-2.5 font-heading">
        <History className="w-4.5 h-4.5 text-indigo-400 stroke-[2.5]" />
        Recent Activity
      </h3>
      <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-wider shadow-[0_0_15px_rgba(52,211,153,0.25)]">
        <span className="live-dot" /> Live Feed
      </span>
    </div>

    {/* List Body */}
    <div className="flex-1 overflow-y-auto px-4 py-4 max-h-[480px]">
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800/50" />
          ))}
        </div>
      ) : people.length === 0 ? (
        <div className="text-center py-16 px-4 text-slate-500">
          <div className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-center mx-auto mb-3.5 text-slate-500 shadow-inner">
            <UserCheck className="w-7 h-7 stroke-[2]" />
          </div>
          <p className="text-sm font-extrabold text-slate-200">No Check-Ins Yet Today</p>
          <p className="text-xs text-slate-400 mt-1 max-w-[220px] mx-auto leading-relaxed font-medium">
            Member check-ins will appear here live as they arrive.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {people.map(p => {
            const isHighlighted = p.id === highlightedId;
            return (
              <div
                key={p.id}
                className={`rounded-2xl px-4 py-3.5 flex items-center justify-between transition-all duration-300 ${
                  isHighlighted
                    ? 'bg-gradient-to-r from-emerald-500/30 via-teal-500/20 to-emerald-500/30 border-2 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.5)] scale-[1.02]'
                    : 'bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 shadow-md list-item-hover'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Sleek Gradient Avatar Badge */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm sm:text-base shrink-0 transition-all ${
                      isHighlighted
                        ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-white border-2 border-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.6)] animate-bounce-short'
                        : 'bg-gradient-to-br from-indigo-500/30 to-violet-600/30 border-2 border-indigo-400/40 text-indigo-200 shadow-[0_0_18px_rgba(99,102,241,0.3)]'
                    }`}
                  >
                    {isHighlighted ? (
                      <Sparkles className="w-5.5 h-5.5 text-white animate-pulse" />
                    ) : (
                      p.name.charAt(0).toUpperCase()
                    )}
                  </div>

                  {/* Member Name & Font-Mono Masked Phone */}
                  <div className="min-w-0">
                    <p
                      className={`text-sm truncate transition-colors ${
                        isHighlighted ? 'text-emerald-300 font-black text-base drop-shadow-md' : 'text-white font-extrabold font-heading'
                      }`}
                    >
                      {p.name}
                    </p>
                    <p className="text-xs font-mono font-bold tracking-widest text-slate-200 mt-0.5">{maskPhone(p.phone)}</p>
                  </div>
                </div>

                {/* Relative Timestamp Pill */}
                <div className="flex items-center gap-1.5 text-xs text-slate-300 shrink-0 ml-3 bg-slate-950/90 px-3.5 py-1.5 rounded-xl border border-slate-800 shadow-inner">
                  <Clock className="w-3.5 h-3.5 text-indigo-400 stroke-[2.5]" />
                  <span className={isHighlighted ? 'text-emerald-300 font-black' : 'font-extrabold text-slate-200'}>
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


