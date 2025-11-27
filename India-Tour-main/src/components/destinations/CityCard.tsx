import { MapPinIcon, StarIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { City } from '../../types';

export interface CityGroup {
  city: string;
  places: any[];
  averageRating: number;
  totalDestinations: number;
  featuredPlace: any;
  stateName: string;
}

interface CityCardProps {
  group: CityGroup;
  allCities: City[];
  onAddCity: (city: City | any) => void;
}

const CityCard: React.FC<CityCardProps> = ({ group, allCities, onAddCity }) => {
  const handleAddCity = () => {
    const normalizedGroupCity = group.city.toLowerCase();
    const normalizedGroupState = group.stateName.toLowerCase();

    const city =
      allCities.find((c) => c.name.toLowerCase() === normalizedGroupCity) ||
      allCities.find(
        (c) =>
          c.name.toLowerCase() === normalizedGroupCity &&
          (c.state || '').toLowerCase().includes(normalizedGroupState)
      );

    if (city) {
      onAddCity(city);
    } else {
      const fallbackCity: any = {
        id: `${normalizedGroupCity}-${normalizedGroupState}`,
        name: group.city,
        state: group.stateName,
        state_id: undefined,
      };
      onAddCity(fallbackCity);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={(() => {
            const firstPlace = group.places && group.places[0];
            const cityFromPlace = firstPlace ? (firstPlace as any).city : null;

            return (
              (cityFromPlace as any)?.image_url ||
              (cityFromPlace as any)?.imageUrl ||
              (group.featuredPlace as any)?.image_url ||
              group.featuredPlace?.imageUrl ||
              '/images/placeholder.jpg'
            );
          })()}
          alt={group.city}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/placeholder.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-xl font-bold">{group.city}</h3>
          <p className="text-sm opacity-90">{group.stateName}</p>
          <div className="flex items-center mt-1">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {group.totalDestinations} {group.totalDestinations === 1 ? 'place' : 'places'}
            </span>
            {group.averageRating > 0 && (
              <>
                <StarIcon className="h-4 w-4 text-yellow-400 ml-3 mr-1" />
                <span className="text-sm">{group.averageRating.toFixed(1)}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2">
        <Link
          to={`/destinations/${group.stateName.replace(/\s+/g, '-').toLowerCase()}/${group.city.replace(/\s+/g, '-').toLowerCase()}`}
          className="inline-flex items-center text-orange-600 font-medium hover:text-orange-700"
        >
          Explore {group.city}
          <ArrowRightIcon className="h-4 w-4 ml-1" />
        </Link>
        <button
          type="button"
          onClick={handleAddCity}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-600 text-white hover:bg-orange-700"
        >
          Add City to Itinerary
        </button>
      </div>
    </div>
  );
};

export default CityCard;
