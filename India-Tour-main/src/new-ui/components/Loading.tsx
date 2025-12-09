import React from 'react'
import { motion } from 'framer-motion'
import { Loader2, Zap, Sparkles, MapPin } from 'lucide-react'
import { cn } from '@/utils/cn'
import { LoadingProps } from '@/types'

const Loading: React.FC<LoadingProps> = ({
  type = 'spinner',
  size = 'medium',
  text,
  fullScreen = false,
  className
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  }

  const textSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }

  const containerClasses = cn(
    'flex flex-col items-center justify-center space-y-3',
    fullScreen ? 'min-h-screen fixed inset-0 bg-background-warm-offwhite/90 backdrop-blur-sm z-50' : 'py-8',
    className
  )

  const renderSpinner = () => (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      className={cn(sizeClasses[size], 'text-primary-saffron')}
    >
      <Loader2 className="w-full h-full" />
    </motion.div>
  )

  const renderSkeleton = () => (
    <div className="w-full max-w-md space-y-4">
      <div className="skeleton-loading h-4 rounded w-3/4" />
      <div className="skeleton-loading h-4 rounded w-1/2" />
      <div className="skeleton-loading h-32 rounded" />
    </div>
  )

  const renderPulse = () => (
    <div className={cn(sizeClasses[size], 'relative')}>
      <div className={cn(sizeClasses[size], 'absolute inset-0 bg-primary-saffron rounded-full animate-pulse')} />
      <div className={cn(sizeClasses[size], 'absolute inset-0 bg-primary-royal-blue rounded-full animate-pulse animation-delay-150')} />
    </div>
  )

  const renderShimmer = () => (
    <div className="skeleton-shimmer w-full h-24 rounded-2xl relative overflow-hidden">
      <div className="absolute top-4 left-4 w-12 h-12 bg-gray-200 rounded-lg" />
      <div className="absolute bottom-4 left-4 right-4 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-2 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  )

  const renderLoadingIcon = () => {
    switch (type) {
      case 'spinner':
        return renderSpinner()
      case 'skeleton':
        return renderSkeleton()
      case 'pulse':
        return renderPulse()
      case 'shimmer':
        return renderShimmer()
      default:
        return renderSpinner()
    }
  }

  const getContextualIcon = () => {
    // Random contextual loading icons for variety
    const icons = [Zap, Sparkles, MapPin]
    const Icon = icons[Math.floor(Math.random() * icons.length)]
    return <Icon className={cn(sizeClasses[size], 'text-primary-royal-blue/50')} />
  }

  const getLoadingText = () => {
    if (text) return text

    switch (type) {
      case 'spinner':
        return 'Loading...'
      case 'skeleton':
        return 'Preparing content...'
      case 'pulse':
        return 'Connecting...'
      case 'shimmer':
        return 'Discovering amazing places...'
      default:
        return 'Loading...'
    }
  }

  return (
    <div className={containerClasses}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative"
      >
        {/* Contextual background elements */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 -z-10">
          {getContextualIcon()}
        </div>

        {/* Main loading element */}
        {renderLoadingIcon()}
      </motion.div>

      {/* Loading text */}
      {getLoadingText() && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'text-gray-600 font-medium text-center',
            textSizes[size]
          )}
        >
          {getLoadingText()}
        </motion.p>
      )}

      {/* Progress dots for additional visual feedback */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 bg-primary-saffron rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Loading screen component for full screen loading
export const LoadingScreen: React.FC<{ message?: string }> = ({ message }) => (
  <Loading
    type="shimmer"
    size="large"
    text={message || 'Preparing your safe journey across India...'}
    fullScreen={true}
  />
)

// Loading skeleton for cards
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 1 }) => (
  <div className="space-y-6">
    {Array.from({ length: count }).map((_, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="skeleton-loading h-64 rounded-2xl"
      >
        <div className="h-full flex flex-col p-6 space-y-4">
          <div className="skeleton-loading h-8 w-3/4 rounded" />
          <div className="flex-1 space-y-2">
            <div className="skeleton-loading h-4 w-full rounded" />
            <div className="skeleton-loading h-4 w-5/6 rounded" />
            <div className="skeleton-loading h-4 w-4/6 rounded" />
          </div>
          <div className="flex space-x-2">
            <div className="skeleton-loading h-8 w-20 rounded-lg" />
            <div className="skeleton-loading h-8 w-24 rounded-lg" />
          </div>
        </div>
      </motion.div>
    ))}
  </div>
)

export default Loading