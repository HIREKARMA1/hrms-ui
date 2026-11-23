import { AlertTriangle, Kanban, Trophy, Users } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { summarizeLeads } from '../../services/leadsService'
import { OVERVIEW_FOCUS, OVERVIEW_KPI_GRID, OVERVIEW_KPI_TILE, OVERVIEW_MOTION } from './leadsOverviewUi'

type LeadsOverviewKpiGridProps = {
  summary: ReturnType<typeof summarizeLeads>
  teamView?: boolean
  onNavigate?: (target: 'high' | 'unassigned' | 'won' | 'all') => void
}

const KPI_ICON_SHELL = {
  all: 'bg-[#F0EDFF] text-[#5938DB]',
  high: 'bg-[#FEF3C7] text-[#B45309]',
  unassigned: 'bg-[#DBEAFE] text-[#1D4ED8]',
  won: 'bg-[#DCFCE7] text-[#15803D]',
} as const

export function LeadsOverviewKpiGrid({
  summary,
  teamView = false,
  onNavigate,
}: LeadsOverviewKpiGridProps) {
  const stats = [
    {
      id: 'all' as const,
      label: teamView ? 'Team leads' : 'Total leads',
      value: summary.total,
      icon: Users,
      shell: KPI_ICON_SHELL.all,
    },
    {
      id: 'high' as const,
      label: 'High priority',
      value: summary.highPriority,
      icon: AlertTriangle,
      shell: KPI_ICON_SHELL.high,
    },
    {
      id: 'unassigned' as const,
      label: 'Unassigned',
      value: summary.unassigned,
      icon: Kanban,
      shell: KPI_ICON_SHELL.unassigned,
    },
    {
      id: 'won' as const,
      label: 'Won',
      value: summary.byStatus.Won ?? 0,
      icon: Trophy,
      shell: KPI_ICON_SHELL.won,
    },
  ]

  return (
    <div className={OVERVIEW_KPI_GRID}>
      {stats.map((stat) => {
        const Icon = stat.icon
        const clickable = Boolean(onNavigate)
        return (
          <button
            key={stat.id}
            type="button"
            disabled={!clickable}
            onClick={() => onNavigate?.(stat.id)}
            className={cn(
              OVERVIEW_KPI_TILE,
              'flex items-center gap-3',
              OVERVIEW_MOTION,
              OVERVIEW_FOCUS,
              clickable && 'cursor-pointer hover:bg-[#F3F4F8]',
              !clickable && 'cursor-default',
            )}
          >
            <div
              className={cn(
                'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                stat.shell,
              )}
              aria-hidden
            >
              <Icon className="h-5 w-5" strokeWidth={1.9} />
            </div>
            <div className="min-w-0 text-left">
              <p className="text-[13px] font-medium text-[#667085]">{stat.label}</p>
              <p className="text-[28px] font-bold tabular-nums leading-tight text-[#17213A]">{stat.value}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}