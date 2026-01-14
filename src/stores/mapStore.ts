import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LayerId, LayersState } from '../types/map.types';

interface MapStore {
  layers: LayersState;
  toggleLayer: (id: LayerId) => void;
}

const initialLayersState: LayersState = {
  countries: {
    id: 'countries',
    label: 'Countries',
    enabled: true, // SIEMPRE habilitado por defecto - necesario para que el mapa se vea
    zIndex: 100,
    order: 1,
  },
  hotspots: {
    id: 'hotspots',
    label: 'Hotspots',
    enabled: true,
    zIndex: 300,
    order: 3,
  },
  conflicts: {
    id: 'conflicts',
    label: 'Conflict Zones',
    enabled: true,
    zIndex: 200,
    order: 2,
  },
  cables: {
    id: 'cables',
    label: 'Cable Landings',
    enabled: false,
    zIndex: 400,
    order: 4,
  },
  nuclear: {
    id: 'nuclear',
    label: 'Nuclear Sites',
    enabled: false,
    zIndex: 400,
    order: 5,
  },
  military: {
    id: 'military',
    label: 'Military Bases',
    enabled: false,
    zIndex: 400,
    order: 6,
  },
  rssCountries: {
    id: 'rss-countries',
    label: 'RSS Countries',
    enabled: true,
    zIndex: 500,
    order: 7,
  },
};

export const useMapStore = create<MapStore>()(
  persist(
    (set) => ({
      layers: initialLayersState,
      toggleLayer: (id: LayerId) =>
        set((state) => {
          // Mapear 'rss-countries' a 'rssCountries' para coincidir con la clave del objeto
          const layerKey: keyof LayersState = id === 'rss-countries' ? 'rssCountries' : (id as keyof LayersState);
          const layer = state.layers[layerKey];
          
          // Asegurar que la capa existe, si no, usar el estado inicial como fallback
          if (!layer) {
            const fallbackLayer = initialLayersState[layerKey];
            if (!fallbackLayer) {
              console.warn(`Layer ${id} not found in state or initial state`);
              return state;
            }
            return {
              layers: {
                ...state.layers,
                [layerKey]: {
                  ...fallbackLayer,
                  enabled: !fallbackLayer.enabled,
                },
              },
            };
          }
          
          return {
            layers: {
              ...state.layers,
              [layerKey]: {
                ...layer,
                enabled: !layer.enabled,
              },
            },
          };
        }),
    }),
    {
      name: 'map-monitor-layers',
      partialize: (state) => ({
        layers: {
          countries: { ...state.layers.countries, enabled: state.layers.countries.enabled },
          hotspots: { ...state.layers.hotspots, enabled: state.layers.hotspots.enabled },
          conflicts: { ...state.layers.conflicts, enabled: state.layers.conflicts.enabled },
          cables: { ...state.layers.cables, enabled: state.layers.cables.enabled },
          nuclear: { ...state.layers.nuclear, enabled: state.layers.nuclear.enabled },
          military: { ...state.layers.military, enabled: state.layers.military.enabled },
          rssCountries: { ...state.layers.rssCountries, enabled: state.layers.rssCountries.enabled },
        },
      }),
      merge: (persistedState: any, currentState) => {
        // Merge asegura que siempre tengamos todas las capas, incluso si el estado persistido es antiguo
        const persistedLayers = persistedState?.layers || {};
        return {
          ...currentState,
          layers: {
            ...initialLayersState,
            ...persistedLayers,
            // Asegurar que cada capa tenga todas sus propiedades
            // IMPORTANTE: countries siempre debe estar enabled para que el mapa se vea
            countries: {
              ...initialLayersState.countries,
              ...persistedLayers.countries,
              enabled: true, // Forzar enabled=true siempre para countries
            },
            hotspots: {
              ...initialLayersState.hotspots,
              ...persistedLayers.hotspots,
            },
            conflicts: {
              ...initialLayersState.conflicts,
              ...persistedLayers.conflicts,
            },
            cables: {
              ...initialLayersState.cables,
              ...persistedLayers.cables,
            },
            nuclear: {
              ...initialLayersState.nuclear,
              ...persistedLayers.nuclear,
            },
            military: {
              ...initialLayersState.military,
              ...persistedLayers.military,
            },
            rssCountries: {
              ...initialLayersState.rssCountries,
              ...persistedLayers.rssCountries,
            },
          },
        };
      },
    }
  )
);

