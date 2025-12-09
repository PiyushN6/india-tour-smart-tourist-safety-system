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
  Globe,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import Button from './Button'
import { handleEmergencySOS } from '@/utils/emergency'
import SignupPage from './SignupPage'
import { useNotifications } from '../../context/NotificationContext'
import { useAuth } from '../../context/AuthContext'
import { useI18n } from '../../i18n'

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
  const [openDropdown, setOpenDropdown] = useState<null | 'safety' | 'notifications' | 'language' | 'user' | 'admin' | 'destinations'>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const { getUnreadCount, getActiveNotifications, markAsRead } = useNotifications()
  const unreadCount = getUnreadCount()

  const { user, displayName, signOut, session } = useAuth()
  const isAdmin = user?.role === 'admin'

  const userMeta = (session?.user.user_metadata as any) || {}

  const rawAvatar: string | null =
    (userMeta.picture as string | undefined) ||
    (userMeta.avatar_url as string | undefined) ||
    null

  const avatarUrl =
    !avatarError && typeof rawAvatar === 'string' && /^https?:\/\//.test(rawAvatar)
      ? rawAvatar
      : null

  const { lang, setLang } = useI18n()

  // Only animate navbar entering from top on the very first visit per session
  const [shouldAnimateNav] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      return window.sessionStorage.getItem('navbarAnimated') !== 'true'
    } catch {
      return true
    }
  })

  const mainNavItems: NavItem[] = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Safety Map', path: '/safety/map', icon: <Map className="w-4 h-4" /> },
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

  // Mark navbar animation as played after first render
  useEffect(() => {
    if (!shouldAnimateNav) return
    try {
      window.sessionStorage.setItem('navbarAnimated', 'true')
    } catch {
      // ignore
    }
    // We don't unset shouldAnimateNav here; it controls only initial props below
  }, [shouldAnimateNav])

  // Initialize dark mode from localStorage / system preference
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('theme')
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      const enabled = stored ? stored === 'dark' : prefersDark
      setIsDarkMode(enabled)
      document.documentElement.classList.toggle('dark', enabled)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false)
    setOpenDropdown(null)
  }, [location.pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/destinations?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      try {
        window.localStorage.setItem('theme', next ? 'dark' : 'light')
      } catch {
        // ignore
      }
      return next
    })
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const renderNavItems = (items: NavItem[], mobile = false) => (
    <ul className={cn(
      mobile ? 'flex flex-col space-y-2' : 'flex items-center space-x-2'
    )}>
      {items.map((item) => (
        <li key={item.path}>
          <Link
            to={item.path}
            className={cn(
              'group relative flex items-center space-x-2 px-2 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap',
              'hover:bg-gray-100 hover:shadow-md',
              mobile ? 'w-full justify-start' : '',
              isActive(item.path)
                ? 'bg-primary-saffron/10 text-slate-700 shadow-sm border border-primary-saffron/40'
                : 'text-slate-700 hover:text-primary-saffron'
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
          </Link>
        </li>
      ))}
    </ul>
  )

  const toggleDropdown = (id: 'safety' | 'notifications' | 'language' | 'user' | 'admin' | 'destinations') => {
    setOpenDropdown(prev => (prev === id ? null : id))
  }

  const closeDropdowns = () => setOpenDropdown(null)

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
        initial={shouldAnimateNav ? { y: -100, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 space-x-8">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
              <motion.div
                className="w-10 h-10 rounded-xl bg-white shadow-lg shadow-primary-royal-blue/30 border border-primary-royal-blue/20 flex items-center justify-center overflow-hidden"
                whileHover={{ rotate: 360, scale: 1.05 }}
                transition={{ duration: 0.6 }}
              >
                <img
                  src="/images/logo.png"
                  alt="India Tour logo"
                  className="w-9 h-9 object-contain"
                />
              </motion.div>
              <div className="flex flex-col leading-tight flex-shrink-0 pr-3">
                <span className="text-base sm:text-lg font-semibold text-gray-900 whitespace-nowrap">
                  India Tour
                </span>
                <span className="text-[11px] sm:text-xs text-gray-600 whitespace-nowrap">
                  Smart Tourist Safety System
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {/* HOME */}
              <Link
                to="/"
                className={cn(
                  'group relative flex items-center space-x-2 px-2 py-2 rounded-xl font-medium transition-all duration-200',
                  'hover:bg-gray-100 hover:shadow-md',
                  isActive('/')
                    ? 'bg-primary-saffron/10 text-slate-700 shadow-sm border border-primary-saffron/40'
                    : 'text-slate-700 hover:text-primary-saffron'
                )}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>

              {/* SAFETY dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('safety')}
                  className={cn(
                    'group relative flex items-center space-x-2 px-2 py-2 rounded-xl font-medium transition-all duration-200',
                    'hover:bg-gray-100 hover:shadow-md',
                    location.pathname.startsWith('/safety/dashboard') || location.pathname.startsWith('/safety/digital-id')
                      ? 'bg-primary-saffron/10 text-slate-700 shadow-sm border border-primary-saffron/40'
                      : 'text-slate-700 hover:text-primary-saffron'
                  )}
                >
                  <Shield className="w-4 h-4" />
                  <span>Safety</span>
                  <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                </button>

                <AnimatePresence>
                  {openDropdown === 'safety' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="absolute left-0 mt-2 w-56 rounded-2xl bg-white/90 backdrop-blur-lg shadow-xl border border-gray-100 py-2 z-50"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/safety/digital-id')
                          closeDropdowns()
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-primary-saffron" />
                        <span>Digital Safety ID</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/safety/digital-id/scan')
                          closeDropdowns()
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <img
                          src="/images/icons/qr-code.png"
                          alt="Scan Safety ID"
                          className="w-4 h-4 object-contain"
                        />
                        <span>Scan Safety ID (QR)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/safety/dashboard')
                          closeDropdowns()
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-primary-royal-blue" />
                        <span>Safety Dashboard</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* DESTINATIONS dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown('destinations')}
                  className={cn(
                    'group relative flex items-center space-x-2 px-2 py-2 rounded-xl font-medium transition-all duration-200',
                    'hover:bg-gray-100 hover:shadow-md',
                    location.pathname.startsWith('/destinations') || location.pathname.startsWith('/itinerary')
                      ? 'bg-primary-saffron/10 text-slate-700 shadow-sm border border-primary-saffron/40'
                      : 'text-slate-700 hover:text-primary-saffron'
                  )}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Destinations</span>
                  <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                </button>

                <AnimatePresence>
                  {openDropdown === 'destinations' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="absolute left-0 mt-2 w-60 rounded-2xl bg-white/90 backdrop-blur-lg shadow-xl border border-gray-100 py-2 z-50"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/destinations')
                          closeDropdowns()
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4 text-primary-saffron" />
                        <span>View all destinations</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/itinerary')
                          closeDropdowns()
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Map className="w-4 h-4 text-primary-royal-blue" />
                        <span>Manage itinerary</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SAFETY MAP, INFORMATION */}
              {renderNavItems(mainNavItems.slice(1))}
            </div>

            {/* Spacer to push right-side actions towards the right edge */}
            <div className="flex-1" />

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 pr-4">
              {/* Notifications dropdown */}
              <div className="relative hidden md:block">
                <Button
                  variant="ghost"
                  size="small"
                  icon={<Bell className="w-4 h-4" />}
                  className="relative"
                  onClick={() => toggleDropdown('notifications')}
                >
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-0 bg-red-500 text-white text-[11px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Button>

                <AnimatePresence>
                  {openDropdown === 'notifications' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-2xl bg-white/90 backdrop-blur-lg shadow-xl border border-gray-100 z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-xs text-gray-500">{unreadCount} unread</span>
                        )}
                      </div>
                      <div className="divide-y divide-gray-100">
                        {getActiveNotifications().filter((n) => !n.isRead).length === 0 ? (
                          <div className="px-4 py-6 text-sm text-gray-500 text-center">
                            You're all caught up.
                          </div>
                        ) : (
                          getActiveNotifications()
                            .filter((n) => !n.isRead)
                            .map((n) => (
                            <button
                              key={n.id}
                              type="button"
                              onClick={() => {
                                markAsRead(n.id)
                                if (n.actionUrl) {
                                  navigate(n.actionUrl)
                                }
                                closeDropdowns()
                              }}
                              className={cn(
                                'w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex flex-col gap-1',
                                !n.isRead && 'bg-orange-50'
                              )}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-gray-900 line-clamp-1">{n.title}</span>
                                <span className="text-[10px] uppercase tracking-wide text-gray-400">{n.type}</span>
                              </div>
                              <p className="text-xs text-gray-600 line-clamp-2">{n.message}</p>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dark Mode Toggle */}
              <Button
                variant="ghost"
                size="small"
                icon={isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                onClick={toggleDarkMode}
              >
                <span className="sr-only">Toggle dark mode</span>
              </Button>

              {/* Emergency SOS Button */}
              <Button
                variant="danger"
                size="small"
                icon={<Phone className="w-4 h-4" />}
                className="pulse-red font-semibold text-slate-700"
                onClick={() => handleEmergencySOS(navigate)}
              >
                SOS
              </Button>

              {/* Language dropdown */}
              <div className="relative hidden md:block">
                <Button
                  variant="ghost"
                  size="small"
                  icon={<Globe className="w-4 h-4" />}
                  onClick={() => toggleDropdown('language')}
                >
                  <span className="ml-1 text-sm font-medium">{lang === 'en' ? 'EN' : 'हिंदी'}</span>
                </Button>
                <AnimatePresence>
                  {openDropdown === 'language' && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                      className="absolute right-0 mt-2 w-44 rounded-2xl bg-white/90 backdrop-blur-lg shadow-xl border border-gray-100 z-50 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setLang('en')
                          closeDropdowns()
                        }}
                        className={cn(
                          'w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 rounded-lg',
                          lang === 'en'
                            ? 'font-semibold text-primary-saffron'
                            : 'text-gray-800 hover:text-primary-saffron'
                        )}
                      >
                        <span>English</span>
                        {lang === 'en' && <span>✓</span>}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLang('hi')
                          closeDropdowns()
                        }}
                        className={cn(
                          'w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-50 rounded-lg',
                          lang === 'hi'
                            ? 'font-semibold text-primary-saffron'
                            : 'text-gray-800 hover:text-primary-saffron'
                        )}
                      >
                        <span>हिंदी</span>
                        {lang === 'hi' && <span>✓</span>}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Admin dropdown (admin only) */}
              {isAdmin && (
                <div className="relative hidden md:block">
                  <Button
                    variant="ghost"
                    size="small"
                    icon={<Shield className="w-4 h-4" />}
                    onClick={() => toggleDropdown('admin')}
                  >
                    <span className="ml-1 text-sm font-medium">Admin</span>
                  </Button>
                  <AnimatePresence>
                    {openDropdown === 'admin' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-white/90 backdrop-blur-lg shadow-xl border border-gray-100 z-50"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            navigate('/safety/admin')
                            closeDropdowns()
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 rounded-xl"
                        >
                          <Shield className="w-4 h-4 text-primary-royal-blue" />
                          <span>Admin Dashboard</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Auth: avatar when logged in, Get started when logged out */}
              {user ? (
                <div className="relative hidden md:block">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('user')}
                    className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 bg-white shadow-lg flex items-center justify-center hover:border-primary-saffron transition-colors"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={displayName || user.email || 'User avatar'}
                        className="w-full h-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-rose-500">
                        <span className="text-sm font-semibold text-white">
                          {(displayName || user.email || '?').trim().charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </button>
                  <AnimatePresence>
                    {openDropdown === 'user' && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="absolute right-0 mt-2 w-52 rounded-2xl bg-white/90 backdrop-blur-lg shadow-xl border border-gray-100 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs text-gray-500 mb-0.5">Signed in as</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {displayName || user.email}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            navigate('/profile')
                            closeDropdowns()
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2"
                        >
                          <User className="w-4 h-4 text-primary-royal-blue" />
                          <span>Manage account</span>
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            await signOut()
                            closeDropdowns()
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 rounded-b-2xl"
                        >
                          <span>Sign out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="hidden md:block">
                  <Button
                    variant="primary"
                    size="small"
                    icon={<User className="w-4 h-4" />}
                    onClick={() => setShowAuthModal(true)}
                    className="shadow-lg whitespace-nowrap text-slate-700"
                  >
                    Get started
                  </Button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="small"
                icon={isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden"
              >
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Global dropdown backdrop (no blur) */}
      <AnimatePresence>
        {(openDropdown || showAuthModal) && (
          <motion.div
            className="fixed inset-0 z-40 hidden md:block bg-black/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              closeDropdowns()
              setShowAuthModal(false)
            }}
          />
        )}
      </AnimatePresence>

      {/* Auth modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-3 sm:px-4 py-6 sm:py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="w-full max-h-[90vh] max-w-5xl shadow-2xl bg-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              <SignupPage onClose={() => setShowAuthModal(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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