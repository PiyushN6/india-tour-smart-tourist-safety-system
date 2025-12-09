import React from 'react'
import Navbar from '@/components/Navbar'
import SafetyDigitalIdScanPageInner from '../../../features/safety/SafetyDigitalIdScanPage'

const SafetyDigitalIdScanPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SafetyDigitalIdScanPageInner />
      </main>
    </div>
  )
}

export default SafetyDigitalIdScanPage
