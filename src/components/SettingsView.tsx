import React, { useState } from 'react';
import { AppSettings, ViewMode } from '../types';
import { Save, FileDown, Upload, RefreshCw, AlertCircle, Database, Map as MapIcon, Hammer } from 'lucide-react';
import { supabase } from '../lib/supabase';
// Add missing clsx import
import clsx from 'clsx';

interface SettingsViewProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onRefresh: () => void;
}

const TEMPLATES = {
  locations: "name,description,x,y,taverns,shops,npcs",
  lore: "title,content,era,year,category",
  monsters: "name,slug,size,type,challenge_rating,armor_class,hit_points,alignment,strength,dexterity,constitution,intelligence,wisdom,charisma,speed_walk,speed_fly,senses,languages",
  rules: "name,category,description,details"
};

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave, onRefresh }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [importStatus, setImportStatus] = useState<{ type: string, message: string, error?: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDownloadTemplate = (type: keyof typeof TEMPLATES) => {
    const csvContent = "data:text/csv;charset=utf-8," + TEMPLATES[type];
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${type}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).filter(l => l.trim()).map(line => {
      const values = line.split(',').map(v => v.trim());
      return headers.reduce((obj: any, header, i) => {
        obj[header] = values[i];
        return obj;
      }, {});
    });
  };

  const handleImport = async (type: string, file: File) => {
    setLoading(true);
    setImportStatus({ type, message: "Parsing Ancient Text..." });
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        let error;

        if (type === 'locations') {
          const formatted = data.map(d => ({
            ...d,
            x: parseFloat(d.x) || 1000,
            y: parseFloat(d.y) || 750,
            taverns: d.taverns ? d.taverns.split(';').map((s: string) => s.trim()) : [],
            shops: d.shops ? d.shops.split(';').map((s: string) => s.trim()) : [],
            npcs: d.npcs ? d.npcs.split(';').map((s: string) => s.trim()) : []
          }));
          ({ error } = await supabase.from('locations').insert(formatted));
        } else if (type === 'lore') {
          const formatted = data.map(d => ({ ...d, year: parseInt(d.year) || 1490 }));
          ({ error } = await supabase.from('lore_entries').insert(formatted));
        } else if (type === 'rules') {
          const formatted = data.map(d => ({
            ...d,
            details: d.details ? d.details.split(';').map((s: string) => s.trim()) : []
          }));
          ({ error } = await supabase.from('rules').insert(formatted));
        } else if (type === 'monsters') {
          const formatted = data.map(d => ({
            ...d,
            armor_class: parseInt(d.armor_class) || 10,
            hit_points: parseInt(d.hit_points) || 10,
            strength: parseInt(d.strength) || 10,
            dexterity: parseInt(d.dexterity) || 10,
            constitution: parseInt(d.constitution) || 10,
            intelligence: parseInt(d.intelligence) || 10,
            wisdom: parseInt(d.wisdom) || 10,
            charisma: parseInt(d.charisma) || 10,
            speed: { walk: parseInt(d.speed_walk) || 30, fly: parseInt(d.speed_fly) || 0 },
            is_homebrew: true
          }));
          ({ error } = await supabase.from('homebrew_monsters').insert(formatted));
        }

        if (error) throw error;
        setImportStatus({ type, message: `Successfully imported ${data.length} entries.` });
        onRefresh();
      } catch (err: any) {
        setImportStatus({ type, message: `Import Failed: ${err.message}`, error: true });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="h-full w-full bg-slate-950 overflow-y-auto custom-scrollbar p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Title */}
        <div className="flex items-center gap-4 border-b border-amber-900/30 pb-6">
          <Hammer className="text-amber-500" size={32} />
          <div>
            <h1 className="text-3xl font-serif font-bold text-amber-500 uppercase tracking-tight">The Forge</h1>
            <p className="text-slate-500 text-xs uppercase tracking-widest font-bold">World Management & Bulk Manifestation</p>
          </div>
        </div>

        {/* Global Configuration */}
        <section className="bg-slate-900/50 border border-amber-900/20 rounded-xl p-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <MapIcon className="text-amber-600" size={20} />
            <h2 className="text-xl font-serif font-bold text-amber-100 uppercase">World Identity</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">World Name</label>
              <input 
                type="text" 
                value={formData.worldName}
                onChange={e => setFormData({...formData, worldName: e.target.value})}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Map URL (Direct Image Link)</label>
              <input 
                type="text" 
                value={formData.mapUrl}
                onChange={e => setFormData({...formData, mapUrl: e.target.value})}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
          <button 
            onClick={() => onSave(formData)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(217,119,6,0.2)]"
          >
            <Save size={16} /> Seal World Identity
          </button>
        </section>

        {/* Bulk Data Management */}
        <section className="bg-slate-900/50 border border-amber-900/20 rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <Database className="text-amber-600" size={20} />
            <h2 className="text-xl font-serif font-bold text-amber-100 uppercase">Manifest Records (Bulk CSV)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(['locations', 'lore', 'rules', 'monsters'] as const).map(type => (
              <div key={type} className="bg-slate-950/50 p-6 rounded border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest">{type}</h3>
                  <button 
                    onClick={() => handleDownloadTemplate(type)}
                    className="text-[10px] text-slate-500 hover:text-amber-500 flex items-center gap-1 transition-colors"
                  >
                    <FileDown size={12} /> Template
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-lg py-6 hover:border-amber-500/50 cursor-pointer transition-all bg-slate-900/30 group">
                    <Upload className="text-slate-600 group-hover:text-amber-500 mb-2" size={24} />
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Upload Records</span>
                    <input 
                      type="file" 
                      accept=".csv" 
                      className="hidden" 
                      onChange={(e) => e.target.files?.[0] && handleImport(type, e.target.files[0])}
                    />
                  </label>
                  
                  {importStatus?.type === type && (
                    <div className={clsx(
                      "p-2 rounded text-[10px] flex items-center gap-2 font-bold uppercase tracking-tight",
                      importStatus.error ? "bg-red-900/20 text-red-400 border border-red-900/50" : "bg-green-900/20 text-green-400 border border-green-900/50"
                    )}>
                      {importStatus.error ? <AlertCircle size={12} /> : <RefreshCw className="animate-spin" size={12} />}
                      {importStatus.message}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-slate-950 border border-amber-900/10 rounded">
            <h4 className="text-[10px] font-bold text-amber-700 uppercase mb-2">Importing Scrolls</h4>
            <ul className="text-[9px] text-slate-500 space-y-1 list-disc pl-4 uppercase leading-relaxed">
              <li>Templates are comma-separated values (CSV).</li>
              <li>For lists (Taverns, NPCs, Rule Details), use a semicolon (;) to separate entries.</li>
              <li>Coordinate (X, Y) range: 0-2000 (X) and 0-1500 (Y).</li>
              <li>Duplicates are handled as new entries. Wipe records via Supabase SQL for clean slates.</li>
            </ul>
          </div>
        </section>

        {/* Footer info */}
        <div className="text-center text-slate-600 text-[9px] uppercase tracking-[0.3em] py-8">
           Atlas Engine v1.1 • Production Ready • Enchanted by AI
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center text-amber-500 font-serif">
           <RefreshCw className="animate-spin mb-4" size={48} />
           <p className="animate-pulse tracking-widest uppercase">Consulting the Grand Archive...</p>
        </div>
      )}
    </div>
  );
};

export default SettingsView;