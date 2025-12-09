import { MapPinIcon, StarIcon } from '@heroicons/react/24/solid';
import { Place } from '../../types';
import Card from '../../new-ui/components/Card';
import ItineraryAddButton from '../ItineraryAddButton';

interface PlaceCardProps {
  place: Place;
  cityLabel?: string;
  onAddToItinerary: (place: Place) => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, cityLabel, onAddToItinerary }) => {
  const effectiveCityLabel = cityLabel || (place.city as any)?.name || '';

  return (
    <Card
      variant="interactive"
      hover
      padding="none"
      className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden hover:shadow-xl hover:border-orange-400/70 flex flex-col"
    >
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
          <ItineraryAddButton
            onAdd={() => onAddToItinerary(place)}
            label="Place added to itinerary"
            alreadyLabel="Place already in itinerary"
            size="sm"
          />
        </div>
      </div>
    </Card>
  );
}

export default PlaceCard;
