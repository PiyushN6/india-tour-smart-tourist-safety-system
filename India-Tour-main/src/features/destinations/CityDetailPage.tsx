import { useParams, Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useItinerary } from '../../context/ItineraryContext';
import { Place } from '../../types';
import { useEffect, useMemo, useState } from 'react';
import { MapPinIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import Card from '../../new-ui/components/Card';
import ItineraryAddButton from '../../components/ItineraryAddButton';
import { supabase } from '../../lib/supabase';
import PlaceCard from '../../components/destinations/PlaceCard';

const CityDetailPage = () => {
  const { stateName, cityName } = useParams<{ stateName: string; cityName: string }>();
  const { places, cities, loading, error } = useData();
  const { addPlace, addCity } = useItinerary();
  const [cityHeroImage, setCityHeroImage] = useState<string | null>(null);

  const { formattedStateName, formattedCityName } = useMemo(() => {
    const formatSlug = (slug?: string) => {
      if (!slug) return '';
      return slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    };

    return {
      formattedStateName: formatSlug(stateName),
      formattedCityName: formatSlug(cityName),
    };
  }, [stateName, cityName]);

  const cityPlaces = useMemo<Place[]>(() => {
    if (!formattedStateName || !formattedCityName) return [];
    return places.filter((place) => {
      const placeState = (place.state || '').toLowerCase();
      const placeCityName = (place.city && (place.city as any).name)
        ? (place.city as any).name.toLowerCase()
        : (place as any).city
        ? ((place as any).city as string).toLowerCase()
        : '';
      return (
        placeState === formattedStateName.toLowerCase() &&
        placeCityName === formattedCityName.toLowerCase()
      );
    });
  }, [places, formattedStateName, formattedCityName]);

  // Load the city image directly from Supabase using the human-readable city name.
  // This ensures we always respect the image_url you set in the cities table.
  useEffect(() => {
    const loadCityImage = async () => {
      if (!formattedCityName) return;

      try {
        const { data, error } = await supabase
          .from('cities')
          .select('image_url')
          .ilike('name', formattedCityName)
          .maybeSingle();

        if (!error && data?.image_url) {
          setCityHeroImage(data.image_url as string);
        }
      } catch {
        // ignore and fall back to other sources
      }
    };

    loadCityImage();
  }, [formattedCityName]);

  const cityEntity = useMemo(() => {
    const cityNameLower = formattedCityName.toLowerCase();
    const stateLower = formattedStateName.toLowerCase();

    // Try strict name match first
    let match = cities.find((c) => c.name.toLowerCase() === cityNameLower);

    if (!match) {
      // Fallback: match both name and state loosely
      match = cities.find(
        (c) =>
          c.name.toLowerCase() === cityNameLower &&
          (c.state || '').toLowerCase().includes(stateLower)
      );
    }

    return match || null;
  }, [cities, formattedCityName, formattedStateName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
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

  if (!cityPlaces.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">No places found for this city</h1>
        <p className="text-gray-600 mb-4">
          {formattedCityName && formattedStateName
            ? `${formattedCityName}, ${formattedStateName}`
            : 'The requested city could not be found.'}
        </p>
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

  const heroPlace = cityPlaces[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100">
      {/* Back button, floating over content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link
          to={`/destinations/${(stateName || '').toLowerCase()}`}
          className="inline-flex items-center rounded-full bg-white/80 backdrop-blur-sm border border-slate-200/70 p-2 text-slate-700 shadow-sm hover:border-orange-400/70 hover:shadow-md transition-all"
          aria-label="Back to state"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
      </div>

      <main className="relative pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
          <div>
            <Card
              padding="none"
              className="relative rounded-3xl overflow-hidden border border-slate-200/80 bg-slate-950/95 shadow-[0_12px_40px_rgba(15,23,42,0.16)] backdrop-blur-xl transform transition-transform duration-300 hover:scale-[1.01] hover:shadow-xl hover:border-orange-400/70"
            >
              <div className="relative h-64 sm:h-72 overflow-hidden">
                <img
                  src={
                    cityHeroImage ||
                    (cityEntity as any)?.image_url ||
                    (cityEntity as any)?.imageUrl ||
                    '/images/placeholder.jpg'
                  }
                  alt={formattedCityName || heroPlace.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder.jpg';
                  }}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/70">City</p>
                    <h2 className="text-3xl sm:text-[2rem] font-semibold leading-tight">{formattedCityName}</h2>
                    {formattedStateName && (
                      <p className="mt-1 text-sm text-slate-100/85">{formattedStateName}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-start md:items-end gap-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPinIcon className="h-5 w-5" />
                      <span>
                        {cityPlaces.length} {cityPlaces.length === 1 ? 'place' : 'places'} to explore
                      </span>
                    </div>
                    <ItineraryAddButton
                      onAdd={() => {
                        if (cityEntity) {
                          return addCity(cityEntity as any);
                        }

                        const fallbackCity: any = {
                          id: `${formattedCityName}-${formattedStateName}`,
                          name: formattedCityName,
                          state: formattedStateName,
                          state_id: undefined,
                        };
                        return addCity(fallbackCity);
                      }}
                      label="City added to itinerary"
                      alreadyLabel="City already in itinerary"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cityPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  cityLabel={formattedCityName}
                  onAddToItinerary={addPlace}
                />
              ))}
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
};

export default CityDetailPage;
