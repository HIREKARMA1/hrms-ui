import * as React from 'react'

import { cn } from '@/lib/utils'

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[96px] w-full rounded-xl border border-border-soft bg-white px-3 py-2 text-sm text-navy shadow-sm placeholder:text-text-secondary focus-visible:border-teal-light focus-visible:ring-2 focus-visible:ring-teal-light/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-muted-bg disabled:opacity-60',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

export { Textarea }
