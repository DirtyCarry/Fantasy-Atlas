export interface LocationData {
  id: string;
  name: string;
  x: number;
  y: number;
  description: string;
  taverns: string[]; 
  shops: string[];
  npcs: string[];
  size?: number;
}

export type DbLocation = {
  id: string;
  name: string;
  x: number;
  y: number;
  description: string;
  taverns: any; 
  shops: any;
  npcs: any;
  size?: number;
}

export interface LoreEntry {
  id: string;
  title: string;
  content: string;
  era: string;
  year: number;
  category: string;
  created_at?: string;
}

export type ViewMode = 'map' | 'lore' | 'rules' | 'monsters' | 'settings';

export interface RuleEntry {
  id: string;
  category: string;
  name: string;
  description: string;
  details?: string[];
  created_at?: string;
}

export interface Monster {
  id?: string;
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