import { cn } from '@/lib/utils'

type HireKarmaMarkProps = {
  className?: string
  size?: 'sm' | 'md'
}

const sizeClasses = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
} as const

/** HireKarma brand mark (same asset as browser favicon). */
export function HireKarmaMark({ className, size = 'md' }: HireKarmaMarkProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm',
        sizeClasses[size],
        className,
      )}
    >
      <img
        src="/favicon.ico"
        alt=""
        width={44}
        height={44}
        className="h-[85%] w-[85%] object-contain"
        decoding="async"
      />
    </div>
  )
}