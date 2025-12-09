import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { triggerPanic, fetchMyAlerts, fetchMySafetyScore, fetchMyTouristProfile, sendLocationPing } from '../../services/safetyApi';
import { useI18n } from '../../i18n';

interface AlertItem {
  id: number;
  type: string;
  severity: string;
  status: string;
  title: string;
  description?: string | null;
  triggered_at: string;
}

const SafetyTouristDashboardPage: React.FC = () => {
  const { session, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const [panicNote, setPanicNote] = useState('');
  const [isSendingPanic, setIsSendingPanic] = useState(false);
  const [panicMessage, setPanicMessage] = useState<string | null>(null);
  const [panicError, setPanicError] = useState<string | null>(null);

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [alertsError, setAlertsError] = useState<string | null>(null);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [hasLoadedAlertsOnce, setHasLoadedAlertsOnce] = useState(false);

  const [lastLocation, setLastLocation] = useState<{ lat?: number; lng?: number }>({});

  const [safetyScore, setSafetyScore] = useState<number | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const [touristIdCode, setTouristIdCode] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const formatAlertTimestamp = (iso: string) => {
    if (!iso) return '';
    // Backend stores timestamps in UTC without an explicit timezone suffix.
    // Force them to be interpreted as UTC and then render in Asia/Kolkata (IST)
    const utcIso = iso.endsWith('Z') ? iso : `${iso}Z`;
    const d = new Date(utcIso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });
  };

  // Try to grab browser location once (best effort)
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLastLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        // ignore errors; we can still send panic without exact coords
      },
      { timeout: 5000 }
    );
  }, []);

  const loadAlerts = async (options?: { silent?: boolean }) => {
    if (!session) return;
    if (!options?.silent) {
      setIsLoadingAlerts(true);
    }
    setAlertsError(null);
    try {
      const data = await fetchMyAlerts(session);
      setAlerts(Array.isArray(data) ? data : []);
      setHasLoadedAlertsOnce(true);
    } catch {
      setAlertsError(t('safety.dashboard.loadAlertsError'));
    } finally {
      if (!options?.silent) {
        setIsLoadingAlerts(false);
      }
    }
  };

  const handleToggleTracking = () => {
    if (!isAuthenticated) return;

    // When enabling tracking, explicitly (re)ask for location permission
    if (!isTracking && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLastLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setTrackingError(null);
          setIsTracking(true);
        },
        () => {
          // If denied or failed, surface a gentle error but don't flip the toggle on
          setTrackingError(t('safety.dashboard.trackingReadError'));
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      // Turning off or geolocation unavailable
      setIsTracking((prev) => !prev);
    }
  };

  // Restore previously chosen tracking preference
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('safetyTrackingEnabled');
      if (saved === 'true') {
        setIsTracking(true);
      }
    } catch {
      // ignore storage issues
    }
  }, []);

  // Persist tracking preference so it survives page reloads / navigation
  useEffect(() => {
    try {
      window.localStorage.setItem('safetyTrackingEnabled', isTracking ? 'true' : 'false');
    } catch {
      // ignore storage issues
    }
  }, [isTracking]);

  useEffect(() => {
    if (session) {
      void loadAlerts();
      void loadSafetyScore();
      void loadProfile();
    }
  }, [session]);

  // Light polling so score and alerts reflect admin resolves without manual refresh
  useEffect(() => {
    if (!session) return;

    const scoreInterval = window.setInterval(() => {
      void loadSafetyScore();
    }, 15_000);

    const alertsInterval = window.setInterval(() => {
      void loadAlerts({ silent: true });
    }, 5_000);

    return () => {
      window.clearInterval(scoreInterval);
      window.clearInterval(alertsInterval);
    };
  }, [session]);

  const loadSafetyScore = async () => {
    if (!session) return;
    setIsLoadingScore(true);
    setScoreError(null);
    try {
      const score = await fetchMySafetyScore(session);
      setSafetyScore(score);
    } catch {
      setScoreError(t('safety.dashboard.scoreError'));
    } finally {
      setIsLoadingScore(false);
    }
  };

  const loadProfile = async () => {
    if (!session) return;
    try {
      const profile = await fetchMyTouristProfile(session);
      if (profile?.tourist_id_code) {
        setTouristIdCode(profile.tourist_id_code);
      }
    } catch {
      // profile is optional for dashboard; ignore errors here
    }
  };

  // Background tracking effect
  useEffect(() => {
    if (!isTracking || !session || !touristIdCode) return;

    if (!('geolocation' in navigator)) {
      setTrackingError(t('safety.dashboard.trackingNotAvailable'));
      return;
    }

    setTrackingError(null);

    const intervalId = window.setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          void sendLocationPing(session, {
            tourist_id_code: touristIdCode,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy_m: pos.coords.accuracy,
            source: 'web-tracking',
          }).catch(() => {
            setTrackingError(t('safety.dashboard.trackingSendError'));
          });
        },
        () => {
          setTrackingError(t('safety.dashboard.trackingReadError'));
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }, 30_000); // every 30 seconds

    return () => window.clearInterval(intervalId);
  }, [isTracking, session, touristIdCode]);

  const handlePanic = async () => {
    if (!session) {
      setPanicError('You need to be logged in to use the panic button.');
      return;
    }

    setIsSendingPanic(true);
    setPanicMessage(null);
    setPanicError(null);

    try {
      const createdAlert = await triggerPanic(session, {
        lat: lastLocation.lat,
        lng: lastLocation.lng,
        note: panicNote || undefined,
      });
      setPanicMessage('Panic alert sent. Authorities and support teams will be notified.');
      setPanicNote('');
      // Optimistically prepend the newly created alert, if present
      if (createdAlert && typeof createdAlert === 'object' && 'id' in createdAlert) {
        setAlerts((prev) => [createdAlert as AlertItem, ...prev]);
        setHasLoadedAlertsOnce(true);
      } else {
        // Fallback: quietly refresh from the backend without showing the big loading state
        void loadAlerts({ silent: true });
      }
      void loadSafetyScore();
    } catch (err) {
      setPanicError('Failed to send panic alert. Please try again in a moment.');
    } finally {
      setIsSendingPanic(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Safety Dashboard | India Tour</title>
        <meta
          name="description"
          content="Tourist safety dashboard with live status, panic support, and risk-aware travel insights."
        />
      </Helmet>
      <div className="min-h-[60vh] py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="mb-4 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-[11px] sm:text-xs text-slate-700 shadow-[0_10px_26px_rgba(15,23,42,0.12)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="flex-1">
              To help authorities locate you quickly during an incident, keep a valid Safety Digital ID on file.
              With a completed Safety Digital ID, the live location sharing button can route your position to safety
              teams more accurately and reliably. If you haven&apos;t created one yet, set it up from the
              <span className="font-semibold"> Safety Digital ID</span> page.
            </p>
          </div>

          {!isAuthenticated && (
            <div className="mb-4 rounded-2xl border border-amber-300/70 bg-amber-50/90 px-4 py-3 text-[11px] sm:text-xs text-amber-900 shadow-[0_14px_30px_rgba(15,23,42,0.16)]">
              {t('safety.dashboard.requireLogin')}
            </div>
          )}

          <div className="grid gap-5 lg:gap-6 lg:grid-cols-3">
            {/* Alerts / live feed */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-lg shadow-[0_22px_60px_rgba(15,23,42,0.16)] p-4 sm:p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight">
                    {t('safety.dashboard.recentAlerts')}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                    {t('safety.dashboard.recentAlertsHelp')}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-3 sm:p-4 overflow-hidden max-h-[55vh]">
                {!hasLoadedAlertsOnce && isLoadingAlerts ? (
                  <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-500">
                    <div className="h-4 w-4 border-2 border-slate-300 border-t-primary-saffron rounded-full animate-spin" />
                    <span>Loading alerts...</span>
                  </div>
                ) : alertsError ? (
                  <p className="text-[11px] sm:text-xs text-rose-600">{t('safety.dashboard.loadAlertsError')}</p>
                ) : alerts.length === 0 ? (
                  <p className="text-[11px] sm:text-xs text-slate-500/90">{t('safety.dashboard.noAlerts')}</p>
                ) : (
                  <ul className="space-y-2 overflow-y-auto max-h-[48vh] pr-1 text-[11px] sm:text-xs">
                    {alerts.map((alert) => (
                      <li
                        key={alert.id}
                        className="rounded-xl border border-slate-200/80 bg-white/90 backdrop-blur-lg px-3 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-[0_10px_28px_rgba(15,23,42,0.12)] transition-transform transition-shadow duration-150 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.16)]"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide shadow-sm ${
                                alert.severity === 'critical'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : alert.severity === 'high'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {alert.severity}
                            </span>
                            <span className="text-[11px] font-medium text-slate-900/90">{alert.type}</span>
                            {(alert.type === 'geofence_breach' || alert.type === 'inactivity') && (
                              <span className="inline-flex items-center rounded-full bg-sky-50 text-sky-700 px-2 py-0.5 text-[9px] font-semibold border border-sky-200">
                                Safety AI
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-900 mt-0.5 line-clamp-2">{alert.title}</p>
                          {alert.description && (
                            <p className="text-[10px] text-slate-600/90 line-clamp-2">{alert.description}</p>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500/80 sm:text-right">
                          <p>{formatAlertTimestamp(alert.triggered_at)}</p>
                          <p className="capitalize">Status: {alert.status}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Panic + status */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50 via-rose-50 to-amber-50 backdrop-blur-lg p-4 shadow-[0_20px_55px_rgba(15,23,42,0.18)]">
                <h3 className="text-sm font-semibold text-slate-900 mb-1 flex items-center gap-2">
                  {t('safety.dashboard.panicTitle')}
                </h3>
                <p className="text-[11px] text-rose-900/80 mb-3">
                  {t('safety.dashboard.panicHelp')}
                </p>

                <textarea
                  rows={3}
                  value={panicNote}
                  onChange={(e) => setPanicNote(e.target.value)}
                  placeholder="Optional: briefly describe what is happening..."
                  className="w-full rounded-lg border border-rose-100 bg-white/90 px-3 py-2 text-[11px] sm:text-xs mb-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400/70 focus:border-rose-300/80"
                />

                {panicError && (
                  <p className="mb-2 text-[11px] text-rose-700">{panicError}</p>
                )}
                {panicMessage && (
                  <p className="mb-2 text-[11px] text-emerald-700">{panicMessage}</p>
                )}

                <button
                  type="button"
                  disabled={!isAuthenticated || isSendingPanic}
                  onClick={handlePanic}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-rose-500 via-rose-500 to-rose-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-[0_14px_32px_rgba(220,38,38,0.35)] disabled:opacity-60 disabled:cursor-not-allowed hover:from-rose-500 hover:via-red-500 hover:to-rose-600 transition-colors"
                >
                  {isSendingPanic ? 'Sending panic alert...' : t('safety.dashboard.panicButton')}
                </button>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={!isAuthenticated}
                    onClick={handleToggleTracking}
                    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-medium border transition-colors transition-shadow duration-150 ${
                      isTracking
                        ? 'bg-emerald-500/90 text-emerald-50 border-emerald-500 shadow-[0_4px_14px_rgba(16,185,129,0.4)]'
                        : 'bg-slate-50 text-slate-700 border-slate-200 shadow-[0_3px_12px_rgba(15,23,42,0.14)]'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <span
                      className={`inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px] font-semibold ${
                        isTracking
                          ? 'border-emerald-200 bg-emerald-500 text-white'
                          : 'border-slate-300 bg-white text-slate-500'
                      }`}
                    >
                      <MapPin className="h-2 w-2" />
                    </span>
                    <span>{isTracking ? 'Live location sharing: ON' : t('safety.dashboard.trackingLabel')}</span>
                  </button>
                </div>
                {trackingError && (
                  <p className="mt-1 text-[11px] text-rose-700/90">{trackingError}</p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-lg shadow-[0_20px_55px_rgba(15,23,42,0.18)] p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-1">{t('safety.dashboard.safetyStatus')}</h3>
                <p className="text-[11px] text-slate-600 mb-3">
                  {t('safety.dashboard.safetyStatusHelp')}
                </p>

                {isLoadingScore && safetyScore === null ? (
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <div className="h-4 w-4 border-2 border-slate-300 border-t-emerald-400 rounded-full animate-spin" />
                    <span>{t('safety.dashboard.scoreLoading')}</span>
                  </div>
                ) : scoreError ? (
                  <p className="text-xs text-rose-600">{scoreError}</p>
                ) : safetyScore === null ? (
                  <p className="text-xs text-slate-500/90">{t('safety.dashboard.scoreEmpty')}</p>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        className="relative h-14 w-14 min-h-14 min-w-14 aspect-square rounded-full bg-white shadow-[0_10px_30px_rgba(16,185,129,0.25)] flex items-center justify-center"
                      >
                        <div className="absolute h-10 w-10 rounded-full border border-emerald-300/70" />
                        <div className="absolute h-6 w-6 rounded-full border border-emerald-200/70" />
                        <div className="absolute inset-0 flex items-center justify-center animate-spin">
                          <div className="h-7 w-[2px] rounded-full bg-emerald-500 origin-bottom -translate-y-[4px]" />
                        </div>
                        <div className="absolute h-1 w-1 rounded-full bg-emerald-500" />
                      </motion.div>
                      <div>
                        <p className="text-3xl font-bold text-slate-900">{safetyScore}</p>
                        <p className="text-[11px] text-slate-600">Score out of 100</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold border ${
                          safetyScore >= 80
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : safetyScore >= 50
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        {safetyScore >= 80 ? 'Safe' : safetyScore >= 50 ? 'Caution' : 'At risk'}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-600 max-w-[190px]">
                        Fewer recent critical alerts and geofence breaches result in a higher score.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SafetyTouristDashboardPage;
