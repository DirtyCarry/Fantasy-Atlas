
import React, { useState, useMemo, useEffect } from 'react';
import { LoreEntry } from '../types';
import { Search, Scroll, Clock, Edit3, Trash2, X, History, Compass, PanelLeftClose, PanelLeftOpen, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';

interface LoreViewProps {
  entries: LoreEntry[];
  isEditable: boolean;
  onEdit: (entry: LoreEntry) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

const LoreView: React.FC<LoreViewProps> = ({ entries, isEditable, onEdit, onAdd, onDelete }) => {
  const [search, setSearch] = useState('');
  const [selectedEra, setSelectedEra] = useState<string | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<LoreEntry | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedEntry(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const eraData = useMemo(() => {
    const erasMap = new Map<string, { year: number; count: number }>();
    entries.forEach(e => {
      const current = erasMap.get(e.era) || { year: e.year, count: 0 };
      erasMap.set(e.era, { 
        year: Math.min(current.year, e.year), 
        count: current.count + 1 
      });
    });

    return Array.from(erasMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => a.year - b.year);
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries
      .filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) || 
                             e.content.toLowerCase().includes(search.toLowerCase());
        const matchesEra = !selectedEra || e.era === selectedEra;
        return matchesSearch && matchesEra;
      })
      .sort((a, b) => a.year - b.year);
  }, [entries, search, selectedEra]);

  const clearFilters = () => {
    setSearch('');
    setSelectedEra(null);
  };

  const hasActiveFilters = search !== '' || selectedEra !== null;

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col md:flex-row overflow-hidden relative font-serif">
      
      {/* The Lore Sidebar */}
      <aside className={clsx(
        "bg-slate-900 border-r border-amber-900/30 flex flex-col shrink-0 relative z-20 shadow-2xl transition-all duration-300 ease-in-out",
        "h-48 md:h-full",
        isCollapsed ? "w-14" : "w-full md:w-72"
      )}>
        {/* Sidebar Header */}
        <div className={clsx(
          "border-b border-amber-900/30 bg-slate-950/50 flex items-center shrink-0",
          isCollapsed ? "justify-center h-[50px] md:h-[60px]" : "justify-between p-4 md:p-6"
        )}>
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in duration-300">
              <div className="flex items-center gap-3 text-amber-500">
                <Scroll size={20} className="shrink-0" />
                <h2 className="text-lg md:text-xl font-bold uppercase tracking-tighter truncate">Lore</h2>
              </div>
              <span className="text-[8px] font-sans uppercase tracking-[0.2em] text-amber-600/50 leading-none mt-1">Ancient Records & Myths</span>
            </div>
          )}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-slate-500 hover:text-amber-500 transition-colors focus:outline-none p-1 rounded hover:bg-slate-800"
          >
            {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>

        {isCollapsed && (
          <div className="mt-4 flex flex-col items-center gap-6 text-slate-600">
            <Scroll size={20} />
            <div className="h-px w-6 bg-slate-800" />
            <Compass size={20} className="hover:text-amber-500 cursor-pointer" onClick={() => { setIsCollapsed(false); setSelectedEra(null); }} />
          </div>
        )}

        <div className={clsx(
          "flex-1 flex flex-col min-h-0 transition-opacity duration-200 overflow-hidden",
          isCollapsed ? "opacity-0 pointer-events-none invisible" : "opacity-100 visible delay-100"
        )}>
          <div className="px-4 md:px-6 py-3 border-b border-amber-900/10 bg-slate-900/30 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
              <input 
                type="text"
                placeholder="Search the lore..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg py-1 pl-8 pr-3 text-[10px] md:text-xs focus:outline-none transition-all placeholder:text-slate-600 font-sans"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 relative">
            <div className="absolute left-7 md:left-9 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-900/50 to-transparent" />
            <nav className="space-y-4 md:space-y-8 relative">
              <button 
                onClick={() => setSelectedEra(null)}
                className={clsx(
                  "w-full flex items-center gap-3 md:gap-4 group transition-all",
                  !selectedEra ? "text-amber-400" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <div className={clsx(
                  "w-5 h-5 md:w-6 md:h-6 rounded-full border-2 z-10 flex items-center justify-center transition-all bg-slate-900",
                  !selectedEra ? "border-amber-400" : "border-slate-800"
                )}>
                  <Compass size={10} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest">All Eras</span>
              </button>

              {eraData.map((era) => (
                <button
                  key={era.name}
                  onClick={() => setSelectedEra(era.name)}
                  className={clsx(
                    "w-full flex items-start gap-3 md:gap-4 group transition-all text-left",
                    selectedEra === era.name ? "text-amber-400" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <div className={clsx(
                    "w-5 h-5 md:w-6 md:h-6 rounded-full border-2 z-10 flex items-center justify-center transition-all bg-slate-900 mt-0.5",
                    selectedEra === era.name ? "border-amber-400" : "border-amber-900/50"
                  )}>
                    <div className={clsx("w-1 h-1 rounded-full", selectedEra === era.name ? "bg-amber-400" : "bg-amber-900/50")} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-mono text-amber-600/70 font-bold uppercase tracking-widest">DR {era.year}</span>
                    <span className="text-xs md:text-sm font-bold leading-tight uppercase tracking-tight truncate">{era.name}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {isEditable && (
            <div className="p-3 bg-slate-950/50 border-t border-amber-900/20 text-center hidden md:block shrink-0">
              <button onClick={onAdd} className="w-full bg-amber-900/20 text-amber-500 border border-amber-900/50 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all">
                Record New Lore
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="p-4 md:p-6 bg-slate-900/80 border-b border-amber-900/30 flex justify-between items-center z-10">
          <div className="flex flex-col min-w-0">
            <h1 className="text-xl md:text-3xl font-bold text-amber-500 tracking-tighter uppercase leading-none truncate pr-4">
              {selectedEra || "The Sacred Archives"}
            </h1>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="flex items-center gap-2 bg-amber-900/30 hover:bg-amber-900/50 text-amber-500 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border border-amber-500/20"
              >
                <Compass size={12} />
                <span className="hidden xs:inline">Reset Compass</span>
              </button>
            )}
            <Scroll className="text-amber-900/30 hidden md:block" size={24} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
          {filteredEntries.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center">
               <History size={48} className="mb-4 opacity-20 mx-auto" />
               <p className="font-serif italic text-lg px-4">The pages of time are silent here...</p>
               {hasActiveFilters && (
                 <button 
                   onClick={clearFilters}
                   className="mt-6 text-amber-500 border-b border-amber-500/30 hover:border-amber-500 transition-all text-xs uppercase tracking-widest font-bold"
                 >
                   Reset the search
                 </button>
               )}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 md:gap-8 max-w-7xl mx-auto">
              {filteredEntries.map(entry => (
                <div key={entry.id} onClick={() => setExpandedEntry(entry)} className="group relative bg-slate-900/60 backdrop-blur-sm border border-amber-900/20 rounded-lg overflow-hidden hover:border-amber-500/40 transition-all flex flex-col h-[320px] md:h-[380px] cursor-pointer shadow-xl">
                  {/* Card Image */}
                  <div className="h-32 md:h-40 relative overflow-hidden bg-slate-950">
                    {entry.image_url ? (
                      <img src={entry.image_url} alt={entry.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-800">
                        <ImageIcon size={32} className="opacity-10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  </div>

                  <div className="p-4 md:p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-amber-600/80">DR {entry.year}</span>
                      {isEditable && (
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => onEdit(entry)} className="text-slate-600 hover:text-amber-500"><Edit3 size={12} /></button>
                          <button onClick={() => onDelete(entry.id)} className="text-slate-600 hover:text-red-500"><Trash2 size={12} /></button>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-amber-100/90 mb-2 md:mb-3 line-clamp-2 leading-tight uppercase tracking-tight group-hover:text-amber-400 transition-colors">{entry.title}</h3>
                    <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-4 line-clamp-3 md:line-clamp-4 flex-1 font-sans">{entry.content}</p>
                    <div className="flex justify-end pt-2 border-t border-slate-800/50">
                      <span className="text-amber-600/40 text-[8px] uppercase tracking-widest font-bold group-hover:text-amber-500 transition-all">Examine Scroll</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {expandedEntry && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-2 md:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setExpandedEntry(null)} />
          <div className="relative bg-slate-900 border border-amber-900/50 rounded-xl md:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
            {/* Modal Image Header - Changed to object-contain and added background */}
            {expandedEntry.image_url && (
              <div className="h-64 md:h-96 w-full overflow-hidden shrink-0 relative bg-black">
                <img src={expandedEntry.image_url} alt={expandedEntry.title} className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
              </div>
            )}

            <div className="bg-slate-950 p-4 md:p-8 border-b border-amber-900/30 flex justify-between items-center shrink-0">
              <div className="min-w-0 pr-4">
                <span className="text-[10px] md:text-xs uppercase font-bold text-amber-600 mb-1 block">Chronicle of Era {expandedEntry.era} • DR {expandedEntry.year}</span>
                <h2 className="text-2xl md:text-5xl font-bold text-amber-100 uppercase tracking-tighter truncate leading-none">{expandedEntry.title}</h2>
              </div>
              <button onClick={() => setExpandedEntry(null)} className="text-slate-600 hover:text-amber-500 p-2 shrink-0 transition-colors"><X size={32} /></button>
            </div>
            {/* Content Area - Replaced natural-paper with a more consistent dark styled background */}
            <div className="flex-1 overflow-y-auto p-6 md:p-16 custom-scrollbar bg-slate-950 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-fixed relative">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-900/5 via-transparent to-transparent pointer-events-none" />
              <p className="text-slate-200 text-lg md:text-2xl leading-relaxed font-serif whitespace-pre-wrap relative z-10">{expandedEntry.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoreView;
