import React from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/cn'
import { ButtonProps } from '@/types'

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  children,
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:focus-visible relative overflow-hidden group'

  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-saffron to-primary-royal-blue text-white hover:from-primary-saffron/90 hover:to-primary-royal-blue/90 shadow-lg hover:shadow-xl button-lift',
    secondary: 'bg-transparent border-2 border-current text-current hover:bg-current hover:text-background-warm-offwhite hover:shadow-lg button-lift',
    outline: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 button-lift',
    glass: 'glass-morphism text-white hover:glass-card-intense hover:shadow-glass-intense button-lift',
    brutal: 'brutal-button text-black font-bold hover:translate-x-1 hover:translate-y-1 hover:shadow-neobrutal-hover',
    danger: 'bg-safety-red text-white hover:bg-red-600 shadow-lg hover:shadow-xl hover:shadow-red-500/25 button-lift',
    ghost: 'bg-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm min-h-[32px]',
    medium: 'px-4 py-2 text-base min-h-[40px]',
    large: 'px-6 py-3 text-lg min-h-[48px]',
    xlarge: 'px-8 py-4 text-xl font-semibold min-h-[56px]'
  }

  const iconSizes = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4',
    large: 'w-5 h-5',
    xlarge: 'w-6 h-6'
  }

  const disabledClasses = disabled || loading
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer'

  const widthClasses = fullWidth ? 'w-full' : ''

  const motionProps: any = {
    whileHover: disabled || loading ? {} : { scale: 1.02 },
    whileTap: disabled || loading ? {} : { scale: 0.98 },
    transition: { type: 'spring', stiffness: 400, damping: 17 }
  }

  const renderIcon = () => {
    if (!icon) return null
    return (
      <span className={cn(iconSizes[size], 'transition-transform duration-200 group-hover:scale-110')}>
        {icon}
      </span>
    )
  }

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
          {size !== 'small' && children && (
            <span className="ml-2">{children}</span>
          )}
        </>
      )
    }

    const content = (
      <>
        {icon && iconPosition === 'left' && renderIcon()}
        {children && <span>{children}</span>}
        {icon && iconPosition === 'right' && renderIcon()}
      </>
    )

    return content
  }

  return (
    <motion.button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabledClasses,
        widthClasses,
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      {...motionProps}
      {...props}
    >
      {/* Animated gradient overlay for primary variant */}
      {variant === 'primary' && !disabled && !loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      )}

      {/* Ripple effect */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-active:opacity-20 bg-white transition-opacity duration-150" />

      {renderContent()}
    </motion.button>
  )
}

export default Button