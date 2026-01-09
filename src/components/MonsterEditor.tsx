import React, { useState } from 'react';
import { Monster } from '../types';
import { X, Save, Skull, Plus, Trash2, Activity, Shield, Wind, Zap, Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

interface MonsterEditorProps {
  monster: Partial<Monster> | null;
  onSave: (monster: Partial<Monster>) => Promise<void>;
  onClose: () => void;
}

const MonsterEditor: React.FC<MonsterEditorProps> = ({ monster, onSave, onClose }) => {
  const [activeTab, setActiveTab] = useState<'identity' | 'combat' | 'abilities' | 'traits' | 'actions' | 'legendary'>('identity');
  
  const [formData, setFormData] = useState<Partial<Monster>>(monster || {
    name: '',
    slug: '',
    size: 'Medium',
    type: 'Humanoid',
    challenge_rating: '1',
    armor_class: 10,
    hit_points: 10,
    alignment: 'Unaligned',
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    speed: { walk: 30 },
    senses: 'Passive Perception 10',
    languages: 'Common',
    special_abilities: [],
    actions: [],
    legendary_actions: [],
    is_homebrew: true,
    is_public: false
  });
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const finalData = { 
      ...formData, 
      slug: formData.slug || formData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') 
    };
    await onSave(finalData);
    setLoading(false);
  };

  const handleArrayChange = (field: 'special_abilities' | 'actions' | 'legendary_actions', index: number, key: 'name' | 'desc', value: string) => {
    const newArray = [...(formData[field] || [])];
    newArray[index] = { ...newArray[index], [key]: value };
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field: 'special_abilities' | 'actions' | 'legendary_actions') => {
    setFormData({ ...formData, [field]: [...(formData[field] || []), { name: 'New Entry', desc: '' }] });
  };

  const removeArrayItem = (field: 'special_abilities' | 'actions' | 'legendary_actions', index: number) => {
    setFormData({ ...formData, [field]: (formData[field] || []).filter((_, i) => i !== index) });
  };

  const handleSpeedChange = (type: string, value: string) => {
    const val = parseInt(value) || 0;
    setFormData({
      ...formData,
      speed: { ...(formData.speed || {}), [type]: val }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[3000] flex items-center justify-center p-2 md:p-4 backdrop-blur-md overflow-hidden font-sans">
      <div className="bg-slate-900 border border-amber-900/50 rounded-lg shadow-2xl w-full max-w-4xl flex flex-col max-h-[95vh] animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 md:p-6 border-b border-amber-900/30 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3 text-amber-500">
            <Skull size={24} />
            <h2 className="text-xl font-serif font-bold uppercase tracking-wider">
              {monster?.id ? 'Vessel Mutation' : 'Spawn New Entity'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-amber-500 p-2"><X size={24} /></button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-amber-900/20 bg-slate-950/50 shrink-0 overflow-x-auto custom-scrollbar no-scrollbar">
          {([
            { id: 'identity', label: 'Identity' },
            { id: 'combat', label: 'Combat' },
            { id: 'abilities', label: 'Abilities' },
            { id: 'traits', label: 'Traits' },
            { id: 'actions', label: 'Actions' },
            { id: 'legendary', label: 'Legendary' }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "px-4 md:px-6 py-3 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                activeTab === tab.id ? "text-amber-500 border-b-2 border-amber-500 bg-amber-500/5" : "text-slate-500 hover:text-slate-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
          
          {/* IDENTITY TAB */}
          {activeTab === 'identity' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 text-sm focus:border-amber-500 focus:outline-none" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Slug (Unique URL ID)</label>
                  <input type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 text-sm focus:border-amber-500 focus:outline-none" placeholder="e.g. fire-giant-king" />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Size</label>
                  <select value={formData.size} onChange={(e) => setFormData({...formData, size: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 text-sm focus:border-amber-500 focus:outline-none">
                    {['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</label>
                  <input type="text" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 text-sm focus:border-amber-500 focus:outline-none" placeholder="e.g. Undead" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Alignment</label>
                  <input type="text" value={formData.alignment} onChange={(e) => setFormData({...formData, alignment: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 text-sm focus:border-amber-500 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CR</label>
                  <input type="text" value={formData.challenge_rating} onChange={(e) => setFormData({...formData, challenge_rating: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 text-sm focus:border-amber-500 focus:outline-none" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-amber-900/10 mt-6">
                <div className="flex items-center gap-3">
                  {formData.is_public ? <Eye className="text-amber-500" size={20} /> : <EyeOff className="text-slate-600" size={20} />}
                  <div>
                    <p className="text-xs font-bold text-amber-100 uppercase tracking-widest leading-none mb-1">Entity Reveal</p>
                    <p className="text-[10px] text-slate-500 uppercase leading-none">{formData.is_public ? 'Players see this beast in Bestiary' : 'Entity is a DM Secret'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_public: !formData.is_public })}
                  className={clsx(
                    "px-4 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all border",
                    formData.is_public ? "bg-amber-600/20 border-amber-500 text-amber-500" : "bg-slate-800 border-slate-700 text-slate-500"
                  )}
                >
                  {formData.is_public ? 'Conceal' : 'Reveal'}
                </button>
              </div>
            </div>
          )}

          {/* COMBAT TAB */}
          {activeTab === 'combat' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Shield size={12}/> Armor Class</label>
                  <input type="number" value={formData.armor_class} onChange={(e) => setFormData({...formData, armor_class: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 text-sm focus:border-amber-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1"><Activity size={12}/> Hit Points</label>
                  <input type="number" value={formData.hit_points} onChange={(e) => setFormData({...formData, hit_points: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 text-sm focus:border-amber-500" />
                </div>
              </div>
              {/* Other combat inputs... */}
              <div className="p-4 bg-slate-950/50 rounded border border-amber-900/10 space-y-4">
                <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Movement Speeds (ft.)</h4>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                  {['walk', 'fly', 'swim', 'climb', 'burrow'].map(type => (
                    <div key={type} className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">{type}</label>
                      <input type="number" value={formData.speed?.[type] || 0} onChange={(e) => handleSpeedChange(type, e.target.value)} className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded p-1 text-xs focus:border-amber-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other tabs follow same structure... Traits, Actions, etc. */}
          {activeTab === 'abilities' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in">
              {(['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'] as const).map(stat => (
                <div key={stat} className="bg-slate-950/50 p-4 rounded border border-amber-900/10 space-y-2">
                  <label className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block text-center">{stat}</label>
                  <input type="number" value={formData[stat]} onChange={(e) => setFormData({...formData, [stat]: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 text-amber-100 text-center rounded p-2 text-lg font-bold focus:border-amber-500" />
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'traits' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Special Traits</h4>
                <button type="button" onClick={() => addArrayItem('special_abilities')} className="text-[10px] text-amber-500 uppercase font-bold flex items-center gap-1"><Plus size={14}/> Add Trait</button>
              </div>
              {(formData.special_abilities || []).map((trait, idx) => (
                <div key={idx} className="bg-slate-950/50 p-4 rounded border border-amber-900/10 space-y-3">
                  <div className="flex gap-4">
                    <input type="text" placeholder="Trait Name" value={trait.name} onChange={(e) => handleArrayChange('special_abilities', idx, 'name', e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 text-amber-200 rounded p-2 text-xs font-bold" />
                    <button type="button" onClick={() => removeArrayItem('special_abilities', idx)} className="text-red-500"><Trash2 size={16}/></button>
                  </div>
                  <textarea value={trait.desc} onChange={(e) => handleArrayChange('special_abilities', idx, 'desc', e.target.value)} rows={3} placeholder="Effect description..." className="w-full bg-slate-900 border border-slate-800 text-slate-400 rounded p-3 text-xs focus:border-amber-500 no-scrollbar resize-none" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'actions' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Combat Actions</h4>
                <button type="button" onClick={() => addArrayItem('actions')} className="text-[10px] text-amber-500 uppercase font-bold flex items-center gap-1"><Plus size={14}/> Add Action</button>
              </div>
              {(formData.actions || []).map((action, idx) => (
                <div key={idx} className="bg-slate-950/50 p-4 rounded border border-amber-900/10 space-y-3">
                  <div className="flex gap-4">
                    <input type="text" placeholder="Action Name" value={action.name} onChange={(e) => handleArrayChange('actions', idx, 'name', e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 text-amber-200 rounded p-2 text-xs font-bold" />
                    <button type="button" onClick={() => removeArrayItem('actions', idx)} className="text-red-500"><Trash2 size={16}/></button>
                  </div>
                  <textarea value={action.desc} onChange={(e) => handleArrayChange('actions', idx, 'desc', e.target.value)} rows={3} placeholder="Action description..." className="w-full bg-slate-900 border border-slate-800 text-slate-400 rounded p-3 text-xs focus:border-amber-500 no-scrollbar resize-none" />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'legendary' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Legendary Actions</h4>
                <button type="button" onClick={() => addArrayItem('legendary_actions')} className="text-[10px] text-amber-500 uppercase font-bold flex items-center gap-1"><Plus size={14}/> Add Legendary Action</button>
              </div>
              {(formData.legendary_actions || []).map((action, idx) => (
                <div key={idx} className="bg-slate-950/50 p-4 rounded border border-amber-600/20 space-y-3">
                  <div className="flex gap-4">
                    <input type="text" placeholder="Name" value={action.name} onChange={(e) => handleArrayChange('legendary_actions', idx, 'name', e.target.value)} className="flex-1 bg-slate-900 border border-slate-800 text-amber-200 rounded p-2 text-xs font-bold" />
                    <button type="button" onClick={() => removeArrayItem('legendary_actions', idx)} className="text-red-500"><Trash2 size={16}/></button>
                  </div>
                  <textarea value={action.desc} onChange={(e) => handleArrayChange('legendary_actions', idx, 'desc', e.target.value)} rows={3} placeholder="Mechanics..." className="w-full bg-slate-900 border border-slate-800 text-slate-400 rounded p-3 text-xs focus:border-amber-500 no-scrollbar resize-none" />
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 md:p-6 bg-slate-950 border-t border-amber-900/30 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="homebrew" 
              checked={formData.is_homebrew} 
              onChange={(e) => setFormData({...formData, is_homebrew: e.target.checked})}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-600 focus:ring-amber-500"
            />
            <label htmlFor="homebrew" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer">Mark as Homebrew</label>
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)]"
          >
            <Save size={20} />
            {loading ? 'Manifesting Entity...' : 'Seal Bestiary Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonsterEditor;