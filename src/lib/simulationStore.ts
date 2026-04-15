import { create } from "zustand";
import { SolarParams, SolarMetrics, IVPoint, computeSolarMetrics } from "./solarPhysics";

export interface SavedConfig {
  id: string;
  name: string;
  params: SolarParams;
  metrics: SolarMetrics;
  ivCurve: IVPoint[];
}

interface SimulationStore {
  params: SolarParams;
  metrics: SolarMetrics;
  ivCurve: IVPoint[];
  savedConfigs: SavedConfig[];
  darkMode: boolean;
  setParam: <K extends keyof SolarParams>(key: K, value: SolarParams[K]) => void;
  setParams: (params: Partial<SolarParams>) => void;
  saveConfig: (name: string) => void;
  removeConfig: (id: string) => void;
  toggleDarkMode: () => void;
}

const defaultParams: SolarParams = {
  irradiance: 1000,
  temperature: 25,
  idealityFactor: 1.0,
  seriesResistance: 0.5,
  shuntResistance: 300,
  cellArea: 4,
  material: "silicon_mono",
};

const { metrics: defaultMetrics, ivCurve: defaultIVCurve } = computeSolarMetrics(defaultParams);

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  params: defaultParams,
  metrics: defaultMetrics,
  ivCurve: defaultIVCurve,
  savedConfigs: [],
  darkMode: true,

  setParam: (key, value) => {
    const newParams = { ...get().params, [key]: value };
    const { metrics, ivCurve } = computeSolarMetrics(newParams);
    set({ params: newParams, metrics, ivCurve });
  },

  setParams: (partial) => {
    const newParams = { ...get().params, ...partial };
    const { metrics, ivCurve } = computeSolarMetrics(newParams);
    set({ params: newParams, metrics, ivCurve });
  },

  saveConfig: (name) => {
    const { params, metrics, ivCurve, savedConfigs } = get();
    if (savedConfigs.length >= 4) return;
    const newConfig: SavedConfig = {
      id: Date.now().toString(),
      name,
      params: { ...params },
      metrics: { ...metrics },
      ivCurve: [...ivCurve],
    };
    set({ savedConfigs: [...savedConfigs, newConfig] });
  },

  removeConfig: (id) => {
    set((state) => ({ savedConfigs: state.savedConfigs.filter((c) => c.id !== id) }));
  },

  toggleDarkMode: () => {
    const next = !get().darkMode;
    set({ darkMode: next });
    if (next) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },
}));
