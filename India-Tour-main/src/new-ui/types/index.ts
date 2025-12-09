import type React from 'react'

// Navigation and Routing Types
export interface RouteConfig {
  path: string
  element: React.ComponentType
  protected?: boolean
  children?: RouteConfig[]
}

// Search and Destination Types
export interface SearchData {
  destination: string
  dates: {
    start: Date
    end: Date
  }
  travelType: 'solo' | 'family' | 'adventure' | 'cultural'
  safetyLevel: 'beginner' | 'intermediate' | 'experienced'
}

export interface Destination {
  id: string
  name: string
  state: string
  description: string
  imageUrl: string
  coordinates: {
    lat: number
    lng: number
  }
  safetyScore: number
  bestTimeToVisit: string[]
  activities: string[]
  avgTemperature: {
    min: number
    max: number
  }
  budget: {
    budget: number
    mid: number
    luxury: number
  }
}

// Safety System Types
export interface SafetyScore {
  overall: number
  security: number
  health: number
  environmental: number
  trend: 'improving' | 'declining' | 'stable'
  historicalData: {
    date: string
    score: number
  }[]
}

export interface SafetyAlert {
  id: string
  type: 'security' | 'health' | 'environmental' | 'traffic' | 'weather'
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  location: string
  timestamp: Date
  coordinates?: {
    lat: number
    lng: number
  }
  isRead: boolean
}

export interface EmergencyService {
  type: 'police' | 'hospital' | 'embassy' | 'tourism'
  name: string
  distance: number
  phoneNumber: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  isAvailable: boolean
}

// User Profile and Gamification Types
export interface UserProfile {
  id: string
  name: string
  email: string
  avatar?: string
  safetyScore: number
  badges: Badge[]
  achievements: Achievement[]
  tripsCompleted: number
  safeDays: number
  points: number
  preferences: {
    notifications: boolean
    locationSharing: boolean
    emergencyContacts: EmergencyContact[]
  }
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'safety' | 'exploration' | 'cultural' | 'community'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt: Date
  progress: number
  maxProgress: number
}

export interface Achievement {
  id: string
  title: string
  description: string
  points: number
  icon: string
  unlockedAt: Date
}

export interface Challenge {
  id: string
  title: string
  description: string
  type: 'cultural' | 'safety' | 'exploration' | 'social'
  points: number
  deadline?: Date
  progress: number
  maxProgress: number
  requirements: string[]
  rewards: {
    points: number
    badge?: string
  }
}

export interface EmergencyContact {
  name: string
  relationship: string
  phoneNumber: string
  isPrimary: boolean
}

// Itinerary and Travel Types
export interface Itinerary {
  id: string
  userId: string
  title: string
  startDate: Date
  endDate: Date
  destinations: ItineraryDestination[]
  totalBudget: number
  safetyLevel: 'low' | 'medium' | 'high'
  isShared: boolean
}

export interface ItineraryDestination {
  destination: Destination
  arrivalDate: Date
  departureDate: Date
  accommodation?: Accommodation
  activities: Activity[]
  budget: number
  safetyNotes: string[]
}

export interface Accommodation {
  id: string
  name: string
  type: 'hotel' | 'hostel' | 'homestay' | 'resort' | 'guesthouse'
  price: number
  rating: number
  safetyRating: number
  amenities: string[]
  imageUrl: string
  coordinates: {
    lat: number
    lng: number
  }
}

export interface Activity {
  id: string
  name: string
  type: 'adventure' | 'cultural' | 'relaxation' | 'spiritual' | 'nature'
  duration: number // in hours
  price: number
  rating: number
  safetyLevel: number
  description: string
  imageUrl: string
  requirements?: string[]
}

// Chatbot and AI Types
export interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  attachments?: {
    type: 'image' | 'location' | 'document'
    url: string
  }[]
  suggestedActions?: string[]
}

export interface AICapability {
  name: string
  description: string
  icon: React.ReactNode
  isAvailable: boolean
  category: 'safety' | 'navigation' | 'translation' | 'emergency' | 'information'
}

// UI Component Types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'glass' | 'brutal' | 'danger' | 'ghost'
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  className?: string
  children: React.ReactNode
}

export interface CardProps {
  variant?: 'default' | 'glass' | 'interactive' | 'brutal' | 'safety'
  hover?: boolean
  padding?: 'none' | 'small' | 'medium' | 'large'
  shadow?: 'none' | 'small' | 'medium' | 'large' | 'brutal'
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export interface LoadingProps {
  type?: 'spinner' | 'skeleton' | 'pulse' | 'shimmer'
  size?: 'small' | 'medium' | 'large'
  text?: string
  fullScreen?: boolean
  className?: string
}

// Map and Location Types
export interface MapMarker {
  id: string
  position: {
    lat: number
    lng: number
  }
  type: 'user' | 'destination' | 'service' | 'alert' | 'safety-zone'
  title: string
  description?: string
  severity?: 'low' | 'medium' | 'high'
  icon?: string
  popup?: React.ReactNode
}

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export interface SafetyZone {
  id: string
  name: string
  bounds: MapBounds
  safetyLevel: 'safe' | 'caution' | 'danger'
  description: string
  alerts: SafetyAlert[]
  lastUpdated: Date
}

// Animation Types
export interface AnimationConfig {
  initial?: any
  animate?: any
  exit?: any
  transition?: any
  whileInView?: any
  whileHover?: any
  whileTap?: any
}

// Filter and Search Types
export interface DestinationFilters {
  search?: string
  region?: string[]
  safetyLevel?: [number, number]
  activities?: string[]
  budget?: [number, number]
  bestSeason?: string[]
  travelType?: string[]
  womenSafeOnly?: boolean
  soloFriendly?: boolean
  familyFriendly?: boolean
}

export interface FilterChip {
  id: string
  label: string
  icon?: string
  active: boolean
  count?: number
  onToggle: () => void
}

// Analytics and Metrics Types
export interface UserMetrics {
  totalDistance: number
  safeTravels: number
  alertsAvoided: number
  helpProvided: number
  reviewsWritten: number
  photosShared: number
  communityScore: number
}

export interface SafetyMetrics {
  overallSafety: number
  regionalScores: Record<string, number>
  incidentTypes: Record<string, number>
  responseTimes: {
    police: number
    medical: number
    embassy: number
  }
  userSatisfaction: number
}

// Error and Status Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode?: number
}

export interface FormError {
  field: string
  message: string
}

// Environment Configuration
export interface Config {
  apiBaseUrl: string
  mapApiKey: string
  features: {
    aiChatbot: boolean
    realTimeAlerts: boolean
    offlineMode: boolean
    pushNotifications: boolean
    socialFeatures: boolean
  }
  limits: {
    maxDestinations: number
    maxItineraries: number
    maxPhotos: number
  }
}