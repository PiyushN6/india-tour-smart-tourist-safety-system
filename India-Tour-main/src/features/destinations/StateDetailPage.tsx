import { useParams, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useItinerary } from '../../context/ItineraryContext';

import { useEffect, useState } from 'react';
import { ArrowLeftIcon, StarIcon } from '@heroicons/react/24/solid';

import { motion } from 'framer-motion';
import Card from '../../new-ui/components/Card';
import ItineraryAddButton from '../../components/ItineraryAddButton';

const StateDetailPage = () => {
  const { stateName } = useParams<{ stateName: string }>();
  const { places, states, cities, loading, error } = useData();
  const { addState, addCity } = useItinerary();

  const [stateData, setStateData] = useState<any>(null);
  const [cityGroups, setCityGroups] = useState<Array<{ name: string; places: any[]; averageRating: number }>>([]);

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

        const citiesData = Array.from(citiesMap.entries()).map(([name, groupedPlaces]) => {
          const placesArray = groupedPlaces as any[];
          const averageRating = placesArray.length
            ? placesArray.reduce((sum, place) => sum + (place.rating || 0), 0) / placesArray.length
            : 0;

          return {
            name,
            places: placesArray,
            averageRating,
          };
        });

        setCityGroups(citiesData);
      }
    }
  }, [stateName, states, places]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  if (!stateData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100">
        <div className="flex flex-col items-center justify-center p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">State not found</h1>
          <Link 
            to="/destinations" 
            className="flex items-center text-orange-600 hover:text-orange-700"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Back to Destinations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100">
      {/* Back button, floating over content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          to="/destinations"
          className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/70 p-2 text-slate-700 shadow-sm hover:border-orange-400/70 hover:shadow-md transition-all"
          aria-label="Back to destinations"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
      </div>

      {/* State image and details */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          <div>
            <Card
              padding="none"
              className="relative rounded-3xl overflow-hidden border border-slate-200/80 bg-slate-950/95 shadow-[0_12px_40px_rgba(15,23,42,0.16)] backdrop-blur-xl transform transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:border-orange-400/70"
            >
              <div className="relative h-64 sm:h-72 overflow-hidden">
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
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/70">State</p>
                    <h2 className="text-3xl sm:text-[2rem] font-semibold leading-tight">{stateData.name}</h2>
                    <p className="mt-1 text-sm text-slate-100/85">
                      {cityGroups.length} {cityGroups.length === 1 ? 'city' : 'cities'} to explore
                    </p>
                  </div>
                  <div className="flex items-end">
                    <ItineraryAddButton
                      onAdd={() => addState(stateData as any)}
                      label="State added to itinerary"
                      alreadyLabel="State already in itinerary"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Cities list */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold text-slate-900">Cities in {stateData.name}</h3>
            
            {cityGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cityGroups.map((city) => (
                  <Link
                    key={city.name}
                    to={`/destinations/${stateName}/${city.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Card
                      variant="interactive"
                      hover
                      padding="none"
                      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden transition-all duration-200 hover:border-orange-400/70 hover:shadow-xl hover:-translate-y-1"
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
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium text-gray-900">{city.name}</h4>
                          {city.averageRating > 0 && (
                            <span className="flex items-center text-sm text-yellow-500">
                              <StarIcon className="h-4 w-4 mr-1" />
                              <span>{city.averageRating.toFixed(1)}</span>
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {city.places?.length || 0}{' '}
                          {city.places?.length === 1 ? 'place' : 'places'} to visit
                        </p>
                        <div className="mt-3 inline-flex items-center justify-end w-full">
                          <ItineraryAddButton
                            onAdd={() => {
                              const normalizedCity = city.name.toLowerCase();
                              const normalizedState = stateData.name.toLowerCase();

                              const cityEntity =
                                (cities as any[]).find((c) => c.name?.toLowerCase() === normalizedCity) ||
                                (cities as any[]).find(
                                  (c) =>
                                    c.name?.toLowerCase() === normalizedCity &&
                                    (c.state || '').toLowerCase().includes(normalizedState)
                                );

                              if (cityEntity) {
                                return addCity(cityEntity as any);
                              }

                              const fallbackCity: any = {
                                id: `${normalizedCity}-${normalizedState}`,
                                name: city.name,
                                state: stateData.name,
                                state_id: undefined,
                              };
                              return addCity(fallbackCity);
                            }}
                            label="City added to itinerary"
                            alreadyLabel="City already in itinerary"
                            size="sm"
                          />
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 rounded-2xl border border-dashed border-slate-300/80 bg-white/70">
                <p className="text-slate-500">No cities found for this state yet.</p>
              </div>
            )}
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default StateDetailPage;