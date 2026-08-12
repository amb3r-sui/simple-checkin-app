import { CheckCircle2, Users } from 'lucide-react';

interface StatsProps {
  checkedInCount: number;
  totalPeopleCount: number;
  isBumping?: boolean;
}

export const StatsOverview = ({ checkedInCount, totalPeopleCount, isBumping }: StatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {/* Primary Running Count Card */}
      <div className="glass-card p-5 relative overflow-hidden bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-slate-900/40 border-indigo-500/20">
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Checked In
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-4xl font-extrabold text-white tracking-tight tabular-nums ${
              isBumping ? 'count-bump' : ''
            }`}
          >
            {checkedInCount.toLocaleString()}
          </span>
          <span className="text-xs text-indigo-300 font-medium">active</span>
        </div>
      </div>

      {/* Total People Registered */}
      <div className="glass-card p-5 relative overflow-hidden bg-slate-900/60 border-slate-800">
        <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Total People
          </span>
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-white tracking-tight tabular-nums">
            {totalPeopleCount.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 font-medium">registered</span>
        </div>
      </div>
    </div>
  );
};
