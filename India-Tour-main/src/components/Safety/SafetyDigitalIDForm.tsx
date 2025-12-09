import React, { useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';

import { useAuth } from '../../context/AuthContext';
import type { Session } from '@supabase/supabase-js';
import { useI18n } from '../../i18n';
import {
  fetchMyTouristProfile,
  upsertTouristProfile,
  type TouristProfilePayload,
} from '../../services/safetyApi';

interface SafetyFormData {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  idType: string;
  idNumber: string;
  idTypeOther?: string;
  phone: string;
  email: string;
  homeAddress: string;
  homeCity: string;
  homeState: string;
  homePincode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation?: string;
  tripStartDate: string;
  tripEndDate: string;
  plannedCities: string;
  accommodationDetails: string;
  bloodGroup?: string;
  medicalConditions?: string;
  allergies?: string;
  medications?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  languages?: string;
}

interface SafetyDigitalIDFormProps {
  onSaved?: () => void;
}

const SafetyDigitalIDForm: React.FC<SafetyDigitalIDFormProps> = ({ onSaved }) => {
  const { session, user } = useAuth();
  const { t } = useI18n();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [touristIdCode, setTouristIdCode] = useState<string | null>(null);
  const [hasConsented, setHasConsented] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cardData, setCardData] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'form' | 'card'>('form');
  const cardRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState<SafetyFormData>({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    nationality: 'India',
    idType: 'passport',
    idNumber: '',
    idTypeOther: '',
    phone: '',
    email: '',
    homeAddress: '',
    homeCity: '',
    homeState: '',
    homePincode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: undefined,
    tripStartDate: '',
    tripEndDate: '',
    plannedCities: '',
    accommodationDetails: '',
    bloodGroup: undefined,
    medicalConditions: undefined,
    allergies: undefined,
    medications: undefined,
    insuranceProvider: undefined,
    insurancePolicyNumber: undefined,
    languages: undefined,
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
          emergencyContactName:
            profile.emergency_contact_name || prev.emergencyContactName,
          emergencyContactPhone:
            profile.emergency_contact_phone || prev.emergencyContactPhone,
          emergencyContactRelation:
            profile.emergency_contact_relation || prev.emergencyContactRelation,
          tripStartDate: profile.trip_start_date || prev.tripStartDate,
          tripEndDate: profile.trip_end_date || prev.tripEndDate,
          plannedCities: Array.isArray(profile.planned_cities)
            ? profile.planned_cities.join(', ')
            : prev.plannedCities,
          accommodationDetails:
            profile.accommodation_details || prev.accommodationDetails,
          homeAddress:
            profile.address || profile.extra_data?.home_address || prev.homeAddress,
          homeCity:
            profile.city || profile.extra_data?.home_city || prev.homeCity,
          homeState:
            profile.state || profile.extra_data?.home_state || prev.homeState,
          homePincode:
            profile.pincode || profile.extra_data?.home_pincode || prev.homePincode,
          bloodGroup:
            profile.blood_group || profile.extra_data?.blood_group || prev.bloodGroup,
          medicalConditions:
            profile.extra_data?.medical_conditions || prev.medicalConditions,
          allergies: profile.extra_data?.allergies || prev.allergies,
          medications: profile.extra_data?.medications || prev.medications,
          insuranceProvider:
            profile.extra_data?.insurance_provider || prev.insuranceProvider,
          insurancePolicyNumber:
            profile.extra_data?.insurance_policy_number || prev.insurancePolicyNumber,
          languages: profile.extra_data?.languages || prev.languages,
          idTypeOther:
            profile.extra_data?.other_gov_id_label || prev.idTypeOther,
        }));

        if (profile.extra_data?.photo_data_url && typeof profile.extra_data.photo_data_url === 'string') {
          setPhotoPreview(profile.extra_data.photo_data_url);
        }
      } catch {
        // ok if no profile yet
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile(session as Session | null);
  }, [session, user]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasConsented) {
      setConsentError(t('safety.digitalId.consentError'));
      return;
    }

    if (!session) {
      toast.error(t('safety.digitalId.requireLogin'), { autoClose: 5000 });
      return;
    }

    // Require gender selection
    if (!formData.gender) {
      toast.error(t('safety.digitalId.saveError'), { autoClose: 5000 });
      return;
    }

    setConsentError(null);
    setLoading(true);

    try {
      // Map UI fields into the extended TouristProfilePayload so all Digital ID
      // data lives on tourist_profiles (no separate digital_ids table).
      const normalizedGovIdType: 'aadhaar' | 'passport' | 'driving' | 'voter' | 'other' =
        formData.idType === 'passport'
          ? 'passport'
          : formData.idType === 'aadhaar'
          ? 'aadhaar'
          : formData.idType === 'driver-license'
          ? 'driving'
          : formData.idType === 'national-id'
          ? 'other'
          : 'other';

      const payload: TouristProfilePayload = {
        full_name: formData.fullName,
        gender: formData.gender || null,
        date_of_birth: formData.dateOfBirth || null,
        nationality: formData.nationality || null,
        id_type: formData.idType || null,
        id_number: formData.idNumber || null,
        phone: formData.phone || null,
        email: formData.email || null,
        emergency_contact_name: formData.emergencyContactName || null,
        emergency_contact_phone: formData.emergencyContactPhone || null,
        trip_start_date: formData.tripStartDate || null,
        trip_end_date: formData.tripEndDate || null,
        planned_cities: formData.plannedCities
          ? formData.plannedCities
              .split(',')
              .map(c => c.trim())
              .filter(Boolean)
          : null,
        accommodation_details: formData.accommodationDetails || null,

        gov_id_type: normalizedGovIdType,
        gov_id_number: formData.idNumber || null,
        address: formData.homeAddress || null,
        city: formData.homeCity || null,
        state: formData.homeState || null,
        country: formData.nationality || null,
        pincode: formData.homePincode || null,
        blood_group: formData.bloodGroup || null,
        emergency_contact_relation: formData.emergencyContactRelation || null,
        digital_id_number: touristIdCode || null,
        extra_data: {
          planned_cities: formData.plannedCities,
          accommodation_details: formData.accommodationDetails,
          medical_conditions: formData.medicalConditions,
          allergies: formData.allergies,
          medications: formData.medications,
          insurance_provider: formData.insuranceProvider,
          insurance_policy_number: formData.insurancePolicyNumber,
          languages: formData.languages,
          other_gov_id_label: formData.idTypeOther,
          home_address: formData.homeAddress,
          home_city: formData.homeCity,
          home_state: formData.homeState,
          home_pincode: formData.homePincode,
          photo_data_url: photoPreview,
        },
      };

      const result = await upsertTouristProfile(session, payload);
      setTouristIdCode(result.tourist_id_code);

      // Immediately prepare card data for UI, independent of background sync.
      const nextCardData = {
        form: { ...formData },
        photo: photoPreview,
      };
      setCardData(nextCardData);

      toast.success('Safety Digital ID card created successfully', {
        autoClose: 4000,
      });
      setViewMode('card');
      // After generating the card, move the viewport to the top so the card
      // sits at the top of the screen without the user needing to scroll.
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 200);

      if (onSaved) onSaved();
    } catch {
      // In some cases the backend may create the profile but return an error
      // code. Try to recover by reloading the profile; if we find a
      // tourist_id_code we still show the card as success.
      try {
        if (session) {
          const profile = await fetchMyTouristProfile(session as Session);
          if (profile?.tourist_id_code) {
            setTouristIdCode(profile.tourist_id_code);
            const recoveredCard = {
              form: { ...formData },
              photo: photoPreview,
            };
            setCardData(recoveredCard);
            toast.success('Safety Digital ID card created successfully', {
              autoClose: 4000,
            });
            setViewMode('card');
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 200);
            if (onSaved) onSaved();
            return;
          }
        }
      } catch (recoveryError) {
        console.error('Recovery fetch after safety profile save error failed', recoveryError);
      }

      toast.error(t('safety.digitalId.saveError'), { autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setPhotoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadJson = () => {
    if (!cardData || !touristIdCode) return;
    const blob = new Blob(
      [
        JSON.stringify(
          {
            safety_id: touristIdCode,
            ...cardData.form,
          },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digital-id-${touristIdCode}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintCard = async () => {
    if (!cardRef.current) return;

    // Use the same clean, shadow-free card as PDF so print output matches.
    cardRef.current.classList.add('pdf-export');
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
    });
    cardRef.current.classList.remove('pdf-export');

    const imgData = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html><html><head><title>Print Digital ID</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: #f3f4f6;
        }
        img {
          width: 75%;
          height: auto;
          max-height: 90vh;
          border-radius: 24px;
          box-shadow: 0 18px 45px rgba(15,23,42,0.25);
        }
      </style>
    </head><body>
      <img src="${imgData}" alt="Safety Digital ID" />
      <script>
        window.onload = function() {
          window.focus();
          window.print();
          // Close the temporary print window once printing is finished or dismissed
          if ('onafterprint' in window) {
            window.onafterprint = function() { window.close(); };
          } else {
            // Fallback: close after a short delay so main app is usable again
            setTimeout(function() { window.close(); }, 1000);
          }
        };
      </script>
    </body></html>`);
    printWindow.document.close();
  };

  const handleDownloadPdf = async () => {
    if (!cardRef.current) return;

    // Render a clean, border-only card for PDF to avoid dark outer shadow.
    cardRef.current.classList.add('pdf-export');
    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
    });
    cardRef.current.classList.remove('pdf-export');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Use a wide target width to make the card large on the page while
    // preserving the rendered aspect ratio from the canvas.
    const targetWidth = pageWidth - 30;
    const aspect = canvas.height / canvas.width;
    const imgWidth = targetWidth;
    const imgHeight = targetWidth * aspect;
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save(`digital-id-${touristIdCode || 'card'}.pdf`);
  };

  if (initialLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <p className="text-gray-600 text-sm">
          {t('safety.digitalId.loadingProfile')}
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @page {
          size: A4;
          margin: 12mm;
        }

        @media print {
          body * {
            visibility: hidden;
          }
          #safety-digital-id-card, #safety-digital-id-card * {
            visibility: visible;
          }
          #safety-digital-id-card {
            position: fixed;
            inset: 0;
            margin: auto;
            box-shadow: none !important;
            border-radius: 24px;
            page-break-after: avoid;
            background: #ffffff;
          }
        }

        #safety-digital-id-card.pdf-export {
          box-shadow: none !important;
          border-radius: 24px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
        }
      `}</style>

      <div className="max-w-5xl mx-auto rounded-3xl border border-slate-200/70 bg-slate-50/90 text-slate-900 backdrop-blur-2xl shadow-[0_40px_120px_rgba(15,23,42,0.35)] p-6 sm:p-10">
        {viewMode === 'form' && (
          <>
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {t('safety.digitalId.title')}
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  {t('safety.digitalId.subtitle')}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Identity & Home base */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
                <h2 className="text-sm font-semibold tracking-wide text-slate-900 flex items-center justify-between">
                  <span>{t('safety.digitalId.identity')}</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)] gap-6 items-start">
                  {/* Photo upload */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative h-32 w-32 rounded-3xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center shadow-inner">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[11px] text-slate-500 text-center px-2">
                          Upload photo
                        </span>
                      )}
                    </div>
                    <label className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-300 bg-slate-50 text-[11px] font-medium text-slate-900 cursor-pointer hover:border-sky-500/80 hover:text-sky-700 transition-colors">
                      <span>Choose photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="text-[10px] text-slate-500 text-center">
                      JPEG/PNG, clear face, max ~2MB.
                    </p>
                  </div>

                  {/* Identity + home address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="fullName"
                      >
                        Full name
                        <span className="text-orange-400"> *</span>
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="dateOfBirth"
                      >
                        Date of birth
                        <span className="text-orange-400"> *</span>
                      </label>
                      <div className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 focus-within:ring-2 focus-within:ring-sky-500/80">
                        <DatePicker
                          id="dateOfBirth"
                          selected={
                            formData.dateOfBirth
                              ? new Date(formData.dateOfBirth)
                              : null
                          }
                          onChange={(date: Date | null) =>
                            setFormData(prev => ({
                              ...prev,
                              dateOfBirth:
                                date instanceof Date
                                  ? date.toISOString().slice(0, 10)
                                  : '',
                            }))
                          }
                          dateFormat="dd/MM/yyyy"
                          placeholderText="DD/MM/YYYY"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          className="w-full bg-transparent outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="gender"
                      >
                        Gender
                        <span className="text-orange-400"> *</span>
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="nationality"
                      >
                        Nationality
                        <span className="text-orange-400"> *</span>
                      </label>
                      <input
                        id="nationality"
                        name="nationality"
                        type="text"
                        value={formData.nationality}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                      />
                    </div>

                    {/* Government ID details (optional) */}
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="idType"
                      >
                        Government ID type
                        <span className="text-orange-400"> *</span>
                      </label>
                      <select
                        id="idType"
                        name="idType"
                        value={formData.idType}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                      >
                        <option value="passport">Passport</option>
                        <option value="national-id">National ID</option>
                        <option value="aadhaar">Aadhaar Card</option>
                        <option value="driver-license">Driver's licence</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="idNumber"
                      >
                        Government ID number
                        <span className="text-orange-400"> *</span>
                      </label>
                      <input
                        id="idNumber"
                        name="idNumber"
                        type="text"
                        value={formData.idNumber}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                      />
                    </div>
                    {formData.idType === 'other' && (
                      <div className="sm:col-span-2">
                        <label
                          className="block text-xs font-medium text-slate-800 mb-1"
                          htmlFor="idTypeOther"
                        >
                          Name of ID document
                          <span className="text-orange-400"> *</span>
                        </label>
                        <input
                          id="idTypeOther"
                          name="idTypeOther"
                          type="text"
                          value={formData.idTypeOther || ''}
                          onChange={handleChange}
                          required
                          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                        />
                      </div>
                    )}

                    <div className="sm:col-span-2 border-t border-slate-200 pt-3 mt-2 grid grid-cols-1 sm:grid-cols-[2fr_2fr_auto] gap-4 items-end">
                      <div className="sm:col-span-3">
                        <label
                          className="block text-xs font-medium text-slate-800 mb-1"
                          htmlFor="homeAddress"
                        >
                          Home address
                        </label>
                        <input
                          id="homeAddress"
                          name="homeAddress"
                          type="text"
                          value={formData.homeAddress}
                          onChange={handleChange}
                          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                        />
                      </div>
                      <div>
                        <label
                          className="block text-xs font-medium text-slate-800 mb-1"
                          htmlFor="homeCity"
                        >
                          Home city
                          <span className="text-orange-400"> *</span>
                        </label>
                        <input
                          id="homeCity"
                          name="homeCity"
                          type="text"
                          value={formData.homeCity}
                          onChange={handleChange}
                          required
                          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                        />
                      </div>
                      <div>
                        <label
                          className="block text-xs font-medium text-slate-800 mb-1"
                          htmlFor="homeState"
                        >
                          Home state
                          <span className="text-orange-400"> *</span>
                        </label>
                        <input
                          id="homeState"
                          name="homeState"
                          type="text"
                          value={formData.homeState}
                          onChange={handleChange}
                          required
                          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                        />
                      </div>
                      <div className="w-full sm:w-32">
                        <label
                          className="block text-xs font-medium text-slate-800 mb-1"
                          htmlFor="homePincode"
                        >
                          Pincode
                          <span className="text-orange-400"> *</span>
                        </label>
                        <input
                          id="homePincode"
                          name="homePincode"
                          type="text"
                          value={formData.homePincode}
                          onChange={handleChange}
                          required
                          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact details */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Contact details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="phone"
                      >
                        Phone number
                        <span className="text-orange-400"> *</span>
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="email"
                      >
                        Email address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency & Trip */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
                  <h2 className="text-sm font-semibold text-slate-900">
                    {t('safety.digitalId.emergencyTrip')}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="emergencyContactName"
                      >
                        Emergency contact name
                      </label>
                      <input
                        id="emergencyContactName"
                        name="emergencyContactName"
                        type="text"
                        value={formData.emergencyContactName}
                        onChange={handleChange}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="emergencyContactPhone"
                      >
                        Emergency contact phone
                        <span className="text-orange-400"> *</span>
                      </label>
                      <input
                        id="emergencyContactPhone"
                        name="emergencyContactPhone"
                        type="tel"
                        value={formData.emergencyContactPhone}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="emergencyContactRelation"
                      >
                        Emergency contact relation
                      </label>
                      <input
                        id="emergencyContactRelation"
                        name="emergencyContactRelation"
                        type="text"
                        value={formData.emergencyContactRelation || ''}
                        onChange={handleChange}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="tripStartDate"
                      >
                        Trip start date
                      </label>
                      <div className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 focus-within:ring-2 focus-within:ring-sky-500/80">
                        <DatePicker
                          id="tripStartDate"
                          selected={
                            formData.tripStartDate
                              ? new Date(formData.tripStartDate)
                              : null
                          }
                          onChange={(date: Date | null) =>
                            setFormData(prev => ({
                              ...prev,
                              tripStartDate:
                                date instanceof Date
                                  ? date.toISOString().slice(0, 10)
                                  : '',
                            }))
                          }
                          dateFormat="dd/MM/yyyy"
                          placeholderText="DD/MM/YYYY"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          className="w-full bg-transparent outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="tripEndDate"
                      >
                        Trip end date
                      </label>
                      <div className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 focus-within:ring-2 focus-within:ring-sky-500/80">
                        <DatePicker
                          id="tripEndDate"
                          selected={
                            formData.tripEndDate
                              ? new Date(formData.tripEndDate)
                              : null
                          }
                          onChange={(date: Date | null) =>
                            setFormData(prev => ({
                              ...prev,
                              tripEndDate:
                                date instanceof Date
                                  ? date.toISOString().slice(0, 10)
                                  : '',
                            }))
                          }
                          dateFormat="dd/MM/yyyy"
                          placeholderText="DD/MM/YYYY"
                          showMonthDropdown
                          showYearDropdown
                          dropdownMode="select"
                          className="w-full bg-transparent outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="plannedCities"
                      >
                        Planned cities (comma separated)
                      </label>
                      <textarea
                        id="plannedCities"
                        name="plannedCities"
                        value={formData.plannedCities}
                        onChange={handleChange}
                        rows={2}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="accommodationDetails"
                      >
                        Accommodation details
                      </label>
                      <textarea
                        id="accommodationDetails"
                        name="accommodationDetails"
                        value={formData.accommodationDetails}
                        onChange={handleChange}
                        rows={2}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                      />
                    </div>
                  </div>
                </div>

                {/* Health & medical details */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4">
                  <h2 className="text-sm font-semibold text-slate-900">
                    Health & medical details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="bloodGroup"
                      >
                        Blood group
                      </label>
                      <input
                        id="bloodGroup"
                        name="bloodGroup"
                        type="text"
                        value={formData.bloodGroup || ''}
                        onChange={handleChange}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="medicalConditions"
                      >
                        Medical conditions
                      </label>
                      <input
                        id="medicalConditions"
                        name="medicalConditions"
                        type="text"
                        value={formData.medicalConditions || ''}
                        onChange={handleChange}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="allergies"
                      >
                        Allergies
                      </label>
                      <input
                        id="allergies"
                        name="allergies"
                        type="text"
                        value={formData.allergies || ''}
                        onChange={handleChange}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="medications"
                      >
                        Medications
                      </label>
                      <input
                        id="medications"
                        name="medications"
                        type="text"
                        value={formData.medications || ''}
                        onChange={handleChange}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="insuranceProvider"
                      >
                        Insurance provider
                      </label>
                      <input
                        id="insuranceProvider"
                        name="insuranceProvider"
                        type="text"
                        value={formData.insuranceProvider || ''}
                        onChange={handleChange}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="insurancePolicyNumber"
                      >
                        Insurance policy number
                      </label>
                      <input
                        id="insurancePolicyNumber"
                        name="insurancePolicyNumber"
                        type="text"
                        value={formData.insurancePolicyNumber || ''}
                        onChange={handleChange}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                      />
                    </div>
                    <div>
                      <label
                        className="block text-xs font-medium text-slate-800 mb-1"
                        htmlFor="languages"
                      >
                        Languages
                      </label>
                      <input
                        id="languages"
                        name="languages"
                        type="text"
                        value={formData.languages || ''}
                        onChange={handleChange}
                        className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/80"
                      />
                    </div>
                  </div>
                </div>

                {/* Consent + Save */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-[11px] text-slate-600 max-w-md">
                    <label className="inline-flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-0.5 h-3 w-3 rounded border-slate-400 bg-white text-sky-600 focus:ring-sky-500"
                        checked={hasConsented}
                        onChange={e => setHasConsented(e.target.checked)}
                      />
                      <span>{t('safety.digitalId.consent')}</span>
                    </label>
                    {consentError && (
                      <p className="mt-1 text-[11px] text-red-500">
                        {consentError}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_35px_rgba(56,189,248,0.45)] hover:bg-sky-500 disabled:opacity-60"
                    >
                      {loading
                        ? t('safety.digitalId.saving')
                        : t('safety.digitalId.save')}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </>
        )}

        {viewMode === 'card' && cardData && touristIdCode && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMode('form')}
                className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 bg-white text-xs mr-1">
                  ←
                </span>
                Back to form
              </button>
            </div>

            <div className="mt-1 grid gap-8 lg:grid-cols-[minmax(0,2.3fr)_minmax(0,1.2fr)] items-stretch">
              <div
                ref={cardRef}
                id="safety-digital-id-card"
                className="rounded-[32px] border border-slate-200 bg-white px-6 py-6 sm:px-8 sm:py-7 shadow-[0_24px_70px_rgba(15,23,42,0.28)] flex flex-col md:flex-row gap-6 sm:gap-8 max-w-3xl mx-auto"
              >
                {/* Left: photo + QR + brand */}
                <div className="flex flex-col justify-between items-center gap-4 md:w-40">
                  <div className="h-32 w-32 rounded-3xl border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
                    {cardData.photo ? (
                      <img
                        src={cardData.photo}
                        alt="ID Photo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[11px] text-slate-400 text-center px-2">
                        No photo
                      </span>
                    )}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-900 p-1.5">
                    <QRCodeSVG
                      value={JSON.stringify({
                        safety_id: touristIdCode,
                        full_name: cardData.form.fullName,
                        gender: cardData.form.gender,
                        date_of_birth: cardData.form.dateOfBirth,
                        nationality: cardData.form.nationality,
                        id_type: cardData.form.idType,
                        id_number: cardData.form.idNumber,
                        id_type_other: cardData.form.idTypeOther,
                        phone: cardData.form.phone,
                        email: cardData.form.email,
                        home_address: cardData.form.homeAddress,
                        home_city: cardData.form.homeCity,
                        home_state: cardData.form.homeState,
                        home_pincode: cardData.form.homePincode,
                        emergency_contact_name: cardData.form.emergencyContactName,
                        emergency_contact_phone: cardData.form.emergencyContactPhone,
                        emergency_contact_relation: cardData.form.emergencyContactRelation,
                        trip_start_date: cardData.form.tripStartDate,
                        trip_end_date: cardData.form.tripEndDate,
                        planned_cities: cardData.form.plannedCities,
                        accommodation_details: cardData.form.accommodationDetails,
                        blood_group: cardData.form.bloodGroup,
                        medical_conditions: cardData.form.medicalConditions,
                        allergies: cardData.form.allergies,
                        medications: cardData.form.medications,
                        insurance_provider: cardData.form.insuranceProvider,
                        insurance_policy_number: cardData.form.insurancePolicyNumber,
                        languages: cardData.form.languages,
                      })}
                      size={72}
                      bgColor="transparent"
                      fgColor="#e5e7eb"
                      level="M"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 text-center">
                    Scan to view Digital ID details.
                  </p>
                  <div className="mt-auto pt-2 w-full flex justify-start self-start">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-1.5 shadow-sm border border-slate-200">
                      <div className="h-6 w-6 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                        <img
                          src="/images/logo.png"
                          alt="India Tour logo"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="text-[11px] leading-tight text-slate-700 font-medium">
                        <div>India Tour</div>
                        <div className="text-[10px] text-slate-400">
                          Smart Tourist Safety System
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: details */}
                <div className="flex-1 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        India Tour Safety ID
                      </p>
                      <p className="text-lg font-semibold text-slate-900 mt-0.5 break-words">
                        {cardData.form.fullName}
                      </p>
                    </div>
                    <div className="text-right text-[11px] text-slate-500 font-mono">
                      <p>Safety ID</p>
                      <p className="text-orange-500 font-semibold">
                        {touristIdCode}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] text-slate-500">Date of birth</p>
                      <p className="text-slate-900 text-sm">
                        {cardData.form.dateOfBirth || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Nationality</p>
                      <p className="text-slate-900 text-sm">
                        {cardData.form.nationality || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Gender</p>
                      <p className="text-slate-900 text-sm capitalize">
                        {cardData.form.gender || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Blood group</p>
                      <p className="text-slate-900 text-sm">
                        {cardData.form.bloodGroup || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Languages</p>
                      <p className="text-slate-900 text-sm break-words">
                        {cardData.form.languages || '—'}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-[11px] text-slate-500">Home base</p>
                      <p className="text-slate-900 text-sm break-words">
                        {[
                          cardData.form.homeAddress,
                          cardData.form.homeCity,
                          cardData.form.homeState,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                        {cardData.form.homePincode &&
                          ` - ${cardData.form.homePincode}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Phone</p>
                      <p className="text-slate-900 text-sm break-words">
                        {cardData.form.phone || '—'}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-[11px] text-slate-500">Email</p>
                      <p className="text-slate-900 text-sm break-words">
                        {cardData.form.email || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                    <span className="break-words">
                      Emergency:{' '}
                      {cardData.form.emergencyContactName || ''}{' '}
                      {cardData.form.emergencyContactRelation &&
                        `(${cardData.form.emergencyContactRelation})`}
                      {cardData.form.emergencyContactPhone &&
                        ` – ${cardData.form.emergencyContactPhone}`}
                    </span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-end gap-3 text-sm">
                <button
                  type="button"
                  onClick={handlePrintCard}
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-800 hover:bg-slate-100"
                >
                  Print card
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_10px_30px_rgba(56,189,248,0.45)] hover:bg-sky-500"
                >
                  Download as PDF
                </button>
                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_12px_35px_rgba(16,185,129,0.6)] hover:bg-emerald-400"
                >
                  Download JSON copy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SafetyDigitalIDForm;
