import React from 'react';
import { CheckCircle2, Users, CalendarCheck2 } from 'lucide-react';

interface StatsProps {
  totalCheckIns: number;
  totalMembers: number;
  todayCheckIns: number;
  isBumping?: boolean;
}

export const StatsOverview: React.FC<StatsProps> = ({
  totalCheckIns,
  totalMembers,
  todayCheckIns,
  isBumping = false,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Total Check-Ins Counter (Running Count) */}
      <div className="glass-card p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">Total Check-Ins</span>
          <div className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-indigo-400" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl font-extrabold text-white tracking-tight ${isBumping ? 'count-bump' : ''}`}>
            {totalCheckIns.toLocaleString()}
          </span>
          <span className="text-xs text-indigo-400 font-medium">total visits</span>
        </div>
      </div>

      {/* Total Members */}
      <div className="glass-card p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-xl group-hover:bg-pink-500/20 transition-all"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-pink-300">Registered Members</span>
          <div className="w-9 h-9 rounded-lg bg-pink-500/15 border border-pink-500/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-pink-400" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-white tracking-tight">
            {totalMembers.toLocaleString()}
          </span>
          <span className="text-xs text-pink-400 font-medium">active profiles</span>
        </div>
      </div>

      {/* Today's Check-ins */}
      <div className="glass-card p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl group-hover:bg-cyan-500/20 transition-all"></div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300">Today's Visits</span>
          <div className="w-9 h-9 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <CalendarCheck2 className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-white tracking-tight">
            {todayCheckIns.toLocaleString()}
          </span>
          <span className="text-xs text-cyan-400 font-medium">today</span>
        </div>
      </div>
    </div>
  );
};
