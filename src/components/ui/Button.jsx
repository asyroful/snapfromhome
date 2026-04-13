import React, { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

/**
 * Button — Reusable button component with variants
 *
 * variants: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
 * sizes:    'sm' | 'md' | 'lg' | 'xl'
 */
const Button = forwardRef(({
  children,
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled = false,
  className = '',
  leftIcon,
  rightIcon,
  fullWidth = false,
  ...props
}, ref) => {
  const variantClass = {
    primary:   'btn-primary',
    secondary: 'btn-secondary',
    ghost:     'btn-ghost',
    danger:    'btn-danger',
    success:   'relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-white transition-all duration-300 bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg hover:-translate-y-0.5',
  }[variant] || 'btn-primary'

  const sizeClass = {
    sm:  'text-sm px-4 py-2 gap-1.5',
    md:  'text-sm px-6 py-3',
    lg:  'text-base px-8 py-4',
    xl:  'text-lg px-10 py-5',
  }[size] || 'text-sm px-6 py-3'

  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={`
        ${variantClass} ${sizeClass}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin flex-shrink-0" />
      ) : leftIcon ? (
        <span className="flex-shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {rightIcon && !loading && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  )
})

Button.displayName = 'Button'
export default Button
