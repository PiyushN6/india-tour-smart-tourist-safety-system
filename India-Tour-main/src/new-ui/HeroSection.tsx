import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Calendar,
  Users,
  Shield,
  MapPin,
  Clock,
  TrendingUp,
  Star,
  ArrowRight,
  Sparkles,
  Compass,
  Heart
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { SearchData } from '@/types'
import Button from './Button'

interface HeroSectionProps {
  onSearch?: (searchData: SearchData) => void
}

const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const [searchData, setSearchData] = useState<SearchData>({
    destination: '',
    dates: {
      start: new Date(),
      end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    },
    travelType: 'solo',
    safetyLevel: 'beginner'
  })
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [destinationSuggestions, setDestinationSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const navigate = useNavigate()
  const formRef = useRef<HTMLFormElement>(null)

  // Background images for parallax effect
  const heroImages = [
    {
      url: '/images/hero-taj-mahal.jpg',
      title: 'Taj Mahal, Agra',
      description: 'Symbol of Eternal Love'
    },
    {
      url: '/images/hero-kerala-backwaters.jpg',
      title: 'Kerala Backwaters',
      description: 'Serene Southern Beauty'
    },
    {
      url: '/images/hero-rajasthan-palace.jpg',
      title: 'Rajasthan Palaces',
      description: 'Royal Heritage'
    },
    {
      url: '/images/hero-himalayan-peaks.jpg',
      title: 'Himalayan Peaks',
      description: 'Majestic Northern Heights'
    }
  ]

  // Sample destination suggestions
  const allDestinations = [
    'Agra, Uttar Pradesh',
    'Jaipur, Rajasthan',
    'Kerala Backwaters',
    'Goa Beaches',
    'Varanasi, Uttar Pradesh',
    'Kashmir Valley',
    'Rishikesh, Uttarakhand',
    'Mumbai, Maharashtra',
    'Delhi',
    'Golden Triangle (Delhi-Agra-Jaipur)'
  ]

  // Auto-rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 10000) // Change every 10 seconds

    return () => clearInterval(interval)
  }, [heroImages.length])

  // Handle mouse position for 3D effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (formRef.current && formRef.current.contains(e.target as Node)) {
        const rect = formRef.current.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
        setMousePosition({ x, y })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Filter destination suggestions
  useEffect(() => {
    if (searchData.destination.length > 0) {
      const filtered = allDestinations.filter(dest =>
        dest.toLowerCase().includes(searchData.destination.toLowerCase())
      ).slice(0, 5)
      setDestinationSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setDestinationSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchData.destination])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchData.destination.trim()) {
      if (onSearch) {
        onSearch(searchData)
      } else {
        // Navigate to destinations page with search parameters
        const params = new URLSearchParams({
          destination: searchData.destination,
          travelType: searchData.travelType,
          safetyLevel: searchData.safetyLevel,
          startDate: searchData.dates.start.toISOString(),
          endDate: searchData.dates.end.toISOString()
        })
        navigate(`/destinations?${params.toString()}`)
      }
      setShowSuggestions(false)
    }
  }

  const handleDestinationSelect = (destination: string) => {
    setSearchData(prev => ({ ...prev, destination }))
    setShowSuggestions(false)
  }

  const getSafetyLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-600 bg-green-50 border-green-200'
      case 'intermediate': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'experienced': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTravelTypeIcon = (type: string) => {
    switch (type) {
      case 'solo': return <Users className="w-4 h-4" />
      case 'family': return <Heart className="w-4 h-4" />
      case 'adventure': return <Compass className="w-4 h-4" />
      case 'cultural': return <Star className="w-4 h-4" />
      default: return <MapPin className="w-4 h-4" />
    }
  }

  const safetyLevels = [
    { value: 'beginner', label: 'Beginner', description: 'Maximum safety features' },
    { value: 'intermediate', label: 'Intermediate', description: 'Balanced safety & experience' },
    { value: 'experienced', label: 'Experienced', description: 'More independent exploration' }
  ]

  const travelTypes = [
    { value: 'solo', label: 'Solo Travel', description: 'Independent exploration' },
    { value: 'family', label: 'Family Trip', description: 'Kid-friendly destinations' },
    { value: 'adventure', label: 'Adventure', description: 'Thrilling experiences' },
    { value: 'cultural', label: 'Cultural', description: 'Heritage & traditions' }
  ]

  const currentImage = heroImages[currentImageIndex]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden parallax-hero">
      {/* Background Image with Parallax */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
            style={{
              backgroundImage: `url(${currentImage.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-saffron/30 via-primary-royal-blue/20 to-primary-emerald/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute inset-0 grain-overlay" />
          </motion.div>
        </AnimatePresence>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0
              }}
              animate={{
                y: [null, -window.innerHeight - 100],
                x: [null, Math.random() * 200 - 100],
                opacity: [0, 0.8, 0]
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 10,
                ease: 'linear'
              }}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            className="text-center lg:text-left space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            {/* Main Headline */}
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <span className="block gradient-text-2025">DISCOVER INDIA</span>
              <span className="block">WITH COMPLETE</span>
              <span className="block">PEACE OF MIND</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              className="text-lg sm:text-xl text-white/90 max-w-lg mx-auto lg:mx-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7 }}
            >
              <span className="flex items-center justify-center lg:justify-start space-x-2">
                <Sparkles className="w-5 h-5 text-accent-electric-yellow" />
                <span>AI-Powered Safety + Authentic Experiences</span>
                <Sparkles className="w-5 h-5 text-accent-electric-yellow" />
              </span>
            </motion.p>

            {/* Trust Badges */}
            <motion.div
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.9 }}
            >
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Shield className="w-5 h-5 text-accent-electric-yellow" />
                <span className="font-semibold">3.5M+</span>
                <span className="text-sm">Safe Travels</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <MapPin className="w-5 h-5 text-accent-electric-yellow" />
                <span className="font-semibold">500+</span>
                <span className="text-sm">Cities</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <TrendingUp className="w-5 h-5 text-accent-electric-yellow" />
                <span className="font-semibold">99.9%</span>
                <span className="text-sm">Uptime</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Search Widget */}
          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <motion.form
              ref={formRef}
              onSubmit={handleSearch}
              className="w-full max-w-md glass-card-intense p-8 bubble-float"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
              style={{
                transform: `perspective(1000px) rotateX(${-mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`
              }}
            >
              {/* Form Title */}
              <motion.div
                className="text-center mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h2 className="text-2xl font-bold text-white mb-2">
                  Explore Safely
                </h2>
                <p className="text-white/80 text-sm">
                  Find your perfect Indian adventure with comprehensive safety features
                </p>
              </motion.div>

              {/* Destination Input */}
              <motion.div
                className="mb-6 relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
              >
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchData.destination}
                    onChange={(e) => setSearchData(prev => ({ ...prev, destination: e.target.value }))}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder="Where would you like to go?"
                    className={cn(
                      'w-full pl-12 pr-4 py-4 rounded-xl border-2 transition-all duration-200 bg-white/95 backdrop-blur-sm',
                      'focus:outline-none focus:ring-2 focus:ring-primary-saffron/50',
                      isSearchFocused
                        ? 'border-primary-saffron shadow-lg'
                        : 'border-white/30'
                    )}
                  />
                </div>

                {/* Destination Suggestions */}
                <AnimatePresence>
                  {showSuggestions && destinationSuggestions.length > 0 && (
                    <motion.div
                      className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl border border-white/30 overflow-hidden z-50"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {destinationSuggestions.map((suggestion, index) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleDestinationSelect(suggestion)}
                          className="w-full px-4 py-3 text-left hover:bg-white/20 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{suggestion}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Date Range */}
              <motion.div
                className="mb-6 grid grid-cols-2 gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
              >
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={searchData.dates.start.toISOString().split('T')[0]}
                    onChange={(e) => setSearchData(prev => ({
                      ...prev,
                      dates: { ...prev.dates, start: new Date(e.target.value) }
                    }))}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-white/30 bg-white/95 backdrop-blur-sm focus:outline-none focus:border-primary-saffron focus:ring-2 focus:ring-primary-saffron/50"
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={searchData.dates.end.toISOString().split('T')[0]}
                    onChange={(e) => setSearchData(prev => ({
                      ...prev,
                      dates: { ...prev.dates, end: new Date(e.target.value) }
                    }))}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-white/30 bg-white/95 backdrop-blur-sm focus:outline-none focus:border-primary-saffron focus:ring-2 focus:ring-primary-saffron/50"
                  />
                </div>
              </motion.div>

              {/* Travel Type Selector */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
              >
                <label className="block text-white text-sm font-medium mb-3">
                  Travel Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {travelTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSearchData(prev => ({ ...prev, travelType: type.value as any }))}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all duration-200 bg-white/95 backdrop-blur-sm flex flex-col items-center space-y-1',
                        searchData.travelType === type.value
                          ? 'border-primary-saffron bg-primary-saffron text-white'
                          : 'border-white/30 hover:border-white/50'
                      )}
                    >
                      {getTravelTypeIcon(type.value)}
                      <span className="text-xs font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Safety Level Slider */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
              >
                <label className="block text-white text-sm font-medium mb-3">
                  Safety Preference
                </label>
                <div className="space-y-2">
                  {safetyLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setSearchData(prev => ({ ...prev, safetyLevel: level.value as any }))}
                      className={cn(
                        'w-full p-3 rounded-lg border-2 transition-all duration-200 bg-white/95 backdrop-blur-sm text-left',
                        searchData.safetyLevel === level.value
                          ? 'border-primary-saffron'
                          : 'border-white/30 hover:border-white/50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm font-medium">{level.label}</span>
                        </div>
                        <span className="text-xs text-gray-500">{level.description}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Search Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  fullWidth
                  icon={<ArrowRight className="w-5 h-5" />}
                  className="bg-gradient-to-r from-accent-electric-yellow to-accent-coral-pink text-black font-bold text-lg shadow-glass-intense hover:shadow-3d-hover border-2 border-accent-electric-yellow/50 hover:scale-105"
                >
                  Explore Safely
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                className="mt-6 flex items-center justify-center space-x-4 text-white/80 text-xs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3 text-green-400" />
                  <span>Verified Safe</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-yellow-400" />
                  <span>24/7 Support</span>
                </div>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
        >
          <motion.div
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-1 h-3 bg-white rounded-full"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          <span className="text-sm text-white/70 mt-2 block">Scroll to explore</span>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection