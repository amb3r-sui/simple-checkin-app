import React, { useState } from 'react';
import { Phone, CheckCircle2, AlertCircle, Loader2, Sparkles, X, Delete } from 'lucide-react';
import confetti from 'canvas-confetti';
import { findMemberByPhone, performCheckIn, registerNewMember } from '../lib/supabase';
import { RegistrationModal } from './RegistrationModal';

interface CheckInCardProps {
  onCheckInSuccess: (memberName: string, isNew: boolean) => void;
}

export const CheckInCard: React.FC<CheckInCardProps> = ({ onCheckInSuccess }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkedInName, setCheckedInName] = useState<string | null>(null);
  const [checkedInCount, setCheckedInCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Registration modal state
  const [showRegModal, setShowRegModal] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPhone(val);
    if (errorMsg) setErrorMsg(null);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#a855f7', '#ec4899', '#10b981'],
      });
    } catch {
      // Ignore if confetti fails
    }
  };

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = phone.replace(/\D/g, '');

    if (!cleanDigits || cleanDigits.length < 7) {
      setErrorMsg('Please enter a valid phone number (at least 7 digits).');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // Step 1: Look up member in Supabase
      const member = await findMemberByPhone(cleanDigits);

      if (member) {
        // Step 2: Member found -> perform check-in
        const { member: updatedMember } = await performCheckIn(member);
        setCheckedInName(updatedMember.name);
        setCheckedInCount(updatedMember.check_in_count);
        triggerConfetti();
        onCheckInSuccess(updatedMember.name, false);
      } else {
        // Step 3: Member not found -> open registration modal (Bonus)
        setShowRegModal(true);
      }
    } catch (err) {
      console.error('Check in error:', err);
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterAndCheckIn = async (name: string) => {
    setLoading(true);
    try {
      const newMember = await registerNewMember(phone, name);
      const { member: checkedInMember } = await performCheckIn(newMember);

      setShowRegModal(false);
      setCheckedInName(checkedInMember.name);
      setCheckedInCount(checkedInMember.check_in_count);
      triggerConfetti();
      onCheckInSuccess(checkedInMember.name, true);
    } catch (err) {
      console.error('Registration checkin error:', err);
      setErrorMsg('Failed to register member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeypadClick = (digit: string) => {
    if (checkedInName) setCheckedInName(null);
    setPhone((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setPhone((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPhone('');
    setCheckedInName(null);
    setErrorMsg(null);
  };

  return (
    <>
      <div className="glass-card p-6 md:p-8 relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Member Check-In
            </h2>
            <p className="text-xs text-slate-400">Enter phone number to check in instantly</p>
          </div>
          {phone && (
            <button
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-white bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Success Banner: Checked in: [Name] */}
        {checkedInName && (
          <div className="success-banner mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">Success!</span>
              <p className="text-lg font-bold text-white">
                Checked in: <span className="text-emerald-300">{checkedInName}</span>
              </p>
              {checkedInCount && (
                <p className="text-xs text-slate-300 mt-0.5">
                  Visit #{checkedInCount} recorded to backend database.
                </p>
              )}
            </div>
            <button
              onClick={() => setCheckedInName(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form Input */}
        <form onSubmit={handleCheckInSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(555) 000-0000"
                className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 text-white text-lg md:text-xl font-mono tracking-wide rounded-xl pl-12 pr-12 py-3.5 outline-none transition"
              />
              {phone && (
                <button
                  type="button"
                  onClick={handleBackspace}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <Delete className="w-5 h-5" />
                </button>
              )}
            </div>
            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-red-400 mt-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Keypad for Touch / Kiosk UI */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadClick(digit)}
                className="bg-slate-800/40 hover:bg-indigo-600/20 border border-slate-700/50 hover:border-indigo-500/50 text-white font-mono text-base font-semibold py-2.5 rounded-xl transition active:scale-95"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 text-xs font-semibold py-2.5 rounded-xl transition"
            >
              CLR
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="bg-slate-800/40 hover:bg-slate-700/60 border border-slate-700/50 text-slate-300 text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !phone.trim()}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-base font-bold tracking-wide shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 active:scale-[0.99]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Checking In...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Tap to Check In</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Registration Modal for missing phone numbers (Bonus) */}
      <RegistrationModal
        isOpen={showRegModal}
        phone={phone}
        onClose={() => setShowRegModal(false)}
        onSubmit={handleRegisterAndCheckIn}
        isLoading={loading}
      />
    </>
  );
};
