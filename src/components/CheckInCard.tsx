import { useState } from 'react';
import { Phone, CheckCircle2, AlertCircle, Loader2, X, Delete } from 'lucide-react';
import confetti from 'canvas-confetti';
import { findMemberByPhone, performCheckIn, registerNewMember } from '../lib/supabase';
import { RegistrationModal } from './RegistrationModal';

interface Props {
  onCheckInSuccess: (name: string, isNew: boolean) => void;
}

export const CheckInCard = ({ onCheckInSuccess }: Props) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkedInName, setCheckedInName] = useState<string | null>(null);
  const [checkedInCount, setCheckedInCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showRegModal, setShowRegModal] = useState(false);

  const triggerConfetti = () => {
    try {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.65 }, colors: ['#818cf8', '#a78bfa', '#c084fc', '#34d399'] });
    } catch { /* */ }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) { setErrorMsg('Enter at least 7 digits.'); return; }

    setLoading(true);
    setErrorMsg(null);
    try {
      const member = await findMemberByPhone(digits);
      if (member) {
        const { member: updated } = await performCheckIn(member);
        setCheckedInName(updated.name);
        setCheckedInCount(updated.check_in_count);
        triggerConfetti();
        onCheckInSuccess(updated.name, false);
      } else {
        setShowRegModal(true);
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (name: string) => {
    setLoading(true);
    try {
      const newMember = await registerNewMember(phone, name);
      const { member: updated } = await performCheckIn(newMember);
      setShowRegModal(false);
      setCheckedInName(updated.name);
      setCheckedInCount(updated.check_in_count);
      triggerConfetti();
      onCheckInSuccess(updated.name, true);
    } catch {
      setErrorMsg('Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const addDigit = (d: string) => { if (checkedInName) { setCheckedInName(null); } setPhone(p => p + d); };
  const backspace = () => setPhone(p => p.slice(0, -1));
  const clear = () => { setPhone(''); setCheckedInName(null); setErrorMsg(null); };

  const keypadRows = [['1','2','3'], ['4','5','6'], ['7','8','9'], ['*','0','#']];

  return (
    <>
      <div className="glass-card relative overflow-hidden">
        {/* Top accent line — subtle, not garish */}
        <div className="h-[2px] bg-gradient-to-r from-indigo-500/60 via-violet-500/60 to-purple-500/60" />

        <div className="p-6 md:p-7">
          {/* Title row */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-white">Check In</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Enter phone number to check in</p>
            </div>
            {phone && (
              <button onClick={clear} className="text-[11px] text-slate-500 hover:text-slate-300 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50 transition">
                Clear
              </button>
            )}
          </div>

          {/* Success banner */}
          {checkedInName && (
            <div className="success-banner mb-5 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  Checked in: <span className="text-emerald-400">{checkedInName}</span>
                </p>
                {checkedInCount && <p className="text-[11px] text-slate-400 mt-0.5">Visit #{checkedInCount}</p>}
              </div>
              <button onClick={() => setCheckedInName(null)} className="text-slate-500 hover:text-white p-0.5"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleCheckIn}>
            {/* Phone input */}
            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Phone Number</label>
            <div className="relative mb-4">
              <Phone className="w-4.5 h-4.5 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                value={phone}
                onChange={e => { setPhone(e.target.value); if (errorMsg) setErrorMsg(null); }}
                placeholder="(555) 000-0000"
                className="w-full bg-slate-900/80 border border-slate-700/60 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 text-white text-lg font-mono tracking-wider rounded-xl pl-11 pr-10 py-3 outline-none transition placeholder:text-slate-600"
              />
              {phone && (
                <button type="button" onClick={backspace} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white p-0.5">
                  <Delete className="w-4.5 h-4.5" />
                </button>
              )}
            </div>

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-[11px] text-red-400 mb-3 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Keypad — standard 3-column phone layout */}
            <div className="grid grid-cols-3 gap-1.5 mb-4">
              {keypadRows.map((row) =>
                row.map(key => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => addDigit(key)}
                    className="bg-slate-800/30 hover:bg-indigo-500/10 border border-slate-700/30 hover:border-indigo-500/30 text-white font-mono text-lg font-semibold py-2.5 rounded-lg transition-colors active:scale-[0.97] active:bg-indigo-500/20"
                  >
                    {key}
                  </button>
                ))
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold tracking-wide shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Checking in…</span></>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /><span>Check In</span></>
              )}
            </button>
          </form>
        </div>
      </div>

      <RegistrationModal
        isOpen={showRegModal}
        phone={phone}
        onClose={() => setShowRegModal(false)}
        onSubmit={handleRegister}
        isLoading={loading}
      />
    </>
  );
};
