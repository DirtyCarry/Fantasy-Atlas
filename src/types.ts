
export interface World {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  map_url: string;
  is_public: boolean;
  created_at?: string;
}

export interface LocationData {
  id: string;
  world_id: string;
  name: string;
  x: number;
  y: number;
  description: string;
  taverns: string[]; 
  shops: string[];
  npcs: string[];
  size?: number;
}

export interface LoreEntry {
  id: string;
  world_id: string;
  title: string;
  content: string;
  era: string;
  year: number;
  category: string;
  created_at?: string;
}

export type ViewMode = 'map' | 'lore' | 'rules' | 'monsters' | 'settings' | 'sanctum';

// Fix: Changed world_id to optional to support system-wide rules and static templates like those in rulesData.ts
export interface RuleEntry {
  id: string;
  world_id?: string;
  category: string;
  name: string;
  description: string;
  details?: string[];
  created_at?: string;
}

export interface Monster {
  id?: string;
  world_id: string;
  slug: string;
  name: string;
  size: string;
  type: string;
  challenge_rating: string;
  armor_class: number;
  hit_points: number;
  alignment: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  speed: Record<string, any>;
  senses: string;
  languages: string;
  special_abilities?: Array<{ name: string; desc: string }>;
  actions?: Array<{ name: string; desc: string }>;
  legendary_actions?: Array<{ name: string; desc: string }>;
  is_homebrew?: boolean;
}

export interface AppSettings {
  worldName: string;
  mapUrl: string;
}
