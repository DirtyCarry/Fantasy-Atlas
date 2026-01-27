
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Skull, Shield, Activity, ChevronLeft, ChevronRight, X, Edit3, Trash2, Loader2, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Monster } from '../types';
import clsx from 'clsx';

interface MonstersViewProps {
  localMonsters: Monster[];
  isEditable: boolean;
  onEdit: (monster: Monster) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

const MonstersView: React.FC<MonstersViewProps> = ({ localMonsters, isEditable, onEdit, onAdd, onDelete }) => {
  const [apiMonsters, setApiMonsters] = useState<Monster[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const monsterTypes = ['Beast', 'Dragon', 'Undead', 'Monstrosity', 'Fiend', 'Construct', 'Elemental', 'Giant', 'Humanoid'];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchApiMonsters();
  }, [page, typeFilter, debouncedSearch]);

  const fetchApiMonsters = async () => {
    setLoading(true);
    try {
      let url = `https://api.open5e.com/monsters/?page=${page}`;
      if (typeFilter) url += `&type=${typeFilter}`;
      if (debouncedSearch) url += `&search=${encodeURIComponent(debouncedSearch)}`;
      
      const response = await fetch(url);
      const data = await response.json();
      setApiMonsters(data.results || []);
    } catch (err) {
      console.error('Failed to fetch monsters:', err);
      setApiMonsters([]);
    } finally {
      setLoading(false);
    }
  };

