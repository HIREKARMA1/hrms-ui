import { HireKarmaMark } from '@/components/brand/HireKarmaMark'
import { cn } from '@/lib/utils'

type HrmsBrandLockupProps = {
  tone?: 'light' | 'dark'
  className?: string
  compact?: boolean
}

/** Shared HRMS logo + title lockup for login surfaces. */
export function HrmsBrandLockup({
  tone = 'dark',
  className,
  compact = false,
}: HrmsBrandLockupProps) {
  const titleClass = tone === 'light' ? 'text-white' : 'text-[#17213A]'
  const subtitleClass = tone === 'light' ? 'text-white/70' : 'text-[#667085]'

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <HireKarmaMark
        className={cn(
          'rounded-xl shadow-sm ring-1 ring-[#14B8A6]/25',
          compact ? 'h-10 w-10' : 'h-11 w-11',
        )}
      />
      <div>
        <p className={cn('text-xl font-bold tracking-tight', titleClass)}>HRMS</p>
        <p className={cn('text-xs sm:text-sm', subtitleClass)}>
          Human Resources Management System
        </p>
      </div>
    </div>
  )
}
