import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Session } from '@supabase/supabase-js';
import { fetchMyTouristProfile, upsertTouristProfile, type TouristProfilePayload } from '../../services/safetyApi';
import { useI18n } from '../../i18n';

interface SafetyFormData {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  idType: string;
  idNumber: string;
  phone: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  tripStartDate: string;
  tripEndDate: string;
  plannedCities: string;
  accommodationDetails: string;
}

const SafetyDigitalIDForm: React.FC = () => {
  const { session, user } = useAuth();
  const { t } = useI18n();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [touristIdCode, setTouristIdCode] = useState<string | null>(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);

  const [formData, setFormData] = useState<SafetyFormData>({
    fullName: '',
    gender: 'prefer-not-to-say',
    dateOfBirth: '',
    nationality: 'India',
    idType: 'passport',
    idNumber: '',
    phone: '',
    email: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    tripStartDate: '',
    tripEndDate: '',
    plannedCities: '',
    accommodationDetails: '',
  });

  // Prefill from auth + safety backend
  useEffect(() => {
    const loadProfile = async (sess: Session | null) => {
      if (!sess) {
        setInitialLoading(false);
        return;
      }

      try {
        const profile = await fetchMyTouristProfile(sess);
        setTouristIdCode(profile.tourist_id_code);
        setFormData(prev => ({
          ...prev,
          fullName: profile.full_name || prev.fullName,
          gender: profile.gender || prev.gender,
          dateOfBirth: profile.date_of_birth || prev.dateOfBirth,
          nationality: profile.nationality || prev.nationality,
          idType: profile.id_type || prev.idType,
          idNumber: profile.id_number || prev.idNumber,
          phone: profile.phone || user?.phone || prev.phone,
          email: profile.email || user?.email || prev.email,
          emergencyContactName: profile.emergency_contact_name || prev.emergencyContactName,
          emergencyContactPhone: profile.emergency_contact_phone || prev.emergencyContactPhone,
          tripStartDate: profile.trip_start_date || prev.tripStartDate,
          tripEndDate: profile.trip_end_date || prev.tripEndDate,
          plannedCities: Array.isArray(profile.planned_cities) ? profile.planned_cities.join(', ') : prev.plannedCities,
          accommodationDetails: profile.accommodation_details || prev.accommodationDetails,
        }));
      } catch (err) {
        // It is okay if there is no profile yet; ignore 404
        setServerError(null);
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile(session as Session | null);
  }, [session, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    if (!hasConsented) {
      setConsentError(t('safety.digitalId.consentError'));
      return;
    }

    if (!session) {
      setServerError(t('safety.digitalId.requireLogin'));
      return;
    }

    setConsentError(null);
    setLoading(true);
    try {
      const payload: TouristProfilePayload = {
        full_name: formData.fullName,
        gender: formData.gender || undefined,
        date_of_birth: formData.dateOfBirth || undefined,
        nationality: formData.nationality || undefined,
        id_type: formData.idType || undefined,
        id_number: formData.idNumber || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        emergency_contact_name: formData.emergencyContactName || undefined,
        emergency_contact_phone: formData.emergencyContactPhone || undefined,
        trip_start_date: formData.tripStartDate || undefined,
        trip_end_date: formData.tripEndDate || undefined,
        planned_cities: formData.plannedCities
          ? formData.plannedCities.split(',').map(c => c.trim()).filter(Boolean)
          : undefined,
        accommodation_details: formData.accommodationDetails || undefined,
      };

      const result = await upsertTouristProfile(session, payload);
      setTouristIdCode(result.tourist_id_code);
      setSuccessMessage(t('safety.digitalId.saveSuccess'));
    } catch (err) {
      setServerError(t('safety.digitalId.saveError'));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-gray-600 text-sm">{t('safety.digitalId.loadingProfile')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 sm:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('safety.digitalId.title')}</h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('safety.digitalId.subtitle')}
          </p>
        </div>
        {touristIdCode && (
          <div className="inline-flex items-center rounded-lg bg-orange-50 px-3 py-2 text-xs sm:text-sm font-medium text-orange-700 border border-orange-100">
            <span className="mr-1">Your Safety ID:</span>
            <span className="font-mono">{touristIdCode}</span>
          </div>
        )}
      </div>

      {serverError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-700">
          {serverError}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-xs sm:text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identity */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">{t('safety.digitalId.identity')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="fullName">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="dateOfBirth">
                Date of birth
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="prefer-not-to-say">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="nationality">
                Nationality
              </label>
              <input
                id="nationality"
                name="nationality"
                type="text"
                value={formData.nationality}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* ID + Contacts */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">{t('safety.digitalId.identityDocs')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="idType">
                ID type
              </label>
              <select
                id="idType"
                name="idType"
                value={formData.idType}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="passport">Passport</option>
                <option value="aadhaar">Aadhaar</option>
                <option value="driving">Driving licence</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="idNumber">
                ID number
              </label>
              <input
                id="idNumber"
                name="idNumber"
                type="text"
                value={formData.idNumber}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="phone">
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Emergency & Trip */}
        <div className="bg-gray-50 rounded-lg p-4 sm:p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">{t('safety.digitalId.emergencyTrip')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="emergencyContactName">
                Emergency contact name
              </label>
              <input
                id="emergencyContactName"
                name="emergencyContactName"
                type="text"
                value={formData.emergencyContactName}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="emergencyContactPhone">
                Emergency contact phone
              </label>
              <input
                id="emergencyContactPhone"
                name="emergencyContactPhone"
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="tripStartDate">
                Trip start date
              </label>
              <input
                id="tripStartDate"
                name="tripStartDate"
                type="date"
                value={formData.tripStartDate}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="tripEndDate">
                Trip end date
              </label>
              <input
                id="tripEndDate"
                name="tripEndDate"
                type="date"
                value={formData.tripEndDate}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="plannedCities">
                Planned cities (comma separated)
              </label>
              <textarea
                id="plannedCities"
                name="plannedCities"
                value={formData.plannedCities}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="accommodationDetails">
                Accommodation details
              </label>
              <textarea
                id="accommodationDetails"
                name="accommodationDetails"
                value={formData.accommodationDetails}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-[11px] text-gray-600 max-w-md">
            <label className="inline-flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-0.5 h-3 w-3 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                checked={hasConsented}
                onChange={e => setHasConsented(e.target.checked)}
              />
              <span>
                {t('safety.digitalId.consent')}
              </span>
            </label>
            {consentError && <p className="mt-1 text-[11px] text-red-600">{consentError}</p>}
          </div>

          <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-md bg-orange-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orange-700 disabled:opacity-60"
          >
            {loading ? t('safety.digitalId.saving') : t('safety.digitalId.save')}
          </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SafetyDigitalIDForm;
