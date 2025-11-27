import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { Place, City, State } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type ItineraryItemType = 'state' | 'city' | 'place';

export interface BaseItineraryItem {
  id: string; // unique key like `type:id`
  type: ItineraryItemType;
  stateId?: string;
  cityId?: string;
  placeId?: string;
  cityName?: string;
  stateName?: string;
  day?: number;
  date?: string; // ISO date string or simple yyyy-mm-dd
  notes?: string;
}

interface ItineraryContextType {
  items: BaseItineraryItem[];
  addState: (state: State) => void;
  addCity: (city: City) => void;
  addPlace: (place: Place) => void;
  removeItem: (itemId: string) => void;
  clear: () => void;
  updateItem: (itemId: string, updates: Partial<BaseItineraryItem>) => void;
}

const ItineraryContext = createContext<ItineraryContextType | undefined>(undefined);

export const useItinerary = (): ItineraryContextType => {
  const ctx = useContext(ItineraryContext);
  if (!ctx) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return ctx;
};

const buildItemId = (type: ItineraryItemType, id: string) => `${type}:${id}`;

export const ItineraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<BaseItineraryItem[]>([]);
  const [hasLoadedFromSupabase, setHasLoadedFromSupabase] = useState(false);
  const { user, isAuthenticated, loading } = useAuth();

  const requireAuth = () => {
    // Allow actions as soon as Supabase session exists, even if profile "user" is still loading.
    // This avoids blocking logged-in users whose profile row hasn't loaded yet.
    if (!isAuthenticated) {
      if (!loading && typeof window !== 'undefined') {
        window.alert('Please log in first to create an itinerary.');
      }
      return false;
    }
    return true;
  };

  const addState = useCallback((state: State) => {
    if (!state?.id) return;
    const id = buildItemId('state', state.id);
    setItems(prev => {
      if (prev.some(item => item.id === id)) return prev;
      return [
        ...prev,
        {
          id,
          type: 'state',
          stateId: state.id,
        },
      ];
    });
  }, []);

  const addCity = useCallback((city: City) => {
    if (!city?.id) return;
    const id = buildItemId('city', city.id);
    setItems(prev => {
      if (prev.some(item => item.id === id)) return prev;
      return [
        ...prev,
        {
          id,
          type: 'city',
          cityId: city.id,
          stateId: city.state_id,
          cityName: city.name,
          stateName: (city as any).state || (city as any)?.state_details?.name,
        },
      ];
    });
  }, []);

  const addPlace = useCallback((place: Place) => {
    if (!place?.id) return;
    const id = buildItemId('place', place.id);
    setItems(prev => {
      if (prev.some(item => item.id === id)) return prev;
      return [
        ...prev,
        {
          id,
          type: 'place',
          placeId: place.id,
          stateId: (place as any).state_id || undefined,
          cityId: place.city_id,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const updateItem = useCallback((itemId: string, updates: Partial<BaseItineraryItem>) => {
    setItems(prev => prev.map(item => (item.id === itemId ? { ...item, ...updates } : item)));
  }, []);

  // Wrap mutations to enforce authentication
  const guardedAddState = useCallback(
    (state: State) => {
      if (!requireAuth()) return;
      addState(state);
    },
    [addState, requireAuth]
  );

  const guardedAddCity = useCallback(
    (city: City) => {
      if (!requireAuth()) return;
      addCity(city);
    },
    [addCity, requireAuth]
  );

  const guardedAddPlace = useCallback(
    (place: Place) => {
      if (!requireAuth()) return;
      addPlace(place);
    },
    [addPlace, requireAuth]
  );

  const guardedRemoveItem = useCallback(
    (itemId: string) => {
      if (!requireAuth()) return;
      removeItem(itemId);
    },
    [removeItem, requireAuth]
  );

  const guardedClear = useCallback(() => {
    if (!requireAuth()) return;
    clear();
  }, [clear, requireAuth]);

  const guardedUpdateItem = useCallback(
    (itemId: string, updates: Partial<BaseItineraryItem>) => {
      if (!requireAuth()) return;
      updateItem(itemId, updates);
    },
    [updateItem, requireAuth]
  );

  // Load existing itinerary from Supabase when user logs in
  useEffect(() => {
    const loadFromSupabase = async () => {
      if (!user || !isAuthenticated) {
        setItems([]);
        setHasLoadedFromSupabase(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_itineraries')
          .select('items')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading itinerary from Supabase:', error);
          return;
        }

        if (data && Array.isArray(data.items)) {
          setItems(data.items as BaseItineraryItem[]);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error('Unexpected error loading itinerary:', err);
      } finally {
        setHasLoadedFromSupabase(true);
      }
    };

    // Only attempt load when auth has finished
    if (!loading) {
      loadFromSupabase();
    }
  }, [user, isAuthenticated, loading]);

  // Persist itinerary to Supabase whenever it changes for a logged-in user
  useEffect(() => {
    const saveToSupabase = async () => {
      if (!user || !isAuthenticated || !hasLoadedFromSupabase) return;

      try {
        const { error } = await supabase
          .from('user_itineraries')
          .upsert(
            {
              user_id: user.id,
              items,
            },
            {
              onConflict: 'user_id',
            }
          );

        if (error) {
          console.error('Error saving itinerary to Supabase:', error);
        }
      } catch (err) {
        console.error('Unexpected error saving itinerary:', err);
      }
    };

    saveToSupabase();
  }, [items, user, isAuthenticated, hasLoadedFromSupabase]);

  const value = useMemo<ItineraryContextType>(
    () => ({
      items,
      addState: guardedAddState,
      addCity: guardedAddCity,
      addPlace: guardedAddPlace,
      removeItem: guardedRemoveItem,
      clear: guardedClear,
      updateItem: guardedUpdateItem,
    }),
    [items, guardedAddState, guardedAddCity, guardedAddPlace, guardedRemoveItem, guardedClear, guardedUpdateItem]
  );

  return <ItineraryContext.Provider value={value}>{children}</ItineraryContext.Provider>;
};
