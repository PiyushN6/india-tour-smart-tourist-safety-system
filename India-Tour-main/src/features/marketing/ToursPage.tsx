import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const ToursPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Tours & Packages | India Tour</title>
        <meta
          name="description"
          content="Browse curated tour packages and experiences across India with India Tour."
        />
      </Helmet>
      <div className="min-h-[60vh] bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Tours & Packages</h1>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            This is a lightweight placeholder page so that navigation is complete. In a full product, this
            section would list curated tour packages and booking options.
          </p>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-700">
            <p className="mb-2 font-semibold">Safety note</p>
            <p className="mb-4">
              When planning tours, we recommend each traveller creates a Safety Digital ID so that emergency
              contacts and trip information are accessible to responders.
            </p>
            <Link
              to="/safety/digital-id"
              className="inline-flex items-center rounded-full bg-orange-600 px-4 py-2 text-xs font-semibold text-white hover:bg-orange-700"
            >
              Get Safety Digital ID
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ToursPage;
