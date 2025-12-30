import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { PersonProfile, InventoryItem, HistoryEntry, UserSettings, Recipe } from './store';
import type { BatchGenerationResult, BatchGenerationParams } from '@shared/generation-types';

const API_BASE = '/api';

export class GenerationError extends Error {
  endpoint: string;
  status: number;
  responseText: string;
  
  constructor(endpoint: string, status: number, responseText: string) {
    super(`Generation failed: ${status} from ${endpoint}`);
    this.name = 'GenerationError';
    this.endpoint = endpoint;
    this.status = status;
    this.responseText = responseText.slice(0, 200);
  }
}

export async function generateBatch(params: BatchGenerationParams): Promise<BatchGenerationResult> {
  const endpoint = `${API_BASE}/generation/batch`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    
    const responseText = await response.text();
    
    if (import.meta.env.DEV) {
      console.log('[Generation API] Response:', { 
        status: response.status, 
        ok: response.ok,
        text: responseText.slice(0, 500) 
      });
    }
    
    if (!response.ok) {
      throw new GenerationError(endpoint, response.status, responseText);
    }
    
    let result: BatchGenerationResult;
    try {
      result = JSON.parse(responseText);
    } catch {
      throw new GenerationError(endpoint, response.status, `Invalid JSON: ${responseText}`);
    }
    
    if (import.meta.env.DEV) {
      console.log('[Generation API] Parsed result:', {
        alcoholic: result.alcoholic?.length ?? 0,
        mocktailsNA: result.mocktailsNA?.length ?? 0,
        kidMocktailsNA: result.kidMocktailsNA?.length ?? 0,
        validationPassed: result.validationPassed,
      });
    }
    
    return result;
  } catch (error) {
    if (error instanceof GenerationError) {
      throw error;
    }
    throw new GenerationError(endpoint, 0, error instanceof Error ? error.message : String(error));
  }
}

// ====== PEOPLE ======
export function usePeople() {
  return useQuery({
    queryKey: ['people'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/people`);
      if (!res.ok) throw new Error('Failed to fetch people');
      return res.json();
    },
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (person: Omit<PersonProfile, 'id' | 'tasteWeights'>) => {
      const res = await fetch(`${API_BASE}/people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(person),
      });
      if (!res.ok) throw new Error('Failed to create person');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<PersonProfile> }) => {
      const res = await fetch(`${API_BASE}/people/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update person');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/people/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete person');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] });
    },
  });
}

// ====== INVENTORY ======
export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/inventory`);
      if (!res.ok) throw new Error('Failed to fetch inventory');
      return res.json();
    },
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: Omit<InventoryItem, 'id' | 'updatedAt'>) => {
      const res = await fetch(`${API_BASE}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!res.ok) throw new Error('Failed to create inventory item');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InventoryItem> }) => {
      const res = await fetch(`${API_BASE}/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update inventory item');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/inventory/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete inventory item');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

// ====== HISTORY ======
export function useHistory() {
  return useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/history`);
      if (!res.ok) throw new Error('Failed to fetch history');
      return res.json();
    },
  });
}

export function useCreateHistoryEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: Omit<HistoryEntry, 'id'>) => {
      const res = await fetch(`${API_BASE}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
      if (!res.ok) throw new Error('Failed to create history entry');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] });
    },
  });
}

// ====== FAVORITES ======
export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/favorites`);
      if (!res.ok) throw new Error('Failed to fetch favorites');
      const data = await res.json();
      return data.map((f: any) => f.recipeId);
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ recipeId, isFavorite }: { recipeId: string; isFavorite: boolean }) => {
      if (isFavorite) {
        const res = await fetch(`${API_BASE}/favorites/${recipeId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to remove favorite');
      } else {
        const res = await fetch(`${API_BASE}/favorites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipeId }),
        });
        if (!res.ok) throw new Error('Failed to add favorite');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });
}

// ====== WOOD KIT ======
export function useWoodKit() {
  return useQuery({
    queryKey: ['woodKit'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/wood-kit`);
      if (!res.ok) throw new Error('Failed to fetch wood kit');
      return res.json();
    },
  });
}

export function useUpdateWoodKit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ woodId, isInKit }: { woodId: string; isInKit: boolean }) => {
      const res = await fetch(`${API_BASE}/wood-kit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ woodId, isInKit }),
      });
      if (!res.ok) throw new Error('Failed to update wood kit');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['woodKit'] });
    },
  });
}

// ====== SETTINGS ======
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/settings`);
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

// ====== CUSTOM RECIPES ======
export function useCustomRecipes() {
  return useQuery({
    queryKey: ['customRecipes'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/recipes`);
      if (!res.ok) throw new Error('Failed to fetch recipes');
      return res.json();
    },
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (recipe: Omit<Recipe, 'createdAt'>) => {
      const res = await fetch(`${API_BASE}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipe),
      });
      if (!res.ok) throw new Error('Failed to create recipe');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customRecipes'] });
    },
  });
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/recipes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete recipe');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customRecipes'] });
    },
  });
}
