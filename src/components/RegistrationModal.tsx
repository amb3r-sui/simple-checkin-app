import { useState } from 'react';
import { UserPlus, Phone, User, ArrowRight, X, Loader2, Sparkles } from 'lucide-react';
import { formatPhone } from '../lib/phone';

interface Props {
  isOpen: boolean;
  phone: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
  isLoading: boolean;
}

export const RegistrationModal = ({ isOpen, phone, onClose, onSubmit, isLoading }: Props) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    setError('');
    onSubmit(name.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card border border-indigo-500/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(99,102,241,0.25)] rounded-3xl p-6 sm:p-7 relative overflow-hidden bg-slate-950/95">
        {/* Top specular indicator sheen */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400" />
        
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4.5 right-4.5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/80 transition min-w-[36px] min-h-[36px] flex items-center justify-center border border-transparent hover:border-slate-700"
          aria-label="Close modal"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-[0_0_20px_rgba(99,102,241,0.35)]">
            <UserPlus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white font-heading flex items-center gap-2">
              <span>New Member Registration</span>
              <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Phone number not found in database.</p>
          </div>
        </div>

        {/* Illuminated Phone Information Card */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 mb-5 flex items-center gap-3.5 shadow-inner">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
            <Phone className="w-4.5 h-4.5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Registering Phone Number</span>
            <span className="text-base font-extrabold text-white font-mono tracking-widest">{formatPhone(phone)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-xs font-extrabold uppercase tracking-widest text-slate-300 mb-2.5">
            What is your full name?
          </label>
          <div className="relative mb-3 group phone-input-halo">
            <User className="w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors stroke-[2.5]" />
            <input
              type="text"
              autoFocus
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/25 text-white text-sm font-semibold rounded-2xl pl-11 pr-4 py-3.5 outline-none transition-all placeholder:text-slate-600 min-h-[50px] shadow-inner"
            />
          </div>
          {error && <p className="text-xs text-rose-400 mb-3 font-extrabold flex items-center gap-1.5">✕ {error}</p>}

          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4.5 py-2.5 rounded-xl border border-slate-700/80 text-slate-400 hover:text-white text-xs font-extrabold uppercase tracking-wider hover:bg-slate-800/80 transition active:scale-95 min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="btn-primary-glow px-6 py-2.5 rounded-xl text-white text-xs font-black tracking-wider uppercase flex items-center gap-2 transition disabled:opacity-50 min-h-[44px] shadow-[0_4px_20px_rgba(99,102,241,0.4)] border border-white/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>REGISTERING…</span>
                </>
              ) : (
                <>
                  <span>SAVE & CHECK IN</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


