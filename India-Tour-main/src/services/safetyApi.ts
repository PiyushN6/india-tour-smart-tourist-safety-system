import type { Session } from '@supabase/supabase-js';

const SAFETY_API_BASE_URL = import.meta.env.VITE_SAFETY_API_URL || 'http://localhost:8000';

export interface SafetyHealth {
  status: string;
  service?: string;
}

export interface TouristProfileSummary {
  tourist_id_code?: string;
  full_name?: string;
  nationality?: string;
  age?: number;
  government_id_type?: string;
  government_id_number?: string;
  primary_contact_name?: string;
  primary_contact_phone?: string;
}

export interface RiskZone {
  id: number;
  name: string;
  description?: string | null;
  risk_level: string;
  category?: string | null;
  city?: string | null;
  geom: any;
  is_active: boolean;
}

function getAuthHeaders(session: Session | null): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }
  return headers;
}

export async function fetchMyTouristProfile(session: Session | null) {
  const res = await fetch(`${SAFETY_API_BASE_URL}/api/tourists/me`, {
    method: 'GET',
    headers: getAuthHeaders(session),
  });

  if (!res.ok) {
    throw new Error(`Failed to load safety profile: ${res.status}`);
  }

  return res.json();
}

export async function clearItineraryBackend(userId: string) {
  const params = new URLSearchParams({ user_id: userId });
  const res = await fetch(`${SAFETY_API_BASE_URL}/api/itinerary/clear?${params.toString()}`, {
    method: 'POST',
  });

  if (!res.ok) {
    throw new Error(`Failed to clear itinerary: ${res.status}`);
  }

  return res.json();
}

// ---- Itinerary persistence via safety API backend ----

export interface ItinerarySavePayload {
  user_id: string;
  items: any[];
  trip_note: string | null;
}

export async function saveItineraryBackend(payload: ItinerarySavePayload) {
  const res = await fetch(`${SAFETY_API_BASE_URL}/api/itinerary/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to save itinerary: ${res.status}`);
  }

  return res.json();
}

export async function fetchRiskZones(): Promise<RiskZone[]> {
  const res = await fetch(`${SAFETY_API_BASE_URL}/api/locations/zones`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error(`Failed to load risk zones: ${res.status}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchSafetyHealth(): Promise<SafetyHealth> {
  const res = await fetch(`${SAFETY_API_BASE_URL}/healthz`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }

  return res.json();
}

export async function fetchMySafetyScore(session: Session | null): Promise<number> {
  const res = await fetch(`${SAFETY_API_BASE_URL}/api/tourists/me/safety-score`, {
    method: 'GET',
    headers: getAuthHeaders(session),
  });

  if (!res.ok) {
    throw new Error(`Failed to load safety score: ${res.status}`);
  }

  const data = await res.json();
  return typeof data?.safety_score === 'number' ? data.safety_score : 0;
}

// ---- Location tracking ----

export interface LocationPingPayload {
  tourist_id_code: string;
  lat: number;
  lng: number;
  accuracy_m?: number;
  source?: string;
}

export async function sendLocationPing(session: Session | null, payload: LocationPingPayload) {
  const res = await fetch(`${SAFETY_API_BASE_URL}/api/locations`, {
    method: 'POST',
    headers: getAuthHeaders(session),
    body: JSON.stringify({
      ...payload,
      recorded_at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to send location: ${res.status}`);
  }

  return res.json();
}

// ---- Admin alerts helpers ----

export interface SafetyAlert {
  id: number;
  type: string;
  severity: string;
  status: string;
  title: string;
  description?: string | null;
  tourist_id_code?: string | null;
  lat?: number | null;
  lng?: number | null;
  extra_data?: Record<string, unknown> | null;
  triggered_at: string;
  resolved_at?: string | null;
  resolved_by?: string | null;
}

export interface AlertFilters {
  status?: string;
  type?: string;
  severity?: string;
  tourist_id_code?: string;
}

