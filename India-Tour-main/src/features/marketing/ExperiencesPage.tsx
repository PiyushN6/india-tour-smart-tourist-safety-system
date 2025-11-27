import React from 'react';
import { Helmet } from 'react-helmet-async';

const ExperiencesPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Experiences | India Tour</title>
        <meta
          name="description"
          content="Discover themed travel experiences across India with India Tour."
        />
      </Helmet>
      <div className="min-h-[60vh] bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Experiences</h1>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            This placeholder page keeps navigation complete while you focus on the safety module. Later you can
            replace this with curated themes like heritage, food trails, and adventure.
          </p>
        </div>
      </div>
    </>
  );
};

export default ExperiencesPage;
