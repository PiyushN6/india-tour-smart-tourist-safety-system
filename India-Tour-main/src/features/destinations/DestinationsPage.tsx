import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useItinerary } from '../../context/ItineraryContext';
import { Place } from '../../types';
import { 
  MapPinIcon, 
  BuildingOffice2Icon
} from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import StateCard, { StateGroup as StateGroupCard } from '../../components/destinations/StateCard';
import CityCard, { CityGroup as CityGroupCard } from '../../components/destinations/CityCard';

interface CityGroup extends CityGroupCard {
  city: string;
  places: Place[];
  averageRating: number;
  totalDestinations: number;
  featuredPlace: Place;
  stateName: string;
}

interface StateGroup extends StateGroupCard {
  state: string;
  places: Place[];
  averageRating: number;
  totalDestinations: number;
  featuredPlace: Place;
  image_url?: string;
}

const DestinationsPage = () => {
  const location = useLocation();
  const { 
    places, 
    states, 
    cities,
    loading, 
    error,
    placesLoading,
    statesLoading,
    placesError,
    statesError
  } = useData();
  const { addState, addCity } = useItinerary();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [stateGroups, setStateGroups] = useState<StateGroup[]>([]);
  const [cityGroups, setCityGroups] = useState<CityGroup[]>([]);
  const [viewMode, setViewMode] = useState<'states' | 'cities'>('states');
  const [selectedState, setSelectedState] = useState<StateGroup | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityGroup | null>(null);

  // When arriving with /destinations?destination=..., prefill search box
  // and default to the Cities view so city names (e.g. Jabalpur) are visible
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const destination = params.get('destination');
    if (destination) {
      setSearchQuery(destination);
      setViewMode('cities');
      setSelectedState(null);
    }
  }, [location.search]);

  // Log states and places for debugging
  useEffect(() => {
    console.log('States:', states);
    console.log('Places:', places);
  }, [states, places]);

  // Group places by state
  useEffect(() => {
    if (!places.length || !states.length) return;

    // Create state groups
    const stateGroupsData = states.map(state => {
      const statePlaces = places.filter(place => 
        place.state?.toLowerCase() === state.name.toLowerCase()
      );
      
      const averageRating = statePlaces.length > 0
        ? statePlaces.reduce((sum, place) => sum + (place.rating || 0), 0) / statePlaces.length
        : 0;

      return {
        state: state.name,
        places: statePlaces,
        averageRating,
        totalDestinations: statePlaces.length,
        featuredPlace: statePlaces[0] || null,
        image_url: state.image_url
      };
    });

    setStateGroups(stateGroupsData);

    // Create city groups
    const cityMap = new Map<string, CityGroup>();
    
    places.forEach(place => {
      let cityName: string;
      if (typeof (place as any).city === 'string') {
        cityName = (place as any).city as string;
      } else {
        cityName = (place.city as any)?.name || 'Unknown City';
      }
      const stateName = place.state || 'Unknown State';
      const key = `${cityName}-${stateName}`;
      
      if (!cityMap.has(key)) {
        cityMap.set(key, {
          city: cityName,
          stateName: stateName,
          places: [],
          averageRating: 0,
          totalDestinations: 0,
          featuredPlace: place,
        });
      }
      
      const cityGroup = cityMap.get(key)!;
      cityGroup.places.push(place);
      cityGroup.totalDestinations = cityGroup.places.length;
      cityGroup.averageRating = cityGroup.places.reduce((sum, p) => sum + (p.rating || 0), 0) / cityGroup.places.length;
      
      // Update featured place to the one with highest rating
      if (place.rating && place.rating > (cityGroup.featuredPlace?.rating || 0)) {
        cityGroup.featuredPlace = place;
      }
    });

    setCityGroups(Array.from(cityMap.values()));
  }, [places, states]);

  const filteredStateGroups = useMemo(() => {
    if (!searchQuery.trim()) return stateGroups;
    
    const query = searchQuery.toLowerCase().trim();
    return stateGroups.filter(group => 
      group.state.toLowerCase().includes(query) ||
      group.places.some(place => 
        place.name.toLowerCase().includes(query) ||
        place.description?.toLowerCase().includes(query)
      )
    );
  }, [stateGroups, searchQuery]);

  const filteredCityGroups = useMemo(() => {
    if (!searchQuery.trim()) return cityGroups;
    
    const query = searchQuery.toLowerCase().trim();
    return cityGroups.filter(group => 
      group.city.toLowerCase().includes(query) ||
      group.stateName.toLowerCase().includes(query) ||
      group.places.some(place => 
        place.name.toLowerCase().includes(query) ||
        place.description?.toLowerCase().includes(query)
      )
    );
  }, [cityGroups, searchQuery]);

  // When in city view with a non-empty search, auto-select the first matching city
  // so that navigating from the hero (e.g. destination=Jabalpur) immediately
  // focuses the relevant city details.
  useEffect(() => {
    if (viewMode !== 'cities') return;
    if (!searchQuery.trim()) return;
    if (selectedCity) return; // don't override manual selections

    if (filteredCityGroups.length > 0) {
      setSelectedCity(filteredCityGroups[0]);
    }
  }, [viewMode, searchQuery, filteredCityGroups, selectedCity]);

  if (loading || placesLoading || statesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading destinations...</h2>
        </div>
      </div>
    );
  }

  if (error || placesError || statesError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">
            {error?.message || placesError?.message || statesError?.message || 'An error occurred while loading destinations.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Compact header row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] tracking-wide uppercase w-max shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-800">Destinations</span>
            </div>
            <h1 className="text-2xl sm:text-[2.1rem] font-semibold text-slate-900">Plan where youll go next</h1>
            <p className="text-[12px] sm:text-[13px] text-slate-500 max-w-xl">
              Browse India by state or city. Tap into a state to see its cities and places, or switch to cities to go straight to whats on your list.
            </p>
          </div>

          {/* Search + toggle */}
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search states, cities or places..."
                className="block w-full pl-9 pr-3 py-2.5 rounded-full border border-slate-200 bg-white text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-royal-blue/70 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="inline-flex rounded-full bg-white border border-slate-200 shadow-sm overflow-hidden self-start sm:self-auto">
              <button
                onClick={() => {
                  setViewMode('states');
                  setSelectedCity(null);
                }}
                className={`px-4 py-1.5 text-xs sm:text-[11px] font-medium tracking-wide uppercase ${
                  viewMode === 'states'
                    ? 'bg-slate-900 text-slate-50'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                By state
              </button>
              <button
                onClick={() => {
                  setViewMode('cities');
                  setSelectedState(null);
                }}
                className={`px-4 py-1.5 text-xs sm:text-[11px] font-medium tracking-wide uppercase ${
                  viewMode === 'cities'
                    ? 'bg-slate-900 text-slate-50'
                    : 'bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                By city
              </button>
            </div>
          </div>
        </div>

        {/* Main two-column layout: list + details */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.4fr)] items-start">
          {/* Left: lists */}
          <div className="space-y-3">
            {viewMode === 'states' && (
              <>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>States across India</span>
                  <span>
                    Showing {filteredStateGroups.length}{' '}
                    {filteredStateGroups.length === 1 ? 'state' : 'states'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredStateGroups.map((stateGroup) => (
                    <StateCard
                      key={stateGroup.state}
                      group={stateGroup}
                      allStates={states as any}
                      onAddState={addState as any}
                      onSelect={(group) => setSelectedState(group)}
                    />
                  ))}
                </div>

                {filteredStateGroups.length === 0 && (
                  <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200 bg-white/60">
                    <BuildingOffice2Icon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-slate-900">No states found</h3>
                    <p className="mt-1 text-[12px] text-slate-500">Try a different name or clear the search box.</p>
                  </div>
                )}
              </>
            )}

            {viewMode === 'cities' && (
              <>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Cities across India</span>
                  <span>
                    Showing {filteredCityGroups.length}{' '}
                    {filteredCityGroups.length === 1 ? 'city' : 'cities'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredCityGroups.map((cityGroup) => (
                    <div
                      key={`${cityGroup.city}-${cityGroup.stateName}`}
                      onClick={() => setSelectedCity(cityGroup)}
                      className="cursor-pointer"
                    >
                      <CityCard
                        group={cityGroup}
                        allCities={cities as any}
                        onAddCity={addCity as any}
                      />
                    </div>
                  ))}
                </div>

                {filteredCityGroups.length === 0 && (
                  <div className="text-center py-10 rounded-2xl border border-dashed border-slate-200 bg-white/60">
                    <MapPinIcon className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-medium text-slate-900">No cities found</h3>
                    <p className="mt-1 text-[12px] text-slate-500">Try a different name or clear the search box.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right: details drill-down panel */}
          <div className="rounded-3xl border border-slate-200 bg-white px-4 sm:px-5 py-4 sm:py-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] min-h-[260px]">
            {viewMode === 'states' && selectedState && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-1">State</p>
                    <h2 className="text-lg font-semibold text-slate-900">{selectedState.state}</h2>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                    onClick={() => setSelectedState(null)}
                  >
                    Clear
                  </button>
                </div>

                <p className="text-[12px] text-slate-500">
                  {selectedState.totalDestinations > 0
                    ? `${selectedState.totalDestinations} place${
                        selectedState.totalDestinations === 1 ? '' : 's'
                      } connected to this state.`
                    : 'No places linked to this state yet.'}
                </p>

                <div className="border-t border-slate-100 pt-3 space-y-2 max-h-[260px] overflow-y-auto">
                  {selectedState.places.map((place) => (
                    <div
                      key={place.id}
                      className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                    >
                      <div className="h-8 w-8 rounded-xl bg-slate-900 text-slate-50 flex items-center justify-center text-[11px] font-semibold">
                        {(place as any).city?.name?.[0] || place.name?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{place.name}</p>
                        {place.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2">{place.description}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {selectedState.places.length === 0 && (
                    <p className="text-[11px] text-slate-500">Well soon surface featured places for this state.</p>
                  )}
                </div>
              </div>
            )}

            {viewMode === 'cities' && selectedCity && (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400 mb-1">City</p>
                    <h2 className="text-lg font-semibold text-slate-900">{selectedCity.city}</h2>
                    <p className="text-[11px] text-slate-500">{selectedCity.stateName}</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 px-3 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                    onClick={() => setSelectedCity(null)}
                  >
                    Clear
                  </button>
                </div>

                <p className="text-[12px] text-slate-500">
                  {selectedCity.totalDestinations > 0
                    ? `${selectedCity.totalDestinations} place${
                        selectedCity.totalDestinations === 1 ? '' : 's'
                      } in this city.`
                    : 'No places linked to this city yet.'}
                </p>

                <div className="border-t border-slate-100 pt-3 space-y-2 max-h-[260px] overflow-y-auto">
                  {selectedCity.places.map((place) => (
                    <div
                      key={place.id}
                      className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                    >
                      <div className="h-8 w-8 rounded-xl bg-slate-900 text-slate-50 flex items-center justify-center text-[11px] font-semibold">
                        {(place as any).city?.name?.[0] || place.name?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">{place.name}</p>
                        {place.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2">{place.description}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {selectedCity.places.length === 0 && (
                    <p className="text-[11px] text-slate-500">Well soon surface featured places for this city.</p>
                  )}
                </div>
              </div>
            )}

            {viewMode === 'states' && !selectedState && (
              <div className="h-full flex flex-col items-center justify-center text-center text-[12px] text-slate-500">
                <p className="font-medium text-slate-700 mb-1">Pick a state on the left to see its cities and places here.</p>
                <p>Use this panel as your planning canvas while you build itineraries.</p>
              </div>
            )}

            {viewMode === 'cities' && !selectedCity && (
              <div className="h-full flex flex-col items-center justify-center text-center text-[12px] text-slate-500">
                <p className="font-medium text-slate-700 mb-1">Pick a city on the left to see its places here.</p>
                <p>Perfect for zeroing in on where you actually want to stay and explore.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DestinationsPage;
