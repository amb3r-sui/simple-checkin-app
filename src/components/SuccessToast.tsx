import { useEffect } from 'react';
import { CheckCircle2, X, Sparkles } from 'lucide-react';
import { formatPhone } from '../lib/phone';
import type { Person } from '../types';

interface Props {
  person: Person | null;
  onClose: () => void;
  duration?: number;
}

export const SuccessToast = ({ person, onClose, duration = 5000 }: Props) => {
  useEffect(() => {
    if (!person) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [person, onClose, duration]);

  if (!person) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-bounce-short">
      <div className="bg-slate-950/95 border-2 border-emerald-400/80 shadow-[0_15px_45px_rgba(16,185,129,0.35)] rounded-2xl p-4.5 flex items-center justify-between gap-4 backdrop-blur-2xl relative overflow-hidden">
        {/* Top specular glow bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500" />

        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 p-0.5 shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-pulse stroke-[2.5]" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-400 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Checked In Successfully!</span>
            </div>
            <p className="text-base font-extrabold text-white truncate leading-snug font-heading mt-0.5">
              {person.name}
            </p>
            <p className="text-xs text-slate-400 font-mono tracking-widest mt-0.5">
              {formatPhone(person.phone)}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition border border-transparent hover:border-slate-700 shrink-0"
          aria-label="Close notification"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};


