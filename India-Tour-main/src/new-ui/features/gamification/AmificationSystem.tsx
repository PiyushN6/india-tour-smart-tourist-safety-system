import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Star,
  Shield,
  MapPin,
  Heart,
  Zap,
  Target,
  Users,
  Clock,
  TrendingUp,
  Award,
  Gift,
  Flame,
  Crown,
  Lock,
  Unlock,
  CheckCircle,
  Sparkles
} from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { Badge, Achievement, Challenge } from '@/types'

const GamificationSystem: React.FC = () => {
  const [userStats, setUserStats] = useState({
    totalPoints: 2850,
    currentStreak: 12,
    badgesUnlocked: 18,
    challengesCompleted: 7,
    level: 'Safety Explorer',
    nextLevelPoints: 500,
    completedTrips: 23,
    helpProvided: 15,
    reviewsWritten: 8
  })

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'safety' | 'exploration' | 'cultural' | 'community'>('all')
  const [activeTab, setActiveTab] = useState<'badges' | 'challenges' | 'achievements'>('badges')
  const [animatingBadge, setAnimatingBadge] = useState<string | null>(null)

  // Sample badges data
  const userBadges: Badge[] = [
    {
      id: 'safety-champion',
      name: 'Safety Champion',
      description: 'Achieved perfect safety score on 10+ trips',
      icon: <Shield className="w-8 h-8" />,
      category: 'safety',
      rarity: 'legendary',
      unlockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      progress: 10,
      maxProgress: 10
    },
    {
      id: 'cultural-explorer',
      name: 'Cultural Explorer',
      description: 'Visited 15+ cultural heritage sites',
      icon: <MapPin className="w-8 h-8" />,
      category: 'exploration',
      rarity: 'epic',
      unlockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      progress: 15,
      maxProgress: 20
    },
    {
      id: 'local-hero',
      name: 'Local Hero',
      description: 'Helped 10+ fellow travelers',
      icon: <Heart className="w-8 h-8" />,
      category: 'community',
      rarity: 'rare',
      unlockedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      progress: 10,
      maxProgress: 15
    },
    {
      id: 'food-adventurer',
      name: 'Food Adventurer',
      description: 'Tried 10+ local Indian dishes',
      icon: <Star className="w-8 h-8" />,
      category: 'cultural',
      rarity: 'common',
      unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      progress: 10,
      maxProgress: 12
    },
    {
      id: 'night-owl',
      name: 'Night Owl',
      description: 'Explored safely after dark 25+ times',
      icon: <Clock className="w-8 h-8" />,
      category: 'safety',
      rarity: 'rare',
      unlockedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      progress: 25,
      maxProgress: 30
    },
    {
      id: 'trail-blazer',
      name: 'Trail Blazer',
      description: 'Completed 500+ km of safe travel',
      icon: <TrendingUp className="w-8 h-8" />,
      category: 'exploration',
      rarity: 'epic',
      unlockedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      progress: 520,
      maxProgress: 1000
    }
  ]

  // Sample challenges
  const challenges: Challenge[] = [
    {
      id: 'golden-triangle-quest',
      title: 'Golden Triangle Explorer',
      description: 'Visit Delhi, Agra, and Jaipur safely within 14 days',
      type: 'exploration',
      points: 500,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      progress: 2,
      maxProgress: 3,
      requirements: [
        'Take safety selfie at Taj Mahal',
        'Complete safety quiz for each city',
        'Maintain safety score above 80 throughout trip'
      ],
      rewards: {
        points: 500,
        badge: 'golden-triangle-master'
      }
    },
    {
      id: 'street-food-champion',
      title: 'Street Food Champion',
      description: 'Try 15 different local street foods safely',
      type: 'cultural',
      points: 300,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      progress: 8,
      maxProgress: 15,
      requirements: [
        'Document each food with safety photo',
        'Rate hygiene and safety of each location',
        'Share recommendations with community'
      ],
      rewards: {
        points: 300,
        badge: 'food-critic'
      }
    },
    {
      id: 'guardian-angel',
      title: 'Guardian Angel',
      description: 'Help 5 travelers in emergency situations',
      type: 'community',
      points: 1000,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      progress: 2,
      maxProgress: 5,
      requirements: [
        'Respond to emergency alerts within 5 minutes',
        'Provide verified assistance to travelers',
        'Get positive feedback from helped travelers'
      ],
      rewards: {
        points: 1000,
        badge: 'community-guardian'
      }
    },
    {
      id: 'safety-scholar',
      title: 'Safety Scholar',
      description: 'Complete all safety quizzes with 90%+ accuracy',
      type: 'safety',
      points: 200,
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      progress: 12,
      maxProgress: 15,
      requirements: [
        'Complete emergency procedure modules',
        'Score 90%+ on all safety tests',
        'Share safety tips with 10+ travelers'
      ],
      rewards: {
        points: 200,
        badge: 'safety-expert'
      }
    }
  ]

  // Sample achievements
  const achievements: Achievement[] = [
    {
      id: 'first-safe-trip',
      title: 'First Safe Journey',
      description: 'Completed first trip with 100% safety score',
      points: 100,
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      unlockedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'samaritan-spirit',
      title: 'Good Samaritan',
      description: 'Successfully helped traveler in distress',
      points: 500,
      icon: <Heart className="w-6 h-6 text-red-500" />,
      unlockedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'cultural-master',
      title: 'Cultural Master',
      description: 'Learned greetings in 5+ Indian languages',
      points: 250,
      icon: <Star className="w-6 h-6 text-purple-500" />,
      unlockedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'milestone-1000-points',
      title: 'Point Master',
      description: 'Earned 1000+ safety points',
      icon: <Zap className="w-6 h-6 text-blue-500" />,
      unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-400 bg-gray-100'
      case 'rare':
        return 'border-blue-400 bg-blue-100'
      case 'epic':
        return 'border-purple-400 bg-purple-100'
      case 'legendary':
        return 'border-yellow-400 bg-yellow-100 text-yellow-800'
      default:
        return 'border-gray-400 bg-gray-100'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'safety':
        return <Shield className="w-6 h-6 text-green-600" />
      case 'exploration':
        return <MapPin className="w-6 h-6 text-blue-600" />
      case 'cultural':
        return <Star className="w-6 h-6 text-purple-600" />
      case 'community':
        return <Heart className="w-6 h-6 text-red-600" />
      default:
        return <Trophy className="w-6 h-6 text-yellow-600" />
    }
  }

  const getChallengeProgress = (challenge: Challenge) => {
    const percentage = (challenge.progress / challenge.maxProgress) * 100
    return Math.min(percentage, 100)
  }

  const handleUnlockAnimation = useCallback((badgeId: string) => {
    setAnimatingBadge(badgeId)
    setTimeout(() => setAnimatingBadge(null), 2000)
  }, [])

  const filteredBadges = selectedCategory === 'all'
    ? userBadges
    : userBadges.filter(badge => badge.category === selectedCategory)

  const filteredChallenges = selectedCategory === 'all'
    ? challenges
    : challenges.filter(challenge => challenge.type === selectedCategory)

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
            <Trophy className="w-8 h-8 text-primary-saffron animate-bounce-gentle" />
            <h1 className="text-4xl font-bold gradient-text-2025">
              Safety Gamification
            </h1>
            <Trophy className="w-8 h-8 text-primary-royal-blue animate-bounce-gentle" />
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Earn rewards, unlock achievements, and level up your safety skills while exploring India safely
          </p>
        </motion.div>

        {/* User Stats Overview */}
        <motion.div
          className="glass-card-intense p-8 mb-12 border-2 border-primary-saffron/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-saffron to-primary-royal-blue rounded-full flex items-center justify-center text-white shadow-lg">
                <Zap className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-primary-saffron">{userStats.totalPoints.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>

            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <Flame className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-green-600">{userStats.currentStreak}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>

            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg">
                <Award className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold text-yellow-600">{userStats.badgesUnlocked}</div>
              <div className="text-sm text-gray-600">Badges Unlocked</div>
            </div>

            <div className="space-y-2">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
                <Crown className="w-8 h-8" />
              </div>
              <div className="text-lg font-semibold text-purple-600">{userStats.level}</div>
              <div className="text-sm text-gray-600">Current Level</div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {[
            { id: 'badges', label: 'Badges', icon: <Trophy className="w-5 h-5" /> },
            { id: 'challenges', label: 'Challenges', icon: <Target className="w-5 h-5" /> },
            { id: 'achievements', label: 'Achievements', icon: <Award className="w-5 h-5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary-saffron text-white shadow-lg transform -translate-y-1'
                  : 'bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-primary-saffron hover:shadow-md'
              }`}
            >
              <span className="transition-transform duration-200 group-hover:scale-110">
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Category Filter */}
        {activeTab === 'badges' && (
          <motion.div
            className="flex flex-wrap justify-center gap-3 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {[
              { id: 'all', label: 'All', icon: <Trophy className="w-4 h-4" /> },
              { id: 'safety', label: 'Safety', icon: <Shield className="w-4 h-4" /> },
              { id: 'exploration', label: 'Exploration', icon: <MapPin className="w-4 h-4" /> },
              { id: 'cultural', label: 'Cultural', icon: <Star className="w-4 h-4" /> },
              { id: 'community', label: 'Community', icon: <Heart className="w-4 h-4" /> }
          ].map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-primary-saffron text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="transition-transform duration-200 hover:scale-110">
                  {category.icon}
                </span>
                <span>{category.label}</span>
              </button>
            ))}
          </motion.div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'badges' && (
            <motion.div
              key="badges"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              {filteredBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    variant="glass"
                    hover={true}
                    padding="medium"
                    className="relative overflow-hidden card-3d-hover"
                    onClick={() => handleUnlockAnimation(badge.id)}
                  >
                    {/* Badge Rarity Border */}
                    <div className={`absolute inset-0 border-4 rounded-2xl ${getRarityColor(badge.rarity)} opacity-50`} />

                    {/* Badge Content */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <span className="text-2xl">
                              {badge.icon}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">{badge.name}</h3>
                            <p className="text-sm text-gray-600 capitalize">{badge.rarity}</p>
                          </div>
                        </div>
                        {animatingBadge === badge.id && (
                          <motion.div
                            className="text-green-600"
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 360, 720] }}
                            transition={{ duration: 1, times: [0, 0.5, 0.5] }}
                          >
                            <Unlock className="w-6 h-6" />
                          </motion.div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <p className="text-gray-700">{badge.description}</p>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium text-gray-900">
                              {badge.progress}/{badge.maxProgress}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <motion.div
                              className="h-3 bg-gradient-to-r from-primary-saffron to-primary-royal-blue rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                              transition={{ duration: 0.8, delay: index * 0.1 + 0.5 }}
                            />
                          </div>
                        </div>

                        {/* Unlock Date */}
                        {badge.unlockedAt && (
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>Unlocked {badge.unlockedAt.toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rarity Badge */}
                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${getRarityColor(badge.rarity)}`}>
                      {badge.rarity.toUpperCase()}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'challenges' && (
            <motion.div
              key="challenges"
              className="space-y-6 mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              {filteredChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                >
                  <Card
                    variant="brutal"
                    hover={true}
                    padding="large"
                    className="relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary-saffron rounded-full flex items-center justify-center text-white">
                          <Target className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{challenge.title}</h3>
                          <div className="flex items-center space-x-2 text-sm">
                            <Sparkles className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium text-gray-700">{challenge.points} points</span>
                            <span className="text-gray-500">•</span>
                            <span className="text-gray-600">{challenge.type} challenge</span>
                          </div>
                        </div>
                      </div>
                      {challenge.deadline && (
                        <div className="text-right">
                          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            new Date() > challenge.deadline
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {new Date() > challenge.deadline ? 'Expired' : 'Active'}
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 mb-6">{challenge.description}</p>

                    {/* Requirements */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Requirements:</h4>
                      <ul className="space-y-2">
                        {challenge.requirements.map((req, reqIndex) => (
                          <li key={reqIndex} className="flex items-start space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Progress */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Progress</span>
                        <span className="font-bold text-gray-900">
                          {getChallengeProgress(challenge)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4">
                        <motion.div
                          className="h-4 bg-gradient-to-r from-primary-saffron to-primary-emerald rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${getChallengeProgress(challenge)}%` }}
                          transition={{ duration: 1, delay: index * 0.2 + 0.5 }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{challenge.progress} / {challenge.maxProgress}</span>
                        {challenge.deadline && (
                          <span>Ends: {challenge.deadline.toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Rewards */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <h4 className="font-semibold text-gray-900">Rewards</h4>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium text-gray-900">{challenge.rewards.points}</span>
                          </div>
                          {challenge.rewards.badge && (
                            <div className="flex items-center space-x-1">
                              <Award className="w-4 h-4 text-purple-500" />
                              <span className="font-medium text-gray-900">{challenge.rewards.badge}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="medium"
                        icon={<Gift className="w-4 h-4" />}
                        disabled={getChallengeProgress(challenge) < 100}
                        className="w-32"
                      >
                        {getChallengeProgress(challenge) >= 100 ? 'Claimed' : 'Locked'}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, rotate: -5 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -3 }}
                >
                  <Card
                    variant="interactive"
                    hover={true}
                    padding="medium"
                    className="text-center card-hover-2025"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white shadow-lg bubble-float">
                      {achievement.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{achievement.title}</h3>
                    <p className="text-gray-600 mb-4">{achievement.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Zap className="w-4 h-4" />
                        <span>{achievement.points} points</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {achievement.unlockedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Level Progress */}
        <motion.div
          className="glass-card-intense p-8 text-center border-2 border-primary-saffron/30"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Level Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-saffron mb-2">{userStats.level}</div>
              <div className="text-sm text-gray-600">Current Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">{userStats.totalPoints}</div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">{userStats.nextLevelPoints}</div>
              <div className="text-sm text-gray-600">Points to Next Level</div>
            </div>
          </div>

          <div className="mt-6">
            <div className="w-full bg-gray-200 rounded-full h-6">
              <motion.div
                className="h-6 bg-gradient-to-r from-primary-saffron to-primary-royal-blue rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${(userStats.totalPoints / (userStats.totalPoints + userStats.nextLevelPoints)) * 100}%`
                }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>{userStats.totalPoints} points earned</span>
              <span>{userStats.totalPoints + userStats.nextLevelPoints} points for next level</span>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}

export default GamificationSystem