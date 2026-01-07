import React, { useState } from 'react';
import { LoreEntry } from '../types';
import { X, Save, BookOpen } from 'lucide-react';

interface LoreEditorProps {
  entry: Partial<LoreEntry> | null;
  onSave: (entry: Partial<LoreEntry>) => Promise<void>;
  onClose: () => void;
}

const LoreEditor: React.FC<LoreEditorProps> = ({ entry, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<LoreEntry>>(entry || {
    title: '',
    content: '',
    era: '',
    year: 1490,
    category: 'History'
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
            <BookOpen size={24} />
            <h2 className="text-xl font-serif font-bold uppercase tracking-wider">
              {entry?.id ? 'Edit Chronicle' : 'Record New Lore'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-amber-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Entry Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Era Name</label>
              <input
                type="text"
                value={formData.era}
                onChange={(e) => setFormData({ ...formData, era: e.target.value })}
                placeholder="e.g. Era of Upheaval"
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 focus:border-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Year (Timeline Sort)</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
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
                <option value="History">History</option>
                <option value="Mythology">Mythology</option>
                <option value="Conflict">Conflict</option>
                <option value="Discovery">Discovery</option>
                <option value="Deity">Deity</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={10}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-3 text-sm focus:border-amber-500 focus:outline-none custom-scrollbar"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all mt-4"
          >
            <Save size={20} />
            {loading ? 'Committing to Records...' : 'Save Chronicle'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoreEditor;