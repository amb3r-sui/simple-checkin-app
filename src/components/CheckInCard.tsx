import { useState } from 'react';
import { Phone, CheckCircle2, AlertCircle, Info, Loader2, X, Delete, Search, UserCheck, UserPlus } from 'lucide-react';
import confetti from 'canvas-confetti';
import { checkInByPhone, registerAndCheckIn, lookupByPhone, formatPhone } from '../lib/supabase';
import { formatPhoneInput, normalizePhone } from '../lib/phone';
import { triggerSuccessFeedback } from '../lib/sound';
import { RegistrationModal } from './RegistrationModal';
import type { CheckInResult, Person } from '../types';

interface Props {
  onCheckInSuccess: (result: CheckInResult) => void;
}

type Mode = 'checkin' | 'lookup';

export const CheckInCard = ({ onCheckInSuccess }: Props) => {
  const [mode, setMode] = useState<Mode>('checkin');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const [lookupResult, setLookupResult] = useState<{ searched: boolean; person: Person | null } | null>(null);
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
    } catch {
      /* ignore */
    }
  };

  const handlePhoneChange = (val: string) => {
    const formatted = formatPhoneInput(val);
    setPhone(formatted);
    if (errorMsg) setErrorMsg(null);
    if (lastResult) setLastResult(null);
    if (lookupResult) setLookupResult(null);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    handlePhoneChange(pastedText);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = normalizePhone(phone);
    if (!cleanDigits || cleanDigits.length < 7) {
      setErrorMsg('Please enter a valid phone number (at least 7 digits).');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setLastResult(null);
    setLookupResult(null);

    if (mode === 'lookup') {
      try {
        const found = await lookupByPhone(phone);
        setLookupResult({ searched: true, person: found });
      } catch (err: any) {
        setErrorMsg(err?.message || 'Lookup failed. Please check your connection.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Check-in mode
    try {
      const result = await checkInByPhone(phone);

      if (result.status === 'not_found') {
        setShowRegModal(true);
      } else {
        setLastResult(result);
        if (result.status === 'checked_in') {
          triggerConfetti();
          triggerSuccessFeedback();
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
      triggerSuccessFeedback();
      onCheckInSuccess(result);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to register new person. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addDigit = (d: string) => {
    if (lastResult) setLastResult(null);
    if (lookupResult) setLookupResult(null);
    if (errorMsg) setErrorMsg(null);
    handlePhoneChange(phone + d);
  };

  const backspace = () => {
    if (errorMsg) setErrorMsg(null);
    if (lastResult) setLastResult(null);
    if (lookupResult) setLookupResult(null);
    const digits = normalizePhone(phone);
    if (digits.length > 0) {
      handlePhoneChange(digits.slice(0, -1));
    } else {
      setPhone('');
    }
  };

  const clear = () => {
    setPhone('');
    setLastResult(null);
    setLookupResult(null);
    setErrorMsg(null);
  };

  const keypadRows = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
  ];

  return (
    <>
      <div className="glass-card relative overflow-hidden shadow-2xl">
        {/* Mode Switcher Header Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setMode('checkin');
              setLastResult(null);
              setLookupResult(null);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] ${
              mode === 'checkin'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>CHECK IN</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('lookup');
              setLastResult(null);
              setLookupResult(null);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition active:scale-[0.98] ${
              mode === 'lookup'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>LOOKUP MEMBER</span>
          </button>
        </div>

        <div className="p-5 md:p-7">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {mode === 'checkin' ? 'Check In' : 'Member Lookup'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === 'checkin'
                  ? 'Enter phone number to check in'
                  : 'Check member status without checking in'}
              </p>
            </div>
            {phone && (
              <button
                type="button"
                onClick={clear}
                className="text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 transition active:scale-95 min-h-[36px]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Feedback Banners for Check-In */}
          {lastResult && lastResult.status === 'checked_in' && (
            <div className="success-banner mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    ✓ Checked in: <span className="text-emerald-400 font-extrabold">{lastResult.person?.name}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
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
            <div className="success-banner mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    Already checked in: <span className="text-amber-300 font-extrabold">{lastResult.person?.name}</span>
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

          {/* Lookup Results Card */}
          {lookupResult && lookupResult.searched && (
            <div className="mb-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 transition-all">
              {lookupResult.person ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400">Search Result</span>
                    {lookupResult.person.checked_in ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Checked In
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <UserCheck className="w-3 h-3" /> Registered (Not Checked In)
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold text-white">{lookupResult.person.name}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {formatPhone(lookupResult.person.phone)}
                    </p>
                  </div>
                  {!lookupResult.person.checked_in && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('checkin');
                        handleFormSubmit({ preventDefault: () => {} } as any);
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>CHECK IN THIS MEMBER NOW</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-2 space-y-2">
                  <p className="text-xs font-semibold text-slate-300">No member registered with this phone number.</p>
                  <button
                    type="button"
                    onClick={() => setShowRegModal(true)}
                    className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition inline-flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>REGISTER NEW MEMBER</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-rose-300 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleFormSubmit}>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Phone Number
            </label>
            <div className="relative mb-4">
              <Phone className="w-5 h-5 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={e => handlePhoneChange(e.target.value)}
                onPaste={handlePaste}
                placeholder="(555) 123-4567 or 0917 123 4567"
                className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white text-lg sm:text-xl font-mono tracking-wider rounded-xl pl-11 pr-10 py-3.5 outline-none transition placeholder:text-slate-600"
              />
              {phone && (
                <button
                  type="button"
                  onClick={backspace}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-2 transition min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-slate-800"
                  title="Backspace"
                  aria-label="Backspace"
                >
                  <Delete className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Keypad with touch target optimizations */}
            <div className="grid grid-cols-3 gap-2 mb-4 touch-manipulation select-none">
              {keypadRows.map(row =>
                row.map(key => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => addDigit(key)}
                    className="bg-slate-800/50 hover:bg-indigo-600/20 border border-slate-700/50 hover:border-indigo-500/40 text-white font-mono text-xl font-semibold min-h-[48px] py-3 rounded-xl transition-all active:scale-95 active:bg-indigo-600/30 shadow-sm"
                  >
                    {key}
                  </button>
                ))
              )}
              {/* Bottom row: Clear, 0, Backspace */}
              <button
                type="button"
                onClick={clear}
                className="bg-slate-800/30 hover:bg-slate-700/40 border border-slate-700/40 text-slate-400 font-semibold text-xs min-h-[48px] py-3 rounded-xl transition-all active:scale-95"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => addDigit('0')}
                className="bg-slate-800/50 hover:bg-indigo-600/20 border border-slate-700/50 hover:border-indigo-500/40 text-white font-mono text-xl font-semibold min-h-[48px] py-3 rounded-xl transition-all active:scale-95 active:bg-indigo-600/30 shadow-sm"
              >
                0
              </button>
              <button
                type="button"
                onClick={backspace}
                className="bg-slate-800/30 hover:bg-slate-700/40 border border-slate-700/40 text-slate-300 font-semibold text-xs min-h-[48px] py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center"
                aria-label="Backspace"
              >
                <Delete className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className={`w-full min-h-[50px] py-3.5 rounded-xl font-bold tracking-wide shadow-lg flex items-center justify-center gap-2.5 transition-all text-white text-base active:scale-[0.99] ${
                loading || !phone.trim()
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60 shadow-none'
                  : mode === 'checkin'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-indigo-600/25'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-600/25'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>{mode === 'checkin' ? 'Checking in…' : 'Searching…'}</span>
                </>
              ) : mode === 'checkin' ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>CHECK IN</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>SEARCH MEMBER</span>
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
