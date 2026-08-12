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
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md animate-bounce-short">
      <div className="bg-slate-900/95 border border-emerald-500/40 shadow-2xl shadow-emerald-950/50 rounded-2xl p-4 flex items-center justify-between gap-3.5 backdrop-blur-md">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/30 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Checked In Successfully!</span>
            </div>
            <p className="text-base font-extrabold text-white truncate leading-snug">
              {person.name}
            </p>
            <p className="text-xs text-slate-400 font-mono">
              {formatPhone(person.phone)}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition"
          aria-label="Close notification"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
