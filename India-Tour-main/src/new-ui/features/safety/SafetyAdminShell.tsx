import React from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import SafetyAdminPage from '../../../features/safety/SafetyAdminPage'

const SafetyAdminShell: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SafetyAdminPage />
      </main>
      <Footer />
    </div>
  )
}

export default SafetyAdminShell
