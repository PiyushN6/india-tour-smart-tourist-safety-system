import { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import StateDetailPage from './features/destinations/StateDetailPage';
import CityDetailPage from './features/destinations/CityDetailPage';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CityOverviewPage from './pages/CityOverviewPage';
import UserProfile from './features/profile/UserProfile';
import AdminPage from './pages/AdminPage';
import DestinationsPage from './features/destinations/DestinationsPage';
import DigitalIDPage from './pages/DigitalIDPage';
import SafetyHomePage from './features/safety/SafetyHomePage';
import SafetyTouristDashboardPage from './features/safety/SafetyTouristDashboardPage';
import SafetyDigitalIDPage from './features/safety/SafetyDigitalIDPage';
import SafetyAdminPage from './features/safety/SafetyAdminPage';
import SafetyMapPage from './features/safety/SafetyMapPage';
import ToursPage from './features/marketing/ToursPage';
import ExperiencesPage from './features/marketing/ExperiencesPage';
import BlogPage from './features/marketing/BlogPage';
import FAQPage from './features/content/FAQPage';
import PrivacyPolicyPage from './features/content/PrivacyPolicyPage';
import TermsPage from './features/content/TermsPage';
import SitemapPage from './features/content/SitemapPage';
import ItineraryPage from './features/itinerary/ItineraryPage';
import { ItineraryProvider } from './context/ItineraryContext';

import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';
import { DigitalIDProvider } from './context/DigitalIDContext';
import './App.css';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading || authLoading) {
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
          <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/destinations" element={<DestinationsPage />} />
                <Route path="/destinations/:stateName" element={<StateDetailPage />} />
                <Route path="/destinations/:stateName/:cityName" element={<CityDetailPage />} />
                <Route path="/city/:cityId" element={<CityOverviewPage />} />
                <Route path="/tours" element={<ToursPage />} />
                <Route path="/experiences" element={<ExperiencesPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/digital-id" element={<DigitalIDPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/safety" element={<SafetyHomePage />} />
                <Route path="/safety/dashboard" element={<SafetyTouristDashboardPage />} />
                <Route path="/safety/digital-id" element={<SafetyDigitalIDPage />} />
                <Route path="/safety/map" element={<SafetyMapPage />} />
                <Route path="/safety/admin" element={<SafetyAdminPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/sitemap" element={<SitemapPage />} />
                <Route path="/itinerary" element={<ItineraryPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
            </Router>
            <Analytics />
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