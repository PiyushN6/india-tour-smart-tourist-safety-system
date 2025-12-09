import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield,
  MapPin,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Heart,
  AlertTriangle,
  Map,
  User,
  BookOpen,
  Camera,
  Star,
  Check
} from 'lucide-react'
import { cn } from '@/utils/cn'
import Button from './Button'

interface FooterSection {
  title: string
  icon: React.ReactNode
  items: {
    label: string
    href: string
    external?: boolean
    description?: string
  }[]
}

interface FooterLink {
  label: string
  to: string
    icon?: React.ReactNode
    badge?: string
}

const Footer: React.FC = () => {
  const [subscribed, setSubscribed] = React.useState(false)

  const mainSections: FooterSection[] = [
    {
      title: 'Explore',
      icon: <MapPin className="w-4 h-4" />,
      items: [
        { label: 'Popular Destinations', href: '/destinations', description: 'Discover amazing places' },
        { label: 'Safety Map', href: '/safety/map', description: 'Real-time safety information' },
        { label: 'Emergency Services', href: '/safety/dashboard', description: 'Quick access to help' },
        { label: 'Travel Guidelines', href: '/safety/information', description: 'Essential safety tips' }
      ]
    },
    {
      title: 'Features',
      icon: <Shield className="w-4 h-4" />,
      items: [
        { label: 'Safety Dashboard', href: '/safety/dashboard', description: 'Your safety overview' },
        { label: 'AI Assistant', href: '/safety/chat', description: '24/7 safety guidance' },
        { label: 'Gamification', href: '/gamification', description: 'Earn rewards & badges' },
        { label: 'Emergency SOS', href: '/safety/emergency', description: 'One-tap emergency help' }
      ]
    },
    {
      title: 'Resources',
      icon: <BookOpen className="w-4 h-4" />,
      items: [
        { label: 'Travel Blog', href: '/blog', description: 'Stories & experiences' },
        { label: 'Safety Guides', href: '/safety/information', description: 'Comprehensive safety guides' },
        { label: 'Emergency Contacts', href: '/safety/emergency', description: 'Important numbers' },
        { label: 'Tourist Offices', href: '/resources/offices', description: 'Local help centers' }
      ]
    },
    {
      title: 'Company',
      icon: <Globe className="w-4 h-4" />,
      items: [
        { label: 'About Us', href: '/about', description: 'Learn about our mission' },
        { label: 'Contact', href: '/contact', description: 'Get in touch with us' },
        { label: 'Careers', href: '/careers', description: 'Join our team' },
        { label: 'Press Kit', href: '/press', description: 'Media resources' }
      ]
    }
  ]

  const legalLinks: FooterLink[] = [
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Terms of Service', to: '/terms' },
    { label: 'Cookie Policy', to: '/cookies' },
    { label: 'Accessibility', to: '/accessibility', badge: 'WCAG' }
  ]

  const socialLinks = [
    { name: 'Facebook', icon: <Facebook className="w-5 h-5" />, href: 'https://facebook.com' },
    { name: 'Twitter', icon: <Twitter className="w-5 h-5" />, href: 'https://twitter.com' },
    { name: 'Instagram', icon: <Instagram className="w-5 h-5" />, href: 'https://instagram.com' },
    { name: 'YouTube', icon: <Youtube className="w-5 h-5" />, href: 'https://youtube.com' }
  ]

  const emergencyInfo = [
    { number: '112', label: 'Emergency', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-600' },
    { number: '100', label: 'Police', icon: <Shield className="w-4 h-4" />, color: 'text-blue-600' },
    { number: '108', label: 'Ambulance', icon: <Phone className="w-4 h-4" />, color: 'text-green-600' }
  ]

  const renderFooterSection = (section: FooterSection) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="space-y-4"
    >
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-primary-saffron transition-transform duration-200 group-hover:scale-110">
          {section.icon}
        </span>
        <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
      </div>
      <ul className="space-y-3">
        {section.items.map((item) => (
          <li key={item.href}>
            <Link
              to={item.href}
              className={cn(
                'group flex flex-col space-y-1 p-2 rounded-lg transition-all duration-200',
                'hover:bg-primary-saffron/10 hover:text-primary-saffron'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 group-hover:text-primary-saffron transition-colors duration-200">
                  {item.label}
                </span>
                {item.external && (
                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-primary-saffron transition-colors duration-200" />
                )}
              </div>
              {item.description && (
                <span className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors duration-200">
                  {item.description}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  )

  const renderEmergencyCard = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="glass-card-intense p-6 space-y-4 border-2 border-red-200"
    >
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-6 h-6 text-red-600 pulse-red" />
        <h3 className="text-lg font-bold text-red-800">Emergency Contacts</h3>
      </div>
      <div className="space-y-3">
        {emergencyInfo.map((contact) => (
          <a
            key={contact.number}
            href={`tel:${contact.number}`}
            className={cn(
              'flex items-center space-x-3 p-3 rounded-lg bg-white/80',
              'hover:bg-white hover:shadow-md transition-all duration-200',
              'border border-current/20'
            )}
          >
            <span className={cn(contact.color, 'transition-transform duration-200 hover:scale-110')}>
              {contact.icon}
            </span>
            <div className="flex-1">
              <div className="text-sm text-gray-600">{contact.label}</div>
              <div className={cn('text-xl font-bold', contact.color)}>
                {contact.number}
              </div>
            </div>
          </a>
        ))}
      </div>
    </motion.div>
  )

  return (
    <footer className="relative bg-gradient-to-b from-background-warm-offwhite to-background-soft-cream border-t border-gray-200 overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 mandala-pattern" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 mb-12">
          {/* Main Sections */}
          {mainSections.map((section) => (
            <div key={section.title}>
              {renderFooterSection(section)}
            </div>
          ))}

          {/* Emergency Card */}
          <div className="lg:col-span-1">
            {renderEmergencyCard()}
          </div>
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="glass-card p-6 mb-12 text-center"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Mail className="w-6 h-6 text-primary-saffron" />
            <h3 className="text-xl font-semibold text-gray-900">
              Stay Safe, Stay Informed
            </h3>
          </div>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Get the latest travel safety alerts, destination updates, and exclusive safety tips delivered to your inbox.
          </p>
          <form
            className="flex flex-col sm:flex-row max-w-md mx-auto space-y-3 sm:space-y-0 sm:space-x-3"
            onSubmit={(e) => {
              e.preventDefault()
              const form = e.currentTarget
              const emailInput = form.elements.namedItem('newsletter-email') as HTMLInputElement | null
              const email = emailInput?.value.trim() || ''

              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              if (!emailRegex.test(email)) {
                alert('Please write a valid email address.')
                return
              }

              // Valid email: show a temporary visual success state on the button
              setSubscribed(true)
              setTimeout(() => setSubscribed(false), 2500)
              form.reset()
            }}
          >
            <input
              type="email"
              name="newsletter-email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-saffron/50 focus:border-primary-saffron transition-all duration-200"
            />
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-xl border border-gray-300 bg-white/70 bg-clip-padding backdrop-blur-md text-sm font-medium transition-all duration-200 gap-2.5 "
            >
              {subscribed ? (
                <>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-green-700">Subscribed</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span className="text-gray-900">Subscribe</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Legal Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Legal</h4>
              <div className="grid grid-cols-2 gap-3">
                {legalLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-sm text-gray-600 hover:text-primary-saffron transition-colors duration-200"
                  >
                    {link.label}
                    {link.badge && (
                      <span className="ml-2 text-xs bg-primary-saffron text-white px-2 py-0.5 rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="space-y-4 text-right md:col-start-3"
            >
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Follow Us</h4>
              <div className="flex space-x-4 justify-end">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary-saffron hover:text-white transition-all duration-200 hover:scale-110"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </motion.div>

            {/* App Download block removed for now */}
          </div>

          {/* Copyright */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            viewport={{ once: true }}
            className="mt-8 pt-8 border-t border-gray-200"
          >
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Copyright © 2025 India Tour Smart Safety System All rights reserved.</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Emergency available 24/7</span>
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>System Status: Online</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Floating Safety Badge removed for now */}
    </footer>
  )
}

export default Footer