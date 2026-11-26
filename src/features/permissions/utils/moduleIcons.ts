import type { LucideIcon } from 'lucide-react'
import {
  Briefcase,
  CalendarDays,
  Clock3,
  Shield,
  Users,
  Wallet,
} from 'lucide-react'

const MODULE_ICON_BY_KEY: Record<string, LucideIcon> = {
  users: Users,
  employees: Users,
  departments: Users,
  onboarding: Users,
  leaves: CalendarDays,
  leave_types: CalendarDays,
  leave_policies: CalendarDays,
  leave_encashments: Wallet,
  leave_approval: CalendarDays,
  employee_leave_policies: CalendarDays,
  holidays: CalendarDays,
  calendar: CalendarDays,
  payroll: Wallet,
  attendance: Clock3,
  biometric: Clock3,
  recruitment: Briefcase,
  applications: Briefcase,
  leads: Briefcase,
  lead_sources: Briefcase,
  lead_categories: Briefcase,
  roles: Shield,
  permissions: Shield,
}

export function getModuleIcon(moduleKey: string): LucideIcon {
  return MODULE_ICON_BY_KEY[moduleKey.toLowerCase()] ?? Shield
}
