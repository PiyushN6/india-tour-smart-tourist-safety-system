import React from 'react';
import { Helmet } from 'react-helmet-async';
import SafetyDigitalIDForm from '../../components/Safety/SafetyDigitalIDForm';
import { useI18n } from '../../i18n';

// Wrapper page so that we can later specialize the form for safety-specific fields
// while reusing the existing Digital ID experience.

const SafetyDigitalIDPage: React.FC = () => {
  const { t } = useI18n();
  return (
    <>
      <Helmet>
        <title>{t('safety.digitalId.title')} | India Tour</title>
        <meta
          name="description"
          content={t('safety.digitalId.subtitle')}
        />
      </Helmet>
      <SafetyDigitalIDForm />
    </>
  );
};

export default SafetyDigitalIDPage;
