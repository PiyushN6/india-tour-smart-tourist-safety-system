import React, { createContext, useContext, useEffect, useState } from 'react';

type Lang = 'en' | 'hi';

type Messages = Record<string, string>;

const en: Messages = {
  'safety.digitalId.title': 'Safety Digital ID',
  'safety.digitalId.subtitle':
    'Provide key details required for safety monitoring, emergency contact, and trip support.',
  'safety.digitalId.identity': 'Identity',
  'safety.digitalId.identityDocs': 'Identity documents & contacts',
  'safety.digitalId.emergencyTrip': 'Emergency contact & trip',
  'safety.digitalId.save': 'Save Safety Digital ID',
  'safety.digitalId.saving': 'Saving...',
  'safety.digitalId.consent':
    'I understand that my Safety Digital ID details will be used only for tourist safety monitoring and emergency support, and may be shared with authorised agencies during an incident.',

  'safety.digitalId.loadingProfile': 'Loading safety profile...',
  'safety.digitalId.saveSuccess': 'Safety Digital ID saved successfully.',
  'safety.digitalId.saveError': 'Failed to save Safety Digital ID. The safety service may be offline right now.',
  'safety.digitalId.consentError': 'Please confirm that you understand and consent to how your data will be used.',
  'safety.digitalId.requireLogin': 'You need to be logged in to create a Safety Digital ID.',

  'safety.dashboard.title': 'Tourist Safety Dashboard',
  'safety.dashboard.recentAlerts': 'Recent alerts',
  'safety.dashboard.recentAlertsHelp':
    'When the safety service is online, you will see your latest panic and anomaly alerts here.',
  'safety.dashboard.panicTitle': 'Panic Button',
  'safety.dashboard.panicHelp':
    'Press this button if you feel unsafe. We will send an alert using your safety profile and, when possible, your current location.',
  'safety.dashboard.panicButton': 'Send Panic Alert',
  'safety.dashboard.trackingLabel': 'Share my live location for safety monitoring',
  'safety.dashboard.safetyStatus': 'Safety Status',
  'safety.dashboard.requireLogin': 'Please sign in to use the panic button and see your personal safety alerts.',
  'safety.dashboard.loadAlertsError': 'Could not load alerts right now. The safety service may be offline.',
  'safety.dashboard.noAlerts': 'No alerts yet.',
  'safety.dashboard.trackingNotAvailable': 'Location services are not available in this browser.',
  'safety.dashboard.trackingSendError': 'Failed to send location update.',
  'safety.dashboard.trackingReadError': 'Unable to read your location for tracking.',
  'safety.dashboard.safetyStatusHelp':
    'Your safety score reflects recent panic alerts and incidents over the last few days.',
  'safety.dashboard.scoreLoading': 'Calculating your safety score...',
  'safety.dashboard.scoreError': 'Could not load your safety score.',
  'safety.dashboard.scoreEmpty': 'No safety data yet. Create a Safety Digital ID to begin.',

  'safety.admin.title': 'Safety Admin Dashboard',
  'safety.admin.subtitle':
    'Monitor panic alerts, geofence breaches, and anomaly events across tourists. Use this view for command-center style incident response.',
  'safety.admin.liveAlerts': 'Live Alerts',
  'safety.admin.selectedDetail': 'Selected Alert Detail',
  'safety.admin.efir': 'E-FIR style summary',
  'safety.admin.loadError': 'Failed to load alerts. Please try again in a moment.',
  'safety.admin.noAlerts': 'No alerts match the current filters.',
  'safety.admin.ackError': 'Failed to acknowledge alert.',
  'safety.admin.resolveError': 'Failed to resolve alert.',
  'safety.admin.selectedDetailEmpty': 'Click an alert on the left to see full details here.',
  'safety.admin.noProfile': 'No linked safety profile was found for this tourist ID.',
  'safety.admin.loadingProfile': 'Loading profile…',
  'safety.admin.noPanicNote': 'No panic note was provided.',
  'safety.admin.efirEmpty':
    'Click "Generate" to create a structured text summary with key details for FIR / report drafting.',
};

