import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const SafetyHomePage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Tourist Safety | India Tour</title>
        <meta
          name="description"
          content="Smart tourist safety, digital IDs, real-time alerts, and safe travel experiences across India."
        />
      </Helmet>
      <div className="min-h-[70vh] bg-gradient-to-br from-orange-50 via-white to-blue-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 items-center mb-12">
            <div>
              <p className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 mb-3">
                New • Smart Safety Module
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
                Travel with confidence using the
                <span className="text-orange-600"> India Tour Safety</span> system
              </h1>
              <p className="text-base sm:text-lg text-gray-600 mb-6">
                Create a secure digital tourist ID, view risk-aware maps, and access emergency support
                designed for safe and seamless journeys across India.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/safety/digital-id"
                  className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                >
                  Get Your Digital Safety ID
                </Link>
                <Link
                  to="/safety/dashboard"
                  className="inline-flex items-center justify-center rounded-lg border border-orange-200 bg-white px-5 py-2.5 text-sm font-medium text-orange-700 shadow-sm hover:bg-orange-50"
                >
                  Open Tourist Safety Dashboard
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-orange-200 via-transparent to-blue-200 opacity-60 blur-2xl" />
              <div className="relative rounded-3xl bg-white shadow-xl border border-orange-100 p-6 sm:p-8 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-900">Safety at a glance</h2>
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    Live
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-500">Digital IDs</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">Ready</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Panic Support</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">Enabled</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Risk Zones</p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">Coming</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 text-xs sm:text-sm text-white flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Emergency tip</p>
                    <p className="opacity-90">Use the panic button from your dashboard to instantly alert local responders.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Digital Tourist ID</h3>
              <p className="text-sm text-gray-600 mb-3">
                Register once and carry a secure digital profile with key contact and trip details.
              </p>
              <Link to="/safety/digital-id" className="text-xs font-medium text-orange-600 hover:text-orange-700">
                Start registration →
              </Link>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Live Safety Dashboard</h3>
              <p className="text-sm text-gray-600 mb-3">
                View safety status, alerts, and location-based risk hints in one place.
              </p>
              <Link to="/safety/dashboard" className="text-xs font-medium text-orange-600 hover:text-orange-700">
                Open dashboard →
              </Link>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Admin & Police View</h3>
              <p className="text-sm text-gray-600 mb-3">
                Monitor incidents, manage tourists, and plan safer routes for visitors.
              </p>
              <Link to="/safety/admin" className="text-xs font-medium text-orange-600 hover:text-orange-700">
                Go to admin panel →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SafetyHomePage;
