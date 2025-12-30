import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// --- Domain Types ---

export type Intensity = 'light' | 'medium' | 'bold' | 'very-strong';
export type WoodName = string; // e.g., 'Apple', 'Hickory'
export type SmokerDeviceType = 'chimney' | 'cloche' | 'smoking-gun' | 'torch-only';

export type GarnishCategory = 'citrus' | 'herb' | 'spice' | 'fruit' | 'savory' | 'rim';

export interface Garnish {
  id: string;
  name: string;
  category: GarnishCategory;
  flavorTags: string[];
  bestWithDrinkTags: string[];
  bestWithWoods?: string[];
  smokeFriendly: boolean;
  smokeSuggestion?: string;
  notes?: string;
  isInMyKit: boolean;
  isCustom?: boolean;
}

export interface Wood {
  id: string;
  name: WoodName;
  intensity: Intensity;
  timeMin: number;
  timeMax: number;
  purpose: string;
  tastingNotes: string;
  flavorTags: string[]; // fruity, savory, etc.
  bestWithDrinkTags: string[];
  bestWithFoodTags: string[];
  avoidWithDrinkTags: string[];
  beginnerSafe: boolean;
  isInMyKit: boolean;
  methodRestriction?: 'garnishOnly';
  isCustom?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  brand?: string;
  category: string; // spirit, mixer, garnish, etc.
  subtype?: string; // bourbon, rye, ipa
  abv?: number;
  photo?: string;
  notes?: string;
  quantity: number;
  bottleSizeMl?: number;
  price?: number;
  store?: string;
  tags: string[];
  updatedAt: number;
}

export interface PersonProfile {
  id: string;
  name: string;
  sweetnessPref: 'dry' | 'balanced' | 'sweet'; // 1-3
  abvComfort: 'low' | 'medium' | 'high';
  likedTags: string[]; // 'citrus', 'smoky'
  dislikedTags: string[]; // 'bitter', 'dairy'
  seasonalPref: 'neutral' | 'warm-weather' | 'cool-weather';
  winePref?: {
    dry: boolean;
    minAbv: number;
  };
  tasteWeights: Record<string, number>; // Dynamic learning weights
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  baseSpirit: string;
  style: 'classic' | 'modern' | 'tiki' | 'smoky' | 'low-abv';
  ingredients: { name: string; amount: string; unit?: string }[];
  steps: string[];
  glassware: string;
  garnish: string;
  isSmoked: boolean;
  recommendedWood?: string;
  smokeTime?: number;
  tags: string[]; // bitter, sweet, sour, boozy, etc.
  sourceUrl?: string;
  sourceName?: string;
  
  // Runtime Learning Props (Optional)
  _score?: number;
  _debugReasons?: string[];
}

export interface HistoryEntry {
  id: string;
  recipeId: string;
  recipeName: string;
  timestamp: number;
  rating?: number; // 1-5
  notes?: string;
  tuning?: {
    action: string;
    diff: string;
  };
  smoked?: {
    wood: string;
    time: number;
  };
}

export interface UserSettings {
  email: string;
  hasSmoker: boolean;
  smokerDeviceName?: string;
  smokerType: SmokerDeviceType;
  defaultIntensity: Intensity;
  enableCostTracking: boolean;
  debugMode: boolean; // Dev only
  woodAffinity: Record<string, number>; // Learning weights for woods
}

export interface AppState {
  // Data
  inventory: InventoryItem[];
  woodLibrary: Wood[];
  garnishLibrary: Garnish[];
  people: PersonProfile[];
  recipes: Recipe[];
  favorites: string[]; // Recipe IDs
  history: HistoryEntry[];
  settings: UserSettings;

  // Actions
  // Inventory
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'updatedAt'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  removeInventoryItem: (id: string) => void;

  // Woods
  toggleWoodKit: (woodId: string) => void;
  updateWood: (id: string, updates: Partial<Wood>) => void;
  addWood: (wood: Omit<Wood, 'id' | 'isCustom'>) => void;
  deleteWood: (woodId: string) => void;

