import { CheckCircle2, Users, CalendarCheck2 } from 'lucide-react';

interface StatsProps {
  totalCheckIns: number;
  totalMembers: number;
  todayCheckIns: number;
  isBumping?: boolean;
}

const cards = [
  { key: 'checkins', label: 'Total Check-Ins', sub: 'all time', Icon: CheckCircle2, color: 'indigo' },
  { key: 'members', label: 'Members', sub: 'registered', Icon: Users, color: 'violet' },
  { key: 'today', label: "Today's Visits", sub: 'today', Icon: CalendarCheck2, color: 'emerald' },
] as const;

const colorMap: Record<string, { icon: string; badge: string; glow: string }> = {
  indigo: { icon: 'text-indigo-400', badge: 'bg-indigo-500/10 border-indigo-500/20', glow: 'bg-indigo-500/5' },
  violet: { icon: 'text-violet-400', badge: 'bg-violet-500/10 border-violet-500/20', glow: 'bg-violet-500/5' },
  emerald: { icon: 'text-emerald-400', badge: 'bg-emerald-500/10 border-emerald-500/20', glow: 'bg-emerald-500/5' },
};

export const StatsOverview = ({ totalCheckIns, totalMembers, todayCheckIns, isBumping }: StatsProps) => {
  const values = { checkins: totalCheckIns, members: totalMembers, today: todayCheckIns };

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {cards.map(({ key, label, sub, Icon, color }) => {
        const c = colorMap[color];
        return (
          <div key={key} className="glass-card p-5 relative overflow-hidden">
            <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${c.glow} blur-2xl`} />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
              <div className={`w-8 h-8 rounded-lg ${c.badge} border flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${c.icon}`} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-extrabold text-white tabular-nums tracking-tight ${key === 'checkins' && isBumping ? 'count-bump' : ''}`}>
                {values[key].toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">{sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
