/**
 * Super Admin access planning placeholder until global Users/Roles ships.
 */

import { KeyRound, Shield, Users } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { LeaveTabHeader } from '../LeaveTabHeader'

const PLANNED = [
  {
    title: 'Users',
    description: 'Invite, deactivate, and map employees to leave approvers.',
    icon: Users,
  },
  {
    title: 'Roles & permissions',
    description: 'Who can edit policy, run accruals, approve encashment, and export reports.',
    icon: Shield,
  },
  {
    title: 'Sign-in & SSO',
    description: 'Connect production auth and replace the demo role switcher.',
    icon: KeyRound,
  },
] as const

export function AccessTab() {
  return (
    <div className="space-y-6">
      <LeaveTabHeader
        title="Access"
        subtitle="Company-wide identity controls will live here. Leave already respects role-aware navigation today."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {PLANNED.map((item) => (
          <Card key={item.title}>
            <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-hrms-muted-bg text-hrms-primary">
                <item.icon className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <CardTitle className="text-base font-semibold text-hrms-navy">{item.title}</CardTitle>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-hrms-text-muted">Planned</p>
              </div>
            </CardHeader>
            <CardContent className="pt-0 text-sm text-hrms-text-secondary">{item.description}</CardContent>
          </Card>
        ))}
      </div>
      <p className="text-sm text-hrms-text-secondary">
        Use the demo role switcher in the page header to preview Employee, Manager, HR Admin, and Super Admin leave
        experiences until authentication is wired.
      </p>
    </div>
  )
}