  // Garnishes
  toggleGarnishKit: (garnishId: string) => void;
  updateGarnish: (id: string, updates: Partial<Garnish>) => void;
  addGarnish: (garnish: Omit<Garnish, 'id' | 'isCustom'>) => void;
  deleteGarnish: (garnishId: string) => void;

  // People
  addPerson: (person: Omit<PersonProfile, 'id' | 'tasteWeights'>) => void;
  updatePerson: (id: string, updates: Partial<PersonProfile>) => void;
  deletePerson: (id: string) => void;

  // Recipes
  addRecipe: (recipe: Recipe) => void; // User generated or imported
  toggleFavorite: (recipeId: string) => void;
  
  // History & Learning
  logHistory: (entry: Omit<HistoryEntry, 'id'>) => void;
  
  // Settings
  updateSettings: (updates: Partial<UserSettings>) => void;
  
  // System
  loadSeedData: () => void;
  reset: () => void;
}

// --- Seed Data Implementation ---

const SEED_WOODS: Wood[] = [
  { id: 'wood-apple', name: 'Apple', intensity: 'light', timeMin: 15, timeMax: 20, purpose: 'Gentle sweet aroma', tastingNotes: 'Fruity, mild smoke', flavorTags: ['fruity', 'sweet'], bestWithDrinkTags: ['sour', 'citrus', 'light'], bestWithFoodTags: ['chicken', 'pork', 'cheese'], avoidWithDrinkTags: ['bold', 'smoky'], beginnerSafe: true, isInMyKit: true },
  { id: 'wood-cherry', name: 'Cherry', intensity: 'medium', timeMin: 12, timeMax: 18, purpose: 'Sweet richness', tastingNotes: 'Sweet, fruity, rounded', flavorTags: ['fruity', 'rich'], bestWithDrinkTags: ['old-fashioned', 'manhattan', 'bourbon'], bestWithFoodTags: ['pork', 'duck', 'chocolate'], avoidWithDrinkTags: [], beginnerSafe: true, isInMyKit: true },
  { id: 'wood-oak', name: 'Oak', intensity: 'medium', timeMin: 8, timeMax: 12, purpose: 'Barrel accent', tastingNotes: 'Vanilla, toast, woody', flavorTags: ['toasty', 'vanilla'], bestWithDrinkTags: ['neat', 'classic', 'whiskey'], bestWithFoodTags: ['steak', 'beef', 'aged-cheese'], avoidWithDrinkTags: ['fruity', 'light'], beginnerSafe: true, isInMyKit: true },
  { id: 'wood-hickory', name: 'Hickory', intensity: 'bold', timeMin: 5, timeMax: 8, purpose: 'Savory bold', tastingNotes: 'Bacon-like, pungent', flavorTags: ['savory', 'campfire'], bestWithDrinkTags: ['bloody-mary', 'bold', 'spicy'], bestWithFoodTags: ['brisket', 'ribs', 'bbq'], avoidWithDrinkTags: ['delicate', 'floral'], beginnerSafe: false, isInMyKit: true },
  { id: 'wood-mesquite', name: 'Mesquite', intensity: 'very-strong', timeMin: 5, timeMax: 7, purpose: 'Aggressive campfire', tastingNotes: 'Earthy, sharp, intense', flavorTags: ['campfire', 'earthy'], bestWithDrinkTags: ['mezcal', 'tequila'], bestWithFoodTags: ['tex-mex', 'steak'], avoidWithDrinkTags: ['sweet', 'fruity'], beginnerSafe: false, isInMyKit: false },
  { id: 'wood-pecan', name: 'Pecan', intensity: 'medium', timeMin: 12, timeMax: 15, purpose: 'Warm nutty', tastingNotes: 'Nutty, spicy, rich', flavorTags: ['nutty', 'spicy'], bestWithDrinkTags: ['fall', 'maple', 'rum'], bestWithFoodTags: ['turkey', 'squash', 'caramel'], avoidWithDrinkTags: [], beginnerSafe: true, isInMyKit: false },
  { id: 'wood-maple', name: 'Maple', intensity: 'light', timeMin: 10, timeMax: 15, purpose: 'Toasted sugar', tastingNotes: 'Sweet, smooth, mild', flavorTags: ['sweet', 'toasty'], bestWithDrinkTags: ['dessert', 'coffee', 'bourbon'], bestWithFoodTags: ['breakfast', 'dessert'], avoidWithDrinkTags: ['savory'], beginnerSafe: true, isInMyKit: false },
  { id: 'wood-alder', name: 'Alder', intensity: 'light', timeMin: 12, timeMax: 15, purpose: 'Clean mild', tastingNotes: 'Neutral, light wood', flavorTags: ['clean', 'neutral'], bestWithDrinkTags: ['gin', 'vodka', 'martini'], bestWithFoodTags: ['seafood', 'poultry'], avoidWithDrinkTags: ['heavy'], beginnerSafe: true, isInMyKit: false },
  { id: 'wood-rosemary', name: 'Rosemary', intensity: 'light', timeMin: 5, timeMax: 8, purpose: 'Herbal aromatic garnish', tastingNotes: 'Piney, herbal aroma', flavorTags: ['herbal', 'piney', 'fresh'], bestWithDrinkTags: ['gin', 'citrus', 'martini'], bestWithFoodTags: ['lamb', 'roasted-veg', 'potatoes'], avoidWithDrinkTags: ['sweet', 'creamy'], beginnerSafe: true, isInMyKit: false, methodRestriction: 'garnishOnly' },
  { id: 'wood-pear', name: 'Pear', intensity: 'light', timeMin: 12, timeMax: 16, purpose: 'Elegant fruit/floral', tastingNotes: 'Elegant fruit, floral, wine-like', flavorTags: ['fruity', 'floral', 'elegant'], bestWithDrinkTags: ['spritz', 'gin', 'white-wine', 'light'], bestWithFoodTags: ['cheese', 'salads', 'light-dishes'], avoidWithDrinkTags: ['bold', 'smoky'], beginnerSafe: true, isInMyKit: true },
  { id: 'wood-peach', name: 'Peach', intensity: 'light', timeMin: 12, timeMax: 16, purpose: 'Stone-fruit summer sweetness', tastingNotes: 'Stone-fruit, summer sweetness', flavorTags: ['fruity', 'sweet', 'summer'], bestWithDrinkTags: ['spritz', 'sour', 'summer', 'bellini'], bestWithFoodTags: ['grilled-chicken', 'fruit-desserts', 'salads'], avoidWithDrinkTags: ['bold', 'bitter'], beginnerSafe: true, isInMyKit: true },
  { id: 'wood-walnut', name: 'Walnut', intensity: 'bold', timeMin: 8, timeMax: 12, purpose: 'Deep nutty/earthy', tastingNotes: 'Deep nutty, dry, earthy', flavorTags: ['nutty', 'earthy', 'dry'], bestWithDrinkTags: ['old-fashioned', 'amaro', 'vermouth', 'bourbon'], bestWithFoodTags: ['roasted-meats', 'mushrooms', 'aged-cheese'], avoidWithDrinkTags: ['light', 'fruity', 'delicate'], beginnerSafe: false, isInMyKit: true },
  { id: 'wood-olive', name: 'Olive', intensity: 'medium', timeMin: 8, timeMax: 12, purpose: 'Savory/mediterranean', tastingNotes: 'Savory, mediterranean, earthy', flavorTags: ['savory', 'mediterranean', 'earthy'], bestWithDrinkTags: ['martini', 'mezcal', 'gin', 'vermouth'], bestWithFoodTags: ['lamb', 'olives', 'grilled-veg', 'mediterranean'], avoidWithDrinkTags: ['sweet', 'fruity'], beginnerSafe: true, isInMyKit: true },
  { id: 'wood-beech', name: 'Beech', intensity: 'medium', timeMin: 10, timeMax: 14, purpose: 'Clean/European/neutral', tastingNotes: 'Clean, european, neutral smoke', flavorTags: ['clean', 'neutral', 'european'], bestWithDrinkTags: ['versatile', 'gin', 'vodka', 'whiskey'], bestWithFoodTags: ['poultry', 'seafood', 'cheese'], avoidWithDrinkTags: [], beginnerSafe: true, isInMyKit: true },
  { id: 'wood-grapevine', name: 'Grapevine', intensity: 'medium', timeMin: 8, timeMax: 12, purpose: 'Wine-barrel adjacent', tastingNotes: 'Tannic, structured, wine-like', flavorTags: ['tannic', 'wine-like', 'structured'], bestWithDrinkTags: ['negroni', 'vermouth', 'wine-like', 'amaro'], bestWithFoodTags: ['charcuterie', 'steak', 'aged-cheese'], avoidWithDrinkTags: ['sweet', 'light'], beginnerSafe: true, isInMyKit: true },
  { id: 'wood-cinnamon', name: 'Cinnamon', intensity: 'light', timeMin: 5, timeMax: 8, purpose: 'Warm spice aroma', tastingNotes: 'Warm spice, holiday aroma', flavorTags: ['spicy', 'warm', 'holiday'], bestWithDrinkTags: ['bourbon', 'rum', 'winter', 'dessert'], bestWithFoodTags: ['desserts', 'holiday', 'apple-pie'], avoidWithDrinkTags: ['savory', 'bitter'], beginnerSafe: true, isInMyKit: false, methodRestriction: 'garnishOnly' },
];

