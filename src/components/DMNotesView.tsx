
import React, { useState, useMemo } from 'react';
import { DMNote } from '../types';
import { Search, BookMarked, Edit3, Trash2, X, EyeOff, Eye, StickyNote, User, Zap, Sparkles, ShieldQuestion, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';

interface DMNotesViewProps {
  notes: DMNote[];
  isEditable: boolean;
  onEdit: (note: DMNote) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

const categoryIcons = {
  'NPC': <User size={14} />,
  'Event': <Zap size={14} />,
  'Character': <Sparkles size={14} />,
  'Plot': <StickyNote size={14} />,
  'Secret': <ShieldQuestion size={14} />
};

const DMNotesView: React.FC<DMNotesViewProps> = ({ notes, isEditable, onEdit, onAdd, onDelete }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedNote, setExpandedNote] = useState<DMNote | null>(null);

  const filteredNotes = useMemo(() => {
    return notes
      .filter(n => {
        const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                             n.content.toLowerCase().includes(search.toLowerCase());
        const matchesCat = !selectedCategory || n.category === selectedCategory;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [notes, search, selectedCategory]);

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col md:flex-row overflow-hidden font-serif">
      <aside className="w-full md:w-72 bg-slate-900 border-r border-amber-900/30 flex flex-col shrink-0">
        <div className="p-6 border-b border-amber-900/30 bg-slate-950/50">
          <div className="flex items-center gap-3 text-amber-500 mb-1">
            <BookMarked size={20} />
            <h2 className="text-xl font-bold uppercase tracking-tighter">Campaign Records</h2>
          </div>
          <span className="text-[8px] font-sans uppercase tracking-widest text-amber-600/50">Shared Lore & Hidden Chronicles</span>
        </div>

        <div className="p-4 border-b border-amber-900/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input 
              type="text"
              placeholder="Query the scrolls..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={clsx(
              "w-full text-left px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all",
              !selectedCategory ? "bg-amber-900/20 text-amber-400" : "text-slate-500 hover:bg-slate-800"
            )}
          >
            Full Archive
          </button>
          {Object.keys(categoryIcons).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={clsx(
                "w-full text-left px-4 py-2 rounded text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-3",
                selectedCategory === cat ? "bg-amber-900/20 text-amber-400" : "text-slate-500 hover:bg-slate-800"
              )}
            >
              <span className="opacity-50 group-hover:opacity-100">{categoryIcons[cat as keyof typeof categoryIcons]}</span>
              {cat}
            </button>
          ))}
        </div>

        {isEditable && (
          <div className="p-4 bg-slate-950/50 border-t border-amber-900/20">
            <button onClick={onAdd} className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded shadow-lg text-[10px] uppercase tracking-widest transition-all">
              Scribe New Record
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredNotes.map(note => (
            <div 
              key={note.id} 
              onClick={() => setExpandedNote(note)}
              className="group relative bg-slate-900/80 backdrop-blur-sm border border-amber-900/20 rounded-xl overflow-hidden hover:border-amber-500/50 transition-all cursor-pointer h-[340px] md:h-[380px] flex flex-col shadow-xl"
            >
              {/* Note Card Image */}
              <div className="h-32 md:h-40 relative bg-slate-950 overflow-hidden">
                {note.image_url ? (
                  <img src={note.image_url} alt={note.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-800">
                    <ImageIcon size={32} className="opacity-10" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-600/60">{categoryIcons[note.category]}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600/80">{note.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {!note.is_public && isEditable && <EyeOff size={14} className="text-slate-600" title="DM Only" />}
                    {isEditable && (
                      <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => onEdit(note)} className="text-slate-600 hover:text-amber-400"><Edit3 size={14} /></button>
                        <button onClick={() => onDelete(note.id)} className="text-slate-600 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-amber-100 mb-3 group-hover:text-amber-400 transition-colors uppercase tracking-tight line-clamp-2">{note.title}</h3>
                <p className="text-slate-400 text-xs md:text-sm leading-relaxed line-clamp-3 font-sans italic">{note.content}</p>
                <div className="mt-auto pt-4 flex justify-end">
                   <span className="text-[9px] uppercase tracking-[0.2em] text-amber-900 font-bold group-hover:text-amber-600 transition-colors">Examine Record</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {expandedNote && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setExpandedNote(null)} />
          <div className="relative bg-slate-900 border border-amber-900/50 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            {/* Expanded Note Image - Fixed cropping with object-contain and added background */}
            {expandedNote.image_url && (
              <div className="h-56 md:h-80 w-full overflow-hidden shrink-0 relative bg-black">
                <img src={expandedNote.image_url} alt={expandedNote.title} className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />
              </div>
            )}

            <div className="p-6 md:p-8 bg-slate-950 border-b border-amber-900/20 flex justify-between items-start shrink-0">
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2 text-amber-600 mb-1">
                  {categoryIcons[expandedNote.category]}
                  <span className="text-[10px] font-bold uppercase tracking-widest">{expandedNote.category} Record</span>
                </div>
                <h2 className="text-3xl font-bold text-amber-100 uppercase tracking-tighter leading-tight truncate">{expandedNote.title}</h2>
              </div>
              <button onClick={() => setExpandedNote(null)} className="text-slate-500 hover:text-amber-500 p-2 shrink-0 transition-colors"><X size={28} /></button>
            </div>
            {/* Content Area - Replaced natural-paper with dark-matter and consistent dark slate styling */}
            <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-slate-950 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-fixed relative">
              <div className="absolute inset-0 bg-gradient-to-b from-amber-900/5 via-transparent to-transparent pointer-events-none" />
              <p className="text-slate-200 text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-serif italic relative z-10">{expandedNote.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DMNotesView;
