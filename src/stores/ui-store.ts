import { create } from 'zustand';

interface UIState {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  
  selectedNodeId: number | null;
  setSelectedNodeId: (id: number | null) => void;
  
  lightboxOpen: boolean;
  lightboxImageIndex: number;
  lightboxImages: { url: string; caption: string }[];
  setLightbox: (open: boolean, images?: { url: string; caption: string }[], index?: number) => void;
  
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  mobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  
  lightboxOpen: false,
  lightboxImageIndex: 0,
  lightboxImages: [],
  setLightbox: (open, images = [], index = 0) => set({
    lightboxOpen: open,
    lightboxImages: images,
    lightboxImageIndex: index,
  }),
  
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
}));