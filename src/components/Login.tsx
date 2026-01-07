import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Lock } from 'lucide-react';

interface LoginProps {
  onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Successful login will trigger session change in App.tsx
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[2000] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-900/50 p-6 rounded-lg shadow-2xl max-w-sm w-full relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-amber-500 transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center gap-3 mb-6 text-amber-500">
          <Lock size={24} />
          <h2 className="text-xl font-serif font-bold">Dungeon Master Access</h2>
        </div>

        {error && (
          <div className="bg-red-900/50 text-red-200 p-3 rounded mb-4 text-sm border border-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 focus:border-amber-500 focus:outline-none"
              placeholder="archmage@faerun.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 focus:border-amber-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Casting Authenticate...' : 'Enter Realm'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;