
import React, { useState, useEffect } from 'react';
import { LocationData } from '../types';
import { X, Save, Plus, Trash2, MapPin, AlertTriangle, Maximize, Eye, EyeOff, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import clsx from 'clsx';

const safeArray = (arr: any): string[] => {
  return Array.isArray(arr) ? arr : [];
};

interface SidebarProps {
  location: LocationData | null;
  isOpen: boolean;
  onClose: () => void;
  isEditable: boolean;
  onSave: (data: LocationData) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  location, 
  isOpen, 
  onClose, 
  isEditable, 
  onSave,
  onDelete
}) => {
  const [editData, setEditData] = useState<LocationData | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (location) {
      setEditData({
        ...location,
        taverns: safeArray(location.taverns),
        shops: safeArray(location.shops),
        npcs: safeArray(location.npcs),
        size: location.size || 32,
        is_public: location.is_public ?? false,
        image_url: location.image_url || ''
      });
    }
    setIsDeleteModalOpen(false);
  }, [location]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!editData) return;
    setSaving(true);
    await onSave(editData);
    setSaving(false);
  };

  const handleDeleteConfirm = async () => {
    if (!editData) return;
    setIsDeleteModalOpen(false);
    await onDelete(editData.id);
  };

  const handleArrayChange = (field: 'taverns' | 'shops' | 'npcs', index: number, value: string) => {
    if (!editData) return;
    const newArray = [...editData[field]];
    newArray[index] = value;
    setEditData({ ...editData, [field]: newArray });
  };

  const addItem = (field: 'taverns' | 'shops' | 'npcs') => {
    if (!editData) return;
    setEditData({ ...editData, [field]: [...editData[field], ""] });
  };

  const removeItem = (field: 'taverns' | 'shops' | 'npcs', index: number) => {
    if (!editData) return;
    const newArray = editData[field].filter((_, i) => i !== index);
    setEditData({ ...editData, [field]: newArray });
  };

  const renderSection = (title: string, field: 'taverns' | 'shops' | 'npcs') => {
    const items = editData ? editData[field] : [];
    return (
      <div className="mb-4 md:mb-6">
        <h3 className="text-amber-500 font-serif font-bold text-base md:text-lg mb-2 flex items-center justify-between">
          {title}
          {isEditable && (
            <button onClick={() => addItem(field)} className="text-[10px] bg-slate-800 text-amber-500 px-2 py-0.5 rounded flex items-center gap-1">
              <Plus size={10} /> Add
            </button>
          )}
        </h3>
        {items.length === 0 && <p className="text-slate-500 italic text-xs">None recorded.</p>}
        <ul className="space-y-1.5 md:space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex gap-2 items-center">
              {isEditable ? (
                <>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleArrayChange(field, idx, e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 text-slate-300 rounded px-2 py-1 text-xs focus:border-amber-500 focus:outline-none"
                  />
                  <button onClick={() => removeItem(field, idx)} className="text-red-500 hover:text-red-400">
                    <Trash2 size={12} />
                  </button>
                </>
              ) : (
                <span className="text-slate-300 text-xs">• {item}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative bg-slate-900 border border-red-900/50 p-6 rounded-lg shadow-2xl max-w-sm w-full text-center">
            <AlertTriangle className="text-red-500 mx-auto mb-4" size={32} />
            <h3 className="text-xl font-serif font-bold text-amber-500 mb-2 uppercase">Strike from Records?</h3>
            <p className="text-slate-400 text-xs mb-6">Action cannot be undone by ordinary magic.</p>
            <div className="flex flex-col gap-2">
              <button onClick={handleDeleteConfirm} className="w-full bg-red-600 text-white font-bold py-2 rounded text-sm">Burn the Records</button>
              <button onClick={() => setIsDeleteModalOpen(false)} className="w-full bg-slate-800 text-slate-300 py-2 rounded text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className={clsx(
        "fixed top-0 right-0 h-full bg-slate-900 border-l border-amber-900/50 shadow-2xl transform transition-transform duration-300 z-[2000] overflow-y-auto custom-scrollbar",
        "w-full md:w-96",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {editData ? (
          <div className="flex flex-col h-full">
            {/* Image Header */}
            <div className="h-48 md:h-56 relative shrink-0 bg-slate-950 overflow-hidden group">
              {editData.image_url ? (
                <img 
                  src={editData.image_url} 
                  alt={editData.name} 
                  className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#020617_100%)]">
                  <ImageIcon size={48} className="mb-2 opacity-20" />
                  <span className="text-[10px] uppercase tracking-widest font-serif">No Vision Recorded</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 bg-black/50 text-white hover:text-amber-500 transition-colors p-2 rounded-full backdrop-blur-md"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 md:p-6 flex-1">
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="flex-1">
                  {isEditable ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="bg-transparent border-b border-amber-500/50 text-xl md:text-2xl font-serif font-bold text-amber-500 w-full focus:outline-none"
                    />
                  ) : (
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-amber-500">{editData.name}</h2>
                  )}
                </div>
              </div>

              {isEditable && (
                <div className="mb-6">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-2">
                    <LinkIcon size={12} /> Illustration URL
                  </label>
                  <input
                    type="text"
                    value={editData.image_url}
                    onChange={(e) => setEditData({ ...editData, image_url: e.target.value })}
                    placeholder="Enter image link..."
                    className="w-full bg-slate-950 border border-slate-700 text-slate-300 rounded p-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="mb-4 md:mb-6">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Description</label>
                {isEditable ? (
                  <textarea
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-300 rounded p-2 text-xs focus:border-amber-500 focus:outline-none"
                  />
                ) : (
                  <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">{editData.description}</p>
                )}
              </div>

              {isEditable && (
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-slate-950/50 rounded-lg border border-amber-900/10">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Maximize size={12} className="text-amber-600" />
                        Sigil Magnitude
                      </label>
                      <span className="text-xs font-mono text-amber-500 font-bold">{editData.size || 32}pt</span>
                    </div>
                    <input 
                      type="range" 
                      min="16" 
                      max="64" 
                      step="2"
                      value={editData.size || 32}
                      onChange={(e) => setEditData({ ...editData, size: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                  </div>

                  <div className="p-4 bg-slate-950/50 rounded-lg border border-amber-900/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {editData.is_public ? <Eye className="text-amber-500" size={16} /> : <EyeOff className="text-slate-600" size={16} />}
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-amber-100 uppercase leading-none mb-1">Visibility</span>
                        <span className="text-[9px] text-slate-500 uppercase tracking-tighter">{editData.is_public ? 'Revealed' : 'Cloaked'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setEditData({ ...editData, is_public: !editData.is_public })}
                      className={clsx(
                        "px-3 py-1.5 rounded text-[9px] font-bold uppercase tracking-widest transition-all border",
                        editData.is_public ? "bg-amber-600/20 border-amber-500 text-amber-500" : "bg-slate-800 border-slate-700 text-slate-500"
                      )}
                    >
                      {editData.is_public ? 'Hide' : 'Reveal'}
                    </button>
                  </div>
                </div>
              )}

              <div className="h-px bg-slate-800 my-4 md:my-6" />

              {renderSection("Taverns & Inns", "taverns")}
              {renderSection("Shops & Markets", "shops")}
              {renderSection("Key NPCs", "npcs")}

              {isEditable && (
                <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col gap-2">
                  <button onClick={handleSave} disabled={saving} className="w-full bg-amber-600 text-white font-bold py-2 px-4 rounded text-xs flex items-center justify-center gap-2">
                    <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button onClick={() => setIsDeleteModalOpen(true)} className="w-full bg-red-900/20 text-red-400 font-bold py-2 px-4 rounded text-xs">Delete Location</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 h-full flex flex-col items-center justify-center text-slate-600">
            <MapPin size={48} className="mb-4 opacity-50" />
            <p className="font-serif text-sm">Select a landmark.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
