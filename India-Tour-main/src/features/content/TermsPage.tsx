import React from 'react';
import { Helmet } from 'react-helmet-async';

const TermsPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | India Tour</title>
        <meta
          name="description"
          content="Terms of service for using India Tour and associated safety features."
        />
      </Helmet>
      <div className="min-h-[60vh] bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-sm text-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Terms of Service</h1>
          <p>
            This page is a lightweight placeholder outlining that this project is a prototype and not a
            production travel service.
          </p>
        </div>
      </div>
    </>
  );
};

export default TermsPage;
