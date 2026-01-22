
import React, { useState } from 'react';
import { AppSettings } from '../types';
import { Save, FileDown, Upload, RefreshCw, AlertCircle, Database, Map as MapIcon, Hammer, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import clsx from 'clsx';

interface SettingsViewProps {
  worldId: string;
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onRefresh: () => void;
}

const TEMPLATES = {
  locations: "name,description,x,y,taverns,shops,npcs,is_public,image_url",
  lore: "title,content,era,year,category,is_public,image_url",
  monsters: "name,slug,size,type,challenge_rating,armor_class,hit_points,alignment,strength,dexterity,constitution,intelligence,wisdom,charisma,speed_walk,speed_fly,senses,languages,is_public",
  rules: "name,category,description,details,is_public",
  notes: "title,content,category,is_public,image_url"
};

const SettingsView: React.FC<SettingsViewProps> = ({ worldId, settings, onSave, onRefresh }) => {
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
    setImportStatus({ type, message: "Deciphering records..." });
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        let error;

        if (type === 'locations') {
          const formatted = data.map(d => ({
            world_id: worldId,
            name: d.name,
            description: d.description,
            x: parseFloat(d.x) || 1000,
            y: parseFloat(d.y) || 750,
            taverns: d.taverns ? d.taverns.split(';').map((s: string) => s.trim()) : [],
            shops: d.shops ? d.shops.split(';').map((s: string) => s.trim()) : [],
            npcs: d.npcs ? d.npcs.split(';').map((s: string) => s.trim()) : [],
            is_public: d.is_public === 'true',
            image_url: d.image_url || ''
          }));
          ({ error } = await supabase.from('locations').insert(formatted));
        } else if (type === 'lore') {
          const formatted = data.map(d => ({ 
            world_id: worldId,
            title: d.title,
            content: d.content,
            era: d.era,
            year: parseInt(d.year) || 1490,
            category: d.category,
            is_public: d.is_public === 'true',
            image_url: d.image_url || ''
          }));
          ({ error } = await supabase.from('lore_entries').insert(formatted));
        } else if (type === 'rules') {
          const formatted = data.map(d => ({
            world_id: worldId,
            name: d.name,
            category: d.category,
            description: d.description,
            details: d.details ? d.details.split(';').map((s: string) => s.trim()) : [],
            is_public: d.is_public === 'true'
          }));
          ({ error } = await supabase.from('rules').insert(formatted));
        } else if (type === 'monsters') {
          const formatted = data.map(d => ({
            world_id: worldId,
            name: d.name,
            slug: d.slug || d.name.toLowerCase().replace(/ /g, '-'),
            size: d.size || 'Medium',
            type: d.type || 'Humanoid',
            challenge_rating: d.challenge_rating || '1',
            armor_class: parseInt(d.armor_class) || 10,
            hit_points: parseInt(d.hit_points) || 10,
            alignment: d.alignment || 'Unaligned',
            strength: parseInt(d.strength) || 10,
            dexterity: parseInt(d.dexterity) || 10,
            constitution: parseInt(d.constitution) || 10,
            intelligence: parseInt(d.intelligence) || 10,
            wisdom: parseInt(d.wisdom) || 10,
            charisma: parseInt(d.charisma) || 10,
            speed: { walk: parseInt(d.speed_walk) || 30, fly: parseInt(d.speed_fly) || 0 },
            senses: d.senses || '',
            languages: d.languages || 'Common',
            is_homebrew: true,
            is_public: d.is_public === 'true'
          }));
          ({ error } = await supabase.from('homebrew_monsters').insert(formatted));
        } else if (type === 'notes') {
          const formatted = data.map(d => ({
            world_id: worldId,
            title: d.title,
            content: d.content,
            category: d.category,
            is_public: d.is_public === 'true',
            image_url: d.image_url || ''
          }));
          ({ error } = await supabase.from('dm_notes').insert(formatted));
        }

        if (error) throw error;
        setImportStatus({ type, message: `Successfully manifested ${data.length} records.` });
        setTimeout(() => setImportStatus(null), 5000);
        onRefresh();
      } catch (err: any) {
        setImportStatus({ type, message: `Manifestation Failed: ${err.message}`, error: true });
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const ImportCard = ({ type, title }: { type: keyof typeof TEMPLATES, title: string }) => (
    <div className="bg-slate-900/40 border border-slate-800/60 rounded-lg p-6 flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-serif font-bold text-amber-500 uppercase tracking-widest">{title}</h3>
        <button 
          onClick={() => handleDownloadTemplate(type)}
          className="text-[10px] text-slate-500 hover:text-amber-500 flex items-center gap-1 transition-colors uppercase font-bold"
        >
          <FileText size={12} /> Template
        </button>
      </div>

      <div className="relative group">
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl py-12 hover:border-amber-500/30 cursor-pointer transition-all bg-slate-950/30">
          <Upload className="text-slate-700 group-hover:text-amber-600 mb-3 transition-colors" size={32} />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest group-hover:text-slate-400">Upload Records</span>
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            onChange={(e) => e.target.files?.[0] && handleImport(type, e.target.files[0])}
          />
        </label>
        
        {importStatus?.type === type && (
          <div className={clsx(
            "absolute inset-0 flex items-center justify-center rounded-xl backdrop-blur-sm px-6 text-center",
            importStatus.error ? "bg-red-950/40" : "bg-green-950/40"
          )}>
            <div className={clsx(
              "text-[10px] font-bold uppercase tracking-widest flex items-center gap-2",
              importStatus.error ? "text-red-400" : "text-green-400"
            )}>
              {importStatus.error ? <AlertCircle size={16} /> : <RefreshCw className="animate-spin" size={16} />}
              {importStatus.message}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full w-full bg-[#020617] overflow-y-auto custom-scrollbar p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* World Identity Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 border-b border-amber-900/20 pb-6">
            <Hammer className="text-amber-600" size={32} />
            <div>
              <h1 className="text-4xl font-serif font-bold text-amber-500 uppercase tracking-tighter">The Forge</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] font-bold">World Management & Creation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/20 p-8 rounded-2xl border border-amber-900/10">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">World Name</label>
                <input 
                  type="text" 
                  value={formData.worldName}
                  onChange={e => setFormData({...formData, worldName: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-3 text-sm focus:border-amber-500 focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Map URL</label>
                <input 
                  type="text" 
                  value={formData.mapUrl}
                  onChange={e => setFormData({...formData, mapUrl: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-3 text-sm focus:border-amber-500 focus:outline-none transition-all"
                />
              </div>
              <button 
                onClick={() => onSave(formData)}
                className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 px-8 rounded-lg transition-all flex items-center gap-3 shadow-lg uppercase text-xs tracking-widest"
              >
                <Save size={18} /> Seal Identity
              </button>
            </div>
            
            <div className="flex items-center justify-center p-4 border border-slate-800/40 rounded-xl bg-slate-950/20 relative group overflow-hidden">
               <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-sm" style={{ backgroundImage: `url(${formData.mapUrl})` }} />
               <MapIcon className="text-amber-900/20 relative z-10" size={64} />
               <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-[8px] text-amber-500 font-bold uppercase tracking-widest z-10">Map Preview</div>
            </div>
          </div>
        </div>

        {/* Bulk Manifest Section */}
        <div className="space-y-10">
          <div className="flex items-center gap-4 border-b border-amber-900/20 pb-6">
            <Database className="text-amber-600" size={28} />
            <h2 className="text-3xl font-serif font-bold text-amber-100 uppercase tracking-tighter">Manifest Records (Bulk CSV)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ImportCard type="locations" title="Locations" />
            <ImportCard type="lore" title="Lore" />
            <ImportCard type="rules" title="Rules" />
            <ImportCard type="monsters" title="Monsters" />
            <div className="md:col-span-2">
              <ImportCard type="notes" title="Campaign Notes" />
            </div>
          </div>

          <div className="p-6 bg-amber-900/5 border border-amber-900/10 rounded-xl">
            <h4 className="text-[10px] font-bold text-amber-700 uppercase mb-3 tracking-widest">Architect's Protocol</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
              <ul className="text-[10px] text-slate-500 space-y-1.5 list-disc pl-4 uppercase leading-relaxed font-semibold">
                <li>Download templates before uploading.</li>
                <li>Separate list items (NPCs, details) with semicolons (;).</li>
                <li>Coordinate boundaries: X (0-2000), Y (0-1500).</li>
              </ul>
              <ul className="text-[10px] text-slate-500 space-y-1.5 list-disc pl-4 uppercase leading-relaxed font-semibold">
                <li>Visibility must be string literal: 'true' or 'false'.</li>
                <li>Uploads append to existing archives.</li>
                <li>Duplicates will be manifested as new entities.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center text-amber-500 font-serif">
           <RefreshCw className="animate-spin mb-6" size={64} />
           <p className="animate-pulse tracking-[0.4em] uppercase text-sm font-bold">Consulting the Grand Archive...</p>
        </div>
      )}
    </div>
  );
};

export default SettingsView;
