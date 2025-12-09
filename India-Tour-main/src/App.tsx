import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import StateDetailPage from './features/destinations/StateDetailPage';
import CityDetailPage from './features/destinations/CityDetailPage';
import Navbar from './new-ui/components/Navbar';
import Footer from './new-ui/Footer';
import HomePage from './new-ui/pages/HomePage';
import CityOverviewPage from './pages/CityOverviewPage';
import ToursPage from './features/marketing/ToursPage';
import ExperiencesPage from './features/marketing/ExperiencesPage';
import BlogPage from './features/marketing/BlogPage';
import FAQPage from './features/content/FAQPage';
import PrivacyPolicyPage from './features/content/PrivacyPolicyPage';
import TermsPage from './features/content/TermsPage';
import SitemapPage from './features/content/SitemapPage';
import ItineraryPage from './features/itinerary/ItineraryPage';
import { ItineraryProvider } from './context/ItineraryContext';

// New UI feature pages
import DestinationExplorer from '@/features/destinations/DestinationExplorer';
import SafetyDashboard from '@/features/safety/SafetyDashboard';
import SafetyMap from '@/features/safety/SafetyMap';
import SafetyInformationHub from '@/features/safety/SafetyInformationHub';
import SafetyDigitalIdPage from './new-ui/features/safety/SafetyDigitalIdPage';
import SafetyDigitalIdScanPage from './new-ui/features/safety/SafetyDigitalIdScanPage';
import SafetyAdminShell from '@/features/safety/SafetyAdminShell';
import NewUserProfile from '@/features/profile/UserProfile';
import GamificationSystem from '@/features/gamification/GamificationSystem';

import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import { DigitalIDProvider } from './context/DigitalIDContext';
import { ItineraryToastProvider } from './context/ItineraryToastContext';
import './App.css';

function AppContent() {
  const { loading: authLoading } = useAuth();
  // Boot splash state: true for the first short moment after a full page load
  // (new tab or browser refresh). This state is tied to the AppContent mount,
  // so it does NOT run on in-app route changes handled by React Router.
  const [bootSplash, setBootSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setBootSplash(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  // Show the India Tour loader whenever the app first mounts in this tab
  // (bootSplash) OR auth is still initializing. Because this component is not
  // remounted on client-side route changes, the splash only appears on
  // first load / hard refresh, not when clicking links like /destinations.
  if (bootSplash || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin animation-delay-150 mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-orange-600 mb-2">India Tour</h2>
          <p className="text-gray-600">Discovering Incredible India...</p>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <DataProvider>
        <ItineraryProvider>
          <NotificationProvider>
            <DigitalIDProvider>
              <ItineraryToastProvider>
          <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                {/* New UI destinations explorer replaces legacy destinations page */}
                <Route path="/destinations" element={<DestinationExplorer />} />
                <Route path="/destinations/:stateName" element={<StateDetailPage />} />
                <Route path="/destinations/:stateName/:cityName" element={<CityDetailPage />} />
                <Route path="/city/:cityId" element={<CityOverviewPage />} />

                <Route path="/tours" element={<ToursPage />} />
                <Route path="/experiences" element={<ExperiencesPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/faq" element={<FAQPage />} />

                {/* New UI profile page */}
                <Route path="/profile" element={<NewUserProfile />} />

                {/* Safety routes: use new UI shells for dashboards, digital ID, scanner, and admin */}
                <Route path="/safety/dashboard" element={<SafetyDashboard />} />
                <Route path="/safety/map" element={<SafetyMap />} />
                <Route path="/safety/information" element={<SafetyInformationHub />} />
                <Route path="/safety/digital-id" element={<SafetyDigitalIdPage />} />
                <Route path="/safety/digital-id/scan" element={<SafetyDigitalIdScanPage />} />
                <Route path="/safety/admin" element={<SafetyAdminShell />} />

                {/* Static content + itinerary remain unchanged */}
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/sitemap" element={<SitemapPage />} />
                <Route path="/itinerary" element={<ItineraryPage />} />

                {/* New gamification route from new UI */}
                <Route path="/gamification" element={<GamificationSystem />} />
              </Routes>
            </main>
            <Footer />
          </div>
            </Router>
            <Analytics />
              </ItineraryToastProvider>
          </DigitalIDProvider>
        </NotificationProvider>
        </ItineraryProvider>
      </DataProvider>
    </HelmetProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;