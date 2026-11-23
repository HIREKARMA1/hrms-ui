/**

 * Clickable status count cards that filter the employee table.

 * Used on PayrollPage between summary and statutory sections.

 */



import { AlertTriangle, CheckCircle2, Clock3, PauseCircle } from 'lucide-react'



import { Card, CardContent } from '@/components/ui/card'

import { cn } from '@/lib/utils'



import { usePayroll } from '../hooks/usePayroll'

import type { PaymentStatus } from '../types/payroll'



type StatusCardsProps = {

  activeStatus: PaymentStatus | null

  onToggle: (status: PaymentStatus) => void

}



const statusMeta: Record<

  PaymentStatus,

  { icon: typeof CheckCircle2; tile: string }

> = {

  Paid: { icon: CheckCircle2, tile: 'bg-hrms-success/10 text-hrms-success' },

  Pending: { icon: Clock3, tile: 'bg-hrms-warning/10 text-hrms-warning' },

  Failed: { icon: AlertTriangle, tile: 'bg-hrms-danger/10 text-hrms-danger' },

  'On Hold': { icon: PauseCircle, tile: 'bg-hrms-muted-bg text-hrms-text-secondary' },

}



export function StatusCards({ activeStatus, onToggle }: StatusCardsProps) {

  const { summary } = usePayroll()



  return (

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

      {(Object.keys(statusMeta) as PaymentStatus[]).map((status) => {

        const meta = statusMeta[status]

        const Icon = meta.icon

        const isActive = activeStatus === status

        return (

          <button

            key={status}

            type="button"

            onClick={() => onToggle(status)}

            className="rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus"

            aria-pressed={isActive}

          >

            <Card className={cn(isActive && 'border-hrms-primary ring-2 ring-hrms-primary/20')}>

              <CardContent className="flex items-start justify-between gap-3 p-5">

                <div>

                  <p className="text-sm font-medium text-hrms-text-secondary">{status}</p>

                  <p className="mt-2 text-2xl font-bold tabular-nums text-hrms-navy">

                    {summary.statusCounts[status]}

                  </p>

                </div>

                <div

                  className={cn(

                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',

                    meta.tile,

                  )}

                >

                  <Icon className="h-5 w-5" aria-hidden />

                </div>

              </CardContent>

            </Card>

          </button>

        )

      })}

    </div>

  )

}

