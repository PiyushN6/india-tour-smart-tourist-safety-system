import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useItinerary } from '../../context/ItineraryContext';
import { useData } from '../../context/DataContext';
import { MapPinIcon, CalendarIcon, TrashIcon } from '@heroicons/react/24/outline';

const MAX_DAYS = 10;

const ItineraryPage: React.FC = () => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const { items, clear, removeItem, updateItem, tripNote, setTripNote, saveItinerary, isSaving, lastSavedAt } = useItinerary();
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
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          whileHover={{ y: -4 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.08)] border border-slate-100 px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <MapPinIcon className="h-5 w-5 text-orange-500" />
            </div>
            <div className="space-y-1">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">State</p>
                <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
              </div>
              <input
                type="text"
                value={item.notes || ''}
                onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                placeholder="Add a quick note for this stop"
                className="mt-1 w-full md:w-72 lg:w-80 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400/70"
              />
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
            <div className="flex items-center border border-slate-200 rounded-xl px-3 py-1.5 bg-white/80 shadow-[0_8px_25px_rgba(15,23,42,0.04)]">
              <CalendarIcon className="h-4 w-4 text-slate-400 mr-2" />
              <DatePicker
                selected={dateValue ? new Date(dateValue) : null}
                onChange={(date: Date | null) =>
                  updateItem(item.id, {
                    date: date instanceof Date ? date.toISOString().slice(0, 10) : '',
                  })
                }
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                portalId="itinerary-date-portal"
                className="text-sm bg-transparent outline-none w-[7.5rem]"
              />
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="text-xs font-semibold text-red-500 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        </motion.div>
      );
    }

    if (item.type === 'city') {
      const city = cities.find((c) => c.id === item.cityId) || null;
      const label = city?.name || item.cityName || 'Unknown city';
      const stateLabel =
        city?.state || (city as any)?.state_details?.name || item.stateName || '';
      const locationLabel = [label, stateLabel].filter(Boolean).join(', ');
      return (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          whileHover={{ y: -4 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.08)] border border-slate-100 px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <MapPinIcon className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-1">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">City</p>
                <h2 className="text-lg font-semibold text-gray-900">{label}</h2>
                {locationLabel && (
                  <p className="text-xs text-gray-500 mt-0.5">{locationLabel}</p>
                )}
              </div>
              <input
                type="text"
                value={item.notes || ''}
                onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                placeholder="Notes for this city (timings, people, etc.)"
                className="mt-1 w-full md:w-72 lg:w-80 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400/70"
              />
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
            <div className="flex items-center border border-slate-200 rounded-xl px-3 py-1.5 bg-white/80 shadow-[0_8px_25px_rgba(15,23,42,0.04)]">
              <CalendarIcon className="h-4 w-4 text-slate-400 mr-2" />
              <DatePicker
                selected={dateValue ? new Date(dateValue) : null}
                onChange={(date: Date | null) =>
                  updateItem(item.id, {
                    date: date instanceof Date ? date.toISOString().slice(0, 10) : '',
                  })
                }
                dateFormat="dd/MM/yyyy"
                placeholderText="DD/MM/YYYY"
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                portalId="itinerary-date-portal"
                className="text-sm bg-transparent outline-none w-[7.5rem]"
              />
            </div>
            <button
              onClick={() => removeItem(item.id)}
              className="text-xs font-semibold text-red-500 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        </motion.div>
      );
    }

    const place = places.find((p) => p.id === item.placeId) || null;
    const placeName = place?.name || 'Unknown place';
    const cityName = (place?.city as any)?.name || '';
    const stateName = (place as any)?.state || '';
    const locationLabel = [cityName, stateName].filter(Boolean).join(', ');

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        whileHover={{ y: -4 }}
        className="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.08)] border border-slate-100 px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <MapPinIcon className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-1">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Place</p>
              <h2 className="text-lg font-semibold text-gray-900">{placeName}</h2>
              {locationLabel && (
                <p className="text-xs text-gray-500 mt-0.5">{locationLabel}</p>
              )}
            </div>
            <input
              type="text"
              value={item.notes || ''}
              onChange={(e) => updateItem(item.id, { notes: e.target.value })}
              placeholder="What do you want to remember here?"
              className="mt-1 w-full md:w-72 lg:w-80 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-[11px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400/70"
            />
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
          <div className="flex items-center border border-slate-200 rounded-xl px-3 py-1.5 bg-white/80 shadow-[0_8px_25px_rgba(15,23,42,0.04)]">
            <CalendarIcon className="h-4 w-4 text-slate-400 mr-2" />
            <DatePicker
              selected={dateValue ? new Date(dateValue) : null}
              onChange={(date: Date | null) =>
                updateItem(item.id, {
                  date: date instanceof Date ? date.toISOString().slice(0, 10) : '',
                })
              }
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              portalId="itinerary-date-portal"
              className="text-sm bg-transparent outline-none w-[7.5rem]"
            />
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="text-xs font-semibold text-red-500 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          >
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] tracking-[0.18em] uppercase text-slate-500 shadow-sm">
                <span className="font-semibold">Itinerary planner</span>
              </div>
              <h1 className="mt-3 text-2xl sm:text-[2.1rem] font-semibold text-slate-900">
                Your itinerary at a glance
              </h1>
              <p className="mt-1.5 text-[13px] text-slate-500 max-w-xl">
                Arrange each state, city, and place by day and travel date so your trip flows the way you want.
              </p>
              <div className="max-w-xl mt-1.5">
                <textarea
                  value={tripNote}
                  onChange={(e) => setTripNote(e.target.value)}
                  placeholder="Add a high-level note for this trip (overall plan, travel companions, constraints, etc.)"
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-1 focus:ring-sky-400/70 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="relative flex items-center">
                <button
                  onClick={async () => {
                    await saveItinerary();
                  }}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs sm:text-[13px] font-semibold text-white bg-sky-600 hover:bg-sky-700 shadow-sm border border-sky-500/80"
                >
                  {isSaving ? 'Saving…' : 'Save itinerary'}
                </button>
                {!isSaving && lastSavedAt && (
                  <span className="pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 text-[11px] sm:text-xs text-slate-500">
                    Saved
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs sm:text-[13px] font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 bg-white shadow-sm"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Clear itinerary
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5, ease: 'easeOut' }}
            className="relative rounded-3xl border border-slate-200 bg-white/80 backdrop-blur-xl shadow-[0_24px_80px_rgba(15,23,42,0.08)] px-4 sm:px-6 py-5 sm:py-6"
          >
            <div className="pointer-events-none absolute inset-0 opacity-50 mix-blend-soft-light">
              <div className="absolute -right-16 top-6 h-40 w-40 rounded-full bg-gradient-to-br from-primary-royal-blue/8 via-sky-400/6 to-transparent blur-3xl" />
              <div className="absolute -left-20 bottom-0 h-40 w-40 rounded-full bg-gradient-to-tr from-primary-saffron/10 via-orange-400/10 to-transparent blur-3xl" />
            </div>

            <div className="relative space-y-7">
              {sortedDays.map((day) => (
                <section key={day} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center text-xs font-semibold shadow-sm">
                      {day}
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900 tracking-wide uppercase">
                        Day {day}
                      </h2>
                      <p className="text-[11px] text-slate-500">
                        Plans and stops you’ll visit on this day.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {itemsByDay[day]?.map((it) => renderItemRow(it))}
                  </div>
                </section>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/20">
          <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-slate-200 px-4 py-4 sm:px-5 sm:py-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">Clear itinerary?</h3>
            <p className="text-xs sm:text-[13px] text-slate-600 mb-4">
              This will remove all saved days, dates, places, and notes for this trip.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 border border-slate-200 bg-white"
              >
                Keep itinerary
              </button>
              <button
                onClick={async () => {
                  await clear();
                  setShowClearConfirm(false);
                }}
                className="inline-flex items-center justify-center rounded-full px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm"
              >
                Clear itinerary
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ItineraryPage;
