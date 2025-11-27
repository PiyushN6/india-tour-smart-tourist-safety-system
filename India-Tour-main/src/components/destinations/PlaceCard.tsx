import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid';
import { Place } from '../../types';

interface PlaceCardProps {
  place: Place;
  cityLabel?: string;
  onAddToItinerary: (place: Place) => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, cityLabel, onAddToItinerary }) => {
  const effectiveCityLabel = cityLabel || (place.city as any)?.name || '';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div className="h-40 bg-gray-100 overflow-hidden">
        <img
          src={(place as any).image_url || (place as any).imageUrl || '/images/placeholder.jpg'}
          alt={place.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/placeholder.jpg';
          }}
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 mr-2">{place.name}</h3>
          {place.rating && (
            <div className="flex items-center text-sm text-yellow-500">
              <StarIcon className="h-4 w-4 mr-1" />
              <span>{place.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        {place.description && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">{place.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span>{effectiveCityLabel}</span>
          </div>
          <button
            onClick={() => onAddToItinerary(place)}
            className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700"
          >
            Add to Itinerary
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
