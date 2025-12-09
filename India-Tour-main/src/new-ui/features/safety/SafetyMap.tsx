import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Navigation } from 'lucide-react'
import SafetyGlobeMap from './SafetyGlobeMap'

// New Safety Map screen: narrative, globe-style layout.
// Navbar and Footer are already rendered by App, so this component
// focuses only on the inner page content.

const SafetyMap: React.FC = () => {
  const [jumpKey, setJumpKey] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        {/* Compact header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col gap-2"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] tracking-wide uppercase w-max shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800">Safety map</span>
          </div>
          <h1 className="text-2xl sm:text-[2.1rem] font-semibold text-slate-900">
            Live risk zones across India
          </h1>
        </motion.div>

        {/* Main content: left big map, right very slim details */}
        {/* IMPORTANT: this grid must NOT be animated/translated, or Mapbox markers will misalign. */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,3.6fr)_minmax(0,1fr)] items-stretch">
          {/* Left: globe map taking most of the width */}
          <div className="flex flex-col gap-3">
            <div className="relative h-[65vh] min-h-[420px] rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] overflow-hidden">
              <SafetyGlobeMap jumpToMyLocationKey={jumpKey} />
            </div>

            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setJumpKey((k) => k + 1)}
                className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-sky-50 px-4 py-1.5 text-[11px] font-medium text-sky-800 shadow-sm hover:bg-sky-100 hover:border-sky-400 transition-colors"
              >
                <Navigation className="h-3.5 w-3.5 text-sky-700" />
                <span>Jump to my location</span>
              </button>
            </div>
          </div>

          {/* Right: very slim detail column with legend */}
          <div className="space-y-3 max-w-xs ml-auto">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-[11px] sm:text-[12px] text-slate-700 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <h2 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <Shield className="h-4 w-4 text-emerald-500" />
                Risk legend
              </h2>
              <div className="space-y-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    <span className="text-[12px] font-semibold text-red-700">High / Critical</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Avoid unless essential; recent or serious safety incidents.
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                    <span className="text-[12px] font-semibold text-orange-700">Medium</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Busy or complex areas; stay alert, especially at night.
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="text-[12px] font-semibold text-emerald-700">Calmer</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Generally comfortable for tourists; still use normal caution.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-[11px] text-slate-500 shadow-sm">
              <p>
                Allow location for the most accurate view around you, or pan / zoom the globe to explore other regions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SafetyMap