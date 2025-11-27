import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
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

  const [lastLocation, setLastLocation] = useState<{ lat?: number; lng?: number }>({});

  const [safetyScore, setSafetyScore] = useState<number | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);

  const [touristIdCode, setTouristIdCode] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

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

  const loadAlerts = async () => {
    if (!session) return;
    setIsLoadingAlerts(true);
    setAlertsError(null);
    try {
      const data = await fetchMyAlerts(session);
      setAlerts(Array.isArray(data) ? data : []);
    } catch {
      setAlertsError(t('safety.dashboard.loadAlertsError'));
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  useEffect(() => {
    if (session) {
      void loadAlerts();
      void loadSafetyScore();
      void loadProfile();
    }
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
      await triggerPanic(session, {
        lat: lastLocation.lat,
        lng: lastLocation.lng,
        note: panicNote || undefined,
      });
      setPanicMessage('Panic alert sent. Authorities and support teams will be notified.');
      setPanicNote('');
      void loadAlerts();
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
      <div className="min-h-[70vh] bg-gradient-to-br from-orange-50 via-white to-blue-50 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{t('safety.dashboard.title')}</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-2xl">
            {/* Optional: could add a separate key if you want this localized too later */}
            Use this dashboard to trigger an emergency alert and review your latest safety notifications. Live
            maps and risk zones will be added here next.
          </p>

          {!isAuthenticated && (
            <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-xs sm:text-sm text-yellow-800">
              {t('safety.dashboard.requireLogin')}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Map / Alerts placeholder */}
            <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-1">{t('safety.dashboard.recentAlerts')}</h2>
                <p className="text-xs text-gray-500 mb-3">
                  {t('safety.dashboard.recentAlertsHelp')}
                </p>
              </div>

              <div className="flex-1 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-4 overflow-hidden flex flex-col">
                {isLoadingAlerts ? (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                    <div className="h-4 w-4 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin" />
                    <span>Loading alerts...</span>
                  </div>
                ) : alertsError ? (
                  <p className="text-xs sm:text-sm text-red-600">{t('safety.dashboard.loadAlertsError')}</p>
                ) : alerts.length === 0 ? (
                  <p className="text-xs sm:text-sm text-gray-500">{t('safety.dashboard.noAlerts')}</p>
                ) : (
                  <ul className="space-y-2 overflow-y-auto max-h-64 pr-1 text-xs sm:text-sm">
                    {alerts.map((alert) => (
                      <li
                        key={alert.id}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                alert.severity === 'critical'
                                  ? 'bg-red-100 text-red-700'
                                  : alert.severity === 'high'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {alert.severity}
                            </span>
                            <span className="text-[11px] font-medium text-gray-700">{alert.type}</span>
                            {(alert.type === 'geofence_breach' || alert.type === 'inactivity') && (
                              <span className="inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-semibold">
                                Safety AI
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-900 mt-0.5 line-clamp-2">{alert.title}</p>
                          {alert.description && (
                            <p className="text-[11px] text-gray-500 line-clamp-2">{alert.description}</p>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 sm:text-right">
                          <p>{new Date(alert.triggered_at).toLocaleString()}</p>
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
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{t('safety.dashboard.panicTitle')}</h3>
                <p className="text-xs text-gray-600 mb-3">
                  {t('safety.dashboard.panicHelp')}
                </p>

                <textarea
                  rows={3}
                  value={panicNote}
                  onChange={(e) => setPanicNote(e.target.value)}
                  placeholder="Optional: briefly describe what is happening..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs sm:text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-red-400"
                />

                {panicError && (
                  <p className="mb-2 text-[11px] text-red-600">{panicError}</p>
                )}
                {panicMessage && (
                  <p className="mb-2 text-[11px] text-green-700">{panicMessage}</p>
                )}

                <button
                  type="button"
                  disabled={!isAuthenticated || isSendingPanic}
                  onClick={handlePanic}
                  className="inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm disabled:opacity-60 disabled:cursor-not-allowed hover:bg-red-700"
                >
                  {isSendingPanic ? 'Sending panic alert...' : t('safety.dashboard.panicButton')}
                </button>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-[11px] text-gray-600">
                    <input
                      type="checkbox"
                      className="h-3 w-3 rounded border-gray-300 text-red-600 focus:ring-red-500"
                      disabled={!isAuthenticated || !touristIdCode}
                      checked={isTracking}
                      onChange={(e) => setIsTracking(e.target.checked)}
                    />
                    <span>{t('safety.dashboard.trackingLabel')}</span>
                  </label>
                </div>
                {trackingError && (
                  <p className="mt-1 text-[11px] text-red-600">{trackingError}</p>
                )}
              </div>

              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{t('safety.dashboard.safetyStatus')}</h3>
                <p className="text-xs text-gray-600 mb-3">
                  {t('safety.dashboard.safetyStatusHelp')}
                </p>

                {isLoadingScore ? (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="h-4 w-4 border-2 border-gray-300 border-t-emerald-500 rounded-full animate-spin" />
                    <span>{t('safety.dashboard.scoreLoading')}</span>
                  </div>
                ) : scoreError ? (
                  <p className="text-xs text-red-600">{scoreError}</p>
                ) : safetyScore === null ? (
                  <p className="text-xs text-gray-500">{t('safety.dashboard.scoreEmpty')}</p>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900">{safetyScore}</p>
                      <p className="text-[11px] text-gray-500">Score out of 100</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${{
                          safe: 'bg-emerald-50 text-emerald-700',
                          caution: 'bg-amber-50 text-amber-700',
                          risk: 'bg-red-50 text-red-700',
                        }[safetyScore >= 80 ? 'safe' : safetyScore >= 50 ? 'caution' : 'risk']}`}
                      >
                        {safetyScore >= 80 ? 'Safe' : safetyScore >= 50 ? 'Caution' : 'At risk'}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500 max-w-[180px]">
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
};

export default SafetyTouristDashboardPage;
