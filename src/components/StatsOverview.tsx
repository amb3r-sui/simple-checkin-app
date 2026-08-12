import { CheckCircle2, Users, CalendarCheck, TrendingUp, Activity, UserCheck } from 'lucide-react';

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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 mb-6">
      {/* Active Checked In Card */}
      <div className="glass-card glass-card-hover p-5 sm:p-6.5 relative overflow-hidden bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-slate-950/95 border-indigo-500/35 hover:border-indigo-400/70 shadow-2xl shadow-indigo-950/40 hover:-translate-y-1.5 transition-all duration-300 group">
        {/* Ambient Backlight Glow */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-indigo-500 blur-3xl opacity-30 pointer-events-none group-hover:opacity-50 transition-all duration-300" />
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-200 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.9)] animate-pulse" />
            Currently Checked In
          </span>
          {/* Vibrant Glowing Icon Frame */}
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/25 border-2 border-indigo-400/50 text-indigo-300 flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.5)] shrink-0 group-hover:scale-110 group-hover:border-indigo-400 group-hover:text-white transition-all duration-300">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2 relative z-10">
          {/* Massive High-Contrast Metric Numbers */}
          <span
            className={`text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] tabular-nums font-heading ${
              isBumping ? 'count-bump' : ''
            }`}
          >
            {checkedInCount.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-xs font-black text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-300 stroke-[2.5]" />
            <span>Active</span>
          </div>
        </div>
      </div>

      {/* Today's Visits Card */}
      <div className="glass-card glass-card-hover p-5 sm:p-6.5 relative overflow-hidden bg-gradient-to-br from-emerald-950/50 via-slate-900/90 to-slate-950/95 border-emerald-500/35 hover:border-emerald-400/70 shadow-2xl shadow-emerald-950/40 hover:-translate-y-1.5 transition-all duration-300 group">
        {/* Ambient Backlight Glow */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-emerald-500 blur-3xl opacity-30 pointer-events-none group-hover:opacity-50 transition-all duration-300" />
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-200 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] animate-pulse" />
            Today's Total Visits
          </span>
          {/* Vibrant Glowing Icon Frame */}
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/25 border-2 border-emerald-400/50 text-emerald-300 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.5)] shrink-0 group-hover:scale-110 group-hover:border-emerald-400 group-hover:text-white transition-all duration-300">
            <CalendarCheck className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2 relative z-10">
          {/* Massive High-Contrast Metric Numbers */}
          <span className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] tabular-nums font-heading">
            {todayCount.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-xs font-black text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Activity className="w-3.5 h-3.5 text-emerald-300 stroke-[2.5]" />
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Total Registered Members Card */}
      <div className="glass-card glass-card-hover p-5 sm:p-6.5 relative overflow-hidden bg-gradient-to-br from-violet-950/50 via-slate-900/90 to-slate-950/95 border-violet-500/35 hover:border-violet-400/70 shadow-2xl shadow-violet-950/40 hover:-translate-y-1.5 transition-all duration-300 group">
        {/* Ambient Backlight Glow */}
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-violet-500 blur-3xl opacity-30 pointer-events-none group-hover:opacity-50 transition-all duration-300" />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-violet-200 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.9)] animate-pulse" />
            Database Members
          </span>
          {/* Vibrant Glowing Icon Frame */}
          <div className="w-14 h-14 rounded-2xl bg-violet-500/25 border-2 border-violet-400/50 text-violet-300 flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.5)] shrink-0 group-hover:scale-110 group-hover:border-violet-400 group-hover:text-white transition-all duration-300">
            <Users className="w-6 h-6 stroke-[2.5]" />
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-2 relative z-10">
          {/* Massive High-Contrast Metric Numbers */}
          <span className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] tabular-nums font-heading">
            {totalPeopleCount.toLocaleString()}
          </span>
          <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-violet-500/20 border border-indigo-400/40 text-xs font-black text-violet-200 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <UserCheck className="w-3.5 h-3.5 text-violet-300 stroke-[2.5]" />
            <span>Registered</span>
          </div>
        </div>
      </div>
    </div>
  );
};
