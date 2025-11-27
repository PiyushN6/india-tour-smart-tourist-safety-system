import React, { useMemo } from 'react';
import { useItinerary } from '../../context/ItineraryContext';
import { useData } from '../../context/DataContext';
import { MapPinIcon, CalendarIcon, TrashIcon } from '@heroicons/react/24/outline';

const MAX_DAYS = 10;

const ItineraryPage: React.FC = () => {
  const { items, clear, removeItem, updateItem } = useItinerary();
  const { states, cities, places } = useData();

  const itemsByDay = useMemo(() => {
    const groups: Record<number, typeof items> = {};
    for (const item of items) {
      const day = item.day && item.day > 0 ? item.day : 1;
      if (!groups[day]) groups[day] = [];
      groups[day].push(item);
    }
    return groups;
  }, [items]);

  const sortedDays = useMemo(
    () => Object.keys(itemsByDay).map(Number).sort((a, b) => a - b),
    [itemsByDay]
  );

  if (!items.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Your itinerary is empty</h1>
          <p className="text-gray-600 mb-6">
            Browse destinations and cities, then use the "Add to Itinerary" buttons to build your personalized travel plan.
          </p>
        </div>
      </div>
    );
  }

  const renderItemRow = (item: typeof items[number]) => {
    const dateValue = item.date || '';

    if (item.type === 'state') {
      const state = states.find((s) => s.id === item.stateId) || null;
      const label = state?.name || 'Unknown state';
      return (
        <div
          key={item.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <MapPinIcon className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">State</p>
              <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 text-xs">
              <span className="mr-2 text-gray-500">Day</span>
              <select
                value={item.day || 1}
                onChange={(e) => updateItem(item.id, { day: Number(e.target.value) })}
                className="bg-transparent border-0 focus:ring-0 focus:outline-none text-sm"
              >
                {Array.from({ length: MAX_DAYS }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50">
              <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
              <input
                type="date"
                value={dateValue}
                onChange={(e) => updateItem(item.id, { date: e.target.value })}
                className="text-sm border-0 bg-transparent focus:ring-0 focus:outline-none"
              />
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="text-xs font-semibold text-red-500 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      );
    }

    if (item.type === 'city') {
      const city = cities.find((c) => c.id === item.cityId) || null;
      const label = city?.name || item.cityName || 'Unknown city';
      const stateLabel =
        city?.state || (city as any)?.state_details?.name || item.stateName || '';
      const locationLabel = [label, stateLabel].filter(Boolean).join(', ');
      return (
        <div
          key={item.id}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <MapPinIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">City</p>
              <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
              {locationLabel && (
                <p className="text-xs text-gray-500 mt-0.5">{locationLabel}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 text-xs">
              <span className="mr-2 text-gray-500">Day</span>
              <select
                value={item.day || 1}
                onChange={(e) => updateItem(item.id, { day: Number(e.target.value) })}
                className="bg-transparent border-0 focus:ring-0 focus:outline-none text-sm"
              >
                {Array.from({ length: MAX_DAYS }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50">
              <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
              <input
                type="date"
                value={dateValue}
                onChange={(e) => updateItem(item.id, { date: e.target.value })}
                className="text-sm border-0 bg-transparent focus:ring-0 focus:outline-none"
              />
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="text-xs font-semibold text-red-500 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      );
    }

    const place = places.find((p) => p.id === item.placeId) || null;
    const placeName = place?.name || 'Unknown place';
    const cityName = (place?.city as any)?.name || '';
    const stateName = (place as any)?.state || '';
    const locationLabel = [cityName, stateName].filter(Boolean).join(', ');

    return (
      <div
        key={item.id}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <MapPinIcon className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Place</p>
            <h2 className="text-lg font-semibold text-gray-900">{placeName}</h2>
            {locationLabel && (
              <p className="text-xs text-gray-500 mt-0.5">{locationLabel}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 text-xs">
            <span className="mr-2 text-gray-500">Day</span>
            <select
              value={item.day || 1}
              onChange={(e) => updateItem(item.id, { day: Number(e.target.value) })}
              className="bg-transparent border-0 focus:ring-0 focus:outline-none text-sm"
            >
              {Array.from({ length: MAX_DAYS }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50">
            <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
            <input
              type="date"
              value={dateValue}
              onChange={(e) => updateItem(item.id, { date: e.target.value })}
              className="text-sm border-0 bg-transparent focus:ring-0 focus:outline-none"
            />
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="text-xs font-semibold text-red-500 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Itinerary</h1>
            <p className="text-gray-600 mt-1">
              Organize your trip by days and set dates for each state, city, and place you want to visit.
            </p>
          </div>
          <button
            onClick={clear}
            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 bg-white shadow-sm"
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Clear All
          </button>
        </div>

        <div className="space-y-8">
          {sortedDays.map((day) => (
            <div key={day} className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Day {day}</h2>
              {itemsByDay[day]?.map((item) => renderItemRow(item))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ItineraryPage;