export async function fetchAlertsAdmin(session: Session | null, filters: AlertFilters = {}): Promise<SafetyAlert[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.type) params.set('type', filters.type);
  if (filters.severity) params.set('severity', filters.severity);
  if (filters.tourist_id_code) params.set('tourist_id_code', filters.tourist_id_code);

  const url = `${SAFETY_API_BASE_URL}/api/alerts${params.toString() ? `?${params.toString()}` : ''}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(session),
  });

  if (!res.ok) {
    throw new Error(`Failed to load admin alerts: ${res.status}`);
  }

  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function acknowledgeAlert(session: Session | null, alertId: number): Promise<SafetyAlert> {
  const res = await fetch(`${SAFETY_API_BASE_URL}/api/alerts/${alertId}/acknowledge`, {
    method: 'POST',
    headers: getAuthHeaders(session),
  });

  if (!res.ok) {
    throw new Error(`Failed to acknowledge alert: ${res.status}`);
  }

  return res.json();
}

export async function resolveAlert(session: Session | null, alertId: number): Promise<SafetyAlert> {
  const res = await fetch(`${SAFETY_API_BASE_URL}/api/alerts/${alertId}/resolve`, {
    method: 'POST',
    headers: getAuthHeaders(session),
  });

  if (!res.ok) {
    throw new Error(`Failed to resolve alert: ${res.status}`);
  }

  return res.json();
}

export async function fetchTouristProfileByCodeAdmin(
  session: Session | null,
  touristIdCode: string,
): Promise<TouristProfileSummary> {
  const res = await fetch(`${SAFETY_API_BASE_URL}/api/tourists/${encodeURIComponent(touristIdCode)}`, {
    headers: getAuthHeaders(session),
  });
  if (!res.ok) {
    throw new Error('Failed to load tourist profile');
  }
  return res.json();
}

// ---- AI Chat helper ----

export interface ChatApiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function sendChatMessage(messages: ChatApiMessage[]): Promise<string> {
  const res = await fetch(`${SAFETY_API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`);
  }

  const data = await res.json();
  return typeof data?.reply === 'string' ? data.reply : '';
}

export interface TouristProfilePayload {
  full_name: string;
  gender?: string | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  id_type?: string | null;
  id_number?: string | null;
  phone?: string | null;
  email?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  trip_start_date?: string | null;
  trip_end_date?: string | null;
  planned_cities?: string[] | null;
  accommodation_details?: string | null;
  // New extended profile fields mirroring tourist_profiles
  gov_id_type?: string | null;
  gov_id_number?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  blood_group?: string | null;
  emergency_contact_relation?: string | null;
  digital_id_number?: string | null;
  extra_data?: Record<string, any> | null;
}

export async function upsertTouristProfile(session: Session | null, payload: TouristProfilePayload) {
  const res = await fetch(`${SAFETY_API_BASE_URL}/api/tourists`, {
    method: 'POST',
    headers: getAuthHeaders(session),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to save safety profile: ${res.status}`);
  }

  return res.json();
}

export interface PanicPayload {
  lat?: number;
  lng?: number;
  note?: string;
}

export async function triggerPanic(session: Session | null, payload: PanicPayload) {
  const res = await fetch(`${SAFETY_API_BASE_URL}/api/incidents/panic`, {
    method: 'POST',
    headers: getAuthHeaders(session),
    body: JSON.stringify({
      tourist_id_code: undefined, // backend infers from token + profile; we will extend later if needed
      ...payload,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to trigger panic: ${res.status}`);
  }

  return res.json();
}

export async function fetchMyAlerts(session: Session | null) {
  const res = await fetch(`${SAFETY_API_BASE_URL}/api/alerts`, {
    method: 'GET',
    headers: getAuthHeaders(session),
  });

  if (!res.ok) {
    throw new Error(`Failed to load alerts: ${res.status}`);
  }

  return res.json();
}
