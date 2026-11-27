import { Eye, EyeOff, Lock } from 'lucide-react'
import { useState, type ComponentProps } from 'react'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type PasswordInputProps = Omit<ComponentProps<'input'>, 'type'> & {
  error?: boolean
}

export function PasswordInput({
  className,
  error,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Lock
        className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#98A2B3]"
        aria-hidden="true"
      />
      <Input
        type={visible ? 'text' : 'password'}
        className={cn(
          'pr-11 pl-10',
          error && 'border-red-400 focus-visible:ring-red-200',
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((prev) => !prev)}
        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-[#98A2B3] transition-colors hover:text-[#667085] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]"
        aria-label={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  )
}
