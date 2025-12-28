import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import cocktailImage from '@assets/generated_images/classic_old_fashioned_cocktail.png';

export type Category = 'spirit' | 'liqueur' | 'bitters' | 'mixer' | 'garnish' | 'tool' | 'accessory';

export type Item = {
  id: string;
  name: string;
  category: Category;
  image?: string;
  abv?: number;
  notes?: string;
  quantity: number;
};

export type AppSettings = {
  openAiKey?: string;
  useOpenAi: boolean;
  onboardingCompleted: boolean;
};

type Store = {
  inventory: Item[];
  settings: AppSettings;
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  loadDemoBar: () => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetStore: () => void;
};

const DEMO_ITEMS: Item[] = [
  { id: 'd1', name: 'Bourbon Whiskey', category: 'spirit', image: cocktailImage, abv: 45, quantity: 1, notes: 'Woodford Reserve' },
  { id: 'd2', name: 'Rye Whiskey', category: 'spirit', quantity: 1, notes: 'Rittenhouse' },
  { id: 'd3', name: 'Sweet Vermouth', category: 'liqueur', quantity: 1, notes: 'Carpano Antica' },
  { id: 'd4', name: 'Campari', category: 'liqueur', quantity: 1 },
  { id: 'd5', name: 'Gin', category: 'spirit', quantity: 1, notes: 'Hendricks' },
  { id: 'd6', name: 'Angostura Bitters', category: 'bitters', quantity: 1 },
  { id: 'd7', name: 'Orange Bitters', category: 'bitters', quantity: 1 },
  { id: 'd8', name: 'Cocktail Smoker', category: 'accessory', quantity: 1, notes: 'With Oak & Cherry chips' },
  { id: 'd9', name: 'Oak Chips', category: 'accessory', quantity: 1, notes: 'Rich, bold smoke' },
  { id: 'd10', name: 'Cherry Wood Dust', category: 'accessory', quantity: 1, notes: 'Sweet, mild smoke' },
  { id: 'd11', name: 'Shaker Tin', category: 'tool', quantity: 1 },
  { id: 'd12', name: 'Mixing Glass', category: 'tool', quantity: 1 },
  { id: 'd13', name: 'Orange', category: 'garnish', quantity: 5 },
  { id: 'd14', name: 'Lemon', category: 'garnish', quantity: 5 },
  { id: 'd15', name: 'Simple Syrup', category: 'mixer', quantity: 1 },
];

export const useStore = create<Store>()(
  persist(
    (set) => ({
      inventory: [],
      settings: {
        useOpenAi: false,
        onboardingCompleted: false,
      },
      addItem: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
      removeItem: (id) => set((state) => ({ inventory: state.inventory.filter((i) => i.id !== id) })),
      updateItem: (id, updates) =>
        set((state) => ({
          inventory: state.inventory.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),
      loadDemoBar: () => set((state) => ({ 
        inventory: [...state.inventory, ...DEMO_ITEMS.filter(d => !state.inventory.find(i => i.name === d.name))] 
      })),
      updateSettings: (updates) => set((state) => ({ settings: { ...state.settings, ...updates } })),
      resetStore: () => set({ inventory: [], settings: { useOpenAi: false, onboardingCompleted: false } }),
    }),
    {
      name: 'my-bar-storage-v2',
    }
  )
);
