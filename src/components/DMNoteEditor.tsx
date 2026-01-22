
import React, { useState } from 'react';
import { DMNote } from '../types';
import { X, Save, BookMarked, Eye, EyeOff, Link as LinkIcon } from 'lucide-react';
import clsx from 'clsx';

interface DMNoteEditorProps {
  note: Partial<DMNote> | null;
  onSave: (note: Partial<DMNote>) => Promise<void>;
  onClose: () => void;
}

const DMNoteEditor: React.FC<DMNoteEditorProps> = ({ note, onSave, onClose }) => {
  const [formData, setFormData] = useState<Partial<DMNote>>(note || {
    title: '',
    content: '',
    category: 'Secret',
    is_public: false,
    image_url: ''
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
      <div className="bg-slate-900 border border-amber-900/50 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="bg-slate-950 p-6 border-b border-amber-900/30 flex justify-between items-center">
          <div className="flex items-center gap-3 text-amber-500">
            <BookMarked size={24} />
            <h2 className="text-xl font-serif font-bold uppercase tracking-wider">
              {note?.id ? 'Edit Campaign Record' : 'Inscribe New Record'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-amber-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Title of Entry</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-3 text-sm focus:border-amber-500 focus:outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Classification</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-3 text-sm focus:border-amber-500 focus:outline-none"
              >
                <option value="NPC">NPC / Ally</option>
                <option value="Event">Event / Moment</option>
                <option value="Character">Player Character</option>
                <option value="Plot">Plot Hook</option>
                <option value="Secret">Forbidden Secret</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <LinkIcon size={12} /> Illustration URL
            </label>
            <input
              type="text"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="Paste a link to an image to enhance this record..."
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-3 text-sm focus:border-amber-500 focus:outline-none transition-all"
            />
            {formData.image_url && (
              <div className="mt-3 h-40 rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                <img src={formData.image_url} alt="Preview" className="h-full w-full object-cover opacity-70" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Chronicled Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={8}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-4 text-sm focus:border-amber-500 focus:outline-none custom-scrollbar font-serif italic"
              required
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-lg border border-amber-900/10">
            <div className="flex items-center gap-3">
              {formData.is_public ? <Eye className="text-amber-500" size={20} /> : <EyeOff className="text-slate-600" size={20} />}
              <div>
                <p className="text-xs font-bold text-amber-100 uppercase tracking-widest leading-none mb-1">Visibility Level</p>
                <p className="text-[10px] text-slate-500 uppercase leading-none">{formData.is_public ? 'Revealed to Players' : 'Cloaked from Players'}</p>
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
              {formData.is_public ? 'Make Secret' : 'Reveal Entry'}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)]"
          >
            <Save size={20} />
            {loading ? 'Committing...' : 'Seal Record'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DMNoteEditor;
