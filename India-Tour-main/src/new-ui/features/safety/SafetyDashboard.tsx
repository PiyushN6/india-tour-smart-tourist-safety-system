import React from 'react'
import { motion } from 'framer-motion'
import { Activity, ShieldCheck } from 'lucide-react'
import Navbar from '@/components/Navbar'
import SafetyTouristDashboardPage from '../../../features/safety/SafetyTouristDashboardPage'

const SafetyDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-background-warm-offwhite text-slate-900">
      <Navbar />

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-14 sm:pb-16">
        {/* Atmospheric background orbs / grid */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-32 top-10 h-72 w-72 rounded-full bg-gradient-to-br from-primary-saffron/30 via-rose-300/25 to-amber-300/25 blur-3xl opacity-80" />
          <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-gradient-to-tr from-primary-royal-blue/30 via-sky-300/30 to-emerald-300/20 blur-3xl opacity-80" />
          <div className="absolute inset-x-6 top-32 h-px bg-gradient-to-r from-transparent via-slate-300/40 to-transparent" />
        </div>

        {/* Header capsule */}
        <motion.div
          className="mb-8 sm:mb-10 flex flex-col gap-4 sm:gap-5"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] backdrop-blur-md shadow-[0_10px_40px_rgba(15,23,42,0.16)]">
            <span className="uppercase tracking-[0.16em] text-primary-royal-blue font-semibold">Live safety control center</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[0_18px_55px_rgba(15,23,42,0.25)] border border-slate-200">
                  <ShieldCheck className="h-5 w-5 text-primary-saffron" />
                  <span className="absolute -inset-px rounded-2xl border border-slate-100 opacity-60" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight gradient-text-2025">
                  Safety Dashboard
                </h1>
              </div>
              <p className="max-w-xl text-xs sm:text-sm text-slate-700">
                Your personal command center for panic alerts, real-time incident feed, and dynamic safety status 
                designed to stay out of the way until you need it.
              </p>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <div className="hidden sm:flex flex-col items-end text-right text-[11px] text-slate-600">
                <span className="font-semibold tracking-wide text-primary-royal-blue">Trusted safety infrastructure</span>
                <span className="mt-0.5 text-slate-500">Secure, encrypted routing of panic and location data.</span>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-[0_18px_55px_rgba(15,23,42,0.25)] border border-slate-200">
                <Activity className="h-5 w-5 text-primary-royal-blue" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Glass grid containing the functional dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
          className="relative rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-xl shadow-[0_26px_80px_rgba(15,23,42,0.25)] overflow-hidden"
        >
          <div className="pointer-events-none absolute inset-0 opacity-70 mix-blend-soft-light">
            <div className="absolute -left-20 top-24 h-64 w-64 rounded-full bg-gradient-to-tr from-amber-200/60 via-rose-200/40 to-transparent blur-3xl" />
            <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-gradient-to-tl from-sky-200/60 via-indigo-200/40 to-transparent blur-3xl" />
          </div>

          <div className="relative border-t border-slate-100/80">
            <SafetyTouristDashboardPage />
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default SafetyDashboard