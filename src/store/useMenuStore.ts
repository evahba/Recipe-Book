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
  fetchAll: () => Promise<void>;
}

const DEV_PORTS = ['5173', '5174', '5175', '5176', '5177', '5178', '5179', '5180'];
export const API_URL = DEV_PORTS.includes(window.location.port)
  ? `http://${window.location.hostname}:3001`
  : window.location.origin;

export const useMenuStore = create<MenuStore>((set) => ({
  items: [],
  loading: false,
  fetchAll: async () => {
    set({ loading: true });
    try {
      const res = await axios.get(`${API_URL}/api/menu/all`);
      set({ items: res.data.items });
    } finally {
      set({ loading: false });
    }
  },
}));
