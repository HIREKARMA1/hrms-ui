/**

 * Department availability bars for today with coverage limit marker.

 */



import { useMemo } from 'react'



import { cn } from '@/lib/utils'



import type { LeaveSnapshot } from '../../services/leaveService'

import { departmentAvailabilityToday } from '../../utils/overviewDeptAvailability'

import { OverviewCard } from './OverviewCard'



type Props = {

  snapshot: LeaveSnapshot

  loading?: boolean

  error?: string | null

  onRetry?: () => void

  onDepartmentSelect: (department: string) => void

}



export function OverviewDeptAvailability({ snapshot, loading, error, onRetry, onDepartmentSelect }: Props) {

  const rows = useMemo(() => departmentAvailabilityToday(snapshot), [snapshot])

  const limit = snapshot.settings.teamCoverage.maxSameDepartmentPerDay

  const maxHead = Math.max(1, ...rows.map((row) => row.headcount))

  const empty = rows.length === 0



  return (

    <OverviewCard title="Department availability" description="On leave today versus active headcount." loading={loading} error={error} onRetry={onRetry} empty={empty} fillHeight skeleton="list">

      <ul className="space-y-3">

        {rows.map((row) => {

          const ratio = row.onLeave / maxHead

          const marker = (limit / maxHead) * 100

          const barClass = row.severity === 'danger' ? 'bg-hrms-danger' : row.severity === 'warn' ? 'bg-hrms-warning' : 'bg-hrms-primary'

          return (

            <li key={row.department}>

              <button

                type="button"

                className="w-full rounded-lg px-1 py-1 text-left hover:bg-hrms-row-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hrms-focus"

                onClick={() => onDepartmentSelect(row.department)}

              >

                <div className="flex items-center justify-between gap-2 text-sm">

                  <span className="font-medium text-hrms-navy">{row.department}</span>

                  <span className="text-xs text-hrms-text-secondary">

                    {row.onLeave} of {row.headcount} · {row.percent}%

                  </span>

                </div>

                <div className="relative mt-1 h-2 w-full overflow-hidden rounded-full bg-hrms-muted-bg">

                  <span className={cn('block h-2 rounded-full', barClass)} style={{ width: `${Math.min(100, ratio * 100)}%` }} />

                  <span className="absolute top-0 h-2 w-0.5 bg-hrms-navy/50" style={{ left: `${Math.min(100, marker)}%` }} title="Coverage limit" />

                </div>

              </button>

            </li>

          )

        })}

      </ul>

      <p className="mt-3 text-[11px] text-hrms-text-muted">Marker = coverage limit ({limit} per department per day)</p>

    </OverviewCard>

  )

}


