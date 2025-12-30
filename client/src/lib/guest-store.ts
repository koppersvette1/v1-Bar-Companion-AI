import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GuestDrink {
  id: string;
  recipeId: string;
  recipeName: string;
  timestamp: number;
  tuning?: Record<string, any>;
  smoked?: { wood: string; time: number; method: string };
}

export interface GuestFlight {
  id: string;
  name: string;
  category: 'alcoholic' | 'na' | 'kid-friendly';
  theme: string;
  recipeIds: string[];
  ratings: Record<string, 'love' | 'like' | 'meh' | 'nope'>;
  winnerId?: string;
  createdAt: number;
}

export interface GuestSmokerSettings {
  smokerType: 'chimney' | 'cloche' | 'smoking-gun' | 'torch';
  defaultIntensity: 'light' | 'medium' | 'bold' | 'very-strong';
  lastWood?: string;
  lastTime?: number;
  lastMethod?: string;
}

export interface GuestPerson {
  id: string;
  name: string;
  isTemporary: true;
}

interface GuestState {
  recentDrinks: GuestDrink[];
  viewedRecipeIds: string[];
  flights: GuestFlight[];
  smokerSettings: GuestSmokerSettings;
  tempPeople: GuestPerson[];
  pendingFavorites: string[];
  
  addRecentDrink: (drink: GuestDrink) => void;
  addViewedRecipe: (recipeId: string) => void;
  
  addFlight: (flight: Omit<GuestFlight, 'id' | 'createdAt' | 'ratings'>) => string;
  updateFlightRating: (flightId: string, recipeId: string, vote: 'love' | 'like' | 'meh' | 'nope') => void;
  setFlightWinner: (flightId: string, recipeId: string) => void;
  
  updateSmokerSettings: (settings: Partial<GuestSmokerSettings>) => void;
  
  addTempPerson: (name: string) => string;
  removeTempPerson: (id: string) => void;
  
  addPendingFavorite: (recipeId: string) => void;
  removePendingFavorite: (recipeId: string) => void;
  
  getExportData: () => GuestExportData;
  clearAllData: () => void;
}

export interface GuestExportData {
  recentDrinks: GuestDrink[];
  flights: GuestFlight[];
  smokerSettings: GuestSmokerSettings;
  pendingFavorites: string[];
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useGuestStore = create<GuestState>()(
  persist(
    (set, get) => ({
      recentDrinks: [],
      viewedRecipeIds: [],
      flights: [],
      smokerSettings: {
        smokerType: 'chimney',
        defaultIntensity: 'medium',
      },
      tempPeople: [],
      pendingFavorites: [],

      addRecentDrink: (drink) => set((state) => ({
        recentDrinks: [drink, ...state.recentDrinks].slice(0, 50),
      })),

      addViewedRecipe: (recipeId) => set((state) => ({
        viewedRecipeIds: [recipeId, ...state.viewedRecipeIds.filter(id => id !== recipeId)].slice(0, 100),
      })),

      addFlight: (flight) => {
        const id = generateId();
        set((state) => ({
          flights: [{
            ...flight,
            id,
            createdAt: Date.now(),
            ratings: {},
          }, ...state.flights],
        }));
        return id;
      },

      updateFlightRating: (flightId, recipeId, vote) => set((state) => ({
        flights: state.flights.map(f => 
          f.id === flightId 
            ? { ...f, ratings: { ...f.ratings, [recipeId]: vote } }
            : f
        ),
      })),

      setFlightWinner: (flightId, recipeId) => set((state) => ({
        flights: state.flights.map(f => 
          f.id === flightId ? { ...f, winnerId: recipeId } : f
        ),
      })),

      updateSmokerSettings: (settings) => set((state) => ({
        smokerSettings: { ...state.smokerSettings, ...settings },
      })),

      addTempPerson: (name) => {
        const id = generateId();
        set((state) => ({
          tempPeople: [...state.tempPeople, { id, name, isTemporary: true }],
        }));
        return id;
      },

      removeTempPerson: (id) => set((state) => ({
        tempPeople: state.tempPeople.filter(p => p.id !== id),
      })),

      addPendingFavorite: (recipeId) => set((state) => ({
        pendingFavorites: state.pendingFavorites.includes(recipeId) 
          ? state.pendingFavorites 
          : [...state.pendingFavorites, recipeId],
      })),

      removePendingFavorite: (recipeId) => set((state) => ({
        pendingFavorites: state.pendingFavorites.filter(id => id !== recipeId),
      })),

      getExportData: () => {
        const state = get();
        return {
          recentDrinks: state.recentDrinks,
          flights: state.flights,
          smokerSettings: state.smokerSettings,
          pendingFavorites: state.pendingFavorites,
        };
      },

      clearAllData: () => set({
        recentDrinks: [],
        viewedRecipeIds: [],
        flights: [],
        smokerSettings: {
          smokerType: 'chimney',
          defaultIntensity: 'medium',
        },
        tempPeople: [],
        pendingFavorites: [],
      }),
    }),
    {
      name: 'barbuddy-guest-session',
    }
  )
);
