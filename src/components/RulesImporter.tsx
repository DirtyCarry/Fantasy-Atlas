
import React, { useState, useEffect } from 'react';
import { X, Search, Download, Check, Loader2, Globe, Shield, Wind, Book, Scale, Zap } from 'lucide-react';
import { RuleEntry } from '../types';
import clsx from 'clsx';

interface RulesImporterProps {
  onClose: () => void;
  onImport: (rules: Partial<RuleEntry>[]) => Promise<void>;
}

const categoryMapping: Record<string, string> = {
  'combat': 'Combat',
  'conditions': 'Conditions',
  'spellcasting': 'Spellcasting',
  'adventuring': 'Adventuring',
  'using-ability-scores': 'Adventuring'
};

const RulesImporter: React.FC<RulesImporterProps> = ({ onClose, onImport }) => {
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState('');
  const [sections, setSections] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.open5e.com/sections/?document__slug=wotc-srd');
      const data = await response.json();
      
      const relevantSections = (data.results || []).filter((s: any) => 
        ['combat', 'conditions', 'spellcasting', 'adventuring', 'using-ability-scores'].includes(s.slug)
      );
      
      setSections(relevantSections);
    } catch (err) {
      console.error('Failed to fetch arcane knowledge:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (slug: string) => {
    const next = new Set(selectedIds);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setSelectedIds(next);
  };

  const handleImport = async () => {
    setImporting(true);
    const rulesToImport: Partial<RuleEntry>[] = [];

    for (const section of sections) {
      if (selectedIds.has(section.slug)) {
        if (section.slug === 'conditions') {
          const parts = section.desc.split('### ').slice(1);
          parts.forEach((p: string) => {
            const lines = p.split('\n');
            const name = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();
            
            rulesToImport.push({
              name,
              category: 'Conditions',
              description: content,
              details: [], // No segmentation
              is_public: true
            });
          });
        } else {
          rulesToImport.push({
            name: section.name,
            category: categoryMapping[section.slug] || 'Combat',
            description: section.desc || "",
            details: [], // No segmentation
            is_public: true
          });
        }
      }
    }

    await onImport(rulesToImport);
    setImporting(false);
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-4 backdrop-blur-xl">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-slate-900 border border-amber-900/50 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-amber-900/30 bg-slate-950/50 flex justify-between items-center">
          <div className="flex items-center gap-3 text-amber-500">
            <Globe size={24} className="animate-pulse" />
            <div>
              <h2 className="text-xl font-serif font-bold uppercase tracking-widest">Arcane Codex Manifest</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-sans">Importing SRD Legal Statutes</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-amber-500 transition-colors"><X size={24} /></button>
        </div>
        <div className="p-4 bg-slate-950/30 border-b border-amber-900/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" size={14} />
            <input 
              type="text" 
              placeholder="Search available knowledge..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
          {loading ? (
            <div className="h-48 flex flex-col items-center justify-center text-amber-500 gap-4">
              <Loader2 className="animate-spin" size={32} />
              <span className="text-[10px] font-bold uppercase tracking-widest animate-pulse">Consulting the Multiverse...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {sections.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(section => (
                <div 
                  key={section.slug}
                  onClick={() => toggleSelection(section.slug)}
                  className={clsx(
                    "p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group",
                    selectedIds.has(section.slug) 
                      ? "bg-amber-900/20 border-amber-500 shadow-[0_0_15px_rgba(217,119,6,0.1)]" 
                      : "bg-slate-950/50 border-slate-800 hover:border-amber-900/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={clsx(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                      selectedIds.has(section.slug) ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-amber-500/40"
                    )}>
                      {categoryMapping[section.slug] === 'Combat' && <Shield size={20} />}
                      {categoryMapping[section.slug] === 'Conditions' && <Wind size={20} />}
                      {categoryMapping[section.slug] === 'Spellcasting' && <Book size={20} />}
                      {categoryMapping[section.slug] === 'Adventuring' && <Zap size={20} />}
                    </div>
                    <div>
                      <h4 className="text-sm font-serif font-bold text-amber-100 uppercase tracking-tight">{section.name}</h4>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">{categoryMapping[section.slug] || 'General'}</p>
                    </div>
                  </div>
                  <div className={clsx(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                    selectedIds.has(section.slug) ? "bg-amber-500 border-amber-500 text-slate-950" : "border-slate-800 group-hover:border-amber-900"
                  )}>
                    {selectedIds.has(section.slug) && <Check size={14} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 bg-slate-950 border-t border-amber-900/30 flex items-center justify-between">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            {selectedIds.size} Statutes Selected
          </div>
          <button 
            onClick={handleImport}
            disabled={selectedIds.size === 0 || importing}
            className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2 text-xs uppercase tracking-widest"
          >
            {importing ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            Manifest Codex
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesImporter;
