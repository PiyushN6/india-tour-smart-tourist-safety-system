import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { Place, City, State } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { saveItineraryBackend, clearItineraryBackend } from '../services/safetyApi';

export type ItineraryItemType = 'state' | 'city' | 'place';

export interface BaseItineraryItem {
  id: string; // unique key like `type:id`
  type: ItineraryItemType;
  stateId?: string;
  cityId?: string;
  placeId?: string;
  // Human-readable labels to make the stored JSON easy to inspect and debug
  name?: string; // generic name (state/city/place)
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
  tripNote: string;
  setTripNote: (note: string) => void;
  saveItinerary: () => Promise<void>;
  isSaving: boolean;
  lastSavedAt: Date | null;
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
  const [tripNote, setTripNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const { user, isAuthenticated, loading } = useAuth();

  const requireAuth = () => {
    // Treat the presence of a Supabase user as the primary signal for itinerary access.
    // This avoids blocking logged-in users if the custom isAuthenticated flag lags behind.
    if (!user) {
      if (!loading && typeof window !== 'undefined') {
        window.alert('Please log in first to create an itinerary.');
      }
      return false;
    }
    return true;
  };

  const addState = useCallback((state: State) => {
    if (!state?.id) return false;
    const id = buildItemId('state', state.id);
    let added = false;
    setItems(prev => {
      if (prev.some(item => item.id === id)) return prev;
      added = true;
      return [
        ...prev,
        {
          id,
          type: 'state',
          stateId: state.id,
          name: (state as any).name ?? undefined,
          stateName: (state as any).name ?? undefined,
          day: 1,
        },
      ];
    });
    // If we never toggled `added`, the item was already present.
    return added ? true : 'duplicate';
  }, []);

  const addCity = useCallback((city: City) => {
    if (!city?.id) return false;
    const id = buildItemId('city', city.id);
    let added = false;
    setItems(prev => {
      if (prev.some(item => item.id === id)) return prev;
      added = true;
      return [
        ...prev,
        {
          id,
          type: 'city',
          cityId: city.id,
          stateId: city.state_id,
          name: city.name,
          cityName: city.name,
          stateName: (city as any).state || (city as any)?.state_details?.name,
          day: 1,
        },
      ];
    });
    return added ? true : 'duplicate';
  }, []);

  const addPlace = useCallback((place: Place) => {
    if (!place?.id) return false;
    const id = buildItemId('place', place.id);
    let added = false;
    setItems(prev => {
      if (prev.some(item => item.id === id)) return prev;
      added = true;
      return [
        ...prev,
        {
          id,
          type: 'place',
          placeId: place.id,
          stateId: (place as any).state_id || undefined,
          cityId: place.city_id,
          name: place.name,
          cityName: (place as any).city?.name,
          stateName: (place as any).state || undefined,
          day: 1,
        },
      ];
    });
    return added ? true : 'duplicate';
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const clear = useCallback(() => {
    // Always clear the local UI immediately
    setItems([]);
    setTripNote('');

    // Also clear the persisted itinerary for logged-in users (fire-and-forget)
    if (!user) return;

    clearItineraryBackend(user.id).catch(err => {
      console.error('Error clearing itinerary via safety API backend:', err);
    });
  }, [user]);

  const updateItem = useCallback((itemId: string, updates: Partial<BaseItineraryItem>) => {
    setItems(prev => prev.map(item => (item.id === itemId ? { ...item, ...updates } : item)));
  }, []);

  // Wrap mutations to enforce authentication
  const guardedAddState = useCallback(
    (state: State) => {
      if (!requireAuth()) return false;
      return addState(state);
    },
    [addState, requireAuth]
  );

  const guardedAddCity = useCallback(
    (city: City) => {
      if (!requireAuth()) return false;
      return addCity(city);
    },
    [addCity, requireAuth]
  );

  const guardedAddPlace = useCallback(
    (place: Place) => {
      if (!requireAuth()) return false;
      return addPlace(place);
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

  // Manual save function: persists current itinerary only when explicitly invoked
  const saveItinerary = useCallback(async () => {
    if (!user) {
      return;
    }

    const itemsToSave = [...items].sort((a, b) => (a.day || 1) - (b.day || 1));

    try {
      setIsSaving(true);
      const response = await saveItineraryBackend({
        user_id: user.id,
        items: itemsToSave,
        trip_note: tripNote || null,
      });

      console.log('Itinerary saved via safety API backend:', response);
      const now = new Date();
      setLastSavedAt(now);

      // Automatically clear the Saved label after a short delay
      if (typeof window !== 'undefined') {
        window.setTimeout(() => {
          // Only clear if lastSavedAt still matches this save, to avoid
          // wiping out a more recent "Saved" state.
          setLastSavedAt(current => {
            if (!current) return current;
            return current.getTime() === now.getTime() ? null : current;
          });
        }, 2000);
      }
    } catch (err) {
      console.error('Error saving itinerary via safety API backend:', err);
    } finally {
      setIsSaving(false);
    }
  }, [user, loading, items, tripNote]);

  // Load existing itinerary from Supabase when user logs in
  useEffect(() => {
    const loadFromSupabase = async () => {
      if (!user) {
        setItems([]);
        setTripNote('');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_itineraries_v2')
          .select('items, trip_note')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading itinerary from Supabase:', error);
          return;
        }

        if (data) {
          if (Array.isArray((data as any).items)) {
            setItems((data as any).items as BaseItineraryItem[]);
          } else {
            setItems([]);
          }
          setTripNote(((data as any).trip_note as string) || '');
        } else {
          setItems([]);
          setTripNote('');
        }
      } catch (err) {
        console.error('Unexpected error loading itinerary:', err);
      }
    };

    // Only attempt load when auth has finished
    if (!loading) {
      loadFromSupabase();
    }
  }, [user, isAuthenticated, loading]);

  const value = useMemo<ItineraryContextType>(
    () => ({
      items,
      addState: guardedAddState,
      addCity: guardedAddCity,
      addPlace: guardedAddPlace,
      removeItem: guardedRemoveItem,
      clear: guardedClear,
      updateItem: guardedUpdateItem,
      tripNote,
      setTripNote,
      saveItinerary,
      isSaving,
      lastSavedAt,
    }),
    [items, guardedAddState, guardedAddCity, guardedAddPlace, guardedRemoveItem, guardedClear, guardedUpdateItem, tripNote, saveItinerary, isSaving, lastSavedAt]
  );

  return <ItineraryContext.Provider value={value}>{children}</ItineraryContext.Provider>;
};
