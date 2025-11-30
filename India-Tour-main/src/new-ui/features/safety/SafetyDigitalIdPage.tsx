import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SafetyDigitalIDPage from '../../../features/safety/SafetyDigitalIDPage'

const SafetyDigitalIdPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SafetyDigitalIDPage />
      </main>
      <Footer />
    </div>
  )
}

export default SafetyDigitalIdPage
