import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingScreen from '@/components/Loading'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ErrorBoundary from '@/components/ErrorBoundary'

// Lazy load components for code splitting
const HomePage = lazy(() => import('@/pages/HomePage'))
const SafetyDashboard = lazy(() => import('@/features/safety/SafetyDashboard'))
const SafetyMap = lazy(() => import('@/features/safety/SafetyMap'))
const DestinationExplorer = lazy(() => import('@/features/destinations/DestinationExplorer'))
const SafetyInformationHub = lazy(() => import('@/features/safety/SafetyInformationHub'))
const UserProfile = lazy(() => import('@/features/profile/UserProfile'))
const GamificationSystem = lazy(() => import('@/features/gamification/GamificationSystem'))

// Animated transitions
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background-warm-offwhite">
        <Helmet>
          <title>India Tour Smart Safety System - Explore India with Complete Peace of Mind</title>
          <meta name="description" content="Revolutionary India tourism platform with AI-powered safety, real-time alerts, interactive maps, and comprehensive travel information for tourists exploring India safely." />
          <meta name="keywords" content="India tourism, travel safety, tourist guide, India travel, safety alerts, travel companion, smart tourism" />
          <meta property="og:title" content="India Tour Smart Safety System" />
          <meta property="og:description" content="Explore India with AI-powered safety features and real-time alerts" />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <link rel="canonical" href="https://india-tour-safety.com" />
        </Helmet>

        <Navbar />

        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={
                  <motion.div
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <HomePage />
                  </motion.div>
                } />

                <Route path="/safety/dashboard" element={
                  <motion.div
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <SafetyDashboard />
                  </motion.div>
                } />

                <Route path="/safety/map" element={
                  <motion.div
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <SafetyMap />
                  </motion.div>
                } />

                <Route path="/destinations" element={
                  <motion.div
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <DestinationExplorer />
                  </motion.div>
                } />

                <Route path="/safety/information" element={
                  <motion.div
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <SafetyInformationHub />
                  </motion.div>
                } />

                <Route path="/profile" element={
                  <motion.div
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <UserProfile />
                  </motion.div>
                } />

                <Route path="/gamification" element={
                  <motion.div
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageVariants}
                    transition={pageTransition}
                  >
                    <GamificationSystem />
                  </motion.div>
                } />
              </Routes>
            </Suspense>
          </AnimatePresence>
        </main>

        <Footer />

        {/* Skip to Content Link for Accessibility */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>

        {/* Global Components */}
        <div id="main-content" className="sr-only">
          Main content starts here
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App