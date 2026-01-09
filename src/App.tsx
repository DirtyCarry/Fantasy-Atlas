import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { LocationData, LoreEntry, ViewMode, RuleEntry, Monster, World, DMNote } from './types';
import MapArea from './components/MapArea';
import Sidebar from './components/Sidebar';
import LocationList from './components/LocationList';
import LoreView from './components/LoreView';
import LoreEditor from './components/LoreEditor';
import RulesView from './components/RulesView';
import RulesEditor from './components/RulesEditor';
import MonstersView from './components/MonstersView';
import MonsterEditor from './components/MonsterEditor';
import DMNotesView from './components/DMNotesView';
import DMNoteEditor from './components/DMNoteEditor';
import SettingsView from './components/SettingsView';
import Sanctum from './components/Sanctum';
import { ShieldAlert, Compass, Scroll, Scale, Skull, Settings, LayoutDashboard, Share2, Loader2, BookMarked, EyeOff, Eye } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const [session, setSession] = useState<any>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('sanctum');
  const [currentWorld, setCurrentWorld] = useState<World | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlayerMode, setIsPlayerMode] = useState(false);

  // Data State
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]);
  const [editingLore, setEditingLore] = useState<Partial<LoreEntry> | null>(null);
  const [rules, setRules] = useState<RuleEntry[]>([]);
  const [editingRule, setEditingRule] = useState<Partial<RuleEntry> | null>(null);
  const [localMonsters, setLocalMonsters] = useState<Monster[]>([]);
  const [editingMonster, setEditingMonster] = useState<Partial<Monster> | null>(null);
  const [dmNotes, setDmNotes] = useState<DMNote[]>([]);
  const [editingNote, setEditingNote] = useState<Partial<DMNote> | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) cleanUrl();
      initialize(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) cleanUrl();
      if (_event === 'SIGNED_IN') initialize(session);
      if (_event === 'SIGNED_OUT') {
        setCurrentWorld(null);
        setViewMode('sanctum');
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const cleanUrl = () => {
    if (window.location.hash.includes('access_token')) {
      const url = new URL(window.location.href);
      url.hash = '';
      window.history.replaceState({}, document.title, url.toString());
    }
  };

  const initialize = async (currentSession: any) => {
    const params = new URLSearchParams(window.location.search);
    const worldId = params.get('w');

    if (worldId) {
      setLoading(true);
      const { data, error } = await supabase.from('worlds').select('*').eq('id', worldId).single();
      if (!error && data) {
        setCurrentWorld(data);
        const playerMode = currentSession?.user?.id !== data.owner_id;
        setIsPlayerMode(playerMode);
        setViewMode('map');
        await fetchWorldData(data.id, playerMode);
      } else {
        setViewMode('sanctum');
      }
    } else {
      setViewMode('sanctum');
    }
    setLoading(false);
  };

  const fetchWorldData = async (worldId: string, playerMode: boolean) => {
    const results = await Promise.all([
      supabase.from('locations').select('*').eq('world_id', worldId),
      supabase.from('lore_entries').select('*').eq('world_id', worldId),
      supabase.from('rules').select('*').eq('world_id', worldId),
      supabase.from('homebrew_monsters').select('*').eq('world_id', worldId),
      supabase.from('dm_notes').select('*').eq('world_id', worldId)
    ]);

    const filterPublic = <T extends { is_public?: boolean }>(data: T[] | null) => 
      playerMode ? (data || []).filter(item => item.is_public) : (data || []);

    setLocations(filterPublic(results[0].data));
    setLoreEntries(filterPublic(results[1].data));
    setRules(filterPublic(results[2].data));
    setLocalMonsters(filterPublic(results[3].data));
    setDmNotes(filterPublic(results[4].data));
  };

  const handleSelectWorld = async (world: World) => {
    const playerMode = session?.user?.id !== world.owner_id;
    setCurrentWorld(world);
    setIsPlayerMode(playerMode);
    setViewMode('map');
    
    const newUrl = `${window.location.origin}${window.location.pathname}?w=${world.id}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
    
    setLoading(true);
    await fetchWorldData(world.id, playerMode);
    setLoading(false);
  };

  const handleSaveLocation = async (data: LocationData) => {
    if (!currentWorld || isPlayerMode) return;
    const { error } = await supabase.from('locations').update(data).eq('id', data.id);
    if (error) alert(error.message);
    else {
      setLocations(prev => prev.map(l => l.id === data.id ? data : l));
      setSelectedLocation(data);
    }
  };

  const handleMarkerDragEnd = async (id: string, lat: number, lng: number) => {
    if (!currentWorld || isPlayerMode) return;
    const { error } = await supabase.from('locations').update({ x: lng, y: lat }).eq('id', id);
    if (error) alert(error.message);
    else {
      setLocations(prev => prev.map(l => l.id === id ? { ...l, x: lng, y: lat } : l));
      if (selectedLocation?.id === id) {
        setSelectedLocation({ ...selectedLocation, x: lng, y: lat });
      }
    }
  };

  const handleAddLocation = async (lat: number, lng: number) => {
    if (!currentWorld || isPlayerMode) return;
    const name = prompt("Name this landmark:");
    if (!name) return;
    const newLoc = {
      world_id: currentWorld.id,
      name,
      x: lng,
      y: lat,
      description: "A mysterious locale.",
      taverns: [],
      shops: [],
      npcs: [],
      size: 32,
      is_public: false
    };
    const { data, error } = await supabase.from('locations').insert([newLoc]).select().single();
    if (error) alert(error.message);
    else if (data) {
      setLocations(prev => [...prev, data]);
      handleLocationSelect(data);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!currentWorld || isPlayerMode) return;
    const { error } = await supabase.from('locations').delete().eq('id', id);
    if (error) alert(error.message);
    else {
      setLocations(prev => prev.filter(l => l.id !== id));
      setDetailsOpen(false);
      setSelectedLocation(null);
    }
  };

  const handleLocationSelect = (loc: LocationData) => {
    setSelectedLocation(loc);
    setDetailsOpen(true);
  };

  const handleSaveLore = async (entry: Partial<LoreEntry>) => {
    if (!currentWorld || isPlayerMode) return;
    const payload = { ...entry, world_id: currentWorld.id };
    const { error } = entry.id 
      ? await supabase.from('lore_entries').update(payload).eq('id', entry.id)
      : await supabase.from('lore_entries').insert([payload]);
    
    if (error) alert(error.message);
    else {
      await fetchWorldData(currentWorld.id, isPlayerMode);
      setEditingLore(null);
    }
  };

  const handleSaveNote = async (note: Partial<DMNote>) => {
    if (!currentWorld || isPlayerMode) return;
    const payload = { ...note, world_id: currentWorld.id };
    const { error } = note.id 
      ? await supabase.from('dm_notes').update(payload).eq('id', note.id)
      : await supabase.from('dm_notes').insert([payload]);
    
    if (error) alert(error.message);
    else {
      await fetchWorldData(currentWorld.id, isPlayerMode);
      setEditingNote(null);
    }
  };

  const copyShareLink = () => {
    if (!currentWorld) return;
    const url = `${window.location.origin}${window.location.pathname}?w=${currentWorld.id}`;
    navigator.clipboard.writeText(url);
    alert("Share Link Copied!");
  };

  const renderView = () => {
    if (viewMode === 'sanctum') return (
      <Sanctum 
        session={session} 
        onSelectWorld={handleSelectWorld} 
        activeWorld={currentWorld} 
        onResumeWorld={() => setViewMode('map')} 
      />
    );
    if (!currentWorld) return null;

    switch (viewMode) {
      case 'map':
        return (
          <>
            <LocationList worldName={currentWorld.name} locations={locations} selectedLocation={selectedLocation} onSelect={handleLocationSelect} />
            <div className="flex-1 relative h-full min-h-0 min-w-0">
              <MapArea mapUrl={currentWorld.map_url} locations={locations} selectedLocation={selectedLocation} onMarkerClick={handleLocationSelect} onMarkerDragEnd={handleMarkerDragEnd} onMapClick={handleAddLocation} isEditable={!isPlayerMode} />
              <Sidebar location={selectedLocation} isOpen={detailsOpen} onClose={() => setDetailsOpen(false)} isEditable={!isPlayerMode} onSave={handleSaveLocation} onDelete={handleDeleteLocation} />
              {!isPlayerMode && (
                <button onClick={copyShareLink} className="absolute top-4 right-4 z-[999] bg-amber-600/90 hover:bg-amber-500 text-white p-2 rounded-full shadow-lg transition-all">
                  <Share2 size={18} />
                </button>
              )}
            </div>
          </>
        );
      case 'lore':
        return <LoreView entries={loreEntries} isEditable={!isPlayerMode} onEdit={setEditingLore} onAdd={() => setEditingLore({ title: '', content: '', era: '', year: 1490, category: 'History', is_public: false })} onDelete={async (id) => {
          await supabase.from('lore_entries').delete().eq('id', id);
          setLoreEntries(prev => prev.filter(e => e.id !== id));
        }} />;
      case 'notes':
        return <DMNotesView notes={dmNotes} isEditable={!isPlayerMode} onEdit={setEditingNote} onAdd={() => setEditingNote({ title: '', content: '', category: 'Secret', is_public: false })} onDelete={async (id) => {
          await supabase.from('dm_notes').delete().eq('id', id);
          setDmNotes(prev => prev.filter(n => n.id !== id));
        }} />;
      case 'rules':
        return <RulesView rules={rules} isEditable={!isPlayerMode} onEdit={setEditingRule} onAdd={() => setEditingRule({ name: '', category: 'Combat', description: '', details: [], is_public: true })} onDelete={async (id) => {
          await supabase.from('rules').delete().eq('id', id);
          setRules(prev => prev.filter(r => r.id !== id));
        }} />;
      case 'monsters':
        return <MonstersView localMonsters={localMonsters} isEditable={!isPlayerMode} onEdit={setEditingMonster} onAdd={() => setEditingMonster({ name: '', is_homebrew: true, strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10, armor_class: 10, hit_points: 10, is_public: false })} onDelete={async (id) => {
          await supabase.from('homebrew_monsters').delete().eq('id', id);
          setLocalMonsters(prev => prev.filter(m => m.id !== id));
        }} />;
      case 'settings':
        return <SettingsView 
          worldId={currentWorld.id}
          settings={{ worldName: currentWorld.name, mapUrl: currentWorld.map_url }} 
          onSave={async (s) => {
            const { error } = await supabase.from('worlds').update({ name: s.worldName, map_url: s.mapUrl }).eq('id', currentWorld.id);
            if (!error) setCurrentWorld({ ...currentWorld, name: s.worldName, map_url: s.mapUrl });
          }} 
          onRefresh={() => fetchWorldData(currentWorld.id, isPlayerMode)} 
        />;
      default: return null;
    }
  };

  if (loading) return (
    <div className="h-full w-full bg-slate-950 flex flex-col items-center justify-center text-amber-500">
      <Loader2 className="animate-spin mb-4" size={48} />
      <span className="font-serif uppercase tracking-widest animate-pulse">Consulting the Grand Archive...</span>
    </div>
  );

  const tabs = [
    { id: 'map', icon: <Compass size={22}/>, label: 'World' },
    { id: 'lore', icon: <Scroll size={22}/>, label: 'Lore' },
    { id: 'rules', icon: <Scale size={22}/>, label: 'Codex' },
    { id: 'monsters', icon: <Skull size={22}/>, label: 'Bestiary' },
  ];

  if (!isPlayerMode && currentWorld) {
    tabs.push({ id: 'notes', icon: <BookMarked size={22}/>, label: 'Notes' });
  }

  return (
    <div className="h-full w-full relative overflow-hidden flex flex-col md:flex-row bg-slate-950">
      {(viewMode !== 'sanctum' || currentWorld) && (
        <nav className="w-full md:w-[72px] bg-slate-950 border-b md:border-b-0 md:border-r border-amber-900/40 flex flex-row md:flex-col items-center py-2 md:py-6 z-[2000] shrink-0">
          <div className="flex flex-row md:flex-col items-center gap-1 md:gap-8 w-full px-2">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setViewMode(tab.id as ViewMode)} className={clsx("flex-1 md:flex-none flex flex-col items-center w-full py-2 rounded-lg transition-all", viewMode === tab.id ? "text-amber-500 bg-amber-600/10" : "text-slate-500 hover:text-amber-400")}>
                {tab.icon}
                <span className="text-[8px] font-serif uppercase tracking-widest mt-1">{tab.label}</span>
              </button>
            ))}
            {!isPlayerMode && currentWorld && (
              <button onClick={() => setViewMode('settings')} className={clsx("flex-1 md:flex-none flex flex-col items-center w-full py-2 rounded-lg transition-all", viewMode === 'settings' ? "text-amber-500 bg-amber-600/10" : "text-slate-500 hover:text-amber-400")}>
                <Settings size={22} />
                <span className="text-[8px] font-serif uppercase tracking-widest mt-1">Forge</span>
              </button>
            )}
            <button onClick={() => setViewMode('sanctum')} className={clsx("flex-1 md:flex-none flex flex-col items-center w-full py-2 rounded-lg transition-all", viewMode === 'sanctum' ? "text-amber-500 bg-amber-600/10" : "text-slate-500 hover:text-amber-400")}>
              <LayoutDashboard size={22} />
              <span className="text-[8px] font-serif uppercase tracking-widest mt-1">Sanctum</span>
            </button>
          </div>
          <div className="mt-auto hidden md:block">
            {session && (
              <button onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }} className="text-red-900/60 hover:text-red-500 p-3">
                <ShieldAlert size={20} />
              </button>
            )}
          </div>
        </nav>
      )}

      <div className={clsx(
        "flex-1 h-full overflow-hidden relative",
        viewMode === 'map' && "flex flex-col md:flex-row"
      )}>
        {renderView()}
      </div>

      {editingLore && <LoreEditor entry={editingLore} onSave={handleSaveLore} onClose={() => setEditingLore(null)} />}
      {editingNote && <DMNoteEditor note={editingNote} onSave={handleSaveNote} onClose={() => setEditingNote(null)} />}
      {editingRule && <RulesEditor rule={editingRule} onSave={async (r) => {
        const payload = { ...r, world_id: currentWorld!.id };
        const { error } = r.id ? await supabase.from('rules').update(payload).eq('id', r.id) : await supabase.from('rules').insert([payload]);
        if (!error) { fetchWorldData(currentWorld!.id, isPlayerMode); setEditingRule(null); }
      }} onClose={() => setEditingRule(null)} />}
      {editingMonster && <MonsterEditor monster={editingMonster} onSave={async (m) => {
        const payload = { ...m, world_id: currentWorld!.id };
        const { error } = m.id ? await supabase.from('homebrew_monsters').update(payload).eq('id', m.id) : await supabase.from('homebrew_monsters').insert([payload]);
        if (!error) { fetchWorldData(currentWorld!.id, isPlayerMode); setEditingMonster(null); }
      }} onClose={() => setEditingMonster(null)} />}
    </div>
  );
}

export default App;