const hi: Messages = {
  'safety.digitalId.title': 'सेफ़्टी डिजिटल आईडी',
  'safety.digitalId.subtitle':
    'सुरक्षा निगरानी, आपातकालीन संपर्क और यात्रा सहायता के लिए आवश्यक विवरण यहाँ दर्ज करें।',
  'safety.digitalId.identity': 'पहचान विवरण',
  'safety.digitalId.identityDocs': 'पहचान दस्तावेज़ और संपर्क',
  'safety.digitalId.emergencyTrip': 'आपातकालीन संपर्क और यात्रा विवरण',
  'safety.digitalId.save': 'सेफ़्टी डिजिटल आईडी सहेजें',
  'safety.digitalId.saving': 'सहेजा जा रहा है...',
  'safety.digitalId.consent':
    'मैं समझता/समझती हूँ कि मेरी सेफ़्टी डिजिटल आईडी की जानकारी केवल पर्यटक सुरक्षा निगरानी और आपातकालीन सहायता के लिए उपयोग की जाएगी और आवश्यकता पड़ने पर अधिकृत एजेंसियों के साथ साझा की जा सकती है।',

  'safety.digitalId.loadingProfile': 'सुरक्षा प्रोफ़ाइल लोड हो रही है...',
  'safety.digitalId.saveSuccess': 'सेफ़्टी डिजिटल आईडी सफलतापूर्वक सहेजी गई।',
  'safety.digitalId.saveError': 'सेफ़्टी डिजिटल आईडी सहेजने में समस्या आई। सुरक्षा सेवा अस्थायी रूप से ऑफ़लाइन हो सकती है।',
  'safety.digitalId.consentError': 'कृपया पुष्टि करें कि आप समझते हैं और सहमति देते हैं कि आपका डाटा कैसे उपयोग होगा।',
  'safety.digitalId.requireLogin': 'सेफ़्टी डिजिटल आईडी बनाने के लिए आपको लॉगिन करना होगा।',

  'safety.dashboard.title': 'पर्यटक सुरक्षा डैशबोर्ड',
  'safety.dashboard.recentAlerts': 'हाल की सूचनाएँ',
  'safety.dashboard.recentAlertsHelp':
    'जब सुरक्षा सेवा ऑनलाइन होगी तो यहाँ आपके नवीनतम पैनिक और एनोमली अलर्ट दिखाई देंगे।',
  'safety.dashboard.panicTitle': 'पैनिक बटन',
  'safety.dashboard.panicHelp':
    'जब भी आप असुरक्षित महसूस करें तो यह बटन दबाएँ। सिस्टम आपकी सेफ़्टी प्रोफाइल और उपलब्ध होने पर वर्तमान लोकेशन के साथ अलर्ट भेजेगा।',
  'safety.dashboard.panicButton': 'पैनिक अलर्ट भेजें',
  'safety.dashboard.trackingLabel': 'सुरक्षा निगरानी के लिए मेरी लाइव लोकेशन साझा करें',
  'safety.dashboard.safetyStatus': 'सुरक्षा स्थिति',
  'safety.dashboard.requireLogin': 'पैनिक बटन उपयोग करने और व्यक्तिगत सुरक्षा अलर्ट देखने के लिए कृपया साइन इन करें।',
  'safety.dashboard.loadAlertsError': 'अभी अलर्ट लोड नहीं हो पाए। सुरक्षा सेवा अस्थायी रूप से ऑफ़लाइन हो सकती है।',
  'safety.dashboard.noAlerts': 'कोई अलर्ट नहीं मिला।',
  'safety.dashboard.trackingNotAvailable': 'इस ब्राउज़र में लोकेशन सर्विस उपलब्ध नहीं है।',
  'safety.dashboard.trackingSendError': 'लोकेशन अपडेट भेजने में समस्या आई।',
  'safety.dashboard.trackingReadError': 'ट्रैकिंग के लिए आपकी लोकेशन पढ़ने में समस्या आई।',
  'safety.dashboard.safetyStatusHelp':
    'आपका सुरक्षा स्कोर पिछले कुछ दिनों में आए पैनिक अलर्ट और घटनाओं पर आधारित है।',
  'safety.dashboard.scoreLoading': 'आपका सुरक्षा स्कोर निकाला जा रहा है...',
  'safety.dashboard.scoreError': 'आपका सुरक्षा स्कोर लोड नहीं हो पाया।',
  'safety.dashboard.scoreEmpty': 'अभी कोई सुरक्षा डाटा नहीं है। शुरू करने के लिए सेफ़्टी डिजिटल आईडी बनाएँ।',

  'safety.admin.title': 'सुरक्षा एडमिन डैशबोर्ड',
  'safety.admin.subtitle':
    'पर्यटकों के पैनिक अलर्ट, जियो-फेंस उल्लंघन और एनॉमली घटनाओं की निगरानी करें।',
  'safety.admin.liveAlerts': 'लाइव अलर्ट',
  'safety.admin.selectedDetail': 'चयनित अलर्ट का विवरण',
  'safety.admin.efir': 'ई-एफआईआर शैली सारांश',
  'safety.admin.loadError': 'अलर्ट लोड नहीं हो पाए। कृपया कुछ देर बाद पुनः प्रयास करें।',
  'safety.admin.noAlerts': 'वर्तमान फ़िल्टर के अनुसार कोई अलर्ट नहीं मिला।',
  'safety.admin.ackError': 'अलर्ट को "Acknowledge" करने में समस्या आई।',
  'safety.admin.resolveError': 'अलर्ट "Resolve" करने में समस्या आई।',
  'safety.admin.selectedDetailEmpty': 'विस्तृत जानकारी देखने के लिए बाएँ से किसी अलर्ट पर क्लिक करें।',
  'safety.admin.noProfile': 'इस टूरिस्ट आईडी के लिए कोई सेफ़्टी प्रोफ़ाइल नहीं मिली।',
  'safety.admin.loadingProfile': 'प्रोफ़ाइल लोड हो रही है…',
  'safety.admin.noPanicNote': 'कोई पैनिक नोट उपलब्ध नहीं है।',
  'safety.admin.efirEmpty':
    'एफआईआर / रिपोर्ट ड्राफ्टिंग के लिए मुख्य विवरण के साथ संरचित टेक्स्ट सारांश बनाने हेतु "Generate" दबाएँ।',
};

const bundles: Record<Lang, Messages> = { en, hi };

interface I18nContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('safety_lang');
      if (saved === 'hi' || saved === 'en') setLangState(saved);
    } catch {
      // ignore
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem('safety_lang', l);
    } catch {
      // ignore
    }
  };

  const t = (key: string) => bundles[lang][key] ?? bundles.en[key] ?? key;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
};