const SEED_GARNISHES: Garnish[] = [
  // Citrus
  { id: 'garnish-orange-peel', name: 'Orange Peel', category: 'citrus', flavorTags: ['bright', 'citrus', 'aromatic'], bestWithDrinkTags: ['old-fashioned', 'negroni', 'whiskey', 'bitter'], smokeFriendly: true, smokeSuggestion: 'Express oils over smoked glass', isInMyKit: true },
  { id: 'garnish-lemon-peel', name: 'Lemon Peel', category: 'citrus', flavorTags: ['bright', 'citrus', 'zesty'], bestWithDrinkTags: ['martini', 'sour', 'gin', 'vodka'], smokeFriendly: true, smokeSuggestion: 'Express oils to lift flat smoke', isInMyKit: true },
  { id: 'garnish-grapefruit-peel', name: 'Grapefruit Peel', category: 'citrus', flavorTags: ['bitter', 'citrus', 'aromatic'], bestWithDrinkTags: ['paloma', 'spritz', 'tequila', 'mezcal'], smokeFriendly: true, isInMyKit: true },
  { id: 'garnish-lime-peel', name: 'Lime Peel', category: 'citrus', flavorTags: ['bright', 'citrus', 'sharp'], bestWithDrinkTags: ['margarita', 'daiquiri', 'tiki', 'rum'], smokeFriendly: true, isInMyKit: true },
  // Herbs
  { id: 'garnish-rosemary', name: 'Rosemary Sprig', category: 'herb', flavorTags: ['herbal', 'piney', 'aromatic'], bestWithDrinkTags: ['gin', 'vodka', 'citrus'], bestWithWoods: ['wood-rosemary'], smokeFriendly: true, smokeSuggestion: 'Torch briefly for aroma', isInMyKit: true },
  { id: 'garnish-thyme', name: 'Thyme Sprig', category: 'herb', flavorTags: ['herbal', 'earthy', 'subtle'], bestWithDrinkTags: ['gin', 'whiskey', 'lemon'], smokeFriendly: true, isInMyKit: true },
  { id: 'garnish-mint', name: 'Fresh Mint', category: 'herb', flavorTags: ['fresh', 'cool', 'bright'], bestWithDrinkTags: ['mojito', 'julep', 'rum', 'bourbon'], smokeFriendly: false, notes: 'Use fresh; smoke dulls mint', isInMyKit: true },
  { id: 'garnish-sage', name: 'Sage Leaf', category: 'herb', flavorTags: ['herbal', 'earthy', 'savory'], bestWithDrinkTags: ['whiskey', 'apple', 'fall'], smokeFriendly: true, smokeSuggestion: 'Brief torch adds depth', isInMyKit: false },
  // Spices
  { id: 'garnish-cinnamon-stick', name: 'Cinnamon Stick', category: 'spice', flavorTags: ['warm', 'spicy', 'sweet'], bestWithDrinkTags: ['bourbon', 'rum', 'winter', 'hot-toddy'], bestWithWoods: ['wood-cinnamon'], smokeFriendly: true, smokeSuggestion: 'Light torch for aroma only', isInMyKit: true },
  { id: 'garnish-star-anise', name: 'Star Anise', category: 'spice', flavorTags: ['licorice', 'aromatic', 'exotic'], bestWithDrinkTags: ['whiskey', 'rum', 'winter', 'exotic'], smokeFriendly: true, isInMyKit: false },
  { id: 'garnish-clove', name: 'Clove', category: 'spice', flavorTags: ['warm', 'pungent', 'aromatic'], bestWithDrinkTags: ['rum', 'tiki', 'winter', 'spiced'], smokeFriendly: false, notes: 'Overpowering when smoked', isInMyKit: false },
  { id: 'garnish-nutmeg', name: 'Grated Nutmeg', category: 'spice', flavorTags: ['warm', 'nutty', 'aromatic'], bestWithDrinkTags: ['eggnog', 'flip', 'cream', 'winter'], smokeFriendly: false, notes: 'Grate fresh over drink', isInMyKit: true },
  // Fruits
  { id: 'garnish-luxardo-cherry', name: 'Luxardo Cherry', category: 'fruit', flavorTags: ['sweet', 'rich', 'cherry'], bestWithDrinkTags: ['manhattan', 'old-fashioned', 'whiskey'], smokeFriendly: true, smokeSuggestion: 'Drop in after smoking glass', isInMyKit: true },
  { id: 'garnish-dehydrated-orange', name: 'Dehydrated Orange Wheel', category: 'fruit', flavorTags: ['citrus', 'concentrated', 'aromatic'], bestWithDrinkTags: ['negroni', 'old-fashioned', 'aperitif'], smokeFriendly: true, isInMyKit: true },
  { id: 'garnish-dehydrated-lemon', name: 'Dehydrated Lemon Wheel', category: 'fruit', flavorTags: ['citrus', 'concentrated', 'bright'], bestWithDrinkTags: ['sour', 'collins', 'gin'], smokeFriendly: true, isInMyKit: false },
  { id: 'garnish-blackberry', name: 'Fresh Blackberry', category: 'fruit', flavorTags: ['berry', 'sweet', 'tart'], bestWithDrinkTags: ['bramble', 'gin', 'bourbon', 'summer'], smokeFriendly: false, notes: 'Add after smoke settles', isInMyKit: false },
  // Savory
  { id: 'garnish-olive', name: 'Cocktail Olive', category: 'savory', flavorTags: ['savory', 'briny', 'salty'], bestWithDrinkTags: ['martini', 'gibson', 'vodka'], bestWithWoods: ['wood-olive'], smokeFriendly: true, isInMyKit: true },
  { id: 'garnish-cocktail-onion', name: 'Pickled Cocktail Onion', category: 'savory', flavorTags: ['savory', 'tangy', 'briny'], bestWithDrinkTags: ['gibson', 'martini'], smokeFriendly: false, isInMyKit: false },
  // Rims
  { id: 'garnish-smoked-salt', name: 'Smoked Salt Rim', category: 'rim', flavorTags: ['savory', 'smoky', 'salty'], bestWithDrinkTags: ['margarita', 'bloody-mary', 'mezcal', 'bold'], smokeFriendly: true, notes: 'Complements wood smoke', isInMyKit: true },
  { id: 'garnish-demerara-sugar', name: 'Demerara Sugar Rim', category: 'rim', flavorTags: ['sweet', 'caramel', 'rich'], bestWithDrinkTags: ['daiquiri', 'sour', 'rum'], smokeFriendly: true, isInMyKit: true },
  { id: 'garnish-chili-salt', name: 'Chili-Salt Rim', category: 'rim', flavorTags: ['spicy', 'savory', 'bold'], bestWithDrinkTags: ['margarita', 'paloma', 'michelada', 'spicy'], smokeFriendly: true, isInMyKit: false },
  { id: 'garnish-cocoa-sugar', name: 'Cocoa-Sugar Rim', category: 'rim', flavorTags: ['sweet', 'chocolate', 'dessert'], bestWithDrinkTags: ['espresso-martini', 'dessert', 'chocolate'], smokeFriendly: true, isInMyKit: false },
];

