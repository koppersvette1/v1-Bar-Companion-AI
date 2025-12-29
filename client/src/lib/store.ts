import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import cocktailImage from '@assets/generated_images/classic_old_fashioned_cocktail.png';

// --- Types ---

export type Intensity = 'light' | 'medium' | 'bold' | 'very-strong';
export type WoodName = 'Apple' | 'Cherry' | 'Oak' | 'Pecan' | 'Hickory' | 'Mesquite' | 'Maple' | 'Alder';

export interface Wood {
  name: WoodName;
  intensity: Intensity;
  recommendedTimeSecondsMin: number;
  recommendedTimeSecondsMax: number;
  purpose: string;
  tastingNotes: string;
  bestWithDrinkTags: string[];
  bestWithFoodTags: string[];
  isInMyKit: boolean;
}

export type Category = 'spirit' | 'liqueur' | 'bitters' | 'mixer' | 'syrup' | 'garnish' | 'tool' | 'accessory';

export interface Item {
  id: string;
  name: string;
  brand?: string;
  category: Category;
  subtype?: string;
  abv?: number;
  quantity: number; // 0-100% or count
  notes?: string;
  image?: string;
  dateAdded: number;
  // Cost Tracking Fields
  price?: number;
  currency?: string;
  bottleSize?: number; // volume
  bottleUnit?: 'ml' | 'oz' | 'l';
  store?: string;
}

export interface UserSettings {
  name: string;
  hasSmoker: boolean;
  smokerDeviceName?: string;
  preferredIntensity: Intensity;
  enableCostTracking: boolean;
}

export interface AppState {
  inventory: Item[];
  woodLibrary: Wood[];
  userSettings: UserSettings;
  
  // Actions
  addItem: (item: Item) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  removeItem: (id: string) => void;
  toggleWoodInKit: (woodName: WoodName) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  loadDemoData: () => void;
  reset: () => void;
}

// --- Seed Data ---

const SEED_WOODS: Wood[] = [
  { name: 'Apple', intensity: 'light', recommendedTimeSecondsMin: 15, recommendedTimeSecondsMax: 20, purpose: 'Gentle sweet aroma', tastingNotes: 'Fruity, mild smoke', bestWithDrinkTags: ['sour', 'citrus', 'light'], bestWithFoodTags: ['chicken', 'pork', 'cheese'], isInMyKit: true },
  { name: 'Cherry', intensity: 'medium', recommendedTimeSecondsMin: 12, recommendedTimeSecondsMax: 18, purpose: 'Sweet richness', tastingNotes: 'Sweet, fruity, rounded', bestWithDrinkTags: ['old-fashioned', 'manhattan', 'bourbon'], bestWithFoodTags: ['pork', 'duck', 'chocolate'], isInMyKit: true },
  { name: 'Oak', intensity: 'medium', recommendedTimeSecondsMin: 8, recommendedTimeSecondsMax: 12, purpose: 'Barrel accent', tastingNotes: 'Vanilla, toast, woody', bestWithDrinkTags: ['neat', 'classic'], bestWithFoodTags: ['steak', 'beef', 'aged-cheese'], isInMyKit: true },
  { name: 'Pecan', intensity: 'medium', recommendedTimeSecondsMin: 12, recommendedTimeSecondsMax: 15, purpose: 'Warm nutty', tastingNotes: 'Nutty, spicy, rich', bestWithDrinkTags: ['fall', 'maple'], bestWithFoodTags: ['turkey', 'squash', 'caramel'], isInMyKit: false },
  { name: 'Hickory', intensity: 'bold', recommendedTimeSecondsMin: 5, recommendedTimeSecondsMax: 8, purpose: 'Savory bold', tastingNotes: 'Bacon-like, pungent, strong', bestWithDrinkTags: ['bloody-mary', 'bold'], bestWithFoodTags: ['brisket', 'ribs'], isInMyKit: true },
  { name: 'Mesquite', intensity: 'very-strong', recommendedTimeSecondsMin: 5, recommendedTimeSecondsMax: 7, purpose: 'Aggressive campfire', tastingNotes: 'Earthy, sharp, intense', bestWithDrinkTags: ['mezcal', 'tequila'], bestWithFoodTags: ['tex-mex', 'steak'], isInMyKit: false },
  { name: 'Maple', intensity: 'light', recommendedTimeSecondsMin: 10, recommendedTimeSecondsMax: 15, purpose: 'Toasted sugar', tastingNotes: 'Sweet, smooth, mild', bestWithDrinkTags: ['dessert', 'coffee', 'bourbon'], bestWithFoodTags: ['breakfast', 'dessert'], isInMyKit: false },
  { name: 'Alder', intensity: 'light', recommendedTimeSecondsMin: 12, recommendedTimeSecondsMax: 15, purpose: 'Clean mild', tastingNotes: 'Neutral, light wood', bestWithDrinkTags: ['gin', 'vodka'], bestWithFoodTags: ['seafood', 'poultry'], isInMyKit: false },
];

