import { Activity, AlertTriangle, Filter, GitBranch } from 'lucide-react'

import type { UserRole } from '@/features/leave/constants/userRoles'
import {
  isEmployeeExperience,
  isHrAdminExperience,
  isManagerExperience,
  isSuperAdminExperience,
} from '@/features/leave/constants/userRoles'

import type { LeadsListScope } from '../../constants/leadsDemoActor'
import type { LeadsPageTabId } from '../../hooks/useLeadsPageTabs'
import { useLeadsScope } from '../../hooks/useLeadsScope'
import { summarizeLeads } from '../../services/leadsService'
import {
  buildLeadSourceBreakdown,
  buildLeadStatusFunnel,
  countDuplicatePairs,
  leadsNeedingAttention,
  recentLeadActivities,
} from '../../utils/leadsOverviewInsights'
import { LeadsNeedsAttentionList } from './LeadsNeedsAttentionList'
import { LeadsOverviewCard } from './LeadsOverviewCard'
import { LeadsPipelineFunnelCard } from './LeadsOverviewCharts'
import { LeadsSourceDonutCard } from './LeadsSourceDonutCard'
import { LeadsOverviewHero } from './LeadsOverviewHero'
import { LeadsOverviewKpiGrid } from './LeadsOverviewKpiGrid'
import { LeadsOverviewQuickActions } from './LeadsOverviewQuickActions'
import { LeadsRecentActivityList } from './LeadsRecentActivityList'
import { LeadsStatusSnapshot } from './LeadsStatusSnapshot'
import { OVERVIEW_PAGE_INNER, OVERVIEW_PAGE_SHELL } from './leadsOverviewUi'

type LeadsOverviewTabProps = {
  role: UserRole
  onNavigate?: (tab: LeadsPageTabId) => void
  onOpenCreate?: () => void
  onOpenLead?: (leadId: string) => void
}

export function LeadsOverviewTab({
  role,
  onNavigate,
  onOpenCreate,
  onOpenLead,
}: LeadsOverviewTabProps) {
  const scope: LeadsListScope = isEmployeeExperience(role)
    ? 'my'
    : isManagerExperience(role)
      ? 'team'
      : 'org'
  const { scopedLeads } = useLeadsScope(role, scope)
  const summary = summarizeLeads(scopedLeads)
  const funnel = buildLeadStatusFunnel(scopedLeads)
  const sources = buildLeadSourceBreakdown(scopedLeads)
  const attention = leadsNeedingAttention(scopedLeads)
  const activity = recentLeadActivities(scopedLeads, 10)
  const duplicateCount = countDuplicatePairs(scopedLeads)
  const showAdmin = isHrAdminExperience(role) || isSuperAdminExperience(role)
  const teamView = isManagerExperience(role)
  const recentLeads = [...scopedLeads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return (
    <div className={OVERVIEW_PAGE_SHELL}>
      <div className={OVERVIEW_PAGE_INNER}>
        <LeadsOverviewHero>
          <LeadsOverviewKpiGrid
            summary={summary}
            teamView={teamView}
            onNavigate={
              onNavigate
                ? (target) => {
                    if (target === 'all') {
                      onNavigate(showAdmin ? 'All Leads' : 'Team Leads')
                      return
                    }
                    onNavigate(showAdmin ? 'All Leads' : 'My Leads')
                  }
                : undefined
            }
          />
          {onNavigate ? (
            <LeadsOverviewQuickActions
              duplicateCount={showAdmin ? duplicateCount : 0}
              showAdminLinks={showAdmin}
              onCreate={onOpenCreate}
              onNavigate={onNavigate}
            />
          ) : null}
        </LeadsOverviewHero>

        <LeadsStatusSnapshot
          counts={summary.byStatus}
          onOpenPipeline={onNavigate ? () => onNavigate('Pipeline') : undefined}
        />

        <div className="grid items-stretch gap-5 min-[900px]:grid-cols-2">
          <LeadsOverviewCard
            variant="overview"
            icon={AlertTriangle}
            iconVariant="overview-amber"
            title="Needs attention"
            subtitle="Unassigned or stale high-priority leads"
            className="h-full"
            bodyClassName="p-0"
          >
            <LeadsNeedsAttentionList
              leads={attention}
              fallbackLeads={recentLeads}
              onOpenLead={(id) => onOpenLead?.(id)}
              onViewAll={onNavigate ? () => onNavigate(showAdmin ? 'All Leads' : 'Team Leads') : undefined}
              onCreate={onOpenCreate}
            />
          </LeadsOverviewCard>

          <LeadsOverviewCard
            variant="overview"
            icon={GitBranch}
            title="Pipeline funnel"
            subtitle="Active stages only"
            className="h-full"
          >
            <LeadsPipelineFunnelCard
              data={funnel}
              wonCount={summary.byStatus.Won ?? 0}
              lostCount={summary.byStatus.Lost ?? 0}
              onStatusClick={() => onNavigate?.('Pipeline')}
            />
          </LeadsOverviewCard>
        </div>

        <div className="grid min-h-0 items-stretch gap-5 min-[900px]:grid-cols-3">
          <LeadsOverviewCard
            variant="overview"
            icon={Activity}
            title="Recent activity"
            subtitle="Latest updates across leads"
            className="h-full min-h-0 min-[900px]:col-span-2"
            bodyClassName="flex min-h-0 flex-col"
          >
            <LeadsRecentActivityList items={activity} onOpenLead={(id) => onOpenLead?.(id)} />
          </LeadsOverviewCard>

          <LeadsOverviewCard
            variant="overview"
            icon={Filter}
            title="Leads by source"
            subtitle="Share of pipeline"
            className="h-full min-h-0"
          >
            <LeadsSourceDonutCard data={sources} />
          </LeadsOverviewCard>
        </div>
      </div>
    </div>
  )
}