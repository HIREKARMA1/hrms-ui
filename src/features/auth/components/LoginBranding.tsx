import { BriefcaseBusiness, CalendarDays, Coins, UserCog } from 'lucide-react'

import { HireKarmaMark } from '@/components/brand/HireKarmaMark'

const features = [
  {
    title: 'Employee Management',
    description: 'Maintain employee records and profiles.',
    icon: UserCog,
  },
  {
    title: 'Attendance & Leave',
    description: 'Track attendance and manage leave requests.',
    icon: CalendarDays,
  },
  {
    title: 'Payroll Management',
    description: 'Handle salaries, allowances and deductions.',
    icon: Coins,
  },
  {
    title: 'Recruitment & Hiring',
    description: 'Manage the complete hiring process.',
    icon: BriefcaseBusiness,
  },
] as const

function DeskIllustration() {
  return (
    <svg
      viewBox="0 0 420 160"
      className="mx-auto mt-8 w-full max-w-md opacity-95"
      aria-hidden="true"
    >
      <ellipse cx="210" cy="138" rx="150" ry="14" fill="rgba(255,255,255,0.12)" />
      <rect x="70" y="108" width="280" height="16" rx="4" fill="rgba(255,255,255,0.28)" />
      <rect x="86" y="124" width="12" height="20" rx="2" fill="rgba(255,255,255,0.22)" />
      <rect x="322" y="124" width="12" height="20" rx="2" fill="rgba(255,255,255,0.22)" />

      {/* Plant */}
      <rect x="104" y="88" width="28" height="20" rx="4" fill="rgba(255,255,255,0.35)" />
      <path
        d="M118 88c-8-18-2-30 0-36 8 10 14 22 10 36h-10z"
        fill="rgba(255,255,255,0.55)"
      />
      <path
        d="M118 88c8-16 16-26 22-30-2 12-6 22-12 30h-10z"
        fill="rgba(255,255,255,0.4)"
      />

      {/* Laptop */}
      <rect x="160" y="52" width="100" height="58" rx="6" fill="rgba(255,255,255,0.55)" />
      <rect x="168" y="60" width="84" height="42" rx="3" fill="#6d5cf6" />
      <rect x="186" y="72" width="48" height="6" rx="2" fill="rgba(255,255,255,0.7)" />
      <rect x="194" y="84" width="32" height="8" rx="2" fill="rgba(255,255,255,0.85)" />
      <path d="M150 110h120l-10-8H160l-10 8z" fill="rgba(255,255,255,0.45)" />

      {/* Mug */}
      <rect x="292" y="82" width="28" height="26" rx="4" fill="rgba(255,255,255,0.5)" />
      <path
        d="M320 88h8a8 8 0 010 16h-8"
        fill="none"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="4"
      />
      <text
        x="306"
        y="100"
        textAnchor="middle"
        fill="#6d5cf6"
        fontSize="9"
        fontWeight="700"
        fontFamily="Segoe UI, sans-serif"
      >
        HR
      </text>
    </svg>
  )
}

export function LoginBranding() {
  return (
    <section className="relative hidden overflow-hidden bg-linear-to-br from-brand-500 via-brand-600 to-brand-800 text-white lg:flex lg:w-[46%] xl:w-[48%]">
      <div className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-brand-300/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-64 w-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.08))]" />

      <div className="relative z-10 flex w-full flex-col justify-between px-10 py-10 xl:px-14 xl:py-12">
        <div>
          <div className="mb-10 flex items-center gap-3">
            <HireKarmaMark />
            <div>
              <p className="text-xl font-bold tracking-tight">HRMS</p>
              <p className="text-sm text-white/75">
                Human Resources Management System
              </p>
            </div>
          </div>

          <h1 className="max-w-md text-3xl leading-tight font-bold tracking-tight xl:text-4xl">
            Manage Your Workforce Efficiently
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 xl:text-base">
            A modern HRMS to streamline employees, attendance, leave, payroll,
            recruitment and more.
          </p>

          <ul className="mt-10 space-y-4">
            {features.map(({ title, description, icon: Icon }) => (
              <li key={title} className="flex items-start gap-3.5">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-white/75">{description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <DeskIllustration />
      </div>
    </section>
  )
}
