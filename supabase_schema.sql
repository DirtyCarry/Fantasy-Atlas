-- Full Database Schema for Faerun Atlas Production

-- World Table: Genesis of Realms
CREATE TABLE worlds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  map_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Locations Table: Mapped Landmarks
CREATE TABLE locations (
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

-- Lore Table: Archives of History
CREATE TABLE lore_entries (
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

-- Rules Table: Codices of Law
CREATE TABLE rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  details TEXT[],
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Homebrew Monsters Table: Sacred Bestiary
CREATE TABLE homebrew_monsters (
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

-- Campaign Notes Table: Chronicles and Secrets
CREATE TABLE dm_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  world_id UUID REFERENCES worlds(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('NPC', 'Event', 'Character', 'Plot', 'Secret')),
  is_public BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- --- SECURITY LAYER ---

ALTER TABLE worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lore_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE homebrew_monsters ENABLE ROW LEVEL SECURITY;
ALTER TABLE dm_notes ENABLE ROW LEVEL SECURITY;

-- Owner Master Policies
CREATE POLICY "Worlds owner" ON worlds FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Locations owner" ON locations FOR ALL USING (EXISTS (SELECT 1 FROM worlds WHERE id = world_id AND owner_id = auth.uid()));
CREATE POLICY "Lore owner" ON lore_entries FOR ALL USING (EXISTS (SELECT 1 FROM worlds WHERE id = world_id AND owner_id = auth.uid()));
CREATE POLICY "Rules owner" ON rules FOR ALL USING (EXISTS (SELECT 1 FROM worlds WHERE id = world_id AND owner_id = auth.uid()));
CREATE POLICY "Monsters owner" ON homebrew_monsters FOR ALL USING (EXISTS (SELECT 1 FROM worlds WHERE id = world_id AND owner_id = auth.uid()));
CREATE POLICY "Notes owner" ON dm_notes FOR ALL USING (EXISTS (SELECT 1 FROM worlds WHERE id = world_id AND owner_id = auth.uid()));

-- Public Read-Only Policies (Based on is_public flag)
CREATE POLICY "Public worlds view" ON worlds FOR SELECT USING (is_public = true);
CREATE POLICY "Public locations view" ON locations FOR SELECT USING (is_public = true);
CREATE POLICY "Public lore view" ON lore_entries FOR SELECT USING (is_public = true);
CREATE POLICY "Public rules view" ON rules FOR SELECT USING (is_public = true);
CREATE POLICY "Public monsters view" ON homebrew_monsters FOR SELECT USING (is_public = true);
CREATE POLICY "Public notes view" ON dm_notes FOR SELECT USING (is_public = true);