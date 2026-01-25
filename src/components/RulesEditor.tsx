
import React, { useState } from 'react';
import { RuleEntry } from '../types';
import { X, Save, Scale, Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

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
    details: [],
    is_public: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
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
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Statute Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={12}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-4 text-sm focus:border-amber-500 focus:outline-none font-serif italic"
              required
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-amber-900/10">
            <div className="flex items-center gap-3">
              {formData.is_public ? <Eye className="text-amber-500" size={20} /> : <EyeOff className="text-slate-600" size={20} />}
              <div>
                <p className="text-xs font-bold text-amber-100 uppercase tracking-widest leading-none mb-1">Codex Visibility</p>
                <p className="text-[10px] text-slate-500 uppercase leading-none">{formData.is_public ? 'Players can access this law' : 'DM restricted rule'}</p>
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
              {formData.is_public ? 'Hide' : 'Reveal'}
            </button>
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
