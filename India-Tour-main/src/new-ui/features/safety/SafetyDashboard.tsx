import React from 'react'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SafetyTouristDashboardPage from '../../../features/safety/SafetyTouristDashboardPage'

const SafetyDashboard: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-primary-saffron" />
            <h1 className="text-3xl md:text-4xl font-bold gradient-text-2025">
              Safety Dashboard
            </h1>
            <Shield className="w-8 h-8 text-primary-royal-blue" />
          </div>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            Use the live dashboard below to trigger emergency alerts, review your recent safety notifications,
            and monitor your personal safety score.
          </p>
        </motion.div>

        {/* Existing functional dashboard with panic button, alerts, and safety score */}
        <div className="mt-4">
          <SafetyTouristDashboardPage />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default SafetyDashboard