const SEED_RECIPES: Recipe[] = [
  {
    id: 'old-fashioned',
    name: "Classic Old Fashioned",
    description: "The definition of a cocktail: spirits, sugar, water, and bitters.",
    baseSpirit: "Whiskey",
    style: "classic",
    ingredients: [{ name: "Bourbon or Rye", amount: "2 oz" }, { name: "Simple Syrup", amount: "0.25 oz" }, { name: "Angostura Bitters", amount: "2 dashes" }],
    steps: ["Stir all ingredients with ice.", "Strain into rocks glass over large cube.", "Express orange peel."],
    glassware: "Rocks",
    garnish: "Orange Peel",
    isSmoked: false,
    tags: ["boozy", "bitter", "sweet", "dinner", "classic"],
  },
  {
    id: 'smoked-old-fashioned',
    name: "Campfire Old Fashioned",
    description: "A rich, smoky twist on the classic.",
    baseSpirit: "Whiskey",
    style: "smoky",
    ingredients: [{ name: "Bourbon", amount: "2 oz" }, { name: "Maple Syrup", amount: "0.25 oz" }, { name: "Angostura Bitters", amount: "2 dashes" }],
    steps: ["Smoke the glass with wood chips.", "Stir ingredients with ice.", "Strain into smoked glass.", "Garnish."],
    glassware: "Rocks",
    garnish: "Luxardo Cherry",
    isSmoked: true,
    recommendedWood: "Hickory",
    smokeTime: 8,
    tags: ["smoky", "boozy", "rich", "winter"],
  },
  {
    id: 'negroni',
    name: "Negroni",
    description: "The perfect balance of bitter, sweet, and botanical.",
    baseSpirit: "Gin",
    style: "classic",
    ingredients: [{ name: "Gin", amount: "1 oz" }, { name: "Campari", amount: "1 oz" }, { name: "Sweet Vermouth", amount: "1 oz" }],
    steps: ["Stir with ice.", "Strain into rocks glass.", "Garnish."],
    glassware: "Rocks",
    garnish: "Orange Peel",
    isSmoked: false,
    tags: ["bitter", "herbal", "aperitif"],
  },
  {
    id: 'margarita',
    name: "Tommy's Margarita",
    description: "A modern classic that highlights the agave flavor.",
    baseSpirit: "Tequila",
    style: "classic",
    ingredients: [{ name: "Tequila Blanco", amount: "2 oz" }, { name: "Fresh Lime Juice", amount: "1 oz" }, { name: "Agave Nectar", amount: "0.5 oz" }],
    steps: ["Shake with ice.", "Strain into rocks glass with fresh ice."],
    glassware: "Rocks",
    garnish: "Lime Wheel + Salt Rim",
    isSmoked: false,
    tags: ["sour", "refreshing", "summer"],
  }
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      inventory: [],
      woodLibrary: SEED_WOODS,
      garnishLibrary: SEED_GARNISHES,
      people: [],
      recipes: SEED_RECIPES,
      favorites: [],
      history: [],
      settings: {
        email: 'user@example.com',
        hasSmoker: false,
        smokerType: 'chimney' as SmokerDeviceType,
        defaultIntensity: 'medium',
        enableCostTracking: false,
        debugMode: false,
        woodAffinity: {}
      },

      // Inventory
      addInventoryItem: (item) => set((state) => ({ 
        inventory: [...state.inventory, { ...item, id: uuidv4(), updatedAt: Date.now() }] 
      })),
      updateInventoryItem: (id, updates) => set((state) => ({
        inventory: state.inventory.map((i) => (i.id === id ? { ...i, ...updates, updatedAt: Date.now() } : i))
      })),
      removeInventoryItem: (id) => set((state) => ({
        inventory: state.inventory.filter((i) => i.id !== id)
      })),

      // Woods
      toggleWoodKit: (woodId) => set((state) => ({
        woodLibrary: state.woodLibrary.map((w) => 
          w.id === woodId ? { ...w, isInMyKit: !w.isInMyKit } : w
        )
      })),
      updateWood: (id, updates) => set((state) => ({
        woodLibrary: state.woodLibrary.map((w) => (w.id === id ? { ...w, ...updates } : w))
      })),
      addWood: (wood) => set((state) => ({
        woodLibrary: [...state.woodLibrary, { ...wood, id: `wood-custom-${uuidv4()}`, isCustom: true }]
      })),
      deleteWood: (woodId) => set((state) => ({
        woodLibrary: state.woodLibrary.filter((w) => w.id !== woodId)
      })),

      // Garnishes
      toggleGarnishKit: (garnishId) => set((state) => ({
        garnishLibrary: state.garnishLibrary.map((g) =>
          g.id === garnishId ? { ...g, isInMyKit: !g.isInMyKit } : g
        )
      })),
      updateGarnish: (id, updates) => set((state) => ({
        garnishLibrary: state.garnishLibrary.map((g) => (g.id === id ? { ...g, ...updates } : g))
      })),
      addGarnish: (garnish) => set((state) => ({
        garnishLibrary: [...state.garnishLibrary, { ...garnish, id: `garnish-custom-${uuidv4()}`, isCustom: true }]
      })),
      deleteGarnish: (garnishId) => set((state) => ({
        garnishLibrary: state.garnishLibrary.filter((g) => g.id !== garnishId)
      })),

      // People
      addPerson: (person) => set((state) => ({
        people: [...state.people, { ...person, id: uuidv4(), tasteWeights: {} }]
      })),
      updatePerson: (id, updates) => set((state) => ({
        people: state.people.map((p) => (p.id === id ? { ...p, ...updates } : p))
      })),
      deletePerson: (id) => set((state) => ({
        people: state.people.filter((p) => p.id !== id)
      })),

      // Recipes
      addRecipe: (recipe) => set((state) => ({
        recipes: [...state.recipes, recipe]
      })),
      toggleFavorite: (recipeId) => set((state) => {
        const exists = state.favorites.includes(recipeId);
        return {
          favorites: exists 
            ? state.favorites.filter(id => id !== recipeId)
            : [...state.favorites, recipeId]
        };
      }),

      // History & Learning
      logHistory: (entry) => set((state) => {
        // Simple learning hook: Update user wood affinity if smoked
        let newAffinity = { ...state.settings.woodAffinity };
        if (entry.smoked && entry.rating && entry.rating >= 4) {
          const wood = entry.smoked.wood;
          newAffinity[wood] = (newAffinity[wood] || 0) + 1;
        }

        return {
          history: [...state.history, { ...entry, id: uuidv4() }],
          settings: { ...state.settings, woodAffinity: newAffinity }
        };
      }),

      // Settings
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates }
      })),

      // System
      loadSeedData: () => set((state) => ({
        woodLibrary: SEED_WOODS,
        recipes: SEED_RECIPES,
        // Mock inventory for demo
        inventory: [
          { id: uuidv4(), name: 'Bourbon Whiskey', category: 'spirit', quantity: 1, tags: ['whiskey'], updatedAt: Date.now() },
          { id: uuidv4(), name: 'Sweet Vermouth', category: 'liqueur', quantity: 1, tags: ['vermouth'], updatedAt: Date.now() },
          { id: uuidv4(), name: 'Angostura Bitters', category: 'bitters', quantity: 1, tags: ['bitters'], updatedAt: Date.now() },
          { id: uuidv4(), name: 'Campari', category: 'liqueur', quantity: 1, tags: ['amaro'], updatedAt: Date.now() },
          { id: uuidv4(), name: 'Gin', category: 'spirit', quantity: 1, tags: ['gin'], updatedAt: Date.now() },
        ],
        settings: { ...state.settings, hasSmoker: true }
      })),
      
      reset: () => set({
        inventory: [],
        woodLibrary: SEED_WOODS,
        garnishLibrary: SEED_GARNISHES,
        people: [],
        recipes: SEED_RECIPES,
        favorites: [],
        history: [],
        settings: {
          email: 'user@example.com',
          hasSmoker: false,
          smokerType: 'chimney' as SmokerDeviceType,
          defaultIntensity: 'medium',
          enableCostTracking: false,
          debugMode: false,
          woodAffinity: {}
        }
      })
    }),
    {
      name: 'barbuddy-hybrid-store',
    }
  )
);
