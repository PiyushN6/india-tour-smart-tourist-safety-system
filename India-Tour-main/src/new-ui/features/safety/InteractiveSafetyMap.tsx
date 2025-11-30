import React, { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet'
import { motion } from 'framer-motion'
import {
  Shield,
  AlertTriangle,
  MapPin,
  Phone,
  Activity,
  Zap,
  Navigation,
  Heart,
  Compass,
  Gauge,
  Users,
  Clock,
  TrendingUp,
  X,
  Filter,
  Plus,
  Minus
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Card from '@/components/Card'
import Button from '@/components/Button'

interface SafetyZone {
  id: string
  name: string
  bounds: [[number, number], [number, number]]
  safetyLevel: 'safe' | 'caution' | 'danger'
  description: string
  alerts: number
  lastUpdated: Date
}

interface EmergencyService {
  id: string
  name: string
  type: 'hospital' | 'police' | 'embassy' | 'tourism'
  coordinates: [number, number]
  distance: number
  phoneNumber: string
  isAvailable: boolean
  waitTime: string
}

interface Incident {
  id: string
  type: 'security' | 'health' | 'environmental' | 'traffic' | 'weather'
  severity: 'low' | 'medium' | 'high' | 'critical'
  coordinates: [number, number]
  title: string
  description: string
  timestamp: Date
  status: 'active' | 'resolved' | 'monitoring'
}

const InteractiveSafetyMap: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [selectedZone, setSelectedZone] = useState<SafetyZone | null>(null)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [showIncidents, setShowIncidents] = useState(true)
  const [showServices, setShowServices] = useState(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.209]) // Delhi
  const [zoom, setZoom] = useState(11)
  const [selectedService, setSelectedService] = useState<EmergencyService | null>(null)
  const [liveTracking, setLiveTracking] = useState(true)
  const [routePath, setRoutePath] = useState<[number, number][] | null>(null)
  const map = useMap()

  // Sample safety zones data
  const safetyZones: SafetyZone[] = [
    {
      id: 'connaught-place',
      name: 'Connaught Place - High Security Zone',
      bounds: [[28.6300, 77.2100], [28.6350, 77.2200]],
      safetyLevel: 'safe',
      description: 'Heavy police presence, CCTV surveillance, tourist-friendly',
      alerts: 0,
      lastUpdated: new Date()
    },
    {
      id: 'paharganj',
      name: 'Paharganj - Caution Zone',
      bounds: [[28.6400, 77.2100], [28.6450, 77.2200]],
      safetyLevel: 'caution',
      description: 'Crowded area, pickpocketing reported, stay vigilant',
      alerts: 2,
      lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'karol-bagh',
      name: 'Karol Bagh - Safety Concern',
      bounds: [[28.6500, 77.1900], [28.6550, 77.2000]],
      safetyLevel: 'danger',
      description: 'Recent security incidents, avoid after dark',
      alerts: 5,
      lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000)
    }
  ]

  // Sample emergency services
  const emergencyServices: EmergencyService[] = [
    {
      id: 'aiims-delhi',
      name: 'AIIMS Delhi',
      type: 'hospital',
      coordinates: [28.5374, 77.2412],
      distance: 2.3,
      phoneNumber: '011-26588500',
      isAvailable: true,
      waitTime: '15-30 min'
    },
    {
      id: 'safdarjung-hospital',
      name: 'Safdarjung Hospital',
      type: 'hospital',
      coordinates: [28.6100, 77.2010],
      distance: 0.8,
      phoneNumber: '011-23365625',
      isAvailable: true,
      waitTime: '10-20 min'
    },
    {
      id: 'connaught-place-ps',
      name: 'Connaught Place PS',
      type: 'police',
      coordinates: [28.6328, 77.2150],
      distance: 1.2,
      phoneNumber: '011-23434487',
      isAvailable: true,
      waitTime: '5-10 min'
    },
    {
      id: 'tourist-police',
      name: 'Delhi Tourist Police',
      type: 'police',
      coordinates: [28.6350, 77.2190],
      distance: 1.8,
      phoneNumber: '011-23439901',
      isAvailable: true,
      waitTime: '8-15 min'
    }
  ]

  // Sample recent incidents
  const recentIncidents: Incident[] = [
    {
      id: 'incident-1',
      type: 'security',
      severity: 'medium',
      coordinates: [28.6333, 77.2186],
      title: 'Pickpocketing Reported',
      description: 'Tourist reported wallet theft near metro station',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'monitoring'
    },
    {
      id: 'incident-2',
      type: 'traffic',
      severity: 'low',
      coordinates: [28.6410, 77.2130],
      title: 'Traffic Congestion',
      description: 'Heavy traffic causing delays, consider alternate routes',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      status: 'resolved'
    },
    {
      id: 'incident-3',
      type: 'health',
      severity: 'high',
      coordinates: [28.6200, 77.2100],
      title: 'Medical Emergency',
      description: 'Tourist experiencing dehydration, assistance provided',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'resolved'
    }
  ]

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation([latitude, longitude])
          setMapCenter([latitude, longitude])
          setZoom(15)
        },
        (error) => {
          console.error('Geolocation error:', error)
          // Show user message about location permissions
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
          frequency: 30000 // Update every 30 seconds
        }
      )

      return () => {
        if (watchId) {
          navigator.geolocation.clearWatch(watchId)
        }
      }
    }
  }, [])

  // Simulate route to nearest safe zone
  const findNearestSafeZone = useCallback(() => {
    if (userLocation) {
      const nearestZone = safetyZones.reduce((nearest, zone) => {
        const zoneCenter = [
          (zone.bounds[0][0] + zone.bounds[1][0]) / 2,
          (zone.bounds[0][1] + zone.bounds[1][1]) / 2
        ]
        const nearestZoneCenter = nearest.bounds ? [
          (nearest.bounds[0][0] + nearest.bounds[1][0]) / 2,
          (nearest.bounds[0][1] + nearest.bounds[1][1]) / 2
        ] : nearestZoneCenter

        const distance = Math.sqrt(
          Math.pow(userLocation[0] - zoneCenter[0], 2) +
          Math.pow(userLocation[1] - zoneCenter[1], 2)
        )
        const nearestDistance = Math.sqrt(
          Math.pow(userLocation[0] - nearestZoneCenter[0], 2) +
          Math.pow(userLocation[1] - nearestZoneCenter[1], 2)
        )

        return distance < nearestDistance ? zone : nearest
      })

      // Create route path
      setRoutePath([userLocation, [
        (nearestZone.bounds[0][0] + nearestZone.bounds[1][0]) / 2,
        (nearestZone.bounds[0][1] + nearestZone.bounds[1][1]) / 2
      ]])
      setSelectedZone(nearestZone)
    }
  }, [userLocation])

  const getSafetyColor = (level: string) => {
    switch (level) {
      case 'safe':
        return '#22C55E'
      case 'caution':
        return '#F59E0B'
      case 'danger':
        return '#EF4444'
      default:
        return '#6B7280'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#DC2626'
      case 'high':
        return '#EF4444'
      case 'medium':
        return '#F59E0B'
      case 'low':
        return '#10B981'
      default:
        return '#6B7280'
    }
  }

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'security':
        return <Shield className="w-5 h-5" />
      case 'health':
        return <Heart className="w-5 h-5" />
      case 'traffic':
        return <Activity className="w-5 h-5" />
      case 'environmental':
        return <Compass className="w-5 h-5" />
      case 'weather':
        return <Zap className="w-5 h-5" />
      default:
        return <AlertTriangle className="w-5 h-5" />
    }
  }

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return <Heart className="w-5 h-5 text-red-600" />
      case 'police':
        return <Shield className="w-5 h-5 text-blue-600" />
      case 'embassy':
        return <Users className="w-5 h-5 text-purple-600" />
      case 'tourism':
        return <MapPin className="w-5 h-5 text-green-600" />
      default:
        return <Phone className="w-5 h-5" />
    }
  }

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
            <MapPin className="w-8 h-8 text-primary-royal-blue animate-pulse-glow" />
            <h1 className="text-4xl font-bold gradient-text-2025">
              Interactive Safety Map
            </h1>
            <Shield className="w-8 h-8 text-primary-saffron animate-pulse-glow" />
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time safety zones, emergency services, and incident tracking across India
          </p>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card variant="glass" padding="large" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Live Tracking */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className={`w-3 h-3 rounded-full ${liveTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">Live Tracking</span>
              </div>

              {/* Heatmap Toggle */}
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  showHeatmap ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Heatmap</span>
              </button>

              {/* Incidents Toggle */}
              <button
                onClick={() => setShowIncidents(!showIncidents)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  showIncidents ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Incidents</span>
              </button>

              {/* Services Toggle */}
              <button
                onClick={() => setShowServices(!showServices)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  showServices ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">Services</span>
              </button>

              {/* Route to Safety */}
              <Button
                variant="outline"
                size="small"
                icon={<Navigation className="w-4 h-4" />}
                onClick={findNearestSafeZone}
                disabled={!userLocation}
                className="w-full"
              >
                Find Safe Zone
              </Button>

              {/* Zoom Controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setZoom(Math.max(zoom - 1, 1))}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-2 text-sm font-medium text-gray-700">{zoom}</span>
                <button
                  onClick={() => setZoom(Math.min(zoom + 1, 18))}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Safety Zones Legend */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card variant="glass" padding="medium" className="w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Safety Zones</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span className="text-sm text-gray-700">Safe - High Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded" />
                <span className="text-sm text-gray-700">Caution - Stay Vigilant</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded" />
                <span className="text-sm text-gray-700">Danger - Avoid Area</span>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Map Container */}
        <motion.div
          className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <Card variant="default" padding="none" className="h-96 lg:h-full min-h-[500px] overflow-hidden">
              <MapContainer
                center={mapCenter}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                className="rounded-2xl"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Safety Zones */}
                {showHeatmap && safetyZones.map((zone) => (
                  <Circle
                    key={zone.id}
                    center={[
                      (zone.bounds[0][0] + zone.bounds[1][0]) / 2,
                      (zone.bounds[0][1] + zone.bounds[1][1]) / 2
                    ]}
                    radius={200}
                    fillColor={getSafetyColor(zone.safetyLevel)}
                    fillOpacity={0.3}
                    stroke={getSafetyColor(zone.safetyLevel)}
                    strokeWidth={2}
                    eventHandlers={{
                      click: () => {
                        setSelectedZone(zone)
                        setMapCenter([
                          (zone.bounds[0][0] + zone.bounds[1][0]) / 2,
                          (zone.bounds[0][1] + zone.bounds[1][1]) / 2
                        ])
                      }
                    }}
                  />
                ))}

                {/* Emergency Services */}
                {showServices && emergencyServices.map((service) => (
                  <Marker
                    key={service.id}
                    position={service.coordinates}
                    icon={getServiceIcon(service.type)}
                    eventHandlers={{
                      click: () => setSelectedService(service)
                    }}
                  >
                    <Popup>
                      <div className="p-4 min-w-[200px]">
                        <h4 className="font-semibold text-gray-900 mb-2">{service.name}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>{service.phoneNumber}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>Wait: {service.waitTime}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{service.distance.toFixed(1)} km away</span>
                          </div>
                        </div>
                        <Button
                          variant="primary"
                          size="small"
                          icon={<Phone className="w-4 h-4" />}
                          className="w-full mt-3"
                        >
                          Call Emergency
                        </Button>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* User Location */}
                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={
                      <div className="relative">
                        <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" />
                        <div className="absolute inset-0 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                      </div>
                    }
                  />
                )}

                {/* Route Path */}
                {routePath && (
                  <Polyline
                    positions={routePath}
                    color="#3B82F6"
                    weight={4}
                    opacity={0.7}
                    dashArray="10, 10"
                  />
                )}

                {/* Incidents */}
                {showIncidents && recentIncidents.map((incident) => (
                  <Marker
                    key={incident.id}
                    position={incident.coordinates}
                    icon={getIncidentIcon(incident.type)}
                    eventHandlers={{
                      click: () => {
                        // Handle incident click
                      }
                    }}
                  >
                    <Popup>
                      <div className="p-4 min-w-[250px]">
                        <div className="flex items-center space-x-2 mb-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: getSeverityColor(incident.severity) }}
                          />
                          <span className="font-semibold text-gray-900 capitalize">{incident.severity}</span>
                          {incident.status === 'active' && (
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-2" />
                          )}
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{incident.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{incident.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{incident.type}</span>
                          <span>{incident.timestamp.toLocaleString()}</span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Selected Zone Info */}
            {selectedZone && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card variant="glass" padding="medium" className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{selectedZone.name}</h3>
                    <Button
                      variant="ghost"
                      size="small"
                      icon={<X className="w-4 h-4" />}
                      onClick={() => setSelectedZone(null)}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm text-gray-700">Safety Level: {selectedZone.safetyLevel}</span>
                    </div>
                    <p className="text-sm text-gray-600">{selectedZone.description}</p>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm text-gray-700">Active Alerts: {selectedZone.alerts}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Last updated: {selectedZone.lastUpdated.toLocaleString()}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Selected Service Info */}
            {selectedService && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card variant="glass" padding="medium" className="w-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getServiceIcon(selectedService.type)}
                      <h3 className="text-lg font-semibold text-gray-900">{selectedService.name}</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="small"
                      icon={<X className="w-4 h-4" />}
                      onClick={() => setSelectedService(null)}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm text-gray-700">{selectedService.phoneNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm text-gray-700">Wait time: {selectedService.waitTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm text-gray-700">{selectedService.distance.toFixed(1)} km</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${selectedService.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm text-gray-700">
                        {selectedService.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      size="medium"
                      icon={<Phone className="w-4 h-4" />}
                      className="w-full"
                    >
                      Call Now
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Live Safety Stats */}
            <Card variant="glass" padding="medium" className="w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Safety Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Gauge className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">Safety Score</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">87</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">Active Tourists</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-gray-700">Response Rate</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">94%</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Emergency Actions */}
          <Card variant="brutal" padding="medium" className="w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Emergency Actions</h3>
            <div className="space-y-3">
              <Button
                variant="danger"
                size="large"
                icon={<Phone className="w-5 h-5" />}
                className="w-full"
              >
                Emergency SOS - 112
              </Button>
              <Button
                variant="outline"
                size="medium"
                icon={<Shield className="w-4 h-4" />}
                className="w-full"
              >
                Report Incident
              </Button>
              <Button
                variant="outline"
                size="medium"
                icon={<Navigation className="w-4 h-4" />}
                className="w-full"
              >
                Share Location
              </Button>
            </div>
          </Card>
        </div>

        {/* Recent Incidents Feed */}
        <div className="lg:col-span-3">
          <Card variant="glass" padding="large" className="w-full h-full">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Incidents</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentIncidents.map((incident, index) => (
                <motion.div
                  key={incident.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="border-b border-gray-200 pb-4 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: getSeverityColor(incident.severity) }}
                    >
                      <div className="text-white">
                        {getIncidentIcon(incident.type)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900">{incident.title}</span>
                        {incident.status === 'active' && (
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{incident.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                        <span className="capitalize">{incident.type}</span>
                        <span>{incident.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default InteractiveSafetyMap