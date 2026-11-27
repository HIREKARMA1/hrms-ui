import { Briefcase, CalendarDays, Coins, Users } from 'lucide-react'

import { HrmsBrandLockup } from './HrmsBrandLockup'
import { LoginFeatureCard } from './LoginFeatureCard'
import { LoginIllustration } from './LoginIllustration'

const features = [
  { title: 'Employees', icon: Users },
  { title: 'Attendance', icon: CalendarDays },
  { title: 'Payroll', icon: Coins },
  { title: 'Recruitment', icon: Briefcase },
] as const

/** Left branding panel — navy/teal split matching the approved login reference. */
export function LoginBranding() {
  return (
    <section className="relative hidden min-h-svh overflow-hidden bg-[#17213A] text-white lg:flex lg:w-[48%] xl:w-[46%]">
      {/* Soft teal atmosphere */}
      <div
        className="pointer-events-none absolute top-[10%] right-[8%] h-[42%] w-[50%] bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.28),transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-56 w-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.38),transparent_65%)]"
        aria-hidden="true"
      />

      {/* Smooth curved boundary + teal accent (matches reference S-curve) */}
      <svg
        className="pointer-events-none absolute inset-y-0 right-0 z-20 h-full w-[22%] min-w-[120px]"
        viewBox="0 0 160 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M40 0C95 120 145 240 130 380c-18 160-95 240-55 390 28 105 70 130 85 130H160V0H40z"
          fill="#F7F8FC"
        />
        <path
          d="M36 0C90 120 140 240 125 380c-18 160-95 240-55 390 25 95 62 120 78 130"
          fill="none"
          stroke="#14B8A6"
          strokeWidth="14"
          opacity="0.85"
        />
        <path
          d="M28 0C82 120 132 240 118 380c-18 160-95 240-55 390 22 90 55 115 70 130"
          fill="none"
          stroke="#5EEAD4"
          strokeWidth="4"
          opacity="0.55"
        />
      </svg>

      <div className="relative z-10 flex w-full flex-col justify-between gap-6 px-10 py-8 pr-20 xl:gap-8 xl:px-14 xl:pr-24 xl:py-10">
        <div>
          <HrmsBrandLockup tone="light" className="mb-8" />

          <h1 className="max-w-lg text-[2.15rem] leading-[1.12] font-bold tracking-tight xl:text-4xl">
            <span className="block text-white">Manage Your</span>
            <span className="mt-1 block bg-linear-to-r from-[#5EEAD4] via-[#14B8A6] to-[#0D9488] bg-clip-text text-transparent">
              Workforce Smarter
            </span>
          </h1>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
            A unified platform to manage employees, attendance, leaves, payroll,
            recruitment and more.
          </p>

          <div className="mt-7 grid max-w-xl grid-cols-4 gap-3">
            {features.map(({ title, icon }) => (
              <LoginFeatureCard key={title} title={title} icon={icon} />
            ))}
          </div>
        </div>

        <div className="max-w-[440px] shrink-0">
          <LoginIllustration />
        </div>
      </div>
    </section>
  )
}
