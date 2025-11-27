import { useEffect, useState, useMemo } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore India's Wonders</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the rich diversity of India's states and cities, each offering unique experiences and breathtaking destinations.
          </p>
        </div>

        {/* Search and Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search destinations, states, or cities..."
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex rounded-lg shadow-sm bg-white border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode('states')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'states'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              By State
            </button>
            <button
              onClick={() => setViewMode('cities')}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === 'cities'
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              By City
            </button>
          </div>
        </div>

        {/* States View */}
        {viewMode === 'states' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStateGroups.map((stateGroup) => (
              <StateCard
                key={stateGroup.state}
                group={stateGroup}
                allStates={states as any}
                onAddState={addState as any}
              />
            ))}
          </div>
        )}

        {/* Cities View */}
        {viewMode === 'cities' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCityGroups.map((cityGroup) => (
              <CityCard
                key={`${cityGroup.city}-${cityGroup.stateName}`}
                group={cityGroup}
                allCities={cities as any}
                onAddCity={addCity as any}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {viewMode === 'states' && filteredStateGroups.length === 0 && (
          <div className="text-center py-12">
            <BuildingOffice2Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No states found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}

        {viewMode === 'cities' && filteredCityGroups.length === 0 && (
          <div className="text-center py-12">
            <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No cities found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinationsPage;
