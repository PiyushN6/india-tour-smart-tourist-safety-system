import React from 'react';
import { Helmet } from 'react-helmet-async';
import SafetyDigitalIDScanner from '../../components/Safety/SafetyDigitalIDScanner';

const SafetyDigitalIdScanPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Scan Safety Digital ID | India Tour</title>
        <meta
          name="description"
          content="Scan a Safety Digital ID QR code using your camera or gallery image to view a tourist's full safety profile."
        />
      </Helmet>
      <SafetyDigitalIDScanner />
    </>
  );
};

export default SafetyDigitalIdScanPage;
