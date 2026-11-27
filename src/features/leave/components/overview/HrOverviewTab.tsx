/**
 * HR Admin Overview tab: attention, stats, charts, outlook, and lists.
 */

import { useState } from 'react'

import { Building2, CalendarCheck, Clock, Users } from 'lucide-react'

import { useLeave } from '../../hooks/useLeave'
import { useLeaveOverviewLive } from '../../hooks/useLeaveOverviewLive'
import { useLeaveOverviewAttention } from '../../hooks/useLeaveOverviewAttention'
import { useLeaveOverviewRecentActivity } from '../../hooks/useLeaveOverviewRecentActivity'
import { useLeaveViewer } from '../../hooks/useLeaveViewer'
import { isSuperAdminExperience } from '../../constants/userRoles'
import type { HrOverviewNavigate } from '../../context/hrOverviewNavigate'
import type { LeaveTypeCode } from '../../constants/leaveTypeCodes'
import { LEAVE_TYPE_LABELS } from '../../constants/leaveTypeCodes'
import type { OverviewChartRange } from '../../utils/overviewRange'
import { overviewStatSubtitles, overviewStatValues } from '../../utils/overviewStatSubtitles'
import { whosAwayTodayFromOnLeave } from '../../utils/overviewWhosAwayFromOnLeave'
import { LeaveStatGrid } from '../LeaveStatGrid'
import { OverviewAttentionSection } from './OverviewAttentionSection'
import { OverviewSectionHeader } from './OverviewSectionHeader'
import { OverviewRangeControl } from './OverviewRangeControl'
import { OverviewLeaveTrendChart } from './OverviewLeaveTrendChart'
import { OverviewLeaveTypeDonut } from './OverviewLeaveTypeDonut'
import { OverviewLeaveTypeDonutLive } from './OverviewLeaveTypeDonutLive'
import { OverviewOutlook14Strip } from './OverviewOutlook14Strip'
import { OverviewDeptAvailability } from './OverviewDeptAvailability'
import { OverviewWhosAway } from './OverviewWhosAway'
import { OverviewRecentActivity } from './OverviewRecentActivity'
import { OverviewHeaderActions } from './OverviewHeaderActions'
import { OverviewPageHeader } from './OverviewPageHeader'
import { OverviewErrorAlert } from './OverviewErrorAlert'
import { SuperAdminScopeBanner } from '../superAdmin/SuperAdminScopeBanner'
import { OV_PAGE } from './overviewVisual'

function safeStatDetail(detail: string | undefined, fallback: string): string {
  if (!detail) return fallback
  return detail.replace(/\bundefined\b/g, '0')
}

