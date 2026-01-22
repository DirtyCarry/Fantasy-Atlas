
import React, { useState, useMemo } from 'react';
import { Search, Shield, Zap, Wind, Book, Scale, X, Edit3, Trash2, PanelLeftClose, PanelLeftOpen, Download } from 'lucide-react';
import clsx from 'clsx';
import { RuleEntry } from '../types';
import RulesImporter from './RulesImporter';

const categoryIcons = {
  'Conditions': <Wind size={14} />,
  'Combat': <Shield size={14} />,
  'Adventuring': <Zap size={14} />,
  'Spellcasting': <Book size={14} />
};

interface RulesViewProps {
  rules: RuleEntry[];
  isEditable: boolean;
  onEdit: (rule: RuleEntry) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onImport: (rules: Partial<RuleEntry>[]) => Promise<void>;
}

const RulesView: React.FC<RulesViewProps> = ({ rules, isEditable, onEdit, onAdd, onDelete, onImport }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRule, setSelectedRule] = useState<RuleEntry | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showImporter, setShowImporter] = useState(false);

  const filteredRules = useMemo(() => {
    return rules.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || 
                           r.description.toLowerCase().includes(search.toLowerCase());
      const matchesCat = !selectedCategory || r.category === selectedCategory;
      // Fixed: matchesEra was not defined, should be matchesCat
      return matchesSearch && matchesCat;
    });
  }, [rules, search, selectedCategory]);

  const categories = Array.from(new Set(rules.map(r => r.category))) as string[];

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
                <Scale size={18} className="shrink-0" />
                <h2 className="text-base md:text-lg font-serif font-bold uppercase tracking-[0.2em] truncate">Codex</h2>
              </div>
              <span className="text-[8px] font-sans uppercase tracking-[0.2em] text-amber-600/50 leading-none mt-1">High Statutes of the Coast</span>
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
            <Scale size={20} className="text-amber-500/50" />
            <div className="h-px w-6 bg-slate-800" />
          </div>
        )}

        <div className={clsx(
          "flex-1 flex flex-col min-h-0 transition-opacity duration-200 overflow-hidden",
          isCollapsed ? "opacity-0 pointer-events-none invisible" : "opacity-100 visible delay-100"
        )}>
          <div className="p-3 bg-slate-900/50 border-b border-amber-900/10 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 text-slate-500" size={14} />
              <input 
                type="text"
                placeholder="Search the statutes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-md py-1.5 pl-8 pr-3 text-xs focus:border-amber-500 focus:outline-none transition-all placeholder:text-slate-600 font-sans"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={clsx(
                "w-full text-left px-3 py-2 rounded text-[11px] font-bold uppercase tracking-wider transition-all",
                !selectedCategory ? "bg-amber-900/20 text-amber-400" : "text-slate-400 hover:bg-slate-800"
              )}
            >
              All Statutes
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={clsx(
                  "w-full text-left px-3 py-2 rounded text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                  selectedCategory === cat ? "bg-amber-900/20 text-amber-400" : "text-slate-400 hover:bg-slate-800"
                )}
              >
                {categoryIcons[cat as keyof typeof categoryIcons] || <Book size={14} />}
                <span className="truncate">{cat}</span>
              </button>
            ))}
          </div>

          {isEditable && (
            <div className="p-3 bg-slate-950/50 border-t border-amber-900/20 shrink-0 space-y-2">
              <button onClick={() => setShowImporter(true)} className="w-full bg-slate-800 text-amber-500 border border-amber-900/30 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                <Download size={12} /> Import Arcane Codex
              </button>
              <button onClick={onAdd} className="w-full bg-amber-900/20 text-amber-500 border border-amber-900/50 py-2 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-amber-900/40 transition-all">
                Amend Statutes
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8 max-w-7xl mx-auto">
          {filteredRules.map(rule => (
            <div 
              key={rule.id}
              onClick={() => setSelectedRule(rule)}
              className="bg-slate-900/60 backdrop-blur-sm border border-amber-900/20 p-6 rounded-lg hover:border-amber-500/40 transition-all cursor-pointer group flex flex-col h-[180px] shadow-lg"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] uppercase tracking-widest font-bold text-amber-600/60">{rule.category}</span>
                {isEditable ? (
                  <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => onEdit(rule)} className="text-slate-600 hover:text-amber-500"><Edit3 size={14} /></button>
                    <button onClick={() => onDelete(rule.id)} className="text-slate-600 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                ) : (
                  <div className="text-amber-500/0 group-hover:text-amber-500/40 transition-all"><Scale size={14} /></div>
                )}
              </div>
              <h3 className="text-amber-100 font-serif font-bold text-lg mb-2 uppercase tracking-tight group-hover:text-amber-400 transition-colors">{rule.name}</h3>
              <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed font-sans">{rule.description}</p>
            </div>
          ))}
        </div>
      </main>

      {selectedRule && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setSelectedRule(null)} />
          <div className="relative bg-slate-900 border border-amber-900/50 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-amber-900/20 flex justify-between items-center bg-slate-950/50 shrink-0">
              <div className="min-w-0 pr-4">
                <span className="text-xs uppercase text-amber-600 font-bold tracking-[0.2em] mb-1 block">{selectedRule.category} Statute</span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-amber-100 uppercase tracking-tighter truncate leading-none">{selectedRule.name}</h2>
              </div>
              <button onClick={() => setSelectedRule(null)} className="text-slate-500 hover:text-amber-500 transition-colors p-2 shrink-0">
                <X size={28} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-slate-950 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-fixed relative">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-900/5 via-transparent to-transparent pointer-events-none" />
              
              <div className="max-w-prose mx-auto relative z-10">
                <p className="text-slate-200 text-lg md:text-xl leading-relaxed mb-8 font-sans italic border-l-2 border-amber-900/30 pl-6">
                  {selectedRule.description}
                </p>
                
                {selectedRule.details && selectedRule.details.length > 0 && (
                  <ul className="space-y-6">
                    {selectedRule.details.map((detail, idx) => (
                      <li key={idx} className="flex gap-4 items-start group">
                        <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-amber-600 shadow-[0_0_8px_rgba(217,119,6,0.6)] shrink-0 transition-transform group-hover:scale-125" />
                        <p className="text-slate-300 leading-relaxed font-sans text-sm md:text-base">{detail}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showImporter && (
        <RulesImporter 
          onClose={() => setShowImporter(false)} 
          onImport={async (newRules) => {
            await onImport(newRules);
            setShowImporter(false);
          }} 
        />
      )}
    </div>
  );
};

export default RulesView;
