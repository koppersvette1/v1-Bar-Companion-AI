import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import bgImage from '@assets/generated_images/elegant_home_bar_background.png';
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

type Store = {
  inventory: Item[];
  addItem: (item: Item) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      inventory: [
        { id: '1', name: 'Bourbon Whiskey', category: 'spirit', image: cocktailImage, abv: 45, quantity: 1, notes: 'Woodford Reserve' },
        { id: '2', name: 'Sweet Vermouth', category: 'liqueur', quantity: 1, notes: 'Carpano Antica' },
        { id: '3', name: 'Angostura Bitters', category: 'bitters', quantity: 1 },
        { id: '4', name: 'Campari', category: 'liqueur', quantity: 1 },
        { id: '5', name: 'Gin', category: 'spirit', quantity: 1, notes: 'Hendricks' },
        { id: '6', name: 'Cocktail Smoker', category: 'accessory', quantity: 1, notes: 'With Oak chips' },
        { id: '7', name: 'Shaker Tin', category: 'tool', quantity: 1 },
      ],
      addItem: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
      removeItem: (id) => set((state) => ({ inventory: state.inventory.filter((i) => i.id !== id) })),
      updateItem: (id, updates) =>
        set((state) => ({
          inventory: state.inventory.map((i) => (i.id === id ? { ...i, ...updates } : i)),
        })),
    }),
    {
      name: 'my-bar-storage',
    }
  )
);
