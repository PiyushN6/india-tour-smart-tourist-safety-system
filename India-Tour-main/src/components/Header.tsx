import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  BellIcon, 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  MapPinIcon,
  CameraIcon,
  InformationCircleIcon,
  PhoneIcon,
  ShieldCheckIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useData } from '../context/DataContext';
import { useI18n } from '../i18n';
import AuthModal from './AuthModal';
import NotificationPanel from './NotificationPanel';
import ProfileEditModal from './ProfileEditModal';

const Header: React.FC = () => {
  const { user, signOut, isAuthenticated, displayName } = useAuth();
  const { getUnreadCount } = useNotifications();
  const { searchCities } = useData();
  const { lang, setLang } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const unreadCount = getUnreadCount();

  // ChaiCode-inspired navigation items with icons
  const allNavigationItems = [
    { 
      name: 'Home', 
      href: '/', 
      current: location.pathname === '/',
      icon: HomeIcon
    },
    { 
      name: 'Itinerary', 
      href: '/itinerary', 
      current: location.pathname === '/itinerary',
      icon: CalendarIcon
    },
    { 
      name: 'Destinations', 
      href: '/destinations', 
      current: location.pathname === '/destinations',
      icon: MapPinIcon
    },
    { 
      name: 'Digital ID', 
      href: '/digital-id', 
      current: location.pathname === '/digital-id',
      icon: () => (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    { 
      name: 'Gallery', 
      href: '/gallery', 
      current: location.pathname === '/gallery',
      icon: CameraIcon
    },
    { 
      name: 'About', 
      href: '/about', 
      current: location.pathname === '/about',
      icon: InformationCircleIcon
    },
    { 
      name: 'Contact', 
      href: '/contact', 
      current: location.pathname === '/contact',
      icon: PhoneIcon
    },
    {
      name: 'Safety',
      href: '/safety',
      current: location.pathname.startsWith('/safety'),
      icon: () => (
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 3L5 5V11C5 15.52 8.06 19.74 12 21C15.94 19.74 19 15.52 19 11V5L12 3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M10 11.5L11.5 13L14 9.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    },
    {
      name: 'Safety Dashboard',
      href: '/safety/dashboard',
      current: location.pathname === '/safety/dashboard',
      icon: ShieldCheckIcon
    },
    {
      name: 'Safety Map',
      href: '/safety/map',
      current: location.pathname === '/safety/map',
      icon: MapPinIcon
    },
    {
      name: 'Safety ID',
      href: '/safety/digital-id',
      current: location.pathname === '/safety/digital-id',
      icon: () => (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 7a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H7a2 2 0 01-2-2V7z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h.01M9 14h6" />
        </svg>
      )
    }
  ];

  const navigationItems = allNavigationItems;
  const desktopNavigationItems = allNavigationItems.filter((item) => 
    item.name !== 'Safety Dashboard' &&
    item.name !== 'Safety ID'
  );

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      try {
        const results = await searchCities(query);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching cities:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleCitySelect = (cityId: string) => {
    navigate(`/city/${cityId}`);
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Add scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (headerRef.current && !headerRef.current.querySelector('.user-menu')?.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setShowUserDropdown(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      <header 
        ref={headerRef}
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg' 
            : 'bg-white shadow-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto pl-2 pr-4 sm:pl-3 sm:pr-6 lg:pl-4 lg:pr-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo and Brand - Maximum Left Aligned */}
            <div className="flex items-center mr-auto">
              <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity group">
                <div className="relative mr-1">
                  <img 
                    src="/images/logo.png" 
                    alt="India Tour Logo" 
                    className="h-14 w-14 group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg hidden items-center justify-center">
                    <span className="text-white font-bold text-lg">IT</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-2xl font-bold text-gray-900 tracking-tight">INDIA</span>
                  <span className="text-2xl font-bold text-orange-600 tracking-tight">TOUR</span>
                </div>
              </Link>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center justify-end space-x-2 md:space-x-3 lg:space-x-4">
              {/* Desktop Navigation - ChaiCode Style Pills */}
              <nav className="hidden md:flex items-center space-x-1 md:space-x-2">
                {desktopNavigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs md:text-sm font-medium transition-all duration-200 hover:bg-gray-50 ${
                        item.current 
                          ? 'text-orange-600 bg-orange-50' 
                          : 'text-gray-700 hover:text-orange-600'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Notifications */}
              <button
                onClick={() => setIsNotificationPanelOpen(true)}
                className="relative p-2 text-gray-600 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Language switcher */}
              <div className="hidden md:flex items-center bg-gray-50 rounded-xl px-1 py-0.5 text-[11px] font-medium text-gray-700 border border-gray-200">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2 py-0.5 rounded-lg transition-colors ${
                    lang === 'en' ? 'bg-white text-orange-600 shadow-sm' : 'hover:text-orange-600'
                  }`}
                >
                  EN
                </button>
                <span className="mx-1 h-4 w-px bg-gray-300" />
                <button
                  type="button"
                  onClick={() => setLang('hi')}
                  className={`px-2 py-0.5 rounded-lg transition-colors ${
                    lang === 'hi' ? 'bg-white text-orange-600 shadow-sm' : 'hover:text-orange-600'
                  }`}
                >
                  हिंदी
                </button>
              </div>

              {/* Auth / Profile - show auth button when logged out, profile dropdown when logged in */}
              {!isAuthenticated ? (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="hidden md:inline-flex items-center px-3 py-1.5 rounded-xl text-[11px] md:text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap"
                >
                  Sign In / Sign Up
                </button>
              ) : (
                <div className="relative hidden md:block user-menu">
                  <button
                    type="button"
                    onClick={() => setShowUserDropdown((prev) => !prev)}
                    className="inline-flex items-center px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:border-orange-300 hover:text-orange-700 transition-colors duration-200"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-[11px] font-semibold text-white mr-2">
                      {(user?.full_name || user?.email || displayName || '?')[0]?.toUpperCase?.() || '?'}
                    </span>
                    <span className="max-w-[120px] truncate mr-1">
                      {user?.full_name || user?.email?.split('@')[0] || displayName || 'My Account'}
                    </span>
                    <svg
                      className="h-3 w-3 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 8l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white shadow-lg ring-1 ring-black/5 py-1 text-xs text-gray-700 z-50">
                      <Link
                        to="/profile"
                        className="block px-3 py-2 hover:bg-gray-50"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        My Account
                      </Link>
                      <Link
                        to="/safety/dashboard"
                        className="block px-3 py-2 hover:bg-gray-50"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        Safety Dashboard
                      </Link>
                      <Link
                        to="/safety/digital-id"
                        className="block px-3 py-2 hover:bg-gray-50"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        Safety Digital ID
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="block w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 border-t border-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Admin Panel Link - Only show if user is admin */}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <span className="w-5 h-5 bg-purple-600 rounded text-white text-xs flex items-center justify-center">A</span>
                  <span>Admin</span>
                </Link>
              )}

              {/* Mobile/Tablet menu button - ChaiCode Style */}
              <button
                onClick={toggleMobileMenu}
                className="xl:hidden p-2 text-gray-600 hover:text-orange-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchFocused && (
          <div className="lg:hidden border-t border-gray-200 bg-white px-4 py-3">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-sm"
                autoFocus
              />
            </div>
            
            {/* Mobile Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {searchResults.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleCitySelect(city.id)}
                    className="w-full text-left px-3 py-3 hover:bg-gray-50 rounded-xl flex items-center space-x-3 transition-colors duration-150"
                  >
                    <img
                      src={city.featuredImage}
                      alt={city.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{city.name}</h4>
                      <p className="text-sm text-gray-600">{city.state}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* ChaiCode-Style Slide-out Navigation Menu */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 xl:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Slide-out Menu */}
          <div 
            ref={mobileMenuRef}
            className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out xl:hidden ${
              mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    src="/images/logo.png" 
                    alt="India Tour Logo" 
                    className="h-16 w-16"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg hidden items-center justify-center">
                    <span className="text-white font-bold">IT</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xl font-bold text-gray-900">INDIA</span>
                  <span className="text-xl font-bold text-orange-600">TOUR</span>
                </div>
              </div>
              {/* Mobile language switcher */}
              <div className="flex items-center bg-gray-50 rounded-xl px-1 py-0.5 text-[11px] font-medium text-gray-700 border border-gray-200 mr-3">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2 py-0.5 rounded-lg transition-colors ${
                    lang === 'en' ? 'bg-white text-orange-600 shadow-sm' : 'hover:text-orange-600'
                  }`}
                >
                  EN
                </button>
                <span className="mx-1 h-4 w-px bg-gray-300" />
                <button
                  type="button"
                  onClick={() => setLang('hi')}
                  className={`px-2 py-0.5 rounded-lg transition-colors ${
                    lang === 'hi' ? 'bg-white text-orange-600 shadow-sm' : 'hover:text-orange-600'
                  }`}
                >
                  हिंदी
                </button>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation Items */}
            <div className="px-6 py-4">
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                        item.current 
                          ? 'text-orange-600 bg-orange-50' 
                          : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
              {user && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3 px-4 py-3">
                    <img
                      src={user.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100'}
                      alt={user.full_name || 'User'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{user.full_name || 'User'}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-1">
                    <button
                      onClick={() => {
                        setIsProfileEditModalOpen(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Edit Profile
                    </button>
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      My Wishlist
                    </Link>
                    <Link
                      to="/digital-id"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      My Digital ID
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 mt-2"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
      />

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileEditModalOpen}
        onClose={() => setIsProfileEditModalOpen(false)}
      />

      {/* Overlay for dropdowns */}
      {showUserDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserDropdown(false)}
        />
      )}
    </>
  );
};

export default Header;