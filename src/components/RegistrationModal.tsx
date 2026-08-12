import React, { useState } from 'react';
import { UserPlus, Phone, User, ArrowRight, X } from 'lucide-react';
import { formatPhoneNumber } from '../lib/supabase';

interface ModalProps {
  isOpen: boolean;
  phone: string;
  onClose: () => void;
  onSubmit: (name: string) => void;
  isLoading: boolean;
}

export const RegistrationModal: React.FC<ModalProps> = ({
  isOpen,
  phone,
  onClose,
  onSubmit,
  isLoading,
}) => {
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
      <div className="modal-content relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">New Member Registration</h3>
            <p className="text-xs text-slate-400">First time visiting? Let's get you checked in!</p>
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 mb-5 flex items-center gap-3">
          <Phone className="w-4 h-4 text-indigo-400" />
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-semibold">Phone Number</span>
            <span className="text-sm font-semibold text-white font-mono">{formatPhoneNumber(phone)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                placeholder="e.g. Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700/70 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 text-sm rounded-xl pl-11 pr-4 py-3 outline-none transition"
              />
            </div>
            {error && <p className="text-xs text-red-400 mt-1.5 font-medium">{error}</p>}
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition disabled:opacity-50"
            >
              {isLoading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <span>Save & Check In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
