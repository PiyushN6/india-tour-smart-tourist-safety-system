import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Star, Target, Heart, Zap } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuth } from '../../../context/AuthContext'
import { useItinerary } from '../../../context/ItineraryContext'
import { fetchMySafetyScore } from '../../../services/safetyApi'

const GamificationSystem: React.FC = () => {
  const { user, session } = useAuth()
  const { items } = useItinerary()
  const [safetyScore, setSafetyScore] = useState<number | null>(null)
  const [isLoadingScore, setIsLoadingScore] = useState(false)
  const [scoreError, setScoreError] = useState<string | null>(null)

  const favoriteCount = user?.favoriteDestinations?.length ?? 0
  const itineraryCount = items.length

  useEffect(() => {
    if (!session) return
    let cancelled = false
    const loadScore = async () => {
      try {
        setIsLoadingScore(true)
        setScoreError(null)
        const score = await fetchMySafetyScore(session)
        if (!cancelled) setSafetyScore(score)
      } catch {
        if (!cancelled) setScoreError('Unable to load safety score right now.')
      } finally {
        if (!cancelled) setIsLoadingScore(false)
      }
    }
    void loadScore()
    return () => {
      cancelled = true
    }
  }, [session])

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Trophy className="w-8 h-8 text-primary-saffron" />
            <h1 className="text-4xl font-bold gradient-text-2025">
              Gamification System
            </h1>
            <Star className="w-8 h-8 text-primary-royal-blue" />
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Earn badges, complete challenges, and level up your safety score while exploring India
          </p>
        </motion.div>

        <motion.div
          className="glass-card-intense p-8 md:p-12 grid gap-8 md:grid-cols-3 items-stretch"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="md:col-span-2 flex flex-col justify-between text-left">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                Your Travel Progress
              </h2>
              <p className="text-sm md:text-base text-gray-600 mb-6 max-w-xl">
                These live stats use your real profile, itinerary and safety data. Well build richer
                challenges and badges on top of this foundation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white/80 border border-orange-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Favorite destinations</p>
                  <p className="text-xl font-bold text-gray-900">{favoriteCount}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-white/80 border border-blue-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Itinerary items</p>
                  <p className="text-xl font-bold text-gray-900">{itineraryCount}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-white/80 border border-emerald-100 p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Safety score</p>
                  {isLoadingScore ? (
                    <p className="text-sm text-gray-500">Loading...</p>
                  ) : scoreError ? (
                    <p className="text-[11px] text-red-500">{scoreError}</p>
                  ) : safetyScore == null ? (
                    <p className="text-sm text-gray-500">No data yet</p>
                  ) : (
                    <p className="text-xl font-bold text-gray-900">{safetyScore}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-500 text-white p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-300" />
                Coming soon: challenge engine
              </h3>
              <p className="text-sm text-indigo-50 mb-4">
                Well turn these stats into travel quests, streaks and badges. For now, this card is a
                preview of the gamification layer.
              </p>
            </div>
            <p className="text-xs text-indigo-100">
              Tip: add destinations to favourites, build itineraries and use the safety system so your
              progress is ready when gamification fully launches.
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}

export default GamificationSystem