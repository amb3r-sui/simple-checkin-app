import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { CheckInCard } from './components/CheckInCard';
import { RecentActivity } from './components/RecentActivity';
import { SuccessToast } from './components/SuccessToast';
import { getAppStats, getRecentCheckedInPeople, subscribeToPeopleChanges } from './lib/supabase';
import type { Person, CheckInResult, AppStats } from './types';
import { Database, ShieldCheck, Sparkles } from 'lucide-react';

export default function App() {
  const [stats, setStats] = useState<AppStats>({ checkedInCount: 0, totalPeopleCount: 0, todayCount: 0 });
  const [recentPeople, setRecentPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBumping, setIsBumping] = useState(false);
  const [toastPerson, setToastPerson] = useState<Person | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

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

    // Setup Supabase Realtime listener
    const unsubscribe = subscribeToPeopleChanges(() => {
      loadData();
    });

    // Backup polling fallback (every 12 seconds)
    const intervalId = setInterval(loadData, 12000);

    return () => {
      unsubscribe();
      clearInterval(intervalId);
    };
  }, [loadData]);

  const handleCheckInSuccess = (result: CheckInResult) => {
    if (result.status === 'checked_in' && result.person) {
      setIsBumping(true);
      setTimeout(() => setIsBumping(false), 450);

      // Trigger success toast & row highlight
      setToastPerson(result.person);
      setHighlightedId(result.person.id);

      // Clear highlight after 5 seconds
      setTimeout(() => {
        setHighlightedId(null);
      }, 5000);

      setStats(prev => ({
        checkedInCount: prev.checkedInCount + 1,
        totalPeopleCount: prev.totalPeopleCount + 1,
        todayCount: prev.todayCount + 1,
      }));
    }

    // Refresh recent list from database
    loadData();
  };

  return (
    <div className="min-h-screen px-4 md:px-6 lg:px-8 max-w-6xl mx-auto py-6 sm:py-8 flex flex-col justify-between relative">
      {/* Animated Success Toast Banner */}
      <SuccessToast person={toastPerson} onClose={() => setToastPerson(null)} />

      <div>
        <Header />

        <StatsOverview
          checkedInCount={stats.checkedInCount}
          totalPeopleCount={stats.totalPeopleCount}
          todayCount={stats.todayCount}
          isBumping={isBumping}
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          <div className="lg:col-span-3">
            <CheckInCard onCheckInSuccess={handleCheckInSuccess} />
          </div>
          <div className="lg:col-span-2">
            <RecentActivity people={recentPeople} isLoading={loading} highlightedId={highlightedId} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 pt-6 pb-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800/60">
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span>Powered by Supabase Database</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>ExpressCheck Portal v2.0</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800/60">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Realtime Synchronized & Secure</span>
        </div>
      </footer>
    </div>
  );
}
