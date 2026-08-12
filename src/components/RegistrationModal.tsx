import { useState } from 'react';
import { UserPlus, Phone, User, ArrowRight, X } from 'lucide-react';
import { formatPhone } from '../lib/supabase';

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
    if (!name.trim()) { setError('Please enter your name'); return; }
    setError('');
    onSubmit(name.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition">
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-violet-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">New Member</h3>
            <p className="text-[11px] text-slate-500">First time? Let's get you set up.</p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/60 rounded-lg p-3 mb-5 flex items-center gap-2.5">
          <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 block font-bold">Phone</span>
            <span className="text-sm font-semibold text-white font-mono">{formatPhone(phone)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Full Name</label>
          <div className="relative mb-1">
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700/60 focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/10 text-white text-sm rounded-lg pl-9 pr-4 py-2.5 outline-none transition placeholder:text-slate-600"
            />
          </div>
          {error && <p className="text-[11px] text-red-400 mb-2 font-medium">{error}</p>}

          <div className="flex items-center justify-end gap-2.5 mt-4">
            <button type="button" onClick={onClose} className="px-3.5 py-2 rounded-lg border border-slate-700/60 text-slate-400 hover:text-white text-xs font-semibold hover:bg-slate-800/60 transition">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-500/15 flex items-center gap-1.5 transition disabled:opacity-50"
            >
              {isLoading ? 'Saving…' : <><span>Save & Check In</span><ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
