import * as React from 'react'

import { cn } from '@/lib/utils'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-navy shadow-sm transition-colors placeholder:text-text-secondary/80 focus-visible:border-teal-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-light/30 disabled:cursor-not-allowed disabled:bg-muted-bg disabled:opacity-60',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
