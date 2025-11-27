import { MapPinIcon, StarIcon, ArrowRightIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { State } from '../../types';

export interface StateGroup {
  state: string;
  places: any[];
  averageRating: number;
  totalDestinations: number;
  featuredPlace: any;
  image_url?: string;
}

interface StateCardProps {
  group: StateGroup;
  allStates: State[];
  onAddState: (state: State) => void;
}

const StateCard: React.FC<StateCardProps> = ({ group, allStates, onAddState }) => {
  const handleAddState = () => {
    const state = allStates.find((s) => s.name === group.state);
    if (state) {
      onAddState(state);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <img
          src={
            group.image_url ||
            `/images/states/${group.state.toLowerCase().replace(/\s+/g, '-')}.jpg` ||
            '/images/placeholder.jpg'
          }
          alt={group.state}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/placeholder.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-xl font-bold">{group.state}</h3>
          <div className="flex items-center mt-1">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span className="text-sm">
              {group.totalDestinations}{' '}
              {group.totalDestinations === 1 ? 'destination' : 'destinations'}
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
          to={`/destinations/${group.state.replace(/\s+/g, '-').toLowerCase()}`}
          className="inline-flex items-center text-orange-600 font-medium hover:text-orange-700"
        >
          Explore {group.state}
          <ArrowRightIcon className="h-4 w-4 ml-1" />
        </Link>
        <button
          type="button"
          onClick={handleAddState}
          className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-600 text-white hover:bg-orange-700"
        >
          Add State to Itinerary
        </button>
      </div>
    </div>
  );
};

export default StateCard;