const DEMO_INVENTORY: Item[] = [
  { id: '1', name: 'Bourbon Whiskey', brand: 'Woodford Reserve', category: 'spirit', subtype: 'Bourbon', abv: 45, quantity: 1, dateAdded: Date.now(), image: cocktailImage, price: 35.99, bottleSize: 750, bottleUnit: 'ml' },
  { id: '2', name: 'Sweet Vermouth', brand: 'Carpano Antica', category: 'liqueur', subtype: 'Vermouth', quantity: 1, dateAdded: Date.now(), price: 32.00, bottleSize: 1000, bottleUnit: 'ml' },
  { id: '3', name: 'Angostura Bitters', category: 'bitters', quantity: 1, dateAdded: Date.now(), price: 12.00, bottleSize: 4, bottleUnit: 'oz' },
  { id: '4', name: 'Campari', category: 'liqueur', subtype: 'Amaro', quantity: 1, dateAdded: Date.now(), price: 28.00, bottleSize: 750, bottleUnit: 'ml' },
  { id: '5', name: 'London Dry Gin', brand: 'Tanqueray', category: 'spirit', subtype: 'Gin', quantity: 1, dateAdded: Date.now(), price: 24.99, bottleSize: 750, bottleUnit: 'ml' },
  { id: '6', name: 'Simple Syrup', category: 'syrup', quantity: 1, dateAdded: Date.now(), price: 5.00, bottleSize: 12, bottleUnit: 'oz' },
  { id: '7', name: 'Cocktail Smoker', brand: 'Foghat', category: 'accessory', quantity: 1, dateAdded: Date.now() },
];

// --- Store ---

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      inventory: [],
      woodLibrary: SEED_WOODS,
      userSettings: {
        name: 'Guest',
        hasSmoker: false,
        preferredIntensity: 'medium',
        enableCostTracking: false,
      },

      addItem: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
      
      updateItem: (id, updates) => set((state) => ({
        inventory: state.inventory.map((i) => (i.id === id ? { ...i, ...updates } : i)),
      })),
      
      removeItem: (id) => set((state) => ({
        inventory: state.inventory.filter((i) => i.id !== id),
      })),

      toggleWoodInKit: (woodName) => set((state) => ({
        woodLibrary: state.woodLibrary.map((w) => 
          w.name === woodName ? { ...w, isInMyKit: !w.isInMyKit } : w
        ),
      })),

      updateSettings: (updates) => set((state) => ({
        userSettings: { ...state.userSettings, ...updates }
      })),

      loadDemoData: () => set((state) => ({
        inventory: DEMO_INVENTORY,
        userSettings: { ...state.userSettings, hasSmoker: true, enableCostTracking: true }
      })),

      reset: () => set({
        inventory: [],
        woodLibrary: SEED_WOODS,
        userSettings: { name: 'Guest', hasSmoker: false, preferredIntensity: 'medium', enableCostTracking: false }
      })
    }),
    {
      name: 'barbuddy-storage',
    }
  )
);
