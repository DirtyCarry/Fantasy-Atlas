import React, { useState, useMemo } from 'react';
import { LocationData } from '../types';
import { Search, Compass, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import clsx from 'clsx';

interface LocationListProps {
  locations: LocationData[];
  selectedLocation: LocationData | null;
  onSelect: (location: LocationData) => void;
  onSecretTrigger?: () => void;
  worldName: string;
}

const LocationList: React.FC<LocationListProps> = ({ 
  locations, 
  selectedLocation, 
  onSelect,
  onSecretTrigger,
  worldName
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredLocations = useMemo(() => {
    return locations
      .filter(loc => loc.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [locations, searchTerm]);

  return (
    <div 
      className={clsx(
        "bg-slate-900 border-r border-amber-900/30 flex flex-col z-10 shadow-xl shrink-0 transition-all duration-300 ease-in-out overflow-hidden relative",
        "h-48 md:h-full",
        isCollapsed ? "w-14" : "w-full md:w-80"
      )}
    >
      <div className={clsx(
        "flex items-center border-b border-amber-900/30 bg-slate-950/50 shrink-0 h-[50px] md:h-[60px]",
        isCollapsed ? "justify-center" : "justify-between px-4"
      )}>
        {!isCollapsed && (
          <div className="flex flex-col animate-in fade-in duration-300 min-w-0 pr-4">
            <h2 
              onDoubleClick={onSecretTrigger}
              className="text-amber-500 font-serif font-bold text-base md:text-lg flex items-center gap-2 whitespace-nowrap cursor-default select-none group"
            >
              <Compass className="group-active:scale-95 transition-transform shrink-0" size={18} /> 
              <span className="uppercase tracking-[0.2em] truncate">
                {worldName}
              </span>
            </h2>
          </div>
        )}

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-slate-500 hover:text-amber-500 transition-colors focus:outline-none p-1 rounded hover:bg-slate-800"
        >
          {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>

      {isCollapsed && (
        <div onDoubleClick={onSecretTrigger} className="mt-4 flex flex-col items-center gap-4 cursor-default">
           <Compass className="text-amber-500/50" size={20} />
           <div className="h-px w-6 bg-slate-800" />
        </div>
      )}

      <div className={clsx(
        "flex-1 flex flex-col min-h-0 transition-opacity duration-200",
        isCollapsed ? "opacity-0 pointer-events-none invisible" : "opacity-100 visible delay-100"
      )}>
        <div className="p-3 bg-slate-900/50 border-b border-amber-900/10 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-slate-500" size={14} />
            <input
              type="text"
              placeholder="Locate landmark..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-md py-1.5 pl-8 pr-3 text-xs focus:border-amber-500 focus:outline-none transition-all placeholder:text-slate-600 font-sans"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredLocations.length === 0 ? (
            <div className="p-4 text-center text-slate-600 text-xs italic font-serif">
              No regions discovered in {worldName}.
            </div>
          ) : (
            <ul className="divide-y divide-slate-800/50">
              {filteredLocations.map((loc) => {
                const isSelected = selectedLocation?.id === loc.id;
                return (
                  <li key={loc.id}>
                    <button
                      onClick={() => onSelect(loc)}
                      className={clsx(
                        "w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between group",
                        isSelected 
                          ? "bg-amber-900/20 border-l-2 border-amber-500" 
                          : "hover:bg-slate-800 border-l-2 border-transparent"
                      )}
                    >
                      <div className="min-w-0 pr-2">
                        <span className={clsx(
                          "font-serif font-semibold block truncate uppercase tracking-tight",
                          isSelected ? "text-amber-400" : "text-slate-300"
                        )}>
                          {loc.name}
                        </span>
                      </div>
                      {isSelected && <ChevronRight size={12} className="text-amber-500 shrink-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        
        <div className="p-2 bg-slate-950 border-t border-amber-900/30 text-[9px] text-slate-600 text-center font-mono shrink-0 uppercase tracking-widest">
          {locations.length} Cartographic Entries
        </div>
      </div>
    </div>
  );
};

export default LocationList;