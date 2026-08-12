import { CheckCircle2, Users, CalendarCheck } from 'lucide-react';

interface StatsProps {
  checkedInCount: number;
  totalPeopleCount: number;
  todayCount: number;
  isBumping?: boolean;
}

export const StatsOverview = ({
  checkedInCount,
  totalPeopleCount,
  todayCount,
  isBumping,
}: StatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 md:gap-4 mb-6">
      {/* Primary Running Count Card */}
      <div className="glass-card p-4 sm:p-5 relative overflow-hidden bg-gradient-to-br from-indigo-950/40 via-slate-900/70 to-slate-900/50 border-indigo-500/30 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
            Checked In
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-3xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums ${
              isBumping ? 'count-bump' : ''
            }`}
          >
            {checkedInCount.toLocaleString()}
          </span>
          <span className="text-xs text-indigo-300 font-medium">active now</span>
        </div>
      </div>

      {/* Today's Visits */}
      <div className="glass-card p-4 sm:p-5 relative overflow-hidden bg-gradient-to-br from-emerald-950/30 via-slate-900/70 to-slate-900/50 border-emerald-500/20 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
            Today's Visits
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <CalendarCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums">
            {todayCount.toLocaleString()}
          </span>
          <span className="text-xs text-emerald-400/80 font-medium">today</span>
        </div>
      </div>

      {/* Total People Registered */}
      <div className="glass-card p-4 sm:p-5 relative overflow-hidden bg-slate-900/70 border-slate-800 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total People
          </span>
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight tabular-nums">
            {totalPeopleCount.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-medium">registered</span>
        </div>
      </div>
    </div>
  );
};
