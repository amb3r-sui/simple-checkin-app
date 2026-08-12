import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { CheckInCard } from './components/CheckInCard';
import { RecentActivity } from './components/RecentActivity';
import { getDashboardStats, getRecentCheckIns, type CheckInRecord } from './lib/supabase';
import { Database, Heart, ShieldCheck } from 'lucide-react';

export default function App() {
  const [stats, setStats] = useState({ totalCheckIns: 0, totalMembers: 0, todayCheckIns: 0 });
  const [recent, setRecent] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBumping, setIsBumping] = useState(false);

  const loadData = async () => {
    try {
      const [s, r] = await Promise.all([getDashboardStats(), getRecentCheckIns(10)]);
      setStats(s);
      setRecent(r);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const id = setInterval(loadData, 10000);
    return () => clearInterval(id);
  }, []);

  const handleSuccess = (_name: string, isNew: boolean) => {
    setIsBumping(true);
    setTimeout(() => setIsBumping(false), 400);
    setStats(p => ({
      totalCheckIns: p.totalCheckIns + 1,
      totalMembers: p.totalMembers + (isNew ? 1 : 0),
      todayCheckIns: p.todayCheckIns + 1,
    }));
    getRecentCheckIns(10).then(setRecent);
  };

  return (
    <div className="min-h-screen px-4 md:px-6 lg:px-8 max-w-5xl mx-auto py-6">
      <Header />

      <StatsOverview
        totalCheckIns={stats.totalCheckIns}
        totalMembers={stats.totalMembers}
        todayCheckIns={stats.todayCheckIns}
        isBumping={isBumping}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-12">
        <div className="lg:col-span-3">
          <CheckInCard onCheckInSuccess={handleSuccess} />
        </div>
        <div className="lg:col-span-2">
          <RecentActivity checkIns={recent} isLoading={loading} />
        </div>
      </div>

      <footer className="border-t border-slate-800/50 pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <Database className="w-3 h-3 text-indigo-500/50" />
          <span>Powered by Supabase</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Built with</span>
          <Heart className="w-3 h-3 text-pink-500/60 fill-pink-500/60" />
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-emerald-500/50" />
          <span>Secure & Synced</span>
        </div>
      </footer>
    </div>
  );
}
