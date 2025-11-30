import React from 'react'
import { motion } from 'framer-motion'
import { User, Shield } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import LegacyUserProfile from '../../../features/profile/UserProfile'

const UserProfile: React.FC = () => {
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
            <User className="w-8 h-8 text-primary-saffron" />
            <h1 className="text-3xl md:text-4xl font-bold gradient-text-2025">
              User Profile
            </h1>
            <Shield className="w-8 h-8 text-primary-royal-blue" />
          </div>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            Manage your account details and favorite destinations. More safety preferences and travel
            history insights will appear here soon.
          </p>
        </motion.div>

        {/* Existing functional profile implementation with auth + favorites */}
        <div className="mt-4">
          <LegacyUserProfile />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default UserProfile