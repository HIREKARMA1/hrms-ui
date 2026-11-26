import type { LucideIcon } from 'lucide-react'

type LoginFeatureCardProps = {
  title: string
  icon: LucideIcon
}

export function LoginFeatureCard({ title, icon: Icon }: LoginFeatureCardProps) {
  return (
    <div className="flex min-h-[76px] flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl border border-[#14B8A6]/35 bg-[#1B2744]/75 px-2 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#14B8A6]/15 text-[#14B8A6]">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <p className="text-center text-[11px] font-semibold tracking-wide text-white">
        {title}
      </p>
    </div>
  )
}
