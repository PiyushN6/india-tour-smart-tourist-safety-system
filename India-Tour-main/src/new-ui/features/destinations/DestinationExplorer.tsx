import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Search, Star, Shield, Heart } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Loading from '@/components/Loading'
import { useData } from '../../../context/DataContext'
import { useItinerary } from '../../../context/ItineraryContext'
import ItineraryAddButton from '../../../components/ItineraryAddButton'

const DestinationExplorer: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    places,
    states,
    loading,
    placesLoading,
    statesLoading,
    error,
    placesError,
    statesError,
  } = useData()
  const { addState, addCity } = useItinerary()

  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'states' | 'cities'>('states')

  // If we arrive via /destinations?destination=..., use that term to prefill
  // the search box and default to the city view so the filter is obvious.
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const destination = params.get('destination')
    if (destination) {
      setSearchQuery(destination)
      setViewMode('cities')
    }
  }, [location.search])

  // Derive simple aggregates similar to DestinationsPage but in a lighter form
  const stateSummaries = useMemo(() => {
    if (!states?.length || !places?.length) return []

    return states.map((state: any) => {
      const statePlaces = places.filter((p: any) => p.state?.toLowerCase() === state.name.toLowerCase())
      const averageRating = statePlaces.length
        ? statePlaces.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) / statePlaces.length
        : 0

      return {
        id: state.id,
        name: state.name,
        region: state.region || 'India',
        imageUrl:
          state.image_url || `https://source.unsplash.com/random/800x600/?${encodeURIComponent(state.name)},india`,
        totalPlaces: statePlaces.length,
        averageRating,
        places: statePlaces,
      }
    })
  }, [states, places])

  const citySummaries = useMemo(() => {
    if (!places?.length) return []

    const cityMap = new Map<string, any>()

    places.forEach((place: any) => {
      const cityRelation = place.city as any
      const cityName = cityRelation?.name || (place.city as any) || 'Unknown City'
      const stateName = place.state || cityRelation?.state || 'Unknown State'
      const cityId = place.city_id || cityRelation?.id || `${cityName}-${stateName}`
      const stateId = cityRelation?.state_id || cityRelation?.state?.id || place.state_id
      const key = `${cityName}-${stateName}`

      if (!cityMap.has(key)) {
        cityMap.set(key, {
          // City-like shape so addCity() can work
          id: cityId,
          name: cityName,
          state_id: stateId,
          state: stateName,

          // Extra fields for UI
          city: cityName,
          stateName,
          places: [] as any[],
          averageRating: 0,
        })
      }

      const group = cityMap.get(key)!
      group.places.push(place)
      group.averageRating =
        group.places.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) / group.places.length
    })

    return Array.from(cityMap.values())
  }, [places])

  const filteredStateSummaries = useMemo(() => {
    if (!searchQuery.trim()) return stateSummaries
    const q = searchQuery.toLowerCase().trim()
    return stateSummaries.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.region.toLowerCase().includes(q) ||
      // Also match any place inside this state by name/description
      (s.places || []).some((p: any) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    )
  }, [stateSummaries, searchQuery])

  const filteredCitySummaries = useMemo(() => {
    if (!searchQuery.trim()) return citySummaries
    const q = searchQuery.toLowerCase().trim()
    return citySummaries.filter((c) =>
      c.city.toLowerCase().includes(q) ||
      c.stateName.toLowerCase().includes(q) ||
      // If any place in this city matches by name/description, include the city
      (c.places || []).some((p: any) =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    )
  }, [citySummaries, searchQuery])

  const isLoading = loading || placesLoading || statesLoading
  const hasError = error || placesError || statesError

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-soft-cream to-background-warm-offwhite">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Compact header + controls */}
        <motion.div
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] tracking-wide uppercase w-max shadow-sm">
              <span className="font-semibold text-slate-800">Destinations</span>
            </div>
            <h1 className="text-2xl md:text-[2.1rem] font-semibold text-slate-900">Choose where your story starts</h1>
            <p className="text-[12px] md:text-[13px] text-slate-500 max-w-xl">
              Browse India by state or city. Click a card to see the cities and places that belong to it while you build your itinerary.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search states, cities or places..."
                className="w-full pl-9 pr-3 py-2.5 rounded-full border border-gray-200 bg-white shadow-sm text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-saffron/60 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="inline-flex rounded-full bg-white shadow-sm border border-gray-200 overflow-hidden self-start md:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('states')}
                className={`px-5 py-1.5 text-xs md:text-[11px] font-medium transition-colors ${
                  viewMode === 'states'
                    ? 'bg-slate-200 text-slate-900'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                By state
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cities')}
                className={`px-5 py-1.5 text-xs md:text-[11px] font-medium border-l border-gray-200 transition-colors ${
                  viewMode === 'cities'
                    ? 'bg-slate-200 text-slate-900'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                By city
              </button>
            </div>
          </div>
        </motion.div>

        {/* Loading / Error states */}
        {isLoading && (
          <div className="py-16 flex justify-center">
            <Loading type="spinner" size="large" text="Loading destinations from India Tour..." />
          </div>
        )}

        {hasError && !isLoading && (
          <div className="py-16">
            <Card variant="glass" padding="large" className="max-w-xl mx-auto text-center border border-red-200">
              <h2 className="text-xl font-bold text-red-700 mb-2">Error loading destinations</h2>
              <p className="text-gray-700 mb-4">
                {(error || placesError || statesError)?.message || 'An unexpected error occurred while loading data.'}
              </p>
              <Button variant="primary" size="medium" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </Card>
          </div>
        )}

        {!isLoading && !hasError && (
          <section className="space-y-6">
            {viewMode === 'states' && (
              <>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>States across India</span>
                  <span>
                    Showing {filteredStateSummaries.length} state
                    {filteredStateSummaries.length !== 1 && 's'}
                  </span>
                </div>

                {filteredStateSummaries.length === 0 ? (
                  <div className="py-10 text-center text-gray-500 bg-white/60 rounded-2xl border border-dashed border-gray-200">
                    No states match your search yet. Try a different keyword.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStateSummaries.map((state: any) => (
                      <Card
                        key={state.id}
                        variant="interactive"
                        hover
                        padding="none"
                        className="overflow-hidden h-full rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:border-orange-400/70 hover:shadow-xl hover:-translate-y-1"
                        onClick={() =>
                          navigate(`/destinations/${state.name.replace(/\s+/g, '-').toLowerCase()}`)
                        }
                      >
                        <div className="h-40 bg-gradient-to-br from-primary-saffron to-primary-royal-blue relative overflow-hidden">
                          <img
                            src={state.imageUrl}
                            alt={state.name}
                            className="w-full h-full object-cover opacity-80"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-4 text-white">
                            <div className="text-xs uppercase tracking-wide text-white/70">State</div>
                            <div className="text-lg font-semibold">{state.name}</div>
                          </div>
                        </div>

                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{state.region}</span>
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400" />
                              {state.averageRating.toFixed(1)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-primary-saffron" />
                              {state.totalPlaces} places
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div />
                            <ItineraryAddButton
                              onAdd={() => addState(state as any)}
                              label="State added to itinerary"
                              alreadyLabel="State already in itinerary"
                              size="sm"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {viewMode === 'cities' && (
              <>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Top cities</span>
                  <span>
                    Showing {filteredCitySummaries.length} city
                    {filteredCitySummaries.length !== 1 && 'ies'}
                  </span>
                </div>

                {filteredCitySummaries.length === 0 ? (
                  <div className="py-10 text-center text-gray-500 bg-white/60 rounded-2xl border border-dashed border-gray-200">
                    No cities match your search yet. Try a different keyword.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCitySummaries.map((city: any) => (
                      <Card
                        key={`${city.city}-${city.stateName}`}
                        variant="interactive"
                        hover
                        padding="none"
                        className="overflow-hidden h-full rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:border-orange-400/70 hover:shadow-xl hover:-translate-y-1"
                        onClick={() =>
                          navigate(
                            `/destinations/${city.stateName.replace(/\s+/g, '-').toLowerCase()}/${city.city
                              .replace(/\s+/g, '-')
                              .toLowerCase()}`
                          )
                        }
                      >
                        <div className="h-36 bg-gradient-to-br from-primary-royal-blue to-primary-emerald relative overflow-hidden">
                          <img
                            src={
                              city.places[0]?.image_url ||
                              `https://source.unsplash.com/random/800x600/?${encodeURIComponent(city.city)},india`
                            }
                            alt={city.city}
                            className="w-full h-full object-cover opacity-80"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute bottom-3 left-4 text-white">
                            <div className="text-xs uppercase tracking-wide text-white/70">City</div>
                            <div className="text-lg font-semibold">{city.city}</div>
                            <div className="text-xs text-white/80">{city.stateName}</div>
                          </div>
                        </div>

                        <div className="p-5 space-y-3">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-primary-saffron" />
                              {city.places.length} places
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400" />
                              {city.averageRating.toFixed(1)} avg
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div />
                            <ItineraryAddButton
                              onAdd={() => addCity(city as any)}
                              label="City added to itinerary"
                              alreadyLabel="City already in itinerary"
                              size="sm"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default DestinationExplorer