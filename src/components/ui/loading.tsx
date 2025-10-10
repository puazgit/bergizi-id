import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  return (
    <Loader2 
      className={cn(
        'animate-spin text-muted-foreground',
        sizeClasses[size],
        className
      )} 
    />
  )
}

export function LoadingButton({ 
  children, 
  loading, 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button 
      {...props}
      disabled={loading || props.disabled}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        props.className
      )}
    >
      {loading && <LoadingSpinner size="sm" />}
      {children}
    </button>
  )
}