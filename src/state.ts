import { AppState, SpecialBlocks, Theme, ViewMode } from './types';
import {
  loadSavedContent,
  loadSavedPaneSplit,
  loadSavedSyncScroll,
  loadSavedTheme,
  saveContent,
  savePaneSplit,
  saveSyncScroll,
  saveTheme,
} from './storage/local-storage';

type StateListener = (state: AppState) => void;

class StateManager {
  private state: AppState;
  private listeners: Set<StateListener> = new Set();

  constructor() {
    this.state = {
      content: loadSavedContent(),
      theme: loadSavedTheme(),
      viewMode: 'split',
      paneSplit: loadSavedPaneSplit(),
      syncScroll: loadSavedSyncScroll(),
      zenMode: false,
    };
  }

  public getState(): AppState {
    return { ...this.state };
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }

  public setContent(content: string, persist = true): void {
    this.state.content = content;
    if (persist) {
      saveContent(content);
    }
    this.notify();
  }

  public setTheme(theme: Theme): void {
    this.state.theme = theme;
    saveTheme(theme);
    this.notify();
  }

  public setViewMode(viewMode: ViewMode): void {
    this.state.viewMode = viewMode;
    this.notify();
  }

  public setPaneSplit(split: number): void {
    const clamped = Math.max(15, Math.min(85, split));
    this.state.paneSplit = clamped;
    savePaneSplit(clamped);
    this.notify();
  }

  public setSyncScroll(enabled: boolean): void {
    this.state.syncScroll = enabled;
    saveSyncScroll(enabled);
    this.notify();
  }

  public setZenMode(enabled: boolean): void {
    this.state.zenMode = enabled;
    this.notify();
  }

  public detectSpecialBlocks(): SpecialBlocks {
    const text = this.state.content;
    const hasMermaid = /```mermaid\b/i.test(text);
    const hasChart = /```chart\b/i.test(text);
    const hasMath = /\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|```(?:math|katex)\b/i.test(text);
    const hasCode = /```[a-zA-Z0-9_-]+\b/.test(text);
    const hasPlantUML = /```(?:plantuml|puml)\b/i.test(text);
    const hasAbc = /```abc\b/i.test(text);

    return {
      hasMermaid,
      hasChart,
      hasMath,
      hasCode,
      hasPlantUML,
      hasAbc,
    };
  }
}

export const appState = new StateManager();

