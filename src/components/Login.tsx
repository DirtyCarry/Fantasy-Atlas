import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, ShieldCheck, X } from 'lucide-react';

interface LoginProps {
  onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Get current origin for redirection back to the app after email confirmation
    const redirectTo = window.location.origin;

    const { error } = isSignUp 
      ? await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: redirectTo
          }
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (isSignUp) {
        setIsSuccess(true);
        setLoading(false);
      } else {
        onClose();
      }
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/95 z-[5000] flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-amber-900/50 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center text-green-500 mb-6 mx-auto border border-green-600/30 animate-pulse">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-amber-500 uppercase tracking-tighter mb-4">Verification Sent</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            The verification scroll has been dispatched to <span className="text-amber-400 font-bold">{email}</span>. 
            Follow the link in your email to finalize your account.
          </p>
          <button
            onClick={onClose}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg transition-all"
          >
            Return to Sanctum
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-[5000] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-900/50 p-8 rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden">
        
        {/* Animated Background Element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl animate-pulse" />

        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-amber-600/20 rounded-full flex items-center justify-center text-amber-500 mb-4 border border-amber-600/30">
            {isSignUp ? <UserPlus size={32} /> : <ShieldCheck size={32} />}
          </div>
          <h2 className="text-3xl font-serif font-bold text-amber-500 uppercase tracking-tighter">
            {isSignUp ? 'Join the Multiverse' : 'Dungeon Master Entry'}
          </h2>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mt-2">Access the Grand Architect's Tools</p>
        </div>

        {error && (
          <div className="bg-red-900/30 text-red-300 p-4 rounded-lg mb-6 text-xs border border-red-900/50 animate-in shake duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email Cipher</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-3 text-sm focus:border-amber-500 focus:outline-none transition-all"
              placeholder="merlin@arcana.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Secret Key</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-3 text-sm focus:border-amber-500 focus:outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-[0_4px_15px_rgba(217,119,6,0.3)] flex items-center justify-center gap-2 group"
          >
            {loading ? 'Casting Spell...' : isSignUp ? 'Begin Journey' : 'Step into the Light'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-amber-500 transition-colors"
          >
            {isSignUp ? 'Already a Master? Sign In' : 'New Architect? Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;