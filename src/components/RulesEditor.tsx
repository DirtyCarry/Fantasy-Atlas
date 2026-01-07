import React, { useState } from 'react';
import { RuleEntry } from '../types';
import { X, Save, Scale, Plus, Trash2 } from 'lucide-react';

interface RulesEditorProps {
  rule: Partial<RuleEntry> | null;
  onSave: (rule: Partial<RuleEntry>) => Promise<void>;
  onClose: () => void;
}

const RulesEditor: React.FC<RulesEditorProps> = ({ rule, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<RuleEntry>>(rule || {
    name: '',
    category: 'Conditions',
    description: '',
    details: []
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  const handleDetailChange = (index: number, value: string) => {
    const newDetails = [...(formData.details || [])];
    newDetails[index] = value;
    setFormData({ ...formData, details: newDetails });
  };

  const addDetail = () => {
    setFormData({ ...formData, details: [...(formData.details || []), ''] });
  };

  const removeDetail = (index: number) => {
    setFormData({ ...formData, details: (formData.details || []).filter((_, i) => i !== index) });
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[3000] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-slate-900 border border-amber-900/50 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-slate-950 p-6 border-b border-amber-900/30 flex justify-between items-center">
          <div className="flex items-center gap-3 text-amber-500">
            <Scale size={24} />
            <h2 className="text-xl font-serif font-bold uppercase tracking-wider">
              {rule?.id ? 'Edit Codex Entry' : 'New Rule Entry'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-amber-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rule Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 focus:border-amber-500 focus:outline-none"
              >
                <option value="Conditions">Conditions</option>
                <option value="Combat">Combat</option>
                <option value="Adventuring">Adventuring</option>
                <option value="Spellcasting">Spellcasting</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Short Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 text-sm focus:border-amber-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Detailed Mechanics</label>
              <button type="button" onClick={addDetail} className="text-[10px] text-amber-500 hover:text-amber-400 font-bold uppercase flex items-center gap-1">
                <Plus size={12} /> Add Point
              </button>
            </div>
            <div className="space-y-2">
              {(formData.details || []).map((detail, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={detail}
                    onChange={(e) => handleDetailChange(idx, e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 text-xs focus:border-amber-500 focus:outline-none"
                    placeholder="Specific rule detail..."
                  />
                  <button type="button" onClick={() => removeDetail(idx)} className="text-red-500 p-2"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all mt-4"
          >
            <Save size={20} />
            {loading ? 'Updating Codex...' : 'Seal Rule'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RulesEditor;