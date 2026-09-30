export type Theme = 'system' | 'light' | 'dark';

export type ViewMode = 'split' | 'editor' | 'preview';

export interface DocumentStats {
  words: number;
  characters: number;
  readingTimeMinutes: number;
}

export interface AppState {
  content: string;
  theme: Theme;
  viewMode: ViewMode;
  paneSplit: number; // percentage 10 to 90
  syncScroll: boolean;
  zenMode: boolean;
}

export interface SpecialBlocks {
  hasMermaid: boolean;
  hasChart: boolean;
  hasMath: boolean;
  hasCode: boolean;
}

