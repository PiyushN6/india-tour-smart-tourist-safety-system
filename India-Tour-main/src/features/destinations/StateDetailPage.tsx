import { useParams, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useItinerary } from '../../context/ItineraryContext';

import { useEffect, useState } from 'react';
import { MapPinIcon, StarIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

const StateDetailPage = () => {
  const { stateName } = useParams<{ stateName: string }>();
  const { places, states, cities, loading, error } = useData();
  const { addState, addCity } = useItinerary();

  const [stateData, setStateData] = useState<any>(null);
  const [cityGroups, setCityGroups] = useState<Array<{ name: string; places: any[] }>>([]);

  useEffect(() => {
    if (stateName && states && places) {
      // Find the state data
      const formattedStateName = stateName.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      const state = states.find(s => 
        s.name.toLowerCase() === formattedStateName.toLowerCase()
      );

      if (state) {
        setStateData(state);
        
        // Group places by city for this state
        const statePlaces = places.filter(place => 
          place.state?.toLowerCase() === state.name.toLowerCase()
        );

        const citiesMap = new Map();
        statePlaces.forEach(place => {
          const cityName = (place.city && (place.city as any).name)
            ? (place.city as any).name
            : (place as any).city || 'Other';

          if (!citiesMap.has(cityName)) {
            citiesMap.set(cityName, []);
          }
          citiesMap.get(cityName).push(place);
        });

        const citiesData = Array.from(citiesMap.entries()).map(([name, groupedPlaces]) => ({
          name,
          places: groupedPlaces as any[],
        }));

        setCityGroups(citiesData);
      }
    }
  }, [stateName, states, places]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  if (!stateData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">State not found</h1>
        <Link 
          to="/destinations" 
          className="flex items-center text-orange-600 hover:text-orange-700"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          Back to Destinations
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Link 
              to="/destinations" 
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">{stateData.name}</h1>
          </div>
        </div>
      </div>

      {/* State image and details */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative h-64 rounded-xl overflow-hidden mb-6">
            <img
              src={
                stateData.image_url ||
                `/images/states/${stateData.name.toLowerCase().replace(/\s+/g, '-')}.jpg` ||
                '/images/placeholder.jpg'
              }
              alt={stateData.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white flex flex-col md:flex-row md:items-end md:justify-between gap-3">
              <div>
                <h2 className="text-3xl font-bold">{stateData.name}</h2>
                <p className="mt-2 text-gray-200">{cityGroups.length} cities to explore</p>
              </div>
              <button
                onClick={() => addState(stateData)}
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-orange-600 text-white hover:bg-orange-700"
              >
                Add State to Itinerary
              </button>
            </div>
          </div>

          {/* Cities list */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Cities in {stateData.name}</h3>
            
            {cityGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cityGroups.map((city) => (
                  <Link
                    key={city.name}
                    to={`/destinations/${stateName}/${city.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="h-40 bg-gray-100 relative">
                      <img
                        src={(() => {
                          const firstPlace = city.places && city.places[0];
                          const cityFromPlace = firstPlace ? (firstPlace as any).city : null;

                          return (
                            (cityFromPlace as any)?.image_url ||
                            (cityFromPlace as any)?.imageUrl ||
                            (firstPlace as any)?.image_url ||
                            (firstPlace as any)?.imageUrl ||
                            '/images/placeholder.jpg'
                          );
                        })()}
                        alt={city.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="text-lg font-medium text-gray-900">{city.name}</h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {city.places?.length || 0}{' '}
                        {city.places?.length === 1 ? 'place' : 'places'} to visit
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          const normalizedCity = city.name.toLowerCase();
                          const normalizedState = stateData.name.toLowerCase();

                          const cityEntity =
                            (cities as any[]).find(
                              (c) => c.name?.toLowerCase() === normalizedCity
                            ) ||
                            (cities as any[]).find(
                              (c) =>
                                c.name?.toLowerCase() === normalizedCity &&
                                (c.state || '').toLowerCase().includes(normalizedState)
                            );

                          if (cityEntity) {
                            addCity(cityEntity as any);
                          } else {
                            const fallbackCity: any = {
                              id: `${normalizedCity}-${normalizedState}`,
                              name: city.name,
                              state: stateData.name,
                              state_id: undefined,
                            };
                            addCity(fallbackCity);
                          }
                        }}
                        className="mt-3 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-600 text-white hover:bg-orange-700"
                      >
                        Add City to Itinerary
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No cities found for this state.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateDetailPage;