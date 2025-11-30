import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Filter, Search, Star, Shield, Heart } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Loading from '@/components/Loading'
import { useData } from '../../../context/DataContext'
import { useItinerary } from '../../../context/ItineraryContext'

const DestinationExplorer: React.FC = () => {
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
      s.region.toLowerCase().includes(q)
    )
  }, [stateSummaries, searchQuery])

  const filteredCitySummaries = useMemo(() => {
    if (!searchQuery.trim()) return citySummaries
    const q = searchQuery.toLowerCase().trim()
    return citySummaries.filter((c) =>
      c.city.toLowerCase().includes(q) ||
      c.stateName.toLowerCase().includes(q)
    )
  }, [citySummaries, searchQuery])

  const isLoading = loading || placesLoading || statesLoading
  const hasError = error || placesError || statesError

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-soft-cream to-background-warm-offwhite">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <MapPin className="w-8 h-8 text-primary-saffron" />
            <h1 className="text-3xl md:text-4xl font-bold gradient-text-2025">
              Destination Explorer
            </h1>
            <Filter className="w-8 h-8 text-primary-royal-blue" />
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Browse real destinations from our database, grouped by state and city, with live ratings and itinerary tools.
          </p>
        </motion.div>

        {/* Search + View toggle */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search states or cities..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-saffron/50 focus:border-primary-saffron"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="inline-flex rounded-full bg-white shadow-sm border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode('states')}
              className={`px-5 py-2 text-sm font-medium flex items-center gap-2 transition-colors ${
                viewMode === 'states'
                  ? 'bg-primary-saffron text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>By State</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cities')}
              className={`px-5 py-2 text-sm font-medium flex items-center gap-2 border-l border-gray-200 transition-colors ${
                viewMode === 'cities'
                  ? 'bg-primary-royal-blue text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>By City</span>
            </button>
          </div>
        </div>

        {/* Loading / Error states */}
        {isLoading && (
          <div className="py-20 flex justify-center">
            <Loading type="spinner" size="large" text="Loading destinations from India Tour..." />
          </div>
        )}

        {hasError && !isLoading && (
          <div className="py-20">
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

        {/* States view */}
        {!isLoading && !hasError && viewMode === 'states' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">States across India</h2>
              <span className="text-sm text-gray-500">
                Showing {filteredStateSummaries.length} state{filteredStateSummaries.length !== 1 && 's'}
              </span>
            </div>

            {filteredStateSummaries.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No states match your search yet. Try a different keyword.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStateSummaries.map((state) => (
                  <Card
                    key={state.id}
                    variant="interactive"
                    hover
                    padding="none"
                    className="overflow-hidden h-full"
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
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4 text-red-400" />
                          Popular
                        </span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="primary"
                          size="small"
                          fullWidth
                          onClick={() => addState(state as any)}
                        >
                          Add to Itinerary
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Cities view */}
        {!isLoading && !hasError && viewMode === 'cities' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Top cities</h2>
              <span className="text-sm text-gray-500">
                Showing {filteredCitySummaries.length} city{filteredCitySummaries.length !== 1 && 'ies'}
              </span>
            </div>

            {filteredCitySummaries.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No cities match your search yet. Try a different keyword.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCitySummaries.map((city) => (
                  <Card
                    key={`${city.city}-${city.stateName}`}
                    variant="interactive"
                    hover
                    padding="none"
                    className="overflow-hidden h-full"
                  >
                    <div className="h-36 bg-gradient-to-br from-primary-royal-blue to-primary-emerald relative overflow-hidden">
                      <img
                        src={city.places[0]?.image_url || `https://source.unsplash.com/random/800x600/?${encodeURIComponent(city.city)},india`}
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

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="primary"
                          size="small"
                          fullWidth
                          onClick={() => addCity(city as any)}
                        >
                          Add City to Itinerary
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default DestinationExplorer