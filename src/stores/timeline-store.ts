import { create } from 'zustand';

interface TimelineState {
  selectedEra: string | null;
  setSelectedEra: (era: string | null) => void;
  
  selectedYear: number | null;
  setSelectedYear: (year: number | null) => void;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  resetFilters: () => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  selectedEra: null,
  setSelectedEra: (era) => set({ selectedEra: era }),
  
  selectedYear: null,
  setSelectedYear: (year) => set({ selectedYear: year }),
  
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  resetFilters: () => set({
    selectedEra: null,
    selectedYear: null,
    searchQuery: '',
  }),
}));