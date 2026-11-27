import { ShieldCheck, UserPlus, Users } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type RoleSummaryCardsProps = {
  totalRoles: number
  systemRoles: number
  customRoles: number
}

const cards = [
  {
    key: 'total',
    label: 'Total Roles',
    icon: Users,
    accent: 'bg-[#CCFBF1] text-[#0F766E]',
  },
  {
    key: 'system',
    label: 'System Roles',
    icon: ShieldCheck,
    accent: 'bg-sky-50 text-sky-600',
  },
  {
    key: 'custom',
    label: 'Custom Roles',
    icon: UserPlus,
    accent: 'bg-emerald-50 text-emerald-600',
  },
] as const

export function RoleSummaryCards({
  totalRoles,
  systemRoles,
  customRoles,
}: RoleSummaryCardsProps) {
  const values = {
    total: totalRoles,
    system: systemRoles,
    custom: customRoles,
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
