import React from 'react';
import { Helmet } from 'react-helmet-async';

const FAQPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>FAQs | India Tour</title>
        <meta
          name="description"
          content="Frequently asked questions about India Tour and the Smart Tourist Safety module."
        />
      </Helmet>
      <div className="min-h-[60vh] bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h1>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-700 space-y-4">
            <div>
              <p className="font-semibold mb-1">What is the India Tour Safety module?</p>
              <p>
                It is an experimental safety layer on top of India Tour, including Safety Digital ID, live alerts,
                and an admin view for responders.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Do I have to share my live location?</p>
              <p>
                No. Location sharing is optional and controlled via a toggle in the Tourist Safety Dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQPage;
