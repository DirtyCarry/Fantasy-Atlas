-- 1. Worlds Archive: The foundation of all realms
CREATE TABLE IF NOT EXISTS worlds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  map_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Map Landmarks (Locations): Mapped points of interest
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  x FLOAT8 NOT NULL,
  y FLOAT8 NOT NULL,
  taverns TEXT[],
  shops TEXT[],
  npcs TEXT[],
  size INTEGER DEFAULT 32,
  is_public BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Historical Chronicles (Lore): Deep world history and myths
CREATE TABLE IF NOT EXISTS lore_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  era TEXT,
  year INTEGER,
  category TEXT,
  is_public BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Divine Statutes (Rules): The governing laws of mechanics
CREATE TABLE IF NOT EXISTS rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  details TEXT[],
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Bestiary (Monsters): Extraordinary and homebrew denizens
CREATE TABLE IF NOT EXISTS homebrew_monsters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT,
  size TEXT,
  type TEXT,
  challenge_rating TEXT,
  armor_class INTEGER,
  hit_points INTEGER,
  alignment TEXT,
  strength INTEGER,
  dexterity INTEGER,
  constitution INTEGER,
  intelligence INTEGER,
  wisdom INTEGER,
  charisma INTEGER,
  speed JSONB,
  senses TEXT,
  languages TEXT,
  special_abilities JSONB,
  actions JSONB,
  legendary_actions JSONB,
  is_homebrew BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Campaign Notes: Centralized hub for DM notes and player logs
CREATE TABLE IF NOT EXISTS dm_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('NPC', 'Event', 'Character', 'Plot', 'Secret')),
  is_public BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- --- SECURITY LAYER (RLS) ---

-- Enable RLS on all scrolls to protect the sanctum
ALTER TABLE worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lore_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE homebrew_monsters ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_notes ENABLE ROW LEVEL SECURITY;

-- 1. Worlds: Owners can do all, Public can see if world is_public
CREATE POLICY "Worlds ownership" ON worlds FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Public worlds view" ON worlds FOR SELECT USING (is_public = true);

-- Helper Function: Verify World Ownership across all sub-tables
CREATE OR REPLACE FUNCTION is_world_owner(w_id UUID) RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM worlds WHERE id = w_id AND owner_id = auth.uid());
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. Locations Policies
CREATE POLICY "Locations owner management" ON locations FOR ALL USING (is_world_owner(world_id));
CREATE POLICY "Locations public view" ON locations FOR SELECT USING (is_public = true OR is_world_owner(world_id));

-- 3. Lore Policies
CREATE POLICY "Lore owner management" ON lore_entries FOR ALL USING (is_world_owner(world_id));
CREATE POLICY "Lore public view" ON lore_entries FOR SELECT USING (is_public = true OR is_world_owner(world_id));

-- 4. Rules Policies
CREATE POLICY "Rules owner management" ON rules FOR ALL USING (is_world_owner(world_id));
CREATE POLICY "Rules public view" ON rules FOR SELECT USING (is_public = true OR is_world_owner(world_id));

-- 5. Monsters Policies
CREATE POLICY "Monsters owner management" ON homebrew_monsters FOR ALL USING (is_world_owner(world_id));
CREATE POLICY "Monsters public view" ON homebrew_monsters FOR SELECT USING (is_public = true OR is_world_owner(world_id));

-- 6. Campaign Notes Policies
CREATE POLICY "Notes owner management" ON dm_notes FOR ALL USING (is_world_owner(world_id));
CREATE POLICY "Notes public view" ON dm_notes FOR SELECT USING (is_public = true OR is_world_owner(world_id));