import { useState } from 'react';
import { Phone, CheckCircle2, AlertCircle, Info, Loader2, X, Delete } from 'lucide-react';
import confetti from 'canvas-confetti';
import { checkInByPhone, registerAndCheckIn, formatPhone } from '../lib/supabase';
import { RegistrationModal } from './RegistrationModal';
import type { CheckInResult } from '../types';

interface Props {
  onCheckInSuccess: (result: CheckInResult) => void;
}

export const CheckInCard = ({ onCheckInSuccess }: Props) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRegModal, setShowRegModal] = useState(false);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#818cf8', '#a78bfa', '#c084fc', '#34d399'],
      });
    } catch { /* ignore */ }
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (!digits || digits.length < 5) {
      setErrorMsg('Please enter a valid phone number (at least 5 digits).');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setLastResult(null);

    try {
      const result = await checkInByPhone(phone);

      if (result.status === 'not_found') {
        setShowRegModal(true);
      } else {
        setLastResult(result);
        if (result.status === 'checked_in') {
          triggerConfetti();
        }
        onCheckInSuccess(result);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Something went wrong during check-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (name: string) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const result = await registerAndCheckIn(phone, name);
      setShowRegModal(false);
      setLastResult(result);
      triggerConfetti();
      onCheckInSuccess(result);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to register new person. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addDigit = (d: string) => {
    if (lastResult) setLastResult(null);
    if (errorMsg) setErrorMsg(null);
    setPhone(p => p + d);
  };

  const backspace = () => {
    if (errorMsg) setErrorMsg(null);
    setPhone(p => p.slice(0, -1));
  };

  const clear = () => {
    setPhone('');
    setLastResult(null);
    setErrorMsg(null);
  };

  const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  return (
    <>
      <div className="glass-card relative overflow-hidden shadow-2xl">
        {/* Accent top line */}
        <div className="h-[3px] bg-gradient-to-r from-indigo-500 via-violet-500 to-emerald-400" />

        <div className="p-6 md:p-8">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Check In</h2>
              <p className="text-xs text-slate-400 mt-0.5">Enter your phone number to check in</p>
            </div>
            {phone && (
              <button
                onClick={clear}
                className="text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700/60 transition active:scale-95"
              >
                Clear
              </button>
            )}
          </div>

          {/* Feedback Banners */}
          {lastResult && lastResult.status === 'checked_in' && (
            <div className="success-banner mb-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    ✓ Checked in: <span className="text-emerald-400 font-extrabold">{lastResult.person?.name}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                    {formatPhone(lastResult.person?.phone || '')}
                  </p>
                </div>
              </div>
              <button onClick={() => setLastResult(null)} className="text-slate-500 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {lastResult && lastResult.status === 'already_checked_in' && (
            <div className="success-banner mb-5 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    Already checked in: <span className="text-amber-300 font-extrabold">{lastResult.person?.name}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Checked-in status is active in database</p>
                </div>
              </div>
              <button onClick={() => setLastResult(null)} className="text-slate-500 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-red-300 font-medium">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCheckInSubmit}>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Phone Number
            </label>
            <div className="relative mb-5">
              <Phone className="w-5 h-5 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={e => {
                  setPhone(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                  if (lastResult) setLastResult(null);
                }}
                placeholder="09171234567"
                className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white text-xl font-mono tracking-wider rounded-xl pl-11 pr-10 py-3.5 outline-none transition placeholder:text-slate-600"
              />
              {phone && (
                <button
                  type="button"
                  onClick={backspace}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-1 transition"
                  title="Backspace"
                >
                  <Delete className="w-4.5 h-4.5" />
                </button>
              )}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {keypadRows.map((row) =>
                row.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => addDigit(key)}
                    className="bg-slate-800/40 hover:bg-indigo-600/20 border border-slate-700/40 hover:border-indigo-500/40 text-white font-mono text-xl font-semibold py-3 rounded-xl transition-all active:scale-95 active:bg-indigo-600/30 shadow-sm"
                  >
                    {key}
                  </button>
                ))
              )}
            </div>

            {/* Check In Button */}
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-base font-bold tracking-wide shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Checking in…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>CHECK IN</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={showRegModal}
        phone={phone}
        onClose={() => setShowRegModal(false)}
        onSubmit={handleRegisterSubmit}
        isLoading={loading}
      />
    </>
  );
};
