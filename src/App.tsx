import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { LocationData, LoreEntry, ViewMode, RuleEntry, Monster, AppSettings } from './types';
import MapArea from './components/MapArea';
import Sidebar from './components/Sidebar';
import LocationList from './components/LocationList';
import Login from './components/Login';
import LoreView from './components/LoreView';
import LoreEditor from './components/LoreEditor';
import RulesView from './components/RulesView';
import RulesEditor from './components/RulesEditor';
import MonstersView from './components/MonstersView';
import MonsterEditor from './components/MonsterEditor';
import SettingsView from './components/SettingsView';
import { ShieldAlert, Compass, Scroll, Scale, Skull, Settings } from 'lucide-react';
import clsx from 'clsx';

const DEFAULT_MAP = "https://media.wizards.com/2015/images/dnd/resources/Sword-Coast-Map_HighRes.jpg";

function App() {
  const [session, setSession] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  
  // Settings State
  const [settings, setSettings] = useState<AppSettings>({
    worldName: 'Faerun Atlas',
    mapUrl: DEFAULT_MAP
  });

  // Locations State
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Lore State
  const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]);
  const [editingLore, setEditingLore] = useState<Partial<LoreEntry> | null>(null);

  // Rules State
  const [rules, setRules] = useState<RuleEntry[]>([]);
  const [editingRule, setEditingRule] = useState<Partial<RuleEntry> | null>(null);

  // Monsters State
  const [localMonsters, setLocalMonsters] = useState<Monster[]>([]);
  const [editingMonster, setEditingMonster] = useState<Partial<Monster> | null>(null);
  
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setShowLogin(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    // Load persisted settings if they exist (local storage for this demo)
    const saved = localStorage.getItem('atlas_settings');
    if (saved) setSettings(JSON.parse(saved));

    fetchData();
    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchLocations(), 
      fetchLore(),
      fetchRules(),
      fetchLocalMonsters()
    ]);
    setLoading(false);
  };

  const fetchLocations = async () => {
    const { data, error } = await supabase.from('locations').select('*');
    if (!error && data) {
      setLocations(data.map(item => ({
        ...item,
        taverns: Array.isArray(item.taverns) ? item.taverns : [],
        shops: Array.isArray(item.shops) ? item.shops : [],
        npcs: Array.isArray(item.npcs) ? item.npcs : [],
        size: item.size || 25
      })));
    }
  };

  const fetchLore = async () => {
    const { data, error } = await supabase.from('lore_entries').select('*');
    if (!error && data) setLoreEntries(data as LoreEntry[]);
  };

  const fetchRules = async () => {
    const { data, error } = await supabase.from('rules').select('*');
    if (!error && data) setRules(data as RuleEntry[]);
  };

  const fetchLocalMonsters = async () => {
    const { data, error } = await supabase.from('homebrew_monsters').select('*');
    if (!error && data) setLocalMonsters(data as Monster[]);
  };

  const handleDbError = (error: any, action: string) => {
    console.error(`Error ${action}:`, error);
    alert(`Dungeon Master Error: ${error.message}`);
  };

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('atlas_settings', JSON.stringify(newSettings));
  };

  const handleSaveRule = async (rule: Partial<RuleEntry>) => {
    if (!session) return;
    const payload = { ...rule };
    const isUpdate = !!payload.id;
    if (!isUpdate) delete payload.id;
    const { error } = isUpdate 
      ? await supabase.from('rules').update(payload).eq('id', payload.id)
      : await supabase.from('rules').insert([payload]);
    if (error) handleDbError(error, "saving rule");
    else { fetchRules(); setEditingRule(null); }
  };

  const handleDeleteRule = async (id: string) => {
    if (!session || !window.confirm("Delete this rule?")) return;
    const { error } = await supabase.from('rules').delete().eq('id', id);
    if (error) handleDbError(error, "deleting rule");
    else fetchRules();
  };

  const handleSaveMonster = async (monster: Partial<Monster>) => {
    if (!session) return;
    const payload = { ...monster };
    const isUpdate = !!payload.id;
    if (!isUpdate) delete payload.id;
    const { error } = isUpdate 
      ? await supabase.from('homebrew_monsters').update(payload).eq('id', payload.id)
      : await supabase.from('homebrew_monsters').insert([payload]);
    if (error) handleDbError(error, "saving monster");
    else { fetchLocalMonsters(); setEditingMonster(null); }
  };

  const handleDeleteMonster = async (id: string) => {
    if (!session || !window.confirm("Vanquish this monster?")) return;
    const { error } = await supabase.from('homebrew_monsters').delete().eq('id', id);
    if (error) handleDbError(error, "deleting monster");
    else fetchLocalMonsters();
  };

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
    setDetailsOpen(true);
  };

  const handleSaveDetails = async (updatedData: LocationData) => {
    if (!session) return;
    const { error } = await supabase.from('locations').update({ ...updatedData }).eq('id', updatedData.id);
    if (error) handleDbError(error, "saving details");
    else { setLocations(prev => prev.map(l => l.id === updatedData.id ? updatedData : l)); setSelectedLocation(updatedData); }
  };

  const handleDeleteLocation = async (id: string) => {
    if(!session) return;
    const { error } = await supabase.from('locations').delete().eq('id', id);
    if(error) handleDbError(error, "deleting location");
    else { setLocations(prev => prev.filter(l => l.id !== id)); setDetailsOpen(false); }
  };

  const handleMarkerDragEnd = async (id: string, lat: number, lng: number) => {
    if (!session) return;
    setLocations(prev => prev.map(l => l.id === id ? { ...l, x: lng, y: lat } : l));
    const { error } = await supabase.from('locations').update({ x: lng, y: lat }).eq('id', id);
    if (error) { handleDbError(error, "updating position"); fetchLocations(); }
  };

  const handleMapClick = async (lat: number, lng: number) => {
    if (!session) return;
    const newName = prompt("Enter location name:");
    if (!newName) return;
    const newLocation = { name: newName, x: lng, y: lat, description: "New location.", taverns: [], shops: [], npcs: [], size: 25 };
    const { data, error } = await supabase.from('locations').insert([newLocation]).select().single();
    if (error) handleDbError(error, "creating location");
    else if (data) { fetchLocations(); handleLocationSelect(data); }
  };

  const handleSaveLore = async (entry: Partial<LoreEntry>) => {
    if (!session) return;
    const payload = { ...entry };
    const isUpdate = !!payload.id;
    if (!isUpdate) delete payload.id;
    const { error } = isUpdate 
      ? await supabase.from('lore_entries').update(payload).eq('id', payload.id)
      : await supabase.from('lore_entries').insert([payload]);
    if (error) handleDbError(error, "saving lore");
    else { fetchLore(); setEditingLore(null); }
  };

  const handleDeleteLore = async (id: string) => {
    if (!session || !window.confirm("Strike this lore entry?")) return;
    const { error } = await supabase.from('lore_entries').delete().eq('id', id);
    if (error) handleDbError(error, "deleting lore");
    else fetchLore();
  };

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'map':
        return (
          <>
            <LocationList worldName={settings.worldName} locations={locations} selectedLocation={selectedLocation} onSelect={handleLocationSelect} onSecretTrigger={() => setShowLogin(true)} />
            <div className="flex-1 relative h-full">
              <MapArea mapUrl={settings.mapUrl} locations={locations} selectedLocation={selectedLocation} onMarkerClick={handleLocationSelect} onMarkerDragEnd={handleMarkerDragEnd} onMapClick={handleMapClick} isEditable={!!session} />
              <Sidebar location={selectedLocation} isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} isEditable={!!session} onSave={handleSaveDetails} onDelete={handleDeleteLocation} />
            </div>
          </>
        );
      case 'lore':
        return <LoreView entries={loreEntries} isEditable={!!session} onEdit={setEditingLore} onAdd={() => setEditingLore({ title: '', content: '', era: '', year: 1490, category: 'History' })} onDelete={handleDeleteLore} />;
      case 'rules':
        return <RulesView rules={rules} isEditable={!!session} onEdit={setEditingRule} onAdd={() => setEditingRule({ name: '', category: 'Conditions', description: '', details: [] })} onDelete={handleDeleteRule} />;
      case 'monsters':
        return <MonstersView localMonsters={localMonsters} isEditable={!!session} onEdit={setEditingMonster} onAdd={() => setEditingMonster({ name: '', is_homebrew: true, strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10, armor_class: 10, hit_points: 10 })} onDelete={handleDeleteMonster} />;
      case 'settings':
        return <SettingsView settings={settings} onSave={handleSaveSettings} onRefresh={fetchData} />;
      default: return null;
    }
  };

  if (loading) return <div className="h-full w-full bg-slate-950 flex items-center justify-center text-amber-500 font-serif animate-pulse text-lg tracking-widest uppercase">Opening the Grand Vault...</div>;

  return (
    <div className="h-full w-full relative overflow-hidden flex flex-col md:flex-row bg-slate-950">
      <nav className="w-full md:w-[72px] bg-slate-950 border-b md:border-b-0 md:border-r border-amber-900/40 flex flex-row md:flex-col items-center justify-center md:justify-start py-1 md:py-6 z-[2000] shrink-0">
        <div className="hidden md:flex flex-col items-center mb-12">
          <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-600/50 flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(217,119,6,0.2)]">
            <span className="font-serif font-bold text-lg">{settings.worldName[0]}</span>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center gap-1 md:gap-8 w-full px-2">
          {[
            { id: 'map', icon: <Compass size={22}/>, label: 'World' },
            { id: 'lore', icon: <Scroll size={22}/>, label: 'Lore' },
            { id: 'rules', icon: <Scale size={22}/>, label: 'Codex' },
            { id: 'monsters', icon: <Skull size={22}/>, label: 'Bestiary' },
          ].map(tab => {
            const isActive = viewMode === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => setViewMode(tab.id as ViewMode)} 
                className={clsx(
                  "flex-1 md:flex-none flex flex-col items-center justify-center w-full py-2 md:py-3 rounded-lg transition-all relative group",
                  isActive 
                    ? "text-amber-500 bg-amber-600/10 shadow-[inset_0_0_10px_rgba(217,119,6,0.1)]" 
                    : "text-slate-500 hover:text-amber-400 hover:bg-slate-900"
                )}
              >
                <span className={clsx("mb-1 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")}>
                  {tab.icon}
                </span>
                <span className="text-[8px] md:text-[9px] font-serif font-bold uppercase tracking-widest text-center whitespace-nowrap">
                  {tab.label}
                </span>
                {isActive && (
                  <>
                    <div className="hidden md:block absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-amber-500 rounded-r-full shadow-[0_0_8px_rgba(217,119,6,0.8)]" />
                    <div className="md:hidden absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-amber-500 rounded-t-full" />
                  </>
                )}
              </button>
            );
          })}

          {session && (
            <button 
              onClick={() => setViewMode('settings')} 
              className={clsx(
                "flex-1 md:flex-none flex flex-col items-center justify-center w-full py-2 md:py-3 rounded-lg transition-all relative group",
                viewMode === 'settings' 
                  ? "text-amber-500 bg-amber-600/10" 
                  : "text-slate-600 hover:text-amber-400"
              )}
            >
              <Settings size={22} className={clsx(viewMode === 'settings' ? 'animate-spin-slow' : '')} />
              <span className="text-[8px] md:text-[9px] font-serif font-bold uppercase tracking-widest text-center">Forge</span>
            </button>
          )}
        </div>

        <div className="mt-auto hidden md:flex flex-col items-center pb-4">
           {session ? (
             <button onClick={async () => await supabase.auth.signOut()} className="text-red-900/60 hover:text-red-500 transition-colors p-3" title="Logout">
               <ShieldAlert size={20} />
             </button>
           ) : (
             <div className="h-10 w-full" /> 
           )}
        </div>
      </nav>

      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden relative">
        {renderCurrentView()}
      </div>

      {showLogin && <Login onClose={() => setShowLogin(false)} />}
      {editingLore && <LoreEditor entry={editingLore} onSave={handleSaveLore} onClose={() => setEditingLore(null)} />}
      {editingRule && <RulesEditor rule={editingRule} onSave={handleSaveRule} onClose={() => setEditingRule(null)} />}
      {editingMonster && <MonsterEditor monster={editingMonster} onSave={handleSaveMonster} onClose={() => setEditingMonster(null)} />}
    </div>
  );
}

export default App;