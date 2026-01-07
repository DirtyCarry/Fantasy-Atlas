import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { World } from '../types';
import Login from './Login';
import { Plus, Globe, Lock, Unlock, ArrowRight, BookOpen, Trash2, Loader2, Sparkles, MoveLeft, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';

interface SanctumProps {
  session: any;
  onSelectWorld: (world: World) => void;
  activeWorld?: World | null;
  onResumeWorld?: () => void;
}

const Sanctum: React.FC<SanctumProps> = ({ session, onSelectWorld, activeWorld, onResumeWorld }) => {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [newWorld, setNewWorld] = useState({ name: '', description: '', is_public: false });

  useEffect(() => {
    if (session) {
      fetchWorlds();
      setShowLogin(false);
    } else {
      setLoading(false);
      // Auto-show login if no session, but don't force it if they dismiss
      setShowLogin(true);
    }
  }, [session]);

  const fetchWorlds = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('worlds').select('*').order('created_at', { ascending: false });
    if (!error && data) setWorlds(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    const { data, error } = await supabase.from('worlds').insert([{
      ...newWorld,
      owner_id: session.user.id
    }]).select().single();

    if (!error && data) {
      setWorlds([data, ...worlds]);
      setShowCreate(false);
      onSelectWorld(data);
    } else {
      alert("Genesis Failed: " + error?.message);
    }
  };

  const deleteWorld = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Banish this realm to the void? This cannot be undone.")) return;
    const { error } = await supabase.from('worlds').delete().eq('id', id);
    if (!error) setWorlds(worlds.filter(w => w.id !== id));
  };

  const handleCloseLogin = () => {
    setShowLogin(false);
    // If they were already viewing a world and clicked Sanctum by accident, take them back
    if (activeWorld && onResumeWorld) {
      onResumeWorld();
    }
  };

  // If we should show the login modal/view
  if (showLogin && !session) {
    return <Login onClose={handleCloseLogin} />;
  }

  return (
    <div className="h-full w-full bg-slate-950 overflow-y-auto custom-scrollbar p-6 md:p-12 font-serif bg-[radial-gradient(circle_at_center,_rgba(217,119,6,0.05)_0%,_transparent_70%)]">
      <div className="max-w-6xl mx-auto">
        
        {/* Guest View: If not logged in and chose to hide login */}
        {!session ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in zoom-in duration-700">
            <div className="w-24 h-24 bg-amber-600/10 rounded-full flex items-center justify-center text-amber-500 border border-amber-500/20 mb-4">
              <Globe size={48} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-5xl md:text-7xl font-bold text-amber-500 uppercase tracking-tighter">The Outer Sanctum</h1>
              <p className="text-slate-400 max-w-lg mx-auto mt-4 font-sans leading-relaxed">
                You have reached the threshold of the Grand Architect's chambers. Access is restricted to those who hold the keys to creation.
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
              <button 
                onClick={() => setShowLogin(true)}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg uppercase tracking-widest text-sm flex items-center justify-center gap-2"
              >
                <ShieldCheck size={18} /> Login to Forge
              </button>
              {activeWorld && (
                <button 
                  onClick={onResumeWorld}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-amber-500 border border-amber-900/30 font-bold py-4 rounded-xl transition-all uppercase tracking-widest text-sm"
                >
                  Return to Map
                </button>
              )}
            </div>
            
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.4em]">Prophecy: Only account holders can manifest new realms.</p>
          </div>
        ) : (
          <>
            {/* Logged In View */}
            {activeWorld && (
              <div className="mb-8 flex justify-start">
                <button 
                  onClick={onResumeWorld}
                  className="flex items-center gap-2 text-amber-500/60 hover:text-amber-500 transition-all text-xs uppercase tracking-widest font-bold group"
                >
                  <MoveLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Resume active world: <span className="text-amber-500 border-b border-amber-500/30 ml-1">{activeWorld.name}</span>
                </button>
              </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-16 border-b border-amber-900/30 pb-12">
              <div className="text-center md:text-left">
                <h1 className="text-5xl md:text-7xl font-bold text-amber-500 uppercase tracking-tighter drop-shadow-2xl">The Sanctum</h1>
                <p className="text-amber-600/60 text-xs md:text-sm uppercase tracking-[0.4em] font-bold mt-3 flex items-center justify-center md:justify-start gap-2">
                  <Sparkles size={14} /> Divine Architect Console
                </p>
              </div>
              <button 
                onClick={() => setShowCreate(true)}
                className="group relative bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-[0_0_30px_rgba(217,119,6,0.2)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span className="relative flex items-center gap-3 text-lg uppercase tracking-widest">
                  <Plus size={22} /> Forge New Realm
                </span>
              </button>
            </div>

            {/* Worlds Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 text-amber-500 gap-4">
                <Loader2 className="animate-spin" size={48} />
                <span className="uppercase tracking-widest animate-pulse">Scrying the Cosmos...</span>
              </div>
            ) : worlds.length === 0 ? (
              <div className="py-40 text-center border-2 border-dashed border-amber-900/20 rounded-3xl bg-slate-900/30 backdrop-blur-sm group hover:border-amber-500/30 transition-all cursor-pointer" onClick={() => setShowCreate(true)}>
                 <Globe size={64} className="text-slate-800 mx-auto mb-6 group-hover:text-amber-500/20 transition-all" />
                 <p className="text-slate-500 text-2xl italic">The multiverse is yet unformed. Begin your legend.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {worlds.map(world => (
                  <div 
                    key={world.id}
                    onClick={() => onSelectWorld(world)}
                    className={clsx(
                      "group relative bg-slate-900/80 border rounded-2xl overflow-hidden cursor-pointer transition-all flex flex-col h-[320px] backdrop-blur-md",
                      activeWorld?.id === world.id ? "border-amber-500 shadow-[0_0_40px_rgba(217,119,6,0.2)]" : "border-amber-900/20 hover:border-amber-500/50 hover:shadow-[0_0_40px_rgba(217,119,6,0.1)]"
                    )}
                  >
                    <div 
                      className="h-32 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100"
                      style={{ backgroundImage: `url(${world.map_url})` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                    </div>

                    <div className="p-8 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-2xl font-bold text-amber-100 uppercase tracking-tight line-clamp-1 group-hover:text-amber-400 transition-colors">{world.name}</h3>
                          <div className="text-amber-600/40 mt-1">
                            {world.is_public ? <Unlock size={14} title="Public" /> : <Lock size={14} title="Private" />}
                          </div>
                        </div>
                        <p className="text-slate-400 text-sm line-clamp-3 font-sans leading-relaxed italic">{world.description || 'A mysterious realm waiting to be charted.'}</p>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-amber-900/10">
                        <div className="flex items-center gap-2 text-amber-600 uppercase text-[10px] font-bold tracking-[0.2em] group-hover:text-amber-400 transition-colors">
                          <ArrowRight size={14} /> {activeWorld?.id === world.id ? 'Continue Exploration' : 'Manifest Realm'}
                        </div>
                        <button 
                          onClick={(e) => deleteWorld(world.id, e)}
                          className="text-slate-700 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Creation Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4 backdrop-blur-xl">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowCreate(false)} />
          <div className="relative bg-slate-900 border border-amber-900/50 rounded-3xl p-10 max-w-lg w-full shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
             <div className="flex items-center gap-5 mb-10 text-amber-500">
                <BookOpen size={40} />
                <h2 className="text-4xl font-bold uppercase tracking-tighter">Genesis Scroll</h2>
             </div>
             <form onSubmit={handleCreate} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Realm Title</label>
                  <input 
                    type="text" 
                    required
                    autoFocus
                    value={newWorld.name}
                    onChange={e => setNewWorld({...newWorld, name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl p-4 focus:border-amber-500 focus:outline-none font-sans text-lg placeholder:text-slate-800"
                    placeholder="e.g. The Mournlands"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Chronicle (Description)</label>
                  <textarea 
                    rows={4}
                    value={newWorld.description}
                    onChange={e => setNewWorld({...newWorld, description: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-xl p-4 focus:border-amber-500 focus:outline-none font-sans text-sm resize-none"
                    placeholder="Define the high fantasy concept..."
                  />
                </div>
                <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                   <input 
                    type="checkbox" 
                    id="public_check"
                    checked={newWorld.is_public}
                    onChange={e => setNewWorld({...newWorld, is_public: e.target.checked})}
                    className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-amber-600 focus:ring-amber-500"
                   />
                   <label htmlFor="public_check" className="text-xs text-slate-400 uppercase tracking-widest cursor-pointer select-none">
                     Make Publicly Accessible (Viewable via Link)
                   </label>
                </div>
                <div className="flex gap-4 pt-4">
                   <button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg text-lg uppercase tracking-widest">Seal Realm</button>
                   <button type="button" onClick={() => setShowCreate(false)} className="px-6 text-slate-500 hover:text-slate-300 font-bold uppercase text-xs tracking-widest">Abort</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sanctum;