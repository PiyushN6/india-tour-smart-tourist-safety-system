import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'
import { Map, Shield } from 'lucide-react'
import SafetyMapPage from '../../../features/safety/SafetyMapPage'

const SafetyMap: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Map className="w-8 h-8 text-primary-saffron" />
            <h1 className="text-4xl font-bold gradient-text-2025">
              Interactive Safety Map
            </h1>
            <Shield className="w-8 h-8 text-primary-royal-blue" />
          </div>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            View your live location and stay aware of safety hot-spots and risk zones across India using the
            interactive map below.
          </p>
        </motion.div>

        {/* Existing functional Leaflet map with risk zones and user position */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white">
          <SafetyMapPage />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default SafetyMap