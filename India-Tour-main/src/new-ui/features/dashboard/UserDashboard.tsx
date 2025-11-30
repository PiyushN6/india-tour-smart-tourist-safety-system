import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Heart,
  MapPin,
  Star,
  Calendar,
  Users,
  TrendingUp,
  Activity,
  Clock,
  AlertTriangle,
  Zap,
  Award,
  Book,
  Navigation,
  Phone,
  Globe,
  Settings,
  Bell
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Card from '@/components/Card'
import Button from '@/components/Button'
import { UserProfile, SafetyMetrics, UserMetrics } from '@/types'

const UserDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'safety' | 'trips' | 'achievements' | 'analytics'>('overview')
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)

  // Sample user data (would come from API/backend)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'user-123',
    name: 'Alex Traveler',
    email: 'alex@safetravel.com',
    avatar: '/images/avatars/user-1.jpg',
    safetyScore: 87,
    badges: [
      {
        id: 'safety-champion',
        name: 'Safety Champion',
        description: 'Achieved perfect safety score on 10+ trips',
        icon: <Shield className="w-4 h-4" />,
        category: 'safety',
        rarity: 'legendary',
        unlockedAt: new Date('2024-03-15'),
        progress: 10,
        maxProgress: 10
      },
      {
        id: 'cultural-explorer',
        name: 'Cultural Explorer',
        description: 'Visited 15+ UNESCO heritage sites',
        icon: <MapPin className="w-4 h-4" />,
        category: 'exploration',
        rarity: 'epic',
        unlockedAt: new Date('2024-02-28'),
        progress: 15,
        maxProgress: 20
      },
      {
        id: 'community-helper',
        name: 'Community Helper',
        description: 'Assisted 10+ travelers in emergency situations',
        icon: <Heart className="w-4 h-4" />,
        category: 'community',
        rarity: 'rare',
        unlockedAt: new Date('2024-01-20'),
        progress: 10,
        maxProgress: 10
      }
    ],
    achievements: [
      {
        id: 'first-safe-trip',
        title: 'First Safe Journey',
        description: 'Completed first trip with 100% safety score',
        points: 100,
        icon: <Award className="w-4 h-4" />,
        unlockedAt: new Date('2024-01-15')
      },
      {
        id: 'samaritan',
        title: 'Good Samaritan',
        description: 'Successfully helped fellow traveler in need',
        points: 500,
        icon: <Heart className="w-4 h-4" />,
        unlockedAt: new Date('2024-02-14')
      },
      {
        id: 'cultural-master',
        title: 'Cultural Master',
        description: 'Learned greetings in 8 Indian languages',
        points: 250,
        icon: <Globe className="w-4 h-4" />,
        unlockedAt: new Date('2024-03-01')
      }
    ],
    tripsCompleted: 23,
    safeDays: 892,
    points: 2850,
    preferences: {
      notifications: true,
      locationSharing: true,
      emergencyContacts: []
    }
  })

  // Sample safety metrics
  const [safetyMetrics, setSafetyMetrics] = useState<SafetyMetrics>({
    overallSafety: 87,
    regionalScores: {
      'Delhi': 92,
      'Mumbai': 85,
      'Bangalore': 90,
      'Kerala': 88,
      'Rajasthan': 78
    },
    incidentTypes: {
      'security': 3,
      'health': 2,
      'environmental': 1,
      'traffic': 7
    },
    responseTimes: {
      police: 4.2,
      medical: 6.1,
      embassy: 12.3
    },
    userSatisfaction: 94.7
  })

  // Sample user metrics
  const [userMetrics, setUserMetrics] = useState<UserMetrics>({
    totalDistance: 15420,
    safeTravels: 23,
    alertsAvoided: 47,
    helpProvided: 12,
    reviewsWritten: 8,
    photosShared: 156,
    communityScore: 89.2
  })

  // Safety score trend data (last 30 days)
  const safetyTrend = [
    { date: '2024-11-01', score: 92 },
    { date: '2024-11-05', score: 88 },
    { date: '2024-11-10', score: 85 },
    { date: '2024-11-15', score: 87 },
    { date: '2024-11-20', score: 89 },
    { date: '2024-11-25', score: 91 },
    { date: '2024-11-30', score: 87 }
  ]

  // Incident type distribution
  const incidentData = Object.entries(safetyMetrics.incidentTypes).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    color: key === 'security' ? '#EF4444' : key === 'health' ? '#22C55E' : key === 'environmental' ? '#00A86B' : '#F59E0B'
  }))

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return 'text-safety-high'
    if (score >= 70) return 'text-safety-medium'
    return 'text-safety-low'
  }

  const getSafetyScoreLabel = (score: number) => {
    if (score >= 90) return 'Very Safe'
    if (score >= 70) return 'Moderately Safe'
    return 'Caution Advised'
  }

  const getSafetyLevelColor = (score: number) => {
    if (score >= 90) return 'bg-safety-green text-white'
    if (score >= 70) return 'bg-safety-yellow text-white'
    return 'bg-safety-red text-white'
  }

  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: <Shield className="w-5 h-5" /> },
    { id: 'safety', label: 'Safety', icon: <Shield className="w-5 h-5" /> },
    { id: 'trips', label: 'Trips', icon: <MapPin className="w-5 h-5" /> },
    { id: 'achievements', label: 'Achievements', icon: <Award className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-5 h-5" /> }
  ]

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const toggleNotifications = () => {
    setNotifications(!notifications)
  }

  // Quick Actions Component
  const QuickActions: React.FC = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      <Card variant="interactive" hover={true} padding="medium" className="h-full">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-saffron/20 to-primary-royal-blue/20 rounded-full flex items-center justify-center text-primary-saffron">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Safety Check</h4>
            <p className="text-sm text-gray-600">Run safety analysis</p>
          </div>
        </div>
      </Card>

      <Card variant="interactive" hover={true} padding="medium" className="h-full">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-full flex items-center justify-center text-emerald-600">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Emergency SOS</h4>
            <p className="text-sm text-gray-600">One-tap emergency</p>
          </div>
        </div>
      </Card>

      <Card variant="interactive" hover={true} padding="medium" className="h-full">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center text-yellow-600">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Notifications</h4>
            <p className="text-sm text-gray-600">Alert preferences</p>
          </div>
        </div>
      </Card>

      <Card variant="interactive" hover={true} padding="medium" className="h-full">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-full flex items-center justify-center text-purple-600">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Emergency Contacts</h4>
            <p className="text-sm text-gray-600">Manage contacts</p>
          </div>
        </div>
      </Card>
    </motion.div>
  )

  // Safety Overview Component
  const SafetyOverview: React.FC = () => (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <Card variant="glass" hover={true} padding="large">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Safe', value: 87, fill: '#22C55E' },
                      { name: 'Caution', value: 13, fill: '#F59E0B' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {safetyMetrics.overallSafety >= 90 ? (
                      <Cell fill="#22C55E" />
                    ) : safetyMetrics.overallSafety >= 70 ? (
                      <Cell fill="#F59E0B" />
                    ) : (
                      <Cell fill="#EF4444" />
                    )}
                  </Pie>
                </ResponsiveContainer>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Overall Safety</h3>
            <div className={`text-5xl font-bold mb-2 ${getSafetyScoreColor(safetyMetrics.overallSafety)}`}>
              {safetyMetrics.overallSafety}%
            </div>
            <p className={`text-lg ${getSafetyScoreColor(safetyMetrics.overallSafety)}`}>
              {getSafetyScoreLabel(safetyMetrics.overallSafety)}
            </p>
          </div>
        </Card>

        <Card variant="glass" hover={true} padding="large">
          <div className="text-center">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Security</span>
                </div>
                <div className="text-2xl font-bold text-green-600">92</div>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Heart className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Health</span>
                </div>
                <div className="text-2xl font-bold text-green-600">85</div>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Activity className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-gray-600">Environment</span>
                </div>
                <div className="text-2xl font-bold text-yellow-600">91</div>
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-gray-600">Response</span>
                </div>
                <div className="text-2xl font-bold text-red-600">7.2min</div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">Response Time: <span className="font-semibold">7.2min avg</span></span>
              <span className="text-sm text-gray-600">Satisfaction: <span className="font-semibold">94.7%</span></span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Safety Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card variant="glass" hover={true} padding="large">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">30-Day Safety Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={safetyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#FF6B35"
                  strokeWidth={3}
                  dot={{ fill: '#FF6B35', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      {/* Regional Safety Scores */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4"
      >
        {Object.entries(safetyMetrics.regionalScores).map(([region, score]) => (
          <Card key={region} variant="glass" hover={true} padding="medium">
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-2">{region}</h4>
              <div className={`text-2xl font-bold ${getSafetyScoreColor(score)}`}>
                {score}%
              </div>
              <p className={`text-sm ${getSafetyScoreColor(score)}`}>
                {getSafetyScoreLabel(score)}
              </p>
            </div>
          </Card>
        ))}
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text-2025 mb-4">
            User Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your personalized safety hub with travel insights, achievements, and real-time monitoring
          </p>
        </motion.div>

        {/* User Stats Overview */}
        <motion.div
          className="glass-card-intense p-8 mb-12 border-2 border-primary-saffron/20"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Users className="w-6 h-6 text-primary-royal-blue" />
                <h3 className="text-lg font-semibold text-gray-900">{userProfile.tripsCompleted}</h3>
              </div>
              <p className="text-gray-600">Safe Trips</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Star className="w-6 h-6 text-primary-saffron" />
                <h3 className="text-lg font-semibold text-gray-900">{userProfile.safetyScore}%</h3>
              </div>
              <p className="text-gray-600">Safety Score</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Trophy className="w-6 h-6 text-accent-electric-yellow" />
                <h3 className="text-lg font-semibold text-gray-900">{userProfile.points.toLocaleString()}</h3>
              </div>
              <p className="text-gray-600">Total Points</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Heart className="w-6 h-6 text-accent-coral-pink" />
                <h3 className="text-lg font-semibold text-gray-900">{userProfile.badges.length}</h3>
              </div>
              <p className="text-gray-600">Badges Earned</p>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {navigationItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-primary-saffron text-white shadow-lg scale-105'
                  : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md hover:scale-105'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item.icon}
              <span>{item.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Settings Bar */}
        <div className="flex justify-end space-x-4 mb-8">
          <Button
            variant={darkMode ? "primary" : "outline"}
            size="small"
            icon={darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            onClick={toggleDarkMode}
            className="hidden sm:flex"
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
          <Button
            variant={notifications ? "primary" : "outline"}
            size="small"
            icon={<Bell className="w-4 h-4" />}
            onClick={toggleNotifications}
          >
            {notifications ? 'Notifications On' : 'Notifications Off'}
          </Button>
        </div>

        {/* Content Sections */}
        <AnimatePresence mode="wait">
          {activeSection === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <QuickActions />
              <SafetyOverview />
            </motion.div>
          )}

          {activeSection === 'safety' && (
            <motion.div
              key="safety"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card variant="glass" hover={true} padding="large">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Live Safety Monitoring</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-700">Active Monitoring</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-700">GPS Tracking</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-700">Emergency Ready</span>
                      </div>
                    </div>
                    <div className="mt-6">
                      <Button variant="primary" size="large" className="w-full">
                        <Zap className="w-5 h-5" />
                        Open Safety Dashboard
                      </Button>
                    </div>
                  </div>
                  </Card>

                  <Card variant="glass" hover={true} padding="large">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">Safety Metrics</h3>
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Overall Safety Score:</span>
                          <span className={`text-2xl font-bold ${getSafetyScoreColor(userProfile.safetyScore)}`}>
                            {userProfile.safetyScore}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Safe Travel Days:</span>
                          <span className="text-xl font-semibold text-green-600">{userProfile.safeDays}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Help Provided:</span>
                          <span className="text-xl font-semibold text-blue-600">{userMetrics.helpProvided}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Community Score:</span>
                          <span className="text-xl font-semibold text-purple-600">{userMetrics.communityScore}</span>
                        </div>
                      </div>
                      <div className="h-64 mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={incidentData}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              innerRadius={40}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {incidentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'trips' && (
            <motion.div
              key="trips"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Card variant="glass" hover={true} padding="large">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Recent Trips</h3>
                <div className="space-y-6">
                  {[
                    {
                      id: 1,
                      destination: 'Delhi - Agra - Jaipur',
                      date: '2024-10-15',
                      duration: '7 days',
                      safetyScore: 92,
                      status: 'completed'
                    },
                    {
                      id: 2,
                      destination: 'Kerala Backwaters',
                      date: '2024-09-20',
                      duration: '5 days',
                      safetyScore: 88,
                      status: 'completed'
                    },
                    {
                      id: 3,
                      destination: 'Rajasthan Heritage Tour',
                      date: '2024-08-05',
                      duration: '10 days',
                      safetyScore: 78,
                      status: 'completed'
                    }
                  ].map((trip, index) => (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md"
                    >
                      <div className="flex items-center space-x-4">
                        <MapPin className="w-5 h-5 text-primary-royal-blue" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{trip.destination}</h4>
                          <p className="text-sm text-gray-600">{trip.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`w-3 h-3 rounded-full ${getSafetyLevelColor(trip.safetyScore)}`} />
                        <span className="text-sm text-gray-600">{trip.safetyScore}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{trip.duration}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {activeSection === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Badges Section */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Badges</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userProfile.badges.map((badge, index) => (
                      <motion.div
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Card variant="interactive" hover={true} padding="medium" className="h-full">
                          <div className="text-center">
                            <div className="relative">
                              <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold ${getRarityColor(badge.rarity)}`}>
                                {badge.rarity.toUpperCase()}
                              </div>
                              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-primary-saffron/20 to-primary-royal-blue/20 rounded-full flex items-center justify-center text-primary-saffron">
                                {badge.icon}
                              </div>
                              <h4 className="font-semibold text-gray-900 mb-2">{badge.name}</h4>
                              <p className="text-sm text-gray-600 mb-4">{badge.description}</p>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Unlocked: {badge.unlockedAt.toLocaleDateString()}</span>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="h-2 bg-gradient-to-r from-primary-saffron to-primary-royal-blue rounded-full"
                                    style={{ width: `${(badge.progress / badge.maxProgress) * 100}%` }}
                                  />
                                </div>
                              </div>
                              </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Achievements Section */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Achievements</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {userProfile.achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Card variant="glass" hover={true} padding="medium">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-accent-electric-yellow/20 to-accent-coral-pink/20 rounded-full flex items-center justify-center">
                              {achievement.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">{achievement.title}</h4>
                              <p className="text-sm text-gray-600">{achievement.description}</p>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">{achievement.unlockedAt.toLocaleDateString()}</span>
                                <span className="text-sm font-semibold text-accent-electric-yellow">+{achievement.points} pts</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card variant="glass" hover={true} padding="large">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Travel Analytics</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="w-5 h-5 text-primary-saffron" />
                          <span className="text-sm text-gray-700">Total Distance</span>
                        </div>
                        <div className="text-2xl font-bold text-primary-saffron">{(userMetrics.totalDistance / 1000).toFixed(1)}k km</div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Shield className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-gray-700">Safe Trips</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">{userMetrics.safeTravels}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm text-gray-700">Alerts Avoided</span>
                        </div>
                        <div className="text-2xl font-bold text-yellow-600">{userMetrics.alertsAvoided}</div>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <Heart className="w-5 h-5 text-red-600" />
                          <span className="text-sm text-gray-700">Help Provided</span>
                        </div>
                        <div className="text-2xl font-bold text-red-600">{userMetrics.helpProvided}</div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card variant="glass" hover={true} padding="large">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Safety Trends</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'Mon', security: 2, health: 1, environmental: 0, traffic: 3 },
                        { name: 'Tue', security: 1, health: 0, environmental: 1, traffic: 2 },
                        { name: 'Wed', security: 0, health: 2, environmental: 0, traffic: 1 },
                        { name: 'Thu', security: 1, health: 1, environmental: 0, traffic: 4 },
                        { name: 'Fri', security: 2, health: 0, environmental: 1, traffic: 5 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Bar dataKey="security" fill="#EF4444" />
                        <Bar dataKey="health" fill="#22C55E" />
                        <Bar dataKey="environmental" fill="#00A86B" />
                        <Bar dataKey="traffic" fill="#F59E0B" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}

export default UserDashboard