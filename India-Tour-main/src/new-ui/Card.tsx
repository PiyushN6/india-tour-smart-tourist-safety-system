import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { CardProps } from '@/types'

const Card: React.FC<CardProps> = ({
  variant = 'default',
  hover = true,
  padding = 'medium',
  shadow = 'medium',
  children,
  onClick,
  className,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const baseClasses = 'rounded-2xl transition-all duration-300 relative overflow-hidden'

  const variantClasses = {
    default: 'bg-white border border-gray-200',
    glass: 'glass-card',
    interactive: 'glass-card-intense cursor-pointer',
    brutal: 'brutal-card bg-background-warm-offwhite',
    safety: 'bg-white border-l-4'
  }

  const paddingClasses = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8'
  }

  const shadowClasses = {
    none: 'shadow-none',
    small: 'shadow-sm',
    medium: 'shadow-glass',
    large: 'shadow-xl',
    brutal: 'shadow-neobrutal'
  }

  const hoverClasses = hover && variant === 'default' ? 'hover:shadow-xl hover:-translate-y-1' : ''
  const interactiveHover = hover && (variant === 'interactive' || variant === 'glass') ? 'hover:shadow-3d-hover card-3d-hover' : ''
  const brutalHover = hover && variant === 'brutal' ? 'hover:shadow-neobrutal-hover hover:-translate-x-1 hover:-translate-y-1' : ''
  const safetyHover = hover && variant === 'safety' ? 'hover:shadow-lg hover:-translate-y-2' : ''

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hover || variant !== 'interactive') return

    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    setMousePosition({ x, y })
  }

  const getSafetyBorderClass = (level?: string) => {
    switch (level) {
      case 'high':
        return 'border-l-green-500'
      case 'medium':
        return 'border-l-yellow-500'
      case 'low':
        return 'border-l-red-500'
      default:
        return 'border-l-blue-500'
    }
  }

  const getTransformStyles = () => {
    if (!hover || variant !== 'interactive' || !isHovered) return {}

    const rotateX = (mousePosition.y - 0.5) * 10
    const rotateY = (mousePosition.x - 0.5) * -10

    return {
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`
    }
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        baseClasses,
        variantClasses[variant],
        paddingClasses[padding],
        shadowClasses[shadow],
        hoverClasses,
        interactiveHover,
        brutalHover,
        safetyHover,
        className
      )}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={getTransformStyles()}
      whileHover={hover && onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {/* Overlay effects for different variants */}
      {variant === 'glass' && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      )}

      {variant === 'interactive' && isHovered && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none rounded-2xl" />
      )}

      {/* Hover glow effect for interactive cards */}
      {variant === 'interactive' && hover && (
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-saffron/20 to-primary-royal-blue/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      )}

      {/* Grain texture for brutalist cards */}
      {variant === 'brutal' && (
        <div className="absolute inset-0 grain-overlay pointer-events-none" />
      )}

      {/* Safety color indicator (if provided via data attribute) */}
      {variant === 'safety' && (
        <div className="absolute top-4 right-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Shimmer effect for loading states */}
      {(props as any)['data-loading'] && (
        <div className="absolute inset-0 skeleton-loading pointer-events-none z-20" />
      )}
    </motion.div>
  )
}

export default Card