  const combinedMonsters = useMemo(() => {
    const filteredLocal = localMonsters.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesType = !typeFilter || m.type.toLowerCase() === typeFilter.toLowerCase();
      return matchesSearch && matchesType;
    });
    return [...filteredLocal, ...apiMonsters];
  }, [localMonsters, apiMonsters, typeFilter, debouncedSearch]);

  const StatBox = ({ label, value }: { label: string, value: number }) => {
    const mod = Math.floor((value - 10) / 2);
    return (
      <div className="bg-slate-900/60 p-2 rounded text-center border border-amber-900/20 shadow-inner">
        <div className="text-[10px] font-bold text-amber-600 uppercase mb-1">{label}</div>
        <div className="text-lg font-bold text-amber-100">{value}</div>
        <div className="text-[10px] text-slate-500">({mod >= 0 ? `+${mod}` : mod})</div>
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col md:flex-row overflow-hidden font-sans">
      <aside className={clsx(
        "bg-slate-900 border-r border-amber-900/30 flex flex-col shrink-0 relative z-20 shadow-2xl transition-all duration-300 ease-in-out",
        "h-48 md:h-full",
        isCollapsed ? "w-14" : "w-full md:w-72"
      )}>
        <div className={clsx(
          "border-b border-amber-900/30 bg-slate-950/50 flex items-center shrink-0 h-[50px] md:h-[60px]",
          isCollapsed ? "justify-center" : "justify-between px-4"
        )}>
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in duration-300">
              <div className="flex items-center gap-3 text-amber-500">
                <Skull size={18} className="shrink-0" />
                <h2 className="text-base md:text-lg font-serif font-bold uppercase tracking-[0.2em] truncate">Bestiary</h2>
              </div>
              <span className="text-[8px] font-sans uppercase tracking-[0.2em] text-amber-600/50 leading-none mt-1">Extraordinary Denizens</span>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-500 hover:text-amber-500 transition-colors focus:outline-none p-1 rounded hover:bg-slate-800"
          >
            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>
        <div className={clsx(
          "flex-1 flex flex-col min-h-0 transition-opacity duration-200 overflow-hidden",
          isCollapsed ? "opacity-0 pointer-events-none invisible" : "opacity-100 visible delay-100"
        )}>
          <div className="p-3 bg-slate-900/50 border-b border-amber-900/10 shrink-0">
            <div className="relative">
              <Search className={clsx(
                "absolute left-2.5 top-2 transition-colors",
                loading ? "text-amber-500 animate-pulse" : "text-slate-500"
              )} size={14} />
              <input 
                type="text"
                placeholder="Consult the bestiary..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-md py-1.5 pl-8 pr-3 text-xs focus:border-amber-500 focus:outline-none transition-all placeholder:text-slate-600 font-sans"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            <button 
              onClick={() => { setTypeFilter(''); setPage(1); }}
              className={clsx(
                "w-full text-left px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all",
                !typeFilter ? "bg-amber-900/20 text-amber-400" : "text-slate-400 hover:bg-slate-800"
              )}
            >
              All Phylums
            </button>
            {monsterTypes.map(type => (
              <button
                key={type}
                onClick={() => { setTypeFilter(type); setPage(1); }}
                className={clsx(
                  "w-full text-left px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-all",
                  typeFilter === type ? "bg-amber-900/20 text-amber-400" : "text-slate-400 hover:bg-slate-800"
                )}
              >
                {type}
              </button>
            ))}
          </div>
          {isEditable && (
            <div className="p-3 bg-slate-950/50 border-t border-amber-900/20 shrink-0">
              <button onClick={onAdd} className="w-full bg-amber-900/20 text-amber-500 border border-amber-900/50 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-amber-900/40 transition-all">
                Summon Homebrew
              </button>
            </div>
          )}
          <div className="p-4 bg-slate-950/50 border-t border-amber-900/20 flex justify-between items-center shrink-0">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} className="text-slate-500 hover:text-amber-500 disabled:opacity-30 p-1" disabled={page === 1 || loading}>
              <ChevronLeft size={20} />
            </button>
            <div className="flex flex-col items-center">
               <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">Library Page</span>
               <span className="text-xs text-amber-200 font-serif">{page}</span>
            </div>
            <button onClick={() => setPage(p => p + 1)} className="text-slate-500 hover:text-amber-500 disabled:opacity-30 p-1" disabled={loading}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center text-amber-500 font-serif">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p className="animate-pulse tracking-widest uppercase text-xs">Summoning Ancient Horrors...</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {combinedMonsters.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 mt-20">
                <Skull size={48} className="mb-4 opacity-20" />
                <p className="font-serif italic text-lg">No such creature haunts these lands...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
                {combinedMonsters.map(m => (
                  <div 
                    key={m.id || m.slug}
                    onClick={() => setSelectedMonster(m)}
                    className={clsx(
                      "bg-slate-900/80 backdrop-blur-sm border p-5 rounded-lg hover:border-amber-500/50 transition-all cursor-pointer flex flex-col group relative overflow-hidden h-[160px] shadow-lg",
                      m.is_homebrew ? "border-amber-600/40 shadow-[0_0_15px_rgba(217,119,6,0.1)]" : "border-amber-900/20"
                    )}
                  >
                    {m.is_homebrew && (
                      <div className="absolute top-0 right-0 bg-amber-600 text-white text-[8px] font-bold px-2 py-0.5 uppercase tracking-tighter">
                        Homebrew
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] uppercase tracking-widest font-bold text-amber-600/60 truncate max-w-[80%]">CR {m.challenge_rating} • {m.type}</span>
                      {isEditable && m.is_homebrew && (
                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                          <button onClick={() => onEdit(m)} className="text-slate-600 hover:text-amber-500"><Edit3 size={14} /></button>
                          <button onClick={() => onDelete(m.id!)} className="text-slate-600 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                      )}
                    </div>
                    <h3 className="text-amber-100 font-serif font-bold text-base md:text-lg mb-auto uppercase tracking-tight truncate group-hover:text-amber-400 transition-colors">{m.name}</h3>
                    <div className="flex gap-4 pt-3 border-t border-amber-900/10">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Shield size={12} className="text-amber-600/50" />
                        <span className="text-[10px] font-bold">{m.armor_class} AC</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Activity size={12} className="text-red-900/50" />
                        <span className="text-[10px] font-bold">{m.hit_points} HP</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {selectedMonster && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-2 md:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setSelectedMonster(null)} />
          <div className="relative bg-slate-900 border border-amber-900/50 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
            <div className="p-6 border-b border-amber-900/20 flex justify-between items-start shrink-0 bg-slate-950/50">
              <div>
                <h2 className="text-2xl md:text-5xl font-serif font-bold text-amber-100 uppercase leading-none mb-1">{selectedMonster.name}</h2>
                <p className="text-amber-600/80 text-xs italic uppercase tracking-widest">{selectedMonster.size} {selectedMonster.type}, {selectedMonster.alignment}</p>
              </div>
              <button onClick={() => setSelectedMonster(null)} className="text-slate-500 hover:text-amber-500 transition-colors p-2"><X size={32} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar space-y-10 bg-slate-950 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-fixed relative">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-900/5 via-transparent to-transparent pointer-events-none" />
              <div className="max-w-prose mx-auto relative z-10">
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-10">
                  <StatBox label="Str" value={selectedMonster.strength} />
                  <StatBox label="Dex" value={selectedMonster.dexterity} />
                  <StatBox label="Con" value={selectedMonster.constitution} />
                  <StatBox label="Int" value={selectedMonster.intelligence} />
                  <StatBox label="Wis" value={selectedMonster.wisdom} />
                  <StatBox label="Cha" value={selectedMonster.charisma} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-y border-amber-900/10 py-6 mb-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Senses</p>
                    <p className="text-slate-300 text-sm font-sans">{selectedMonster.senses}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Languages</p>
                    <p className="text-slate-300 text-sm font-sans">{selectedMonster.languages}</p>
                  </div>
                </div>
                {selectedMonster.special_abilities && selectedMonster.special_abilities.length > 0 && (
                  <div className="mb-10">
                    <h4 className="text-amber-500 font-serif font-bold uppercase text-sm border-b border-amber-900/30 mb-4 pb-1">Special Traits</h4>
                    <div className="space-y-6">
                      {selectedMonster.special_abilities.map((ability, idx) => (
                        <div key={idx} className="group">
                          <span className="font-bold text-amber-100 text-base italic">{ability.name}. </span>
                          <span className="text-slate-400 text-sm md:text-base leading-relaxed font-sans">{ability.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedMonster.actions && selectedMonster.actions.length > 0 && (
                  <div>
                    <h4 className="text-amber-500 font-serif font-bold uppercase text-sm border-b border-amber-900/30 mb-4 pb-1">Actions</h4>
                    <div className="space-y-6">
                      {selectedMonster.actions.map((action, idx) => (
                        <div key={idx} className="group">
                          <span className="font-bold text-amber-100 text-base italic">{action.name}. </span>
                          <span className="text-slate-400 text-sm md:text-base leading-relaxed font-sans">{action.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonstersView;