export function HrOverviewTab({ onNavigate }: { onNavigate: HrOverviewNavigate }) {
  const { snapshot, loading, error, reload } = useLeave()
  const { role } = useLeaveViewer()
  const superAdmin = isSuperAdminExperience(role)
  const [range, setRange] = useState<OverviewChartRange>('last_6_months')
  const [infoOpen, setInfoOpen] = useState(false)
  const serverMode = Boolean(snapshot?.api)
  const live = useLeaveOverviewLive({ enabled: serverMode, range, snapshot })
  const attention = useLeaveOverviewAttention({ enabled: serverMode, snapshot })
  const recentActivity = useLeaveOverviewRecentActivity({ enabled: serverMode, snapshot })

  if (!snapshot && !loading) return null

  const subtitles = snapshot ? overviewStatSubtitles(snapshot) : null
  const values = snapshot ? overviewStatValues(snapshot) : null
  const onRetry = () => void reload()
  const liveStats = live.active && live.stats ? live.stats : null

  const statItems = [
    {
      label: 'On leave today',
      value: String(liveStats?.onLeaveToday ?? values?.onLeaveToday ?? '—'),
      detail: safeStatDetail(liveStats?.onLeaveSubtitle ?? subtitles?.onLeaveToday, 'from leave dashboard'),
      icon: Users,
      tone: 'primary' as const,
    },
    {
      label: 'Upcoming (7 days)',
      value: String(liveStats?.upcoming ?? values?.upcoming ?? '—'),
      detail: safeStatDetail(liveStats?.upcomingSubtitle ?? subtitles?.upcoming, 'starting in the next 7 days'),
      icon: CalendarCheck,
      tone: 'success' as const,
    },
    {
      label: 'Pending requests',
      value: String(liveStats?.pending ?? values?.pending ?? 0),
      detail: safeStatDetail(
        liveStats?.pendingSubtitle ?? subtitles?.pending,
        '0 overlapping this leave year',
      ),
      icon: Clock,
      tone: 'warning' as const,
    },
    {
      label: 'Active employees',
      value: String(liveStats?.active ?? values?.active ?? '—'),
      detail: safeStatDetail(liveStats?.activeSubtitle ?? subtitles?.active, '0 on probation'),
      icon: Building2,
      tone: 'neutral' as const,
    },
  ]

  const liveTodayRows =
    live.active && live.canLeaveAnalytics ? whosAwayTodayFromOnLeave(live.onLeaveTodayItems) : undefined

  const infoContent = snapshot?.api ? (
    <>
      Overview panels use dashboard, calendar, approval, and balance APIs where your role allows. Personal
      balance ledgers and comp-off are not stored on the server. Year-end and encashment notices use loaded
      leave data.
    </>
  ) : null

  return (
    <div className={OV_PAGE}>
      {superAdmin ? <SuperAdminScopeBanner onViewAudit={() => onNavigate('Audit')} /> : null}

      <OverviewPageHeader
        superAdminSubtitle={superAdmin}
        infoOpen={infoOpen}
        onToggleInfo={() => setInfoOpen((open) => !open)}
        infoContent={infoContent}
        actions={snapshot ? <OverviewHeaderActions snapshot={snapshot} onNavigate={onNavigate} /> : null}
      />

      <OverviewAttentionSection
        snapshot={snapshot}
        onNavigate={onNavigate}
        loading={loading}
        error={error}
        onRetry={onRetry}
        attentionSummary={serverMode ? attention.summary : undefined}
        attentionLoading={serverMode ? attention.loading : undefined}
        attentionError={serverMode ? attention.error : undefined}
        onRetryAttention={() => void attention.refetch()}
      />

      {live.active && live.statsError ? (
        <OverviewErrorAlert message={live.statsError} onRetry={() => void live.refetchStats()} />
      ) : null}

      <LeaveStatGrid items={statItems} loading={live.active ? live.statsLoading : loading} chrome="overview" />

      <section className="flex flex-col gap-4">
        <OverviewSectionHeader
          title="Leave analytics"
          description="Approved leave in the selected range."
          aside={<OverviewRangeControl value={range} onChange={setRange} />}
          id="overview-charts-heading"
        />
        <div className="grid items-stretch gap-4 min-[980px]:grid-cols-[2fr_1fr]">
          <div className="min-w-0">
            {live.active && live.canLeaveAnalytics ? (
              <OverviewLeaveTrendChart
                range={range}
                live={live.trend}
                legendOverride={{ PL: 'Approved leave days' }}
                loading={live.chartsLoading}
                error={live.chartsError}
                onRetry={() => void live.refetchCharts()}
              />
            ) : snapshot ? (
              <OverviewLeaveTrendChart
                snapshot={snapshot}
                range={range}
                loading={loading}
                error={error}
                onRetry={onRetry}
              />
            ) : null}
          </div>
          <div className="min-w-0 flex">
            {live.active && live.canLeaveAnalytics ? (
              <OverviewLeaveTypeDonutLive
                range={range}
                slices={live.donut.slices}
                totalDays={live.donut.totalDays}
                loading={live.chartsLoading}
                error={live.chartsError}
                onRetry={() => void live.refetchCharts()}
                onTypeSelect={(search) => onNavigate('Requests', { segment: 'all', requestsSearch: search })}
              />
            ) : snapshot ? (
              <OverviewLeaveTypeDonut
                snapshot={snapshot}
                range={range}
                loading={loading}
                error={error}
                onRetry={onRetry}
                onTypeSelect={(code: LeaveTypeCode) =>
                  onNavigate('Requests', { segment: 'all', requestsSearch: LEAVE_TYPE_LABELS[code] })
                }
              />
            ) : null}
          </div>
        </div>
      </section>

      <section>
        {snapshot ? (
          <OverviewOutlook14Strip
            snapshot={snapshot}
            loading={live.orgWideCalendar ? live.outlookLoading : loading}
            error={live.orgWideCalendar ? live.outlookError : error}
            onRetry={live.orgWideCalendar ? () => void live.refetchOutlook() : onRetry}
            liveCells={live.orgWideCalendar ? live.outlook14Cells : null}
            liveCalendarItems={live.orgWideCalendar ? live.calendarItems : undefined}
            liveTypeCodeById={live.orgWideCalendar ? live.typeCodeById : undefined}
          />
        ) : null}
      </section>

      <section className="grid items-stretch gap-4 min-[980px]:grid-cols-3">
        <div className="flex h-full min-w-0 min-h-0 flex-col">
          {live.active && (live.canStats || live.canLeaveAnalytics) ? (
            <OverviewDeptAvailability
              liveRows={live.deptRows}
              coverageLimit={live.coverageLimit}
              loading={live.deptLoading}
              error={live.deptError}
              onRetry={() => void live.refetchDept()}
              onDepartmentSelect={(department) => onNavigate('Calendar', { calendarDepartment: department })}
            />
          ) : snapshot ? (
            <OverviewDeptAvailability
              snapshot={snapshot}
              loading={loading}
              error={error}
              onRetry={onRetry}
              onDepartmentSelect={(department) => onNavigate('Calendar', { calendarDepartment: department })}
            />
          ) : null}
        </div>
        <div className="flex h-full min-w-0 min-h-0 flex-col">
          {snapshot ? (
            <OverviewWhosAway
              snapshot={snapshot}
              loading={loading}
              error={error}
              onRetry={onRetry}
              liveTodayRows={liveTodayRows}
              liveTodayLoading={live.onLeaveTodayLoading}
              liveTodayError={live.onLeaveTodayError}
              onRetryLiveToday={() => void live.refetchOnLeaveToday()}
              whosAwayFromCalendar={live.orgWideCalendar ? live.whosAwayFromCalendar : undefined}
              calendarWindowLoading={live.calendarWindowLoading}
              calendarWindowError={live.calendarWindowError}
              onRetryCalendarWindow={() => void live.refetchCalendarWindow()}
            />
          ) : null}
        </div>
        <div className="flex h-full min-w-0 min-h-0 flex-col min-[980px]:col-span-1">
          {snapshot ? (
            <OverviewRecentActivity
              snapshot={recentActivity.activitySnapshot ?? snapshot}
              items={serverMode ? recentActivity.items : undefined}
              loading={serverMode ? recentActivity.loading : loading}
              error={serverMode ? recentActivity.error : error}
              onRetry={serverMode ? () => void recentActivity.refetch() : onRetry}
              description={serverMode ? recentActivity.scopeNote : undefined}
              onViewAll={() => onNavigate('Requests', { segment: 'all' })}
            />
          ) : null}
        </div>
      </section>
    </div>
  )
}