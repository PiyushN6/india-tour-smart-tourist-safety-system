import React, { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import jsQR from 'jsqr';

interface ScannedData {
  [key: string]: any;
}

const SafetyDigitalIDScanner: React.FC = () => {
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  const handleDecodedText = (text: string) => {
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== 'object' || !parsed.safety_id) {
        setError('This QR code does not contain a valid Safety Digital ID payload.');
        return;
      }
      setScannedData(parsed);
      setError(null);
      setIsScanning(false);
    } catch (e) {
      console.error('Failed to parse QR JSON', e);
      setError('Could not read Safety ID data from this QR code.');
    }
  };

  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Unable to process image.');
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);
      if (code?.data) {
        handleDecodedText(code.data);
      } else {
        setError('No QR code could be detected in this image.');
      }
    };
    img.onerror = () => {
      setError('Failed to load the selected image.');
    };

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const resetScan = () => {
    setScannedData(null);
    setError(null);
    setIsScanning(true);
  };

  const renderValue = (value: any) => {
    if (value === undefined || value === null || value === '') return '—';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Scan Safety Digital ID</h1>
          <p className="text-sm text-slate-600 mt-1">
            Use your camera or upload a QR image to view a tourist's Safety Digital ID details.
          </p>
        </div>
        <button
          type="button"
          onClick={resetScan}
          className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
        >
          Reset / Scan another
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)] items-start">
        <div className="space-y-4">
          {isScanning && (
            <div className="rounded-2xl border border-slate-200 bg-slate-900/95 text-slate-50 p-4 sm:p-5 shadow-[0_20px_60px_rgba(15,23,42,0.65)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-2">
                Live scanner
              </p>
              <div className="rounded-xl overflow-hidden bg-black/80 aspect-[4/3] flex items-center justify-center">
                <Scanner
                  onScan={(results) => {
                    const text = Array.isArray(results)
                      ? results[0]?.rawValue
                      : (results as any)?.[0]?.rawValue || (results as any)?.rawValue;
                    if (text) {
                      handleDecodedText(text);
                    }
                  }}
                  constraints={{
                    facingMode: 'environment',
                  }}
                  styles={{
                    container: { width: '100%', height: '100%' },
                    video: { width: '100%', height: '100%', objectFit: 'cover' },
                  }}
                />
              </div>
              <p className="mt-3 text-[11px] text-slate-300">
                Point the camera at the Safety ID QR code. The details will appear automatically once detected.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3">
            <p className="text-xs font-semibold text-slate-900">
              Or scan from gallery
            </p>
            <label className="inline-flex items-center px-3 py-1.5 rounded-full border border-slate-300 bg-slate-50 text-[11px] font-medium text-slate-900 cursor-pointer hover:border-sky-500/80 hover:text-sky-700 transition-colors">
              <span>Select QR image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadImage}
                className="sr-only"
              />
            </label>
            <p className="text-[11px] text-slate-500">
              Choose a photo that clearly contains the Safety Digital ID QR code.
            </p>
            {error && (
              <p className="text-[11px] text-red-500 mt-1">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-[0_18px_50px_rgba(15,23,42,0.25)] min-h-[260px]">
          {!scannedData ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-sm">
              <p>No Safety ID scanned yet.</p>
              <p className="mt-1 text-xs max-w-xs">
                Once a valid QR is detected, the tourist's Safety Digital ID details will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                    India Tour Safety ID
                  </p>
                  <p className="text-lg font-semibold text-slate-900 mt-0.5 break-words">
                    {renderValue(scannedData.full_name)}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  <p>Safety ID</p>
                  <p className="text-orange-500 font-semibold">
                    {renderValue(scannedData.safety_id)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-[11px] text-slate-500">Date of birth</p>
                  <p className="text-slate-900 text-sm">{renderValue(scannedData.date_of_birth)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Nationality</p>
                  <p className="text-slate-900 text-sm">{renderValue(scannedData.nationality)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Gender</p>
                  <p className="text-slate-900 text-sm capitalize">{renderValue(scannedData.gender)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Blood group</p>
                  <p className="text-slate-900 text-sm">{renderValue(scannedData.blood_group)}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[11px] text-slate-500">Home base</p>
                  <p className="text-slate-900 text-sm break-words">
                    {[scannedData.home_address, scannedData.home_city, scannedData.home_state]
                      .filter((v) => v && String(v).trim() !== '')
                      .join(', ')}
                    {scannedData.home_pincode && ` - ${scannedData.home_pincode}`}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Phone</p>
                  <p className="text-slate-900 text-sm break-words">{renderValue(scannedData.phone)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-500">Email</p>
                  <p className="text-slate-900 text-sm break-words">{renderValue(scannedData.email)}</p>
                </div>
                <div className="sm:col-span-2 mt-1 pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-500">
                  <div>
                    <p className="font-semibold text-slate-700 mb-0.5">Govt. ID type</p>
                    <p className="text-slate-900 text-xs">
                      {renderValue(scannedData.id_type_other || scannedData.id_type)}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 mb-0.5">Govt. ID number</p>
                    <p className="text-slate-900 text-xs break-words">
                      {renderValue(scannedData.id_number)}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 mb-0.5">Name of ID document</p>
                    <p className="text-slate-900 text-xs break-words">
                      {renderValue(scannedData.id_type_other)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="break-words">
                  Emergency: {renderValue(scannedData.emergency_contact_name)}{' '}
                  {scannedData.emergency_contact_relation && `(${renderValue(scannedData.emergency_contact_relation)})`}
                  {scannedData.emergency_contact_phone && ` - ${renderValue(scannedData.emergency_contact_phone)}`}
                </span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-500">
                <div>
                  <p className="font-semibold text-slate-700 mb-1">Trip details</p>
                  <p>Trip: {renderValue(scannedData.trip_start_date)} - {renderValue(scannedData.trip_end_date)}</p>
                  <p className="mt-0.5">Planned cities: {renderValue(scannedData.planned_cities)}</p>
                  <p className="mt-0.5">Stay: {renderValue(scannedData.accommodation_details)}</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-700 mb-1">Health & insurance</p>
                  <p>Conditions: {renderValue(scannedData.medical_conditions)}</p>
                  <p>Allergies: {renderValue(scannedData.allergies)}</p>
                  <p>Medications: {renderValue(scannedData.medications)}</p>
                  <p className="mt-0.5">
                    Insurance: {renderValue(scannedData.insurance_provider)}{' '}
                    {scannedData.insurance_policy_number && `(${renderValue(scannedData.insurance_policy_number)})`}
                  </p>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
                <span>Languages: {renderValue(scannedData.languages)}</span>
                <span className="text-slate-400">Verified via Safety Digital ID QR</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafetyDigitalIDScanner;
