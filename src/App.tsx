import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { CheckInCard } from './components/CheckInCard';
import { RecentActivity } from './components/RecentActivity';
import { getDashboardStats, getRecentCheckIns, type CheckInRecord } from './lib/supabase';
import { Database, ShieldCheck, Heart } from 'lucide-react';

export function App() {
  const [stats, setStats] = useState({
    totalCheckIns: 0,
    totalMembers: 0,
    todayCheckIns: 0,
  });
  const [recentCheckIns, setRecentCheckIns] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBumping, setIsBumping] = useState(false);

  const loadData = async () => {
    try {
      const [fetchedStats, fetchedCheckIns] = await Promise.all([
        getDashboardStats(),
        getRecentCheckIns(10),
      ]);
      setStats(fetchedStats);
      setRecentCheckIns(fetchedCheckIns);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Poll data every 10 seconds for real-time sync across multiple clients
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCheckInSuccess = (_memberName: string, _isNew: boolean) => {
    // Increment stats locally with bump animation
    setIsBumping(true);
    setTimeout(() => setIsBumping(false), 500);

    setStats((prev) => ({
      totalCheckIns: prev.totalCheckIns + 1,
      totalMembers: prev.totalMembers + (_isNew ? 1 : 0),
      todayCheckIns: prev.todayCheckIns + 1,
    }));

    // Reload recent check-ins list
    getRecentCheckIns(10).then((updated) => setRecentCheckIns(updated));
  };

  return (
    <div className="min-h-screen pb-16 px-4 md:px-8 max-w-6xl mx-auto pt-6">
      <Header />

      <StatsOverview
        totalCheckIns={stats.totalCheckIns}
        totalMembers={stats.totalMembers}
        todayCheckIns={stats.todayCheckIns}
        isBumping={isBumping}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <CheckInCard onCheckInSuccess={handleCheckInSuccess} />
        </div>
        <div className="lg:col-span-5">
          <RecentActivity checkIns={recentCheckIns} isLoading={loading} />
        </div>
      </div>

      <footer className="mt-16 text-center text-xs text-slate-500 border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-400" />
          <span>Powered by Supabase Realtime Backend</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
          <span>for Express Check-Ins</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Secure & Synchronized</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
