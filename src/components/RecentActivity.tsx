import { History, UserCheck, Clock } from 'lucide-react';
import { type CheckInRecord, formatPhone } from '../lib/supabase';

interface Props {
  checkIns: CheckInRecord[];
  isLoading: boolean;
}

const relTime = (iso: string) => {
  try {
    const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 10) return 'Just now';
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch { return ''; }
};

const maskPhone = (phone: string) => {
  const f = formatPhone(phone);
  return f.length > 6 ? f.slice(0, -4) + '••••' : '•••-••••';
};

export const RecentActivity = ({ checkIns, isLoading }: Props) => (
  <div className="glass-card h-full flex flex-col">
    <div className="flex items-center justify-between px-6 pt-6 pb-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <History className="w-4 h-4 text-violet-400" />
        Recent Activity
      </h3>
      <span className="text-[10px] text-slate-500 font-semibold bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700/40">
        Live
      </span>
    </div>

    <div className="flex-1 overflow-y-auto px-4 pb-4">
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-14 bg-slate-800/30 rounded-lg animate-pulse" />)}
        </div>
      ) : checkIns.length === 0 ? (
        <div className="text-center py-12 text-slate-600">
          <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs">No check-ins yet</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {checkIns.map(r => (
            <div key={r.id} className="bg-slate-900/40 hover:bg-slate-800/40 border border-slate-800/40 hover:border-slate-700/40 rounded-lg px-3.5 py-2.5 flex items-center justify-between transition group">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/15 to-violet-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-xs shrink-0">
                  {r.member_name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-white transition truncate">
                    {r.member_name || 'Unknown'}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">{maskPhone(r.phone)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-500 shrink-0 ml-2">
                <Clock className="w-3 h-3" />
                <span>{relTime(r.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
