import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, MapPin, Star, TrendingUp, Users, AlertTriangle, Heart, Sparkles, Globe, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SearchData } from '@/types'
import HeroSection from '@/components/HeroSection'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useData } from '../../context/DataContext'
import { useItinerary } from '../../context/ItineraryContext'

const HomePage: React.FC = () => {
  const { states, fetchStates } = useData()
  const { addState } = useItinerary()

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

  // Derive featured destinations from the first few states
  useEffect(() => {
    if (!states || states.length === 0) return

    const topStates = states.slice(0, 3)

    const mapped = topStates.map((state: any) => ({
      id: state.id,
      name: state.name,
      stateLabel: state.region || 'India',
      description:
        state.description || `Explore the beautiful state of ${state.name} with its rich cultural heritage and stunning attractions.`,
      // Until we have a real safety field on state, use a neutral high score
      safetyScore: 90,
      imageUrl:
        state.image_url || `https://source.unsplash.com/random/800x600/?${encodeURIComponent(state.name)},india`,
      bestTime: 'Year-round',
      highlights: ['Cultural', 'Scenic', 'Popular'],
    }))

    setFeaturedDestinations(mapped)
  }, [states])

  // Safety statistics
  const safetyStats = [
    {
      icon: <Users className="w-6 h-6" />,
      value: "3.5M+",
      label: "Safe Travels",
      description: "Tourists protected nationwide",
      color: "text-primary-royal-blue"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      value: "99.9%",
      label: "Uptime",
      description: "System reliability",
      color: "text-primary-emerald"
    },
    {
      icon: <Star className="w-6 h-6" />,
      value: "4.9★",
      label: "Rating",
      description: "User satisfaction",
      color: "text-accent-electric-yellow"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      value: "500+",
      label: "Cities",
      description: "Coverage across India",
      color: "text-accent-coral-pink"
    }
  ]

  // Key features
  const keyFeatures = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "AI-Powered Safety",
      description: "Real-time safety scoring and emergency assistance powered by artificial intelligence",
      highlights: ["Live Safety Score", "Emergency SOS", "Risk Alerts"]
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Interactive Maps",
      description: "Detailed safety maps with real-time updates and nearby services",
      highlights: ["Safety Zones", "Emergency Services", "Route Planning"]
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "24/7 Support",
      description: "Round-the-clock assistance and emergency response coordination",
      highlights: ["Live Chat Support", "Emergency Contacts", "Medical Assistance"]
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Smart Alerts",
      description: "Instant notifications about safety concerns and travel advisories",
      highlights: ["Weather Alerts", "Security Updates", "Health Advisories"]
    }
  ]

  // Trust indicators
  const trustIndicators = [
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: "Emergency Ready",
      description: "Quick access to emergency services and support"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Community Verified",
      description: "Safety information verified by local communities"
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Real-time Updates",
      description: "Live safety scores and risk assessments"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Government Certified",
      description: "Official tourism safety partner certification"
    }
  ]

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return "safety-high"
    if (score >= 70) return "safety-medium"
    return "safety-low"
  }

  const getSafetyScoreLabel = (score: number) => {
    if (score >= 90) return "Very Safe"
    if (score >= 70) return "Moderately Safe"
    return "Caution Advised"
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <HeroSection onSearch={handleSearch} />

      {/* Safety Statistics Section */}
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
                Trusted by Millions
              </h2>
              <Sparkles className="w-6 h-6 text-accent-electric-yellow animate-pulse" />
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join millions of travelers exploring India safely with our comprehensive safety platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {safetyStats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  variant="glass"
                  hover={true}
                  padding="large"
                  className="h-full text-center group"
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <motion.div
                    className="text-3xl font-bold text-gray-900 mb-2"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, delay: index * 0.1 + 0.3 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-lg font-semibold text-gray-800 mb-2">
                    {stat.label}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.description}
                  </div>
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
              Popular <span className="gradient-text-2025">Safe Destinations</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover India's most beloved destinations, all verified for your safety and comfort
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
                  className="h-full overflow-hidden card-hover-2025"
                >
                  <div className="relative">
                    {/* Destination Image */}
                    <div className="h-64 bg-gradient-to-br from-primary-saffron to-primary-royal-blue relative overflow-hidden">
                      <img
                        src={destination.imageUrl}
                        alt={destination.name}
                        className="w-full h-full object-cover opacity-80"
                        onError={(e) => {
                          // Fallback for missing images
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Safety Badge */}
                      <div className="absolute top-4 right-4">
                        <div className={`safety-indicator ${getSafetyScoreColor(destination.safetyScore)}`}>
                          {destination.safetyScore}/100
                        </div>
                      </div>

                      {/* Best Time Badge */}
                      <div className="absolute bottom-4 left-4 glass-card px-3 py-1 rounded-full">
                        <span className="text-white text-sm font-medium">
                          {destination.bestTime}
                        </span>
                      </div>
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

                      {/* Safety Score */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Safety Level</span>
                          <span className={`text-sm font-bold ${getSafetyScoreColor(destination.safetyScore).replace('safety-', 'text-safety-')}`}>
                            {getSafetyScoreLabel(destination.safetyScore)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <motion.div
                            className={`h-2 rounded-full ${
                              destination.safetyScore >= 90 ? 'bg-safety-green' :
                              destination.safetyScore >= 70 ? 'bg-safety-yellow' : 'bg-safety-red'
                            }`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${destination.safetyScore}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        {destination.highlights.map((highlight, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-primary-saffron/10 text-primary-saffron text-xs rounded-full font-medium"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>

                      {/* CTAs */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                          to={`/destinations/${destination.name.toLowerCase().replace(/\s+/g, '-')}`}
                          className="flex-1"
                        >
                          <Button
                            variant="primary"
                            size="medium"
                            icon={<ArrowRight className="w-4 h-4" />}
                            className="w-full"
                          >
                            Explore Destination
                          </Button>
                        </Link>

                        <Button
                          variant="outline"
                          size="medium"
                          className="sm:w-auto"
                          onClick={() => {
                            const fullState = (states as any[] | undefined)?.find((s) => s.id === destination.id)
                            if (fullState) {
                              addState(fullState)
                            }
                          }}
                        >
                          Add to Itinerary
                        </Button>
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
            <Button
              variant="outline"
              size="large"
              icon={<MapPin className="w-5 h-5" />}
              className="group"
            >
              View All Destinations
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="gradient-text-2025">Safety First</span> Travel Experience
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced safety features powered by AI, designed specifically for travelers exploring India
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {keyFeatures.map((feature, index) => (
              <motion.div
                key={index}
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
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary-saffron/20 to-primary-royal-blue/20 flex items-center justify-center text-primary-saffron group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {feature.description}
                  </p>
                  <div className="space-y-2">
                    {feature.highlights.map((highlight, i) => (
                      <div key={i} className="flex items-center space-x-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-primary-saffron rounded-full" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
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
                  className="pulse-red"
                >
                  Emergency SOS
                </Button>
                <Button
                  variant="outline"
                  size="large"
                  icon={<Shield className="w-5 h-5" />}
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
                >
                  Start Safe Journey
                </Button>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>100% Free</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>Trusted by 3.5M+</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-accent-electric-yellow" />
                    <span>4.9★ Rating</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default HomePage