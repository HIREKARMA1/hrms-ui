import { CheckCircle2, Shield, Users } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type PermissionSummaryCardsProps = {
  totalPermissions: number
  usedInRoles: number
  unusedPermissions: number
}

const cards = [
  {
    key: 'total',
    label: 'Total Permissions',
    icon: Shield,
    accent: 'bg-[#F0EDFF] text-[#5938DB]',
  },
  {
    key: 'used',
    label: 'Used in Roles',
    icon: Users,
    accent: 'bg-sky-50 text-sky-600',
  },
  {
    key: 'unused',
    label: 'Unused Permissions',
    icon: CheckCircle2,
    accent: 'bg-emerald-50 text-emerald-600',
  },
] as const

export function PermissionSummaryCards({
  totalPermissions,
  usedInRoles,
  unusedPermissions,
}: PermissionSummaryCardsProps) {
  const values = {
    total: totalPermissions,
    used: usedInRoles,
    unused: unusedPermissions,
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card
            key={card.key}
            className="border-border-soft shadow-[0_1px_2px_rgba(23,33,58,0.04)]"
          >
            <CardContent className="flex items-center gap-4 p-5">
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  card.accent,
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.9} />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-text-secondary">{card.label}</p>
                <p className="text-2xl font-bold tabular-nums text-navy">
                  {values[card.key]}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
