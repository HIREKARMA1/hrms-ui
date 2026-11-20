/**

 * HR Admin Overview tab: attention, stats, charts, outlook, and lists.

 */



import { useState } from 'react'

import { Building2, CalendarCheck, Clock, Users } from 'lucide-react'



import { useLeave } from '../../hooks/useLeave'

import { useLeaveViewer } from '../../hooks/useLeaveViewer'

import { isSuperAdminExperience } from '../../constants/userRoles'

import type { HrOverviewNavigate } from '../../context/hrOverviewNavigate'

import type { LeaveTypeCode } from '../../constants/leaveTypeCodes'

import { LEAVE_TYPE_LABELS } from '../../constants/leaveTypeCodes'

import type { OverviewChartRange } from '../../utils/overviewRange'

import { overviewStatSubtitles, overviewStatValues } from '../../utils/overviewStatSubtitles'

import { formatOverviewTodayLabel } from '../../utils/formatOverviewToday'

import { LeaveStatGrid } from '../LeaveStatGrid'

import { LeaveTabHeader } from '../LeaveTabHeader'

import { OverviewAttentionSection } from './OverviewAttentionSection'

import { OverviewSectionHeader } from './OverviewSectionHeader'

import { OverviewRangeControl } from './OverviewRangeControl'

import { OverviewLeaveTrendChart } from './OverviewLeaveTrendChart'

import { OverviewLeaveTypeDonut } from './OverviewLeaveTypeDonut'

import { OverviewOutlook14Strip } from './OverviewOutlook14Strip'

import { OverviewDeptAvailability } from './OverviewDeptAvailability'

import { OverviewWhosAway } from './OverviewWhosAway'

import { OverviewRecentActivity } from './OverviewRecentActivity'

import { OverviewHeaderActions } from './OverviewHeaderActions'

import { LeaveServerNotice } from '../shared/LeaveServerNotice'

import { SuperAdminScopeBanner } from '../superAdmin/SuperAdminScopeBanner'



export function HrOverviewTab({ onNavigate }: { onNavigate: HrOverviewNavigate }) {

  const { snapshot, loading, error, reload } = useLeave()

  const { role } = useLeaveViewer()

  const superAdmin = isSuperAdminExperience(role)

  const [range, setRange] = useState<OverviewChartRange>('last_6_months')

  if (!snapshot && !loading) return null

  const subtitles = snapshot ? overviewStatSubtitles(snapshot) : null

  const values = snapshot ? overviewStatValues(snapshot) : null

  const onRetry = () => void reload()



  return (

    <div className="flex flex-col gap-6">

      {superAdmin ? <SuperAdminScopeBanner onViewAudit={() => onNavigate('Audit')} /> : null}

      <LeaveTabHeader

        title="Overview"

        subtitle={superAdmin ? 'Company-wide leave posture with super admin tools.' : 'What needs attention across leave today.'}

        actions={

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">

            {snapshot ? <OverviewHeaderActions snapshot={snapshot} onNavigate={onNavigate} /> : null}

          </div>

        }

      />

      <p className="-mt-4 text-xs font-medium text-hrms-text-muted">{formatOverviewTodayLabel()}</p>

      {snapshot?.api ? (
        <LeaveServerNotice>
          {snapshot.api.access.requests
            ? `Figures use the ${snapshot.requests.length} most recent of ${snapshot.api.requestTotal} leave requests loaded from the server.`
            : 'You do not have permission to view leave requests across the organisation, so these figures are empty.'}{' '}
          Holidays and balance ledgers are not available from the server yet.
        </LeaveServerNotice>
      ) : null}

      <OverviewAttentionSection snapshot={snapshot} onNavigate={onNavigate} loading={loading} error={error} onRetry={onRetry} />

      <LeaveStatGrid

        items={[

          { label: 'On leave today', value: String(values?.onLeaveToday ?? '—'), detail: subtitles?.onLeaveToday, icon: Users, tone: 'primary' },

          { label: 'Upcoming (7 days)', value: String(values?.upcoming ?? '—'), detail: subtitles?.upcoming, icon: CalendarCheck, tone: 'success' },

          { label: 'Pending requests', value: String(values?.pending ?? '—'), detail: subtitles?.pending, icon: Clock, tone: 'warning' },

          { label: 'Active employees', value: String(values?.active ?? '—'), detail: subtitles?.active, icon: Building2, tone: 'neutral' },

        ]}

      />

      <section className="flex flex-col gap-3">

        <OverviewSectionHeader title="Leave analytics" description="Approved leave in the selected range." aside={<OverviewRangeControl value={range} onChange={setRange} />} id="overview-charts-heading" />

        <div className="grid items-stretch gap-4 min-[700px]:grid-cols-3">

          <div className="min-w-0 min-[700px]:col-span-2">

            {snapshot ? <OverviewLeaveTrendChart snapshot={snapshot} range={range} loading={loading} error={error} onRetry={onRetry} /> : null}

          </div>

          <div className="min-w-0 flex">

            {snapshot ? (

              <OverviewLeaveTypeDonut snapshot={snapshot} range={range} loading={loading} error={error} onRetry={onRetry} onTypeSelect={(code: LeaveTypeCode) => onNavigate('Requests', { segment: 'all', requestsSearch: LEAVE_TYPE_LABELS[code] })} />

            ) : null}

          </div>

        </div>

      </section>

      <section>{snapshot ? <OverviewOutlook14Strip snapshot={snapshot} loading={loading} error={error} onRetry={onRetry} /> : null}</section>

      <section className="grid items-stretch gap-4 min-[700px]:grid-cols-2 min-[1100px]:grid-cols-3">
        <div className="flex h-full min-w-0 min-h-0 flex-col min-[700px]:max-[1099px]:col-span-2 min-[1100px]:col-span-1">
          {snapshot ? <OverviewDeptAvailability snapshot={snapshot} loading={loading} error={error} onRetry={onRetry} onDepartmentSelect={(department) => onNavigate('Calendar', { calendarDepartment: department })} /> : null}
        </div>
        <div className="flex h-full min-w-0 min-h-0 flex-col">
          {snapshot ? <OverviewWhosAway snapshot={snapshot} loading={loading} error={error} onRetry={onRetry} /> : null}
        </div>
        <div className="flex h-full min-w-0 min-h-0 flex-col min-[700px]:col-span-2 min-[1100px]:col-span-1">
          {snapshot ? <OverviewRecentActivity snapshot={snapshot} loading={loading} error={error} onRetry={onRetry} onViewAll={() => onNavigate('Requests', { segment: 'all' })} /> : null}
        </div>
      </section>

    </div>

  )

}


