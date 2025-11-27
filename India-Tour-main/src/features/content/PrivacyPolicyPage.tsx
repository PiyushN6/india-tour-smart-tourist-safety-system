import React from 'react';
import { Helmet } from 'react-helmet-async';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | India Tour</title>
        <meta
          name="description"
          content="Privacy policy for India Tour and the Smart Tourist Safety module."
        />
      </Helmet>
      <div className="min-h-[60vh] bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-sm text-gray-700">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Privacy Policy</h1>
          <p>
            This is a simplified privacy page for demo and academic purposes. Personal data stored in the
            application is limited and primarily used to power travel features and the Safety Digital ID.
          </p>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicyPage;
