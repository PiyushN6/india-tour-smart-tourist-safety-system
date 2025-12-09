import React from 'react'
import { motion } from 'framer-motion'
import { BellRing, Shield } from 'lucide-react'
import Navbar from '@/components/Navbar'
import SafetyAdminPage from '../../../features/safety/SafetyAdminPage'

const SafetyAdminShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar />
      <main className="relative max-w-[96rem] mx-auto px-4 sm:px-6 lg:px-10 pt-4 sm:pt-6 pb-14 sm:pb-16">
        {/* Atmospheric background for admin view */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-32 top-10 h-72 w-72 rounded-full bg-gradient-to-br from-sky-500/15 via-cyan-400/15 to-transparent blur-3xl opacity-80" />
          <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-gradient-to-tr from-slate-700/40 via-slate-800/40 to-transparent blur-3xl opacity-80" />
          <div className="absolute inset-x-6 top-32 h-px bg-gradient-to-r from-transparent via-slate-500/35 to-transparent" />
        </div>

        {/* Header capsule */}
        <motion.div
          className="mb-8 sm:mb-10 flex flex-col gap-4 sm:gap-5"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-600/70 bg-slate-900/85 px-3 py-1 text-[11px] backdrop-blur-md shadow-[0_10px_40px_rgba(15,23,42,0.7)]">
            <span className="uppercase tracking-[0.16em] text-slate-100 font-semibold">Admin safety command center</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 shadow-[0_18px_55px_rgba(15,23,42,0.9)] border border-slate-700/80">
                  <Shield className="h-5 w-5 text-slate-100" />
                  <span className="absolute -inset-px rounded-2xl border border-slate-600/80 opacity-60" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-50 via-slate-100 to-slate-200">
                  Safety Admin Dashboard
                </h1>
              </div>
              <p className="max-w-xl text-xs sm:text-sm text-slate-300">
                Monitor tourist panic alerts, geofence breaches, and anomaly signals together in one focused
                command-center view.
              </p>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <div className="hidden sm:flex flex-col items-end text-right text-[11px] text-slate-400">
                <span className="font-semibold tracking-wide text-slate-100">Live alert overview</span>
                <span className="mt-0.5 text-slate-500">See which tourists are currently raising safety signals.</span>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 shadow-[0_18px_55px_rgba(15,23,42,0.9)] border border-slate-700/80">
                <BellRing className="h-5 w-5 text-slate-100" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Glass grid containing the functional admin dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
          className="relative rounded-3xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shadow-[0_26px_80px_rgba(15,23,42,0.9)] overflow-hidden"
        >
          <div className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light">
            <div className="absolute -left-20 top-24 h-64 w-64 rounded-full bg-gradient-to-tr from-slate-700/40 via-slate-800/40 to-transparent blur-3xl" />
            <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-gradient-to-tl from-sky-500/25 via-cyan-400/20 to-transparent blur-3xl" />
          </div>

          <div className="relative border-t border-slate-700/70">
            <SafetyAdminPage />
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default SafetyAdminShell
