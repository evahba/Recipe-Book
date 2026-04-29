import { create } from 'zustand';
import axios from 'axios';

export interface RecipeData {
  servingsPerBatch: Record<string, number>;
  postCookedWeightOz: Record<string, number>;
  holdTempF: number;
  cookTempF: number;
  sections: {
    name: string;
    ingredients: {
      name: string;
      unit: string;
      quantities: Record<string, string>;
    }[];
    cookTime?: Record<string, string>;
  }[];
  steps: { n: number; section: string; text: string }[];
  qualityGuide?: {
    standard: { imageUrl: string; items: string[] };
    overheld: { imageUrl: string; items: string[] };
    executionIssues: { imageUrl: string; items: string[] };
    resolvingExecutionIssues: { issue: string; cause: string; correctiveAction: string; imageUrl: string }[];
  };
  bestPractices?: {
    n: number;
    text: string;
    imageUrl: string;
    badge?: { text: string; color: string; icon?: 'temp' | 'time' };
  }[];
  qualityChecks?: {
    n: number;
    title?: string;
    text: string;
    why?: string;
    imageUrl: string;
  }[];
  comparisons?: {
    title: string;
    subtitle: string;
    points: string[];
    good: {
      imageUrl: string;
      label: string;
      points?: string[];
      highlights?: { text: string; x: number; y: number }[];
    };
    bad: {
      imageUrl: string;
      label: string;
      points?: string[];
      highlights?: { text: string; x: number; y: number }[];
    };
  }[];
  executionOverview?: { imageUrl: string; title: string; points: string[] };
  executionIssues?: { imageUrl: string; title: string; cause: string; correctiveAction: string }[];
}

export interface MenuItem {
  id: number;
  code: string;
  title: string;
  station: string;
  batchSizes: string[];
  color: string;
  imageUrl: string | null;
  recommendedBatch: Record<string, string> | null;
  enabled: boolean;
  holdTime: number;
  cookTimes: Record<string, number>;
  ingredients?: string[] | null;
  allergens?: string[] | null;
  recipe?: RecipeData | null;
  nutrition?: {
    serving_size_oz?: number;
    calories_kcal?: number;
    protein_g?: number;
    carbohydrate_g?: number;
    saturated_fat_g?: number;
  } | null;
}

interface MenuStore {
  items: MenuItem[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
}

const port = Number(window.location.port);
export const API_URL: string = import.meta.env.VITE_API_URL ||
  ((port >= 5173 && port <= 5300) ? `http://${window.location.hostname}:3001` : window.location.origin);

function fixUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return import.meta.env.VITE_API_URL ? `${API_URL}${url}` : url;
}

function fixRecipeUrls(recipe: RecipeData): RecipeData {
  return {
    ...recipe,
    bestPractices: recipe.bestPractices?.map(bp => ({ ...bp, imageUrl: fixUrl(bp.imageUrl) ?? bp.imageUrl })),
    qualityChecks: recipe.qualityChecks?.map(qc => ({ ...qc, imageUrl: fixUrl(qc.imageUrl) ?? qc.imageUrl })),
    comparisons: recipe.comparisons?.map(c => ({
      ...c,
      good: { ...c.good, imageUrl: fixUrl(c.good.imageUrl) ?? c.good.imageUrl },
      bad:  { ...c.bad,  imageUrl: fixUrl(c.bad.imageUrl)  ?? c.bad.imageUrl  },
    })),
    executionOverview: recipe.executionOverview
      ? { ...recipe.executionOverview, imageUrl: fixUrl(recipe.executionOverview.imageUrl) ?? recipe.executionOverview.imageUrl }
      : undefined,
    executionIssues: recipe.executionIssues?.map(ei => ({ ...ei, imageUrl: fixUrl(ei.imageUrl) ?? ei.imageUrl })),
    qualityGuide: recipe.qualityGuide ? {
      standard:        { ...recipe.qualityGuide.standard,        imageUrl: fixUrl(recipe.qualityGuide.standard.imageUrl)        ?? recipe.qualityGuide.standard.imageUrl },
      overheld:        { ...recipe.qualityGuide.overheld,        imageUrl: fixUrl(recipe.qualityGuide.overheld.imageUrl)        ?? recipe.qualityGuide.overheld.imageUrl },
      executionIssues: { ...recipe.qualityGuide.executionIssues, imageUrl: fixUrl(recipe.qualityGuide.executionIssues.imageUrl) ?? recipe.qualityGuide.executionIssues.imageUrl },
      resolvingExecutionIssues: recipe.qualityGuide.resolvingExecutionIssues?.map(r => ({ ...r, imageUrl: fixUrl(r.imageUrl) ?? r.imageUrl })),
    } : undefined,
  };
}

export const useMenuStore = create<MenuStore>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  fetchAll: async () => {
    if (get().items.length > 0) return;
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/api/menu/all`);
      const items: MenuItem[] = (res.data.items || []).map((item: MenuItem) => ({
        ...item,
        imageUrl: fixUrl(item.imageUrl),
        recipe: item.recipe ? fixRecipeUrls(item.recipe) : null,
      }));
      set({ items });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      set({ error: `Failed to load recipes: ${message}` });
    } finally {
      set({ loading: false });
    }
  },
}));
