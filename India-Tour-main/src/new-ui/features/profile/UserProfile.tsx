import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Map, Clock, Phone, Mail, Pencil } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import type { Session } from '@supabase/supabase-js'
import { fetchMyTouristProfile } from '../../../services/safetyApi'

const UserProfile: React.FC = () => {
  const { user, displayName, session, updateProfile } = useAuth()

  const effectiveEmail = user?.email || session?.user.email || ''
  const effectiveName = displayName || effectiveEmail.split('@')[0] || 'Traveler'
  const joinedAtRaw = (user as any)?.created_at || session?.user.created_at
  const joinedAt = joinedAtRaw ? new Date(joinedAtRaw).toLocaleDateString() : undefined

  const avatarInitial = (effectiveName || effectiveEmail || '?').trim().charAt(0).toUpperCase()
  const [avatarError, setAvatarError] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(effectiveName)
  const [isSavingName, setIsSavingName] = useState(false)
  const [touristIdCode, setTouristIdCode] = useState<string | null>(null)
  const [safetyIdLoading, setSafetyIdLoading] = useState(false)

  const userMeta = (session?.user.user_metadata as any) || {}
  const rawAvatar: string | null =
    (userMeta.picture as string | undefined) ||
    (userMeta.avatar_url as string | undefined) ||
    null

  const avatarUrl =
    !avatarError && typeof rawAvatar === 'string' && /^https?:\/\//.test(rawAvatar)
      ? rawAvatar
      : null

  useEffect(() => {
    const loadSafetyId = async () => {
      if (!session) return

      try {
        setSafetyIdLoading(true)
        const profile = await fetchMyTouristProfile(session as Session)
        setTouristIdCode(profile.tourist_id_code || null)
      } catch (e) {
        setTouristIdCode(null)
      } finally {
        setSafetyIdLoading(false)
      }
    }

    loadSafetyId()
  }, [session])

  const handleSaveName = async () => {
    const trimmed = nameInput.trim()
    if (!trimmed) {
      return
    }
    if (trimmed === effectiveName) {
      setIsEditingName(false)
      return
    }

    try {
      setIsSavingName(true)
      const { error } = await updateProfile({ full_name: trimmed })
      if (error) {
        console.error('Error updating name:', error)
        alert('Could not update name. Please try again.')
        return
      }
      setIsEditingName(false)
    } finally {
      setIsSavingName(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-slate-100 text-slate-900">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)] gap-8 lg:gap-10"
        >
          {/* Identity + contact column */}
          <section className="space-y-6">
            {/* Identity card */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)] px-6 sm:px-8 py-6 sm:py-7">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-24 -right-16 w-52 h-52 bg-primary-royal-blue/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-16 w-48 h-48 bg-primary-saffron/15 blur-3xl" />
              </div>

              <div className="relative flex flex-col md:flex-row md:items-center gap-5 md:gap-7">
                <div className="shrink-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border border-slate-200 bg-gradient-to-br from-primary-royal-blue to-primary-saffron shadow-lg shadow-primary-royal-blue/40 flex items-center justify-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={effectiveName}
                        className="w-full h-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <span className="text-slate-900 text-3xl font-semibold">
                        {avatarInitial}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-1 text-left">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-1">Profile</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {isEditingName ? (
                      <>
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 bg-transparent border-b border-primary-saffron focus:outline-none focus:border-primary-royal-blue transition-colors"
                        />
                        <button
                          type="button"
                          onClick={handleSaveName}
                          disabled={isSavingName || !nameInput.trim()}
                          className="ml-1 rounded-xl bg-primary-royal-blue text-white text-xs font-semibold px-3 py-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {isSavingName ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditingName(false)
                            setNameInput(effectiveName)
                          }}
                          className="text-xs text-slate-500 ml-1"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                          {effectiveName}
                        </h1>
                        <button
                          type="button"
                          onClick={() => setIsEditingName(true)}
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-primary-royal-blue transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Rename</span>
                        </button>
                      </>
                    )}
                  </div>
                  {effectiveEmail && (
                    <p className="flex items-center gap-2 text-sm text-slate-300">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>{effectiveEmail}</span>
                    </p>
                  )}
                  {joinedAt && (
                    <p className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>Member since {joinedAt}</span>
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <Shield className="w-3 h-3" />
                    {safetyIdLoading ? (
                      <span>Digital Safety ID: Checking status...</span>
                    ) : touristIdCode ? (
                      <span>
                        Digital Safety ID:{' '}
                        <span className="font-mono font-semibold text-slate-900">
                          {touristIdCode}
                        </span>
                      </span>
                    ) : (
                      <span>Digital Safety ID: Not created yet</span>
                    )}
                  </p>
                </div>

                <div className="flex flex-col items-stretch gap-2 md:items-end md:justify-center" />
              </div>
            </div>

            {/* Safety & preferences card */}
            <div className="rounded-3xl border border-slate-200 bg-white px-6 sm:px-7 py-5 sm:py-6 flex flex-col gap-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary-saffron" />
                  Safety overview
                </h2>
                <span className="text-[11px] uppercase tracking-wide text-slate-400">India Tour ID</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex flex-col gap-1">
                  <span className="text-xs text-emerald-700/80">Account status</span>
                  <span className="text-sm font-semibold text-emerald-900">Active</span>
                </div>
                <div className="rounded-2xl border border-primary-royal-blue/30 bg-primary-royal-blue/5 px-4 py-3 flex flex-col gap-1">
                  <span className="text-xs text-slate-700/80">Login method</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {session?.user.app_metadata?.provider === 'google' ? 'Google account' : 'Email & password'}
                  </span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex flex-col gap-1">
                  <span className="text-xs text-slate-600/90">Emergency contact</span>
                  <span className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Not added</span>
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Soon you'll be able to manage digital safety ID, trusted contacts and alert preferences directly from
                this page.
              </p>
            </div>
          </section>

          {/* Travel summary + journeys column */}
          <section className="space-y-6">
            {/* Travel snapshot */}
            <div className="rounded-3xl border border-slate-200 bg-white px-6 sm:px-7 py-5 sm:py-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Map className="w-4 h-4 text-primary-saffron" />
                  Travel snapshot
                </h2>
                <span className="text-[11px] uppercase tracking-wide text-slate-400">Coming alive as you explore</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-3 py-3 flex flex-col gap-1">
                  <span className="text-slate-500">Cities favorited</span>
                  <span className="text-lg font-semibold text-primary-saffron">0</span>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-3 py-3 flex flex-col gap-1">
                  <span className="text-slate-500">Trips planned</span>
                  <span className="text-lg font-semibold text-emerald-600">0</span>
                </div>
                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-3 py-3 flex flex-col gap-1">
                  <span className="text-slate-500">Check-ins</span>
                  <span className="text-lg font-semibold text-sky-600">0</span>
                </div>
              </div>
            </div>

            {/* Journeys & safety timeline */}
            <div className="rounded-3xl border border-slate-200 bg-white px-6 sm:px-7 py-5 sm:py-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-saffron" />
                  Upcoming journeys & safety
                </h2>
                <span className="text-[11px] uppercase tracking-wide text-slate-400">Personalised soon</span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                  <div>
                    <p className="font-semibold text-slate-900">Your next trip will appear here</p>
                    <p className="text-xs text-slate-500">
                      As you plan itineraries in India Tour, we will surface your upcoming journeys with local safety
                      tips and alerts in one place.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
                  <div>
                    <p className="font-semibold text-slate-900">City-specific safety briefings</p>
                    <p className="text-xs text-slate-500">
                      Before you arrive in a city, we will highlight emergency numbers, safe zones and recent
                      advisories tailored to your route.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
                  <div>
                    <p className="font-semibold text-slate-900">Trusted circle check-ins</p>
                    <p className="text-xs text-slate-500">
                      Soon you&apos;ll be able to share your live status with trusted contacts and see a history of your
                      check-ins right here.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subtle note */}
            <p className="text-[11px] text-slate-500 leading-relaxed">
              This profile is the heart of your India Tour experience. As you explore, we'll surface your journeys,
              alerts and trusted circles here in a way that always keeps safety first.
            </p>
          </section>
        </motion.div>
      </main>
    </div>
  )
}

export default UserProfile