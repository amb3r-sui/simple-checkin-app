import { useState } from 'react';
import { Phone, CheckCircle2, AlertCircle, Info, Loader2, X, Delete, Search, UserCheck, UserPlus, Sparkles, Zap } from 'lucide-react';
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

interface KeyConfig {
  digit: string;
  sub: string;
}

const KEYPAD_KEYS: KeyConfig[] = [
  { digit: '1', sub: '' },
  { digit: '2', sub: 'ABC' },
  { digit: '3', sub: 'DEF' },
  { digit: '4', sub: 'GHI' },
  { digit: '5', sub: 'JKL' },
  { digit: '6', sub: 'MNO' },
  { digit: '7', sub: 'PQRS' },
  { digit: '8', sub: 'TUV' },
  { digit: '9', sub: 'WXYZ' },
];

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
        particleCount: 75,
        spread: 65,
        origin: { y: 0.65 },
        colors: ['#6366f1', '#8b5cf6', '#a855f7', '#10b981'],
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

  return (
    <>
      <div className="glass-card relative overflow-hidden shadow-2xl shadow-indigo-950/40 border border-white/10 backdrop-blur-2xl">
        {/* High-Contrast Segment Switcher Tab Bar */}
        <div className="p-3 bg-slate-950/90 border-b border-slate-800/80">
          <div className="grid grid-cols-2 gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner">
            <button
              type="button"
              onClick={() => {
                setMode('checkin');
                setLastResult(null);
                setLookupResult(null);
                setErrorMsg(null);
              }}
              className={`py-3.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2.5 tracking-wider uppercase transition-all duration-200 ${
                mode === 'checkin'
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-[0_4px_25px_rgba(99,102,241,0.5)] border border-indigo-300/40 scale-[1.01]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {mode === 'checkin' && <span className="w-2 h-2 rounded-full bg-indigo-200 shadow-[0_0_8px_#ffffff] animate-pulse" />}
              <Zap className={`w-4 h-4 ${mode === 'checkin' ? 'text-amber-300 fill-amber-300/30' : 'text-slate-400'}`} />
              <span>QUICK CHECK-IN</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('lookup');
                setLastResult(null);
                setLookupResult(null);
                setErrorMsg(null);
              }}
              className={`py-3.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2.5 tracking-wider uppercase transition-all duration-200 ${
                mode === 'lookup'
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-[0_4px_25px_rgba(99,102,241,0.5)] border border-indigo-300/40 scale-[1.01]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {mode === 'lookup' && <span className="w-2 h-2 rounded-full bg-indigo-200 shadow-[0_0_8px_#ffffff] animate-pulse" />}
              <Search className={`w-4 h-4 ${mode === 'lookup' ? 'text-indigo-100' : 'text-slate-400'}`} />
              <span>MEMBER LOOKUP</span>
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-7 md:p-8">
          {/* Section Heading */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2 font-heading">
                {mode === 'checkin' ? (
                  <>
                    <span>Enter Phone Number</span>
                    <Sparkles className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                  </>
                ) : (
                  <span>Member Lookup</span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {mode === 'checkin'
                  ? 'Enter phone number below or tap tactile keypad to check in instantly'
                  : 'Verify member profile without recording a check-in visit'}
              </p>
            </div>
            {phone && (
              <button
                type="button"
                onClick={clear}
                className="text-xs font-extrabold uppercase tracking-wider text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-700/90 px-3.5 py-1.5 rounded-xl border border-slate-700/80 transition active:scale-95 min-h-[36px] shadow-sm flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </button>
            )}
          </div>

          {/* Feedback Banner: Checked In */}
          {lastResult && lastResult.status === 'checked_in' && (
            <div className="success-banner mb-6 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/10 border-2 border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-[0_0_25px_rgba(16,185,129,0.25)]">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.35)]">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    ✓ Checked in: <span className="text-emerald-400 font-extrabold text-sm">{lastResult.person?.name}</span>
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {formatPhone(lastResult.person?.phone || '')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLastResult(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Feedback Banner: Already Checked In */}
          {lastResult && lastResult.status === 'already_checked_in' && (
            <div className="success-banner mb-6 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-[0_0_25px_rgba(245,158,11,0.25)]">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.35)]">
                  <Info className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    Already checked in: <span className="text-amber-300 font-extrabold text-sm">{lastResult.person?.name}</span>
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {formatPhone(lastResult.person?.phone || '')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLastResult(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/60 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Lookup Results Card */}
          {lookupResult && lookupResult.searched && (
            <div className="mb-6 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4.5 shadow-xl transition-all">
              {lookupResult.person ? (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Member Found</span>
                    {lookupResult.person.checked_in ? (
                      <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                      </span>
                    ) : (
                      <span className="text-xs font-extrabold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                        <UserCheck className="w-3.5 h-3.5" /> Registered (Not Checked In)
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-white font-heading">{lookupResult.person.name}</h4>
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
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 border border-white/20"
                    >
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                      <span>CHECK IN THIS MEMBER NOW</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-3.5 space-y-3">
                  <p className="text-xs font-semibold text-slate-300">No member registered with this phone number.</p>
                  <button
                    type="button"
                    onClick={() => setShowRegModal(true)}
                    className="py-2.5 px-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition shadow-lg shadow-indigo-600/25 inline-flex items-center gap-2 border border-white/20"
                  >
                    <UserPlus className="w-4 h-4 stroke-[2.5]" />
                    <span>REGISTER NEW MEMBER</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center gap-3 text-xs text-rose-300 font-semibold shadow-md">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleFormSubmit}>
            <label className="block text-[11px] font-extrabold uppercase tracking-widest text-slate-300 mb-2.5">
              Member Phone Number
            </label>
            
            {/* Phone Input Box: Height h-18 sm:h-20, text-3xl sm:text-4xl font-black font-mono tracking-widest text-white, illuminated phone badge */}
            <div className="relative mb-6 group phone-input-halo">
              <div className="w-full h-18 sm:h-20 bg-slate-950/95 border-2 border-slate-800/90 rounded-2xl flex items-center pr-14 group-focus-within:border-indigo-500/80 group-focus-within:ring-4 group-focus-within:ring-indigo-500/25 transition-all duration-200 shadow-inner overflow-hidden">
                {/* Illuminated Phone Icon Badge */}
                <div className="w-13 h-13 rounded-2xl bg-indigo-500/25 border-2 border-indigo-400/50 text-indigo-300 flex items-center justify-center shadow-[0_0_25px_rgba(99,102,241,0.4)] shrink-0 ml-3.5 group-focus-within:border-indigo-300 group-focus-within:bg-indigo-500/35 group-focus-within:text-white transition-all duration-200">
                  <Phone className="w-6 h-6 stroke-[2.5]" />
                </div>
                
                <input
                  type="tel"
                  value={phone}
                  onChange={e => handlePhoneChange(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="(555) 123-4567"
                  className="w-full bg-transparent border-none text-white text-3xl sm:text-4xl font-mono font-black tracking-widest pl-4 pr-2 py-0 outline-none placeholder:text-slate-600 placeholder:font-sans placeholder:text-xl placeholder:tracking-normal placeholder:font-medium"
                />
              </div>

              {/* Clean Backspace Clear Button */}
              {phone && (
                <button
                  type="button"
                  onClick={backspace}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 transition flex items-center justify-center active:scale-95 shadow-sm"
                  title="Backspace"
                  aria-label="Backspace"
                >
                  <Delete className="w-5 h-5 text-indigo-300 hover:text-white stroke-[2.2]" />
                </button>
              )}
            </div>

            {/* Keypad Inset Dark Tray */}
            <div className="bg-slate-950/95 border border-slate-800/90 p-4 sm:p-5 rounded-3xl shadow-inner mb-6">
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 touch-manipulation select-none">
                {KEYPAD_KEYS.map(k => (
                  <button
                    key={k.digit}
                    type="button"
                    onClick={() => addDigit(k.digit)}
                    className="h-16 sm:h-20 rounded-2xl bg-gradient-to-b from-slate-800/95 to-slate-950/98 border-t-2 border-slate-400/50 border-x border-slate-700/60 border-b-2 border-slate-950 shadow-[0_8px_20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.3)] hover:from-indigo-900/90 hover:to-slate-900/95 hover:border-indigo-400/70 active:translate-y-1 active:shadow-inner flex flex-col items-center justify-center py-2 transition-all duration-150"
                  >
                    <span className="text-3xl sm:text-4xl font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] font-heading leading-none">
                      {k.digit}
                    </span>
                    {k.sub && (
                      <span className="text-xs font-black tracking-widest text-indigo-300 uppercase mt-1 leading-none">
                        {k.sub}
                      </span>
                    )}
                  </button>
                ))}
                
                {/* Bottom row: Clear, 0 (+), ⌫ */}
                <button
                  type="button"
                  onClick={clear}
                  className="h-16 sm:h-20 rounded-2xl bg-gradient-to-b from-slate-800/95 to-slate-950/98 border-t-2 border-slate-400/50 border-x border-slate-700/60 border-b-2 border-slate-950 shadow-[0_8px_20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.3)] hover:from-rose-950/60 hover:to-slate-900/95 hover:border-rose-400/70 active:translate-y-1 active:shadow-inner flex flex-col items-center justify-center py-2 transition-all duration-150"
                >
                  <span className="text-rose-400 font-black text-sm tracking-widest uppercase">
                    CLEAR
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => addDigit('0')}
                  className="h-16 sm:h-20 rounded-2xl bg-gradient-to-b from-slate-800/95 to-slate-950/98 border-t-2 border-slate-400/50 border-x border-slate-700/60 border-b-2 border-slate-950 shadow-[0_8px_20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.3)] hover:from-indigo-900/90 hover:to-slate-900/95 hover:border-indigo-400/70 active:translate-y-1 active:shadow-inner flex flex-col items-center justify-center py-2 transition-all duration-150"
                >
                  <span className="text-3xl sm:text-4xl font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] font-heading leading-none">
                    0
                  </span>
                  <span className="text-xs font-black tracking-widest text-indigo-300 uppercase mt-1 leading-none">
                    +
                  </span>
                </button>

                <button
                  type="button"
                  onClick={backspace}
                  className="h-16 sm:h-20 rounded-2xl bg-gradient-to-b from-slate-800/95 to-slate-950/98 border-t-2 border-slate-400/50 border-x border-slate-700/60 border-b-2 border-slate-950 shadow-[0_8px_20px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.3)] hover:from-indigo-900/90 hover:to-slate-900/95 hover:border-indigo-400/70 active:translate-y-1 active:shadow-inner flex flex-col items-center justify-center py-2 transition-all duration-150"
                  aria-label="Backspace"
                >
                  <Delete className="w-6 h-6 text-indigo-300 stroke-[2.5] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
                  <span className="text-xs font-black tracking-widest text-indigo-300 uppercase mt-1 leading-none">
                    DEL
                  </span>
                </button>
              </div>
            </div>

            {/* Ultra-Hero CHECK IN NOW Button */}
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className={`w-full h-20 sm:h-22 rounded-3xl text-xl sm:text-2xl font-black tracking-widest uppercase flex items-center justify-center gap-4 transition-all duration-200 btn-hero-primary border-t-2 border-white/60 border-x border-white/30 border-b-2 border-purple-950 ${
                loading || !phone.trim()
                  ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed opacity-50 border-slate-800 shadow-none'
                  : 'bg-gradient-to-r from-indigo-600 via-purple-600 via-pink-600 to-violet-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-[0_0_50px_rgba(99,102,241,0.7),0_0_90px_rgba(236,72,153,0.4)]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                  <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {mode === 'checkin' ? 'PROCESSING CHECK-IN…' : 'SEARCHING DATABASE…'}
                  </span>
                </>
              ) : mode === 'checkin' ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-white/25 border-2 border-white/50 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.6)] shrink-0">
                    <CheckCircle2 className="w-7 h-7 text-white stroke-[3]" />
                  </div>
                  <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">CHECK IN NOW</span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-white/25 border-2 border-white/50 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.6)] shrink-0">
                    <Search className="w-7 h-7 text-white stroke-[3]" />
                  </div>
                  <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">SEARCH MEMBER PROFILE</span>
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


