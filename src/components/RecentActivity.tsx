import React from 'react';
import { History, UserCheck, Clock } from 'lucide-react';
import { type CheckInRecord, formatPhoneNumber } from '../lib/supabase';

interface ActivityProps {
  checkIns: CheckInRecord[];
  isLoading: boolean;
}

export const RecentActivity: React.FC<ActivityProps> = ({ checkIns, isLoading }) => {
  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSecs < 10) return 'Just now';
      if (diffSecs < 60) return `${diffSecs}s ago`;
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  const maskPhone = (phone: string) => {
    const formatted = formatPhoneNumber(phone);
    if (formatted.length > 7) {
      return formatted.substring(0, formatted.length - 4) + '****';
    }
    return '***-****';
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-pink-400" />
          Recent Check-Ins Feed
        </h3>
        <span className="text-xs text-slate-400 font-medium bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
          Live Realtime
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-800/40 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : checkIns.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No check-ins logged yet today.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {checkIns.map((record) => (
            <div
              key={record.id}
              className="bg-slate-900/60 hover:bg-slate-800/70 border border-slate-800 hover:border-slate-700/70 rounded-xl p-3.5 flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
                  {record.member_name ? record.member_name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition">
                    {record.member_name || 'Anonymous Member'}
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    {maskPhone(record.phone)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{getRelativeTime(record.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
