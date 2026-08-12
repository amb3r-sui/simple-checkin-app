import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { CheckInCard } from './components/CheckInCard';
import { RecentActivity } from './components/RecentActivity';
import { getAppStats, getRecentCheckedInPeople } from './lib/supabase';
import type { Person, CheckInResult, AppStats } from './types';
import { Database, ShieldCheck } from 'lucide-react';

export default function App() {
  const [stats, setStats] = useState<AppStats>({ checkedInCount: 0, totalPeopleCount: 0 });
  const [recentPeople, setRecentPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBumping, setIsBumping] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [s, r] = await Promise.all([getAppStats(), getRecentCheckedInPeople(10)]);
      setStats(s);
      setRecentPeople(r);
    } catch (err) {
      console.error('Data loading error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const intervalId = setInterval(loadData, 10000);
    return () => clearInterval(intervalId);
  }, [loadData]);

  const handleCheckInSuccess = (result: CheckInResult) => {
    if (result.status === 'checked_in') {
      setIsBumping(true);
      setTimeout(() => setIsBumping(false), 400);

      setStats(prev => ({
        checkedInCount: prev.checkedInCount + 1,
        totalPeopleCount: prev.totalPeopleCount + 1,
      }));
    }
    // Refresh the recent list from database
    getRecentCheckedInPeople(10).then(setRecentPeople);
  };

  return (
    <div className="min-h-screen px-4 md:px-6 lg:px-8 max-w-5xl mx-auto py-6 flex flex-col justify-between">
      <div>
        <Header />

        <StatsOverview
          checkedInCount={stats.checkedInCount}
          totalPeopleCount={stats.totalPeopleCount}
          isBumping={isBumping}
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          <div className="lg:col-span-3">
            <CheckInCard onCheckInSuccess={handleCheckInSuccess} />
          </div>
          <div className="lg:col-span-2">
            <RecentActivity people={recentPeople} isLoading={loading} />
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-800/60 pt-5 pb-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span>Powered by Supabase Database</span>
        </div>
        <div className="flex items-center gap-1">
          <span>Built for AI Operations Specialist Assessment</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Production Ready & Secure</span>
        </div>
      </footer>
    </div>
  );
}
