import { History, UserCheck, Clock } from 'lucide-react';
import type { Person } from '../types';
import { formatPhone } from '../lib/supabase';

interface Props {
  people: Person[];
  isLoading: boolean;
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

export const RecentActivity = ({ people, isLoading }: Props) => (
  <div className="glass-card h-full flex flex-col">
    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800/60">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <History className="w-4 h-4 text-indigo-400" />
        Recent Activity
      </h3>
      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
      </span>
    </div>

    <div className="flex-1 overflow-y-auto px-4 py-4">
      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-14 bg-slate-800/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : people.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs">No checked-in people yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {people.map(p => (
            <div
              key={p.id}
              className="bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800/60 hover:border-slate-700/60 rounded-xl px-3.5 py-3 flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-100 group-hover:text-white transition truncate">
                    {p.name}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">{maskPhone(p.phone)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0 ml-2">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{relTime(p.checked_in_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
