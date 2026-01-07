import React, { useState, useEffect } from 'react';
import { LocationData } from '../types';
import { X, Save, Plus, Trash2, MapPin, Move, AlertTriangle } from 'lucide-react';
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
        size: location.size || 25
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
        // Full width on mobile, w-96 on desktop
        "w-full md:w-96",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {editData ? (
          <div className="p-4 md:p-6">
            <div className="flex justify-between items-start mb-4 md:mb-6">
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
              <button onClick={onClose} className="text-slate-500 hover:text-slate-300 ml-4 p-1">
                <X size={24} />
              </button>
            </div>

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