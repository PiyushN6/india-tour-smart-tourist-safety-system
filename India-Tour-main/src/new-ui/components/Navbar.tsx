import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  Search,
  Shield,
  Map,
  Info,
  User,
  Bell,
  Moon,
  Sun,
  Home,
  MapPin,
  Phone,
  Globe
} from 'lucide-react'
import { cn } from '@/utils/cn'
import Button from './Button'

interface NavItem {
  name: string
  path: string
  icon: React.ReactNode
  badge?: number
}

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const mainNavItems: NavItem[] = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Safety', path: '/safety/dashboard', icon: <Shield className="w-4 h-4" />, badge: 3 },
    { name: 'Map', path: '/safety/map', icon: <Map className="w-4 h-4" /> },
    {
      name: 'Destinations',
      path: '/destinations',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      name: 'Information',
      path: '/safety/information',
      icon: <Info className="w-4 h-4" />
    },
  ]

  const secondaryNavItems: NavItem[] = [
    { name: 'Profile', path: '/profile', icon: <User className="w-4 h-4" /> },
    { name: 'Gamification', path: '/gamification', icon: <Globe className="w-4 h-4" /> },
  ]

  const emergencyContacts = [
    { name: 'Emergency', number: '112', icon: <Phone className="w-4 h-4" />, color: 'text-red-600' },
    { name: 'Police', number: '100', icon: <Shield className="w-4 h-4" />, color: 'text-blue-600' },
    { name: 'Ambulance', number: '108', icon: <Phone className="w-4 h-4" />, color: 'text-green-600' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false)
  }, [location.pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/destinations?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsSearchFocused(false)
    }
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const renderNavItems = (items: NavItem[], mobile = false) => (
    <ul className={cn(
      mobile ? 'flex flex-col space-y-2' : 'flex items-center space-x-1'
    )}>
      {items.map((item) => (
        <li key={item.path}>
          <Link
            to={item.path}
            className={cn(
              'group relative flex items-center space-x-2 px-3 py-2 rounded-xl font-medium transition-all duration-200',
              'hover:bg-gray-100 hover:shadow-md',
              mobile ? 'w-full justify-start' : '',
              isActive(item.path)
                ? 'bg-primary-saffron text-white shadow-lg'
                : 'text-gray-700 hover:text-primary-saffron'
            )}
          >
            <span className="transition-transform duration-200 group-hover:scale-110">
              {item.icon}
            </span>
            <span className="transition-colors duration-200">
              {item.name}
            </span>
            {item.badge && item.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}

            {/* Animated underline for active items */}
            {isActive(item.path) && !mobile && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                layoutId="activeTab"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </Link>
        </li>
      ))}
    </ul>
  )

  const renderEmergencyContacts = () => (
    <div className="flex flex-col space-y-2 p-4 bg-red-50 rounded-xl border border-red-200">
      <h3 className="text-sm font-semibold text-red-800 mb-3">Emergency Contacts</h3>
      {emergencyContacts.map((contact) => (
        <a
          key={contact.number}
          href={`tel:${contact.number}`}
          className={cn(
            'flex items-center space-x-3 p-2 rounded-lg hover:bg-red-100 transition-colors duration-200',
            contact.color
          )}
        >
          <span className="transition-transform duration-200 hover:scale-110">
            {contact.icon}
          </span>
          <div className="flex-1">
            <div className="text-sm font-medium">{contact.name}</div>
            <div className="text-lg font-bold">{contact.number}</div>
          </div>
        </a>
      ))}
    </div>
  )

  return (
    <>
      <motion.nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'glass-card-intense shadow-glass-intense'
            : 'bg-transparent'
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-primary-saffron to-primary-royal-blue rounded-xl flex items-center justify-center text-white font-bold shadow-lg"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <Shield className="w-6 h-6" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-saffron to-primary-royal-blue bg-clip-text text-transparent">
                India Tour
              </span>
              <span className="text-sm text-gray-500 hidden sm:block">Safety System</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {renderNavItems(mainNavItems)}
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-6">
              <form onSubmit={handleSearch} className="relative">
                <motion.div
                  className={cn(
                    'relative flex items-center',
                    isSearchFocused ? 'scale-105' : 'scale-100'
                  )}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Search className="absolute left-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    placeholder="Search destinations, activities, safety info..."
                    className={cn(
                      'w-full pl-10 pr-4 py-2.5 rounded-xl border-2 transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-primary-saffron/50',
                      isSearchFocused
                        ? 'border-primary-saffron glass-morphism shadow-lg'
                        : 'border-gray-300 bg-white/80 backdrop-blur-sm'
                    )}
                  />
                  {isSearchFocused && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary-saffron/10 to-primary-royal-blue/10 rounded-xl pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </motion.div>
              </form>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="small"
                icon={<Bell className="w-4 h-4" />}
                className="relative"
              >
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary-saffron rounded-full animate-pulse" />
              </Button>

              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="small"
                icon={isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                onClick={toggleDarkMode}
              />

              {/* Emergency SOS Button */}
              <Button
                variant="danger"
                size="small"
                icon={<Phone className="w-4 h-4" />}
                className="pulse-red font-semibold"
              >
                SOS
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="small"
                icon={isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden"
              />
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              className="absolute top-0 right-0 bottom-0 w-80 max-w-full bg-white shadow-2xl overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="p-6 space-y-6">
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search destinations..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-saffron/50 focus:border-primary-saffron"
                  />
                </form>

                {/* Navigation Items */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Navigation</h3>
                  {renderNavItems(mainNavItems, true)}
                </div>

                {/* Secondary Items */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Account</h3>
                  {renderNavItems(secondaryNavItems, true)}
                </div>

                {/* Emergency Contacts */}
                {renderEmergencyContacts()}

                {/* Close Button */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Close Menu
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  )
}

export default Navbar