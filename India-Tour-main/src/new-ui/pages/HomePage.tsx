import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, MapPin, Star, TrendingUp, Users, AlertTriangle, Heart, Sparkles, Zap } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { SearchData } from '@/types'
import HeroSection from '@/components/HeroSection'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { useData } from '../../context/DataContext'
import { useItinerary } from '../../context/ItineraryContext'
import ItineraryAddButton from '../../components/ItineraryAddButton'
import { handleEmergencySOS } from '@/utils/emergency'

const HomePage: React.FC = () => {
  const { states, fetchStates } = useData()
  const { addState } = useItinerary()
  const navigate = useNavigate()

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const [featuredDestinations, setFeaturedDestinations] = useState<{
    id: string
    name: string
    stateLabel: string
    description: string
    safetyScore: number
    imageUrl: string
    bestTime: string
    highlights: string[]
  }[]>([])

  const handleSearch = (searchData: SearchData) => {
    // For now, just log. HeroSection already navigates to /destinations with params.
    console.log('Search data:', searchData)
  }

  // Load states from Supabase-backed DataContext
  useEffect(() => {
    const loadStates = async () => {
      try {
        await fetchStates()
      } catch (error) {
        console.error('Error loading states for homepage:', error)
      }
    }

    loadStates()
  }, [fetchStates])

  // Derive featured destinations from states, rotating randomly every few seconds
  useEffect(() => {
    if (!states || states.length === 0) return

    const pickRandomStates = () => {
      const pool = [...states]
      // Shuffle pool and take first 3
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[pool[i], pool[j]] = [pool[j], pool[i]]
      }
      const sample = pool.slice(0, Math.min(3, pool.length))

      const mapped = sample.map((state: any) => ({
        id: state.id,
        name: state.name,
        stateLabel: state.region || 'India',
        description:
          state.description || `Explore the beautiful state of ${state.name} with its rich cultural heritage and stunning attractions.`,
        // Neutral placeholder score until a real safety metric exists
        safetyScore: 90,
        imageUrl:
          state.image_url || `https://source.unsplash.com/random/800x600/?${encodeURIComponent(state.name)},india`,
        bestTime: 'Year-round',
        highlights: ['Cultural', 'Scenic', 'Popular'],
      }))

      setFeaturedDestinations(mapped)
    }

    pickRandomStates()
    const interval = setInterval(pickRandomStates, 20000) // rotate every 20 seconds

    return () => clearInterval(interval)
  }, [states])

  // Unified safety overview blocks (merged content from the two previous sections)
  const safetyOverviewBlocks = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Designed for your journey",
      subtitle: "Solo, family, first‑time",
      body: "Whether you are backpacking, visiting relatives, or planning a once‑in‑a‑lifetime trip, India Tour adapts to how you actually travel.",
      bullets: [
        "Plan by state, city, and specific places",
        "Balance discovery with peace of mind",
        "Useful for weekend breaks and long routes",
      ],
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Safety decisions made simple",
      subtitle: "Clear signals, not fear",
      body: "See at a glance which areas feel comfortable, which need caution, and why in language a traveler can actually use.",
      bullets: [
        "AI‑assisted area safety scores",
        "Safe‑feeling vs. caution‑zone neighborhoods",
        "Plain‑English context behind each rating",
      ],
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Maps with local instincts",
      subtitle: "Human + AI guidance",
      body: "Move through Indian cities with maps that highlight not just streets, but safety, services, and how the area feels.",
      bullets: [
        "Safety heatmaps for each locality",
        "Police, hospitals, and help centers nearby",
        "Routes tuned for comfort, not just speed",
      ],
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "24/7 safety companion",
      subtitle: "Quiet until it matters",
      body: "India Tour stays in the background while you explore, stepping forward only when something could impact your plans.",
      bullets: [
        "Weather, health, and security alerts",
        "One‑tap access to emergency contacts",
        "Designed to work with local advice and common sense",
      ],
    },
  ]

  // Trust indicators
  const trustIndicators = [
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: "Emergency Ready",
      description: "Quick access to emergency services and support",
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Community Verified",
      description: "Safety information verified by local communities",
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Real-time Updates",
      description: "Live safety scores and risk assessments",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Transparent Sources",
      description: "Clear about where safety data comes from and how it is used",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section - uses internal navigation when Explore Safely is submitted */}
      <HeroSection />

      {/* Integrated Safety Overview Section (stats + features) */}
      <section className="py-16 lg:py-24 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 mandala-pattern" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <Sparkles className="w-6 h-6 text-accent-electric-yellow animate-pulse" />
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text-2025">
                Safety First Travel Experience
              </h2>
              <Sparkles className="w-6 h-6 text-accent-electric-yellow animate-pulse" />
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced safety features powered by AI and built around real Indian cities and states, so you can explore with more confidence and clarity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {safetyOverviewBlocks.map((block, index) => (
              <motion.div
                key={block.title}
                className="h-full"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  variant="glass"
                  hover={true}
                  padding="large"
                  className="h-full text-center card-hover-2025"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-saffron/20 to-primary-royal-blue/20 flex items-center justify-center text-primary-saffron">
                    {block.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {block.title}
                  </h3>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    {block.subtitle}
                  </p>
                  <p className="text-sm text-gray-600">
                    {block.body}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-background-soft-cream to-background-warm-offwhite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Featured <span className="gradient-text-2025">States & Regions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A few real states pulled from the current India Tour database to give you a taste of where you can go next
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredDestinations.map((destination, index) => (
              <motion.div
                key={index}
                className="h-full"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  variant="interactive"
                  hover={true}
                  padding="none"
                  className="h-full overflow-hidden card-hover-2025 border border-white/50 bg-white/80 backdrop-blur-sm shadow-lg"
                >
                  <div className="relative">
                    {/* Destination Image */}
                    <div className="h-64 bg-gradient-to-br from-primary-saffron to-primary-royal-blue relative overflow-hidden">
                      <img
                        src={destination.imageUrl}
                        alt={destination.name}
                        className="w-full h-full object-cover opacity-80"
                        onError={(e) => {
                          // Fallback for missing or broken images: swap to a generic India travel photo
                          e.currentTarget.onerror = null
                          e.currentTarget.src = 'https://source.unsplash.com/random/800x600/?india,travel'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Safety badge and best-time badge removed for now to avoid fake data */}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="text-sm text-gray-500 mb-2">{destination.stateLabel}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {destination.name}
                      </h3>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {destination.description}
                      </p>

                      {/* Highlights removed to keep this section concise for now */}

                      {/* CTAs */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                          to={`/destinations/${destination.name.toLowerCase().replace(/\s+/g, '-')}`}
                          className="flex-1"
                        >
                          <Button
                            variant="primary"
                            size="medium"
                            className="w-full text-gray-900"
                          >
                            Explore destination
                          </Button>
                        </Link>

                        <div className="sm:w-auto flex items-center justify-end">
                          <ItineraryAddButton
                            onAdd={() => {
                              const fullState = (states as any[] | undefined)?.find((s) => s.id === destination.id)
                              if (!fullState) return false
                              return addState(fullState as any)
                            }}
                            label="State added to itinerary"
                            alreadyLabel="State already in itinerary"
                            size="md"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* View All Destinations CTA */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link to="/destinations" className="inline-block">
              <Button
                variant="outline"
                size="large"
                className="group"
              >
                Explore all destinations
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-background-warm-offwhite to-background-soft-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Why <span className="gradient-text-2025">Trust</span> India Tour Safety
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to providing the most reliable safety information for your Indian journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {trustIndicators.map((indicator, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="glass-card p-6 hover:glass-card-intense transition-all duration-300">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-saffron/10 flex items-center justify-center text-primary-saffron">
                    {indicator.icon}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {indicator.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {indicator.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Emergency CTA */}
          <motion.div
            className="mt-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="glass-card-intense p-8 border-2 border-red-200 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-red-800 mb-4">
                Emergency Assistance Available 24/7
              </h3>
              <p className="text-gray-700 mb-6">
                For any emergency during your travels in India, immediate help is just a tap away
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="danger"
                  size="large"
                  icon={<AlertTriangle className="w-5 h-5" />}
                  className="pulse-red text-gray-900"
                  onClick={() => handleEmergencySOS(navigate)}
                >
                  Emergency SOS
                </Button>
                <Button
                  variant="outline"
                  size="large"
                  icon={<Shield className="w-5 h-5" />}
                  onClick={() => navigate('/safety/dashboard')}
                >
                  Safety Dashboard
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass-card-intense p-12 bg-gradient-to-br from-primary-saffron/10 to-primary-royal-blue/10 border-2 border-primary-saffron/30 max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
                Ready to Explore <span className="gradient-text-2025">Safely?</span>
              </h2>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                Start your journey with India's most comprehensive safety platform. Peace of mind included.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  variant="primary"
                  size="xlarge"
                  icon={<Sparkles className="w-6 h-6" />}
                  className="bg-gradient-to-r from-accent-electric-yellow to-accent-coral-pink text-black font-bold"
                  onClick={scrollToTop}
                >
                  Start Safe Journey
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}

export default HomePage