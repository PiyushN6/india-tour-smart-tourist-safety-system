import React from 'react'
import { motion } from 'framer-motion'
import { Book, Shield, AlertTriangle, Heart } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const SafetyInformationHub: React.FC = () => {
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
            <Book className="w-8 h-8 text-primary-saffron" />
            <h1 className="text-4xl font-bold gradient-text-2025">
              Safety Information Hub
            </h1>
            <Shield className="w-8 h-8 text-primary-royal-blue" />
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive safety guides, emergency information, and cultural etiquette for traveling safely in India
          </p>
        </motion.div>

        <motion.div
          className="glass-card-intense p-12 text-center h-96 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Safety Guides Coming Soon
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Interactive safety information including emergency contacts, cultural etiquette guides,
              health and vaccination requirements, scam prevention tips, and regional safety
              assessments will be available here.
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}

export default SafetyInformationHub