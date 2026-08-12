import { useState } from 'react';
import { UserPlus, Phone, User, ArrowRight, X, Loader2 } from 'lucide-react';
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
      setError('Please enter your name');
      return;
    }
    setError('');
    onSubmit(name.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white p-2 rounded-lg hover:bg-slate-800/60 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Phone number not found.</h3>
            <p className="text-xs text-slate-400">Enter your details to register and check in.</p>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 mb-4 flex items-center gap-3">
          <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Phone</span>
            <span className="text-sm font-semibold text-white font-mono">{formatPhone(phone)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            What's your name?
          </label>
          <div className="relative mb-2">
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="e.g. John Smith"
              value={name}
              onChange={e => {
                setName(e.target.value);
                if (error) setError('');
              }}
              className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white text-sm rounded-xl pl-9 pr-4 py-3 outline-none transition placeholder:text-slate-600 min-h-[44px]"
            />
          </div>
          {error && <p className="text-xs text-rose-400 mb-3 font-medium">{error}</p>}

          <div className="flex items-center justify-end gap-2.5 mt-5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700/80 text-slate-400 hover:text-white text-xs font-semibold hover:bg-slate-800/60 transition min-h-[40px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5 transition disabled:opacity-50 active:scale-95 min-h-[40px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <span>ADD & CHECK IN</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
