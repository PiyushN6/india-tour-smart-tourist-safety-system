import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext';
import {
  fetchAlertsAdmin,
  acknowledgeAlert,
  resolveAlert,
  fetchTouristProfileByCodeAdmin,
  fetchSafetyHealth,
  type SafetyAlert,
  type TouristProfileSummary,
} from '../../services/safetyApi';
import { useI18n } from '../../i18n';

const SafetyAdminPage: React.FC = () => {
  const { session, user, isAuthenticated } = useAuth();
  const { t } = useI18n();

  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const [selectedAlert, setSelectedAlert] = useState<SafetyAlert | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<TouristProfileSummary | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [efirText, setEfirText] = useState<string | null>(null);

  const [healthStatus, setHealthStatus] = useState<'unknown' | 'ok' | 'error'>('unknown');

  const isAdmin = user?.role === 'admin';

  const loadAlerts = async () => {
    if (!session) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAlertsAdmin(session, {
        status: statusFilter || undefined,
        severity: severityFilter || undefined,
        type: typeFilter || undefined,
      });
      setAlerts(data);
    } catch (err) {
      setError(t('safety.admin.loadError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAlert = async (alert: SafetyAlert) => {
    setSelectedAlert(alert);
    setEfirText(null);
    setSelectedProfile(null);

    if (!session || !isAdmin || !alert.tourist_id_code) return;

    setIsLoadingProfile(true);
    try {
      const profile = await fetchTouristProfileByCodeAdmin(session, alert.tourist_id_code);
      setSelectedProfile(profile);
    } catch {
      // profile is helpful but optional for admin view
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleGenerateEfir = () => {
    if (!selectedAlert) return;

    const a = selectedAlert;
    const p = selectedProfile;

    const lines: string[] = [];
    lines.push(`Alert ID: ${a.id}`);
    lines.push(`Type: ${a.type}`);
    lines.push(`Severity: ${a.severity}`);
    lines.push(`Status: ${a.status}`);
    lines.push(`Triggered at: ${new Date(a.triggered_at).toISOString()}`);
    if (a.lat != null && a.lng != null) {
      lines.push(`Location: lat=${a.lat}, lng=${a.lng}`);
    }
    if (p) {
      lines.push('--- Tourist Snapshot ---');
      if (p.full_name) lines.push(`Name: ${p.full_name}`);
      if (p.nationality) lines.push(`Nationality: ${p.nationality}`);
      if (p.age != null) lines.push(`Age: ${p.age}`);
      if (a.tourist_id_code) lines.push(`Tourist ID Code: ${a.tourist_id_code}`);
      if (p.government_id_type || p.government_id_number) {
        lines.push(
          `Govt ID: ${p.government_id_type ?? ''} ${p.government_id_number ?? ''}`.trim(),
        );
      }
      if (p.primary_contact_name || p.primary_contact_phone) {
        lines.push(
          `Emergency contact: ${p.primary_contact_name ?? ''} ${p.primary_contact_phone ?? ''}`.trim(),
        );
      }
    }
    const panicNote =
      a.type === 'panic'
        ? (a.description || (a.extra_data && typeof a.extra_data['note'] === 'string'
            ? (a.extra_data['note'] as string)
            : ''))
        : '';
    if (panicNote) {
      lines.push('--- Panic note ---');
      lines.push(panicNote);
    }
    if (a.description) {
      lines.push('--- Description ---');
      lines.push(a.description);
    }

    setEfirText(lines.join('\n'));
  };

  const mapUrl = useMemo(() => {
    if (!selectedAlert || selectedAlert.lat == null || selectedAlert.lng == null) return null;
    const lat = selectedAlert.lat;
    const lng = selectedAlert.lng;
    const delta = 0.02;
    const minLng = lng - delta;
    const minLat = lat - delta;
    const maxLng = lng + delta;
    const maxLat = lat + delta;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik&marker=${lat},${lng}`;
  }, [selectedAlert]);

  const recentPanicAlerts = useMemo(
    () =>
      alerts
        .filter((a) => a.type === 'panic')
        .sort(
          (a, b) =>
            new Date(b.triggered_at).getTime() -
            new Date(a.triggered_at).getTime(),
        )
        .slice(0, 5),
    [alerts],
  );

  useEffect(() => {
    if (session && isAdmin) {
      void loadAlerts();
    }
  }, [session, isAdmin, statusFilter, severityFilter, typeFilter]);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        await fetchSafetyHealth();
        setHealthStatus('ok');
      } catch {
        setHealthStatus('error');
      }
    };

    void checkHealth();
  }, []);

  const handleAcknowledge = async (alertId: number) => {
    if (!session) return;
    try {
      await acknowledgeAlert(session, alertId);
      void loadAlerts();
    } catch {
      setError(t('safety.admin.ackError'));
    }
  };

  const handleResolve = async (alertId: number) => {
    if (!session) return;
    try {
      await resolveAlert(session, alertId);
      void loadAlerts();
    } catch {
      setError(t('safety.admin.resolveError'));
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('safety.admin.title')} | India Tour</title>
        <meta
          name="description"
          content={t('safety.admin.subtitle')}
        />
      </Helmet>
      <div className="min-h-[70vh] bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-slate-50">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{t('safety.admin.title')}</h1>
          <p className="text-sm sm:text-base text-slate-300 mb-6 max-w-3xl">
            {t('safety.admin.subtitle')}
          </p>

          {!isAuthenticated && (
            <div className="mb-4 rounded-lg border border-yellow-500/40 bg-yellow-900/30 px-4 py-3 text-xs sm:text-sm text-yellow-50">
              Please sign in with an administrator account to access the safety admin dashboard.
            </div>
          )}

          {isAuthenticated && !isAdmin && (
            <div className="mb-4 rounded-lg border border-red-500/40 bg-red-900/30 px-4 py-3 text-xs sm:text-sm text-red-50">
              Your account is not marked as an admin. Ask the system owner to set <code>role = 'admin'</code> in the
              <code>profiles</code> table for your user to unlock full admin access.
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 rounded-2xl bg-slate-900/70 border border-slate-700/80 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-sm font-semibold mb-1">{t('safety.admin.liveAlerts')}</h2>
                  <p className="text-xs text-slate-300">
                    Filter and act on active panic, geofence, and anomaly alerts.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100"
                  >
                    <option value="">Status: All</option>
                    <option value="new">New</option>
                    <option value="acknowledged">Acknowledged</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100"
                  >
                    <option value="">Severity: All</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="rounded-md bg-slate-900 border border-slate-700 px-2 py-1 text-slate-100"
                  >
                    <option value="">Type: All</option>
                    <option value="panic">Panic</option>
                    <option value="geofence_breach">Geofence</option>
                    <option value="inactivity">Inactivity</option>
                  </select>
                </div>
              </div>

              <div className="h-72 rounded-xl bg-slate-950/60 border border-slate-800/80 p-3 overflow-auto">
                {isLoading ? (
                  <p className="text-xs text-slate-300">Loading alerts...</p>
                ) : error ? (
                  <p className="text-xs text-red-300">{error}</p>
                ) : alerts.length === 0 ? (
                  <p className="text-xs text-slate-400">{t('safety.admin.noAlerts')}</p>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {alerts.map((alert) => (
                      <li
                        key={alert.id}
                        onClick={() => handleSelectAlert(alert)}
                        className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 cursor-pointer hover:border-emerald-400/60"
                      >
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                alert.severity === 'critical'
                                  ? 'bg-red-500/20 text-red-300'
                                  : alert.severity === 'high'
                                  ? 'bg-orange-500/20 text-orange-200'
                                  : 'bg-yellow-500/20 text-yellow-200'
                              }`}
                            >
                              {alert.severity}
                            </span>
                            <span className="text-[11px] font-medium text-slate-100">{alert.type}</span>
                            {alert.type === 'inactivity' && (
                              <span className="inline-flex items-center rounded-full bg-emerald-500/15 text-emerald-200 px-2 py-0.5 text-[10px] font-semibold">
                                Anomaly
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400 capitalize">{alert.status}</span>
                            {alert.tourist_id_code && (
                              <span className="text-[11px] text-slate-400">ID: {alert.tourist_id_code}</span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-50 font-semibold line-clamp-2">{alert.title}</p>
                          {alert.description && (
                            <p className="text-[11px] text-slate-300 line-clamp-2">{alert.description}</p>
                          )}
                          <p className="text-[10px] text-slate-500 mt-1">
                            Triggered: {new Date(alert.triggered_at).toLocaleString()}
                            {alert.resolved_at && ` • Resolved: ${new Date(alert.resolved_at).toLocaleString()}`}
                          </p>
                        </div>
                        {isAdmin && (
                          <div className="flex flex-wrap gap-2 text-[11px]">
                            {alert.status === 'new' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleAcknowledge(alert.id);
                                }}
                                className="rounded-md border border-blue-500/60 px-3 py-1 text-blue-100 hover:bg-blue-500/20"
                              >
                                Acknowledge
                              </button>
                            )}
                            {alert.status !== 'resolved' && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleResolve(alert.id);
                                }}
                                className="rounded-md border border-emerald-500/60 px-3 py-1 text-emerald-100 hover:bg-emerald-500/20"
                              >
                                Resolve
                              </button>
                            )}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-900/70 border border-slate-700/80 p-4">
                <h3 className="text-sm font-semibold mb-1">{t('safety.admin.selectedDetail')}</h3>
                {!selectedAlert ? (
                  <p className="text-xs text-slate-300">{t('safety.admin.selectedDetailEmpty')}</p>
                ) : (
                  <div className="space-y-3 text-xs text-slate-200">
                    <div>
                      <p className="font-semibold">{selectedAlert.title}</p>
                      {selectedAlert.description && (
                        <p className="text-slate-300 mt-0.5">{selectedAlert.description}</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">
                        Type: {selectedAlert.type} • Severity: {selectedAlert.severity} • Status:{' '}
                        <span className="capitalize">{selectedAlert.status}</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Triggered: {new Date(selectedAlert.triggered_at).toLocaleString()}
                        {selectedAlert.resolved_at &&
                          ` • Resolved: ${new Date(selectedAlert.resolved_at).toLocaleString()}`}
                      </p>
                    </div>

                    {selectedAlert.lat != null && selectedAlert.lng != null && (
                      <div>
                        <p className="font-semibold mb-1">Last known location</p>
                        <p className="text-[11px] text-slate-300">
                          lat={selectedAlert.lat.toFixed(4)}, lng={selectedAlert.lng.toFixed(4)}
                        </p>
                        {mapUrl && (
                          <iframe
                            title="Alert location map"
                            src={mapUrl}
                            className="mt-2 w-full h-36 rounded-lg border border-slate-700"
                            loading="lazy"
                          />
                        )}
                        <p className="text-[10px] text-slate-500 mt-1">
                          Approximate map view powered by OpenStreetMap.
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="font-semibold mb-1">Tourist snapshot</p>
                      {isLoadingProfile && (
                        <p className="text-[11px] text-slate-400">{t('safety.admin.loadingProfile')}</p>
                      )}
                      {!isLoadingProfile && !selectedProfile && (
                        <p className="text-[11px] text-slate-400">
                          {t('safety.admin.noProfile')}
                        </p>
                      )}
                      {selectedProfile && (
                        <div className="space-y-0.5">
                          {selectedProfile.full_name && <p>Name: {selectedProfile.full_name}</p>}
                          {selectedAlert.tourist_id_code && <p>ID code: {selectedAlert.tourist_id_code}</p>}
                          {selectedProfile.nationality && <p>Nationality: {selectedProfile.nationality}</p>}
                          {selectedProfile.age != null && <p>Age: {selectedProfile.age}</p>}
                          {(selectedProfile.government_id_type || selectedProfile.government_id_number) && (
                            <p>
                              Govt ID: {selectedProfile.government_id_type ?? ''}{' '}
                              {selectedProfile.government_id_number ?? ''}
                            </p>
                          )}
                          {(selectedProfile.primary_contact_name || selectedProfile.primary_contact_phone) && (
                            <p>
                              Emergency contact: {selectedProfile.primary_contact_name ?? ''}{' '}
                              {selectedProfile.primary_contact_phone ?? ''}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {selectedAlert.type === 'panic' && (
                      <div>
                        <p className="font-semibold mb-1">Evidence / Panic note</p>
                        {selectedAlert.description ? (
                          <p className="text-[11px] text-slate-300 whitespace-pre-line">
                            {selectedAlert.description}
                          </p>
                        ) : selectedAlert.extra_data && typeof selectedAlert.extra_data['note'] === 'string' ? (
                          <p className="text-[11px] text-slate-300 whitespace-pre-line">
                            {selectedAlert.extra_data['note'] as string}
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-400">{t('safety.admin.noPanicNote')}</p>
                        )}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold">{t('safety.admin.efir')}</p>
                        <button
                          type="button"
                          onClick={handleGenerateEfir}
                          className="rounded-md border border-emerald-500/60 px-2 py-1 text-[11px] text-emerald-100 hover:bg-emerald-500/20"
                        >
                          Generate
                        </button>
                      </div>
                      {efirText ? (
                        <textarea
                          className="w-full h-32 rounded-md bg-slate-950/60 border border-slate-700 px-2 py-1 text-[11px] text-slate-100"
                          readOnly
                          value={efirText}
                        />
                      ) : (
                        <p className="text-[11px] text-slate-400">
                          {t('safety.admin.efirEmpty')}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-slate-900/70 border border-slate-700/80 p-4">
                <h3 className="text-sm font-semibold mb-1">System Status</h3>
                <div className="flex items-center gap-2 mb-2 text-xs">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ${
                      healthStatus === 'ok'
                        ? 'bg-emerald-500/20 text-emerald-200'
                        : healthStatus === 'error'
                        ? 'bg-red-500/20 text-red-200'
                        : 'bg-slate-500/20 text-slate-200'
                    }`}
                  >
                    {healthStatus === 'ok'
                      ? 'Online'
                      : healthStatus === 'error'
                      ? 'Offline'
                      : 'Checking...'}
                  </span>
                  <span className="text-slate-400">Safety API</span>
                </div>
                <p className="text-xs text-slate-300">
                  FastAPI safety backend, Supabase auth, and alert ingestion are wired. This admin view now also
                  surfaces anomaly alerts, tourist context, and a ready-to-copy E-FIR style summary.
                </p>
                <div className="mt-3 border-t border-slate-800/80 pt-2">
                  <p className="text-xs font-semibold text-slate-200 mb-1">Recent panic dispatches</p>
                  {recentPanicAlerts.length === 0 ? (
                    <p className="text-[11px] text-slate-400">No recent panic alerts.</p>
                  ) : (
                    <ul className="space-y-1 text-[11px] text-slate-300">
                      {recentPanicAlerts.map((a) => (
                        <li key={a.id} className="flex justify-between gap-2">
                          <span className="truncate">
                            #{a.id} {a.tourist_id_code ? `(${a.tourist_id_code})` : ''}
                          </span>
                          <span className="text-slate-500">
                            {new Date(a.triggered_at).toLocaleTimeString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SafetyAdminPage;
