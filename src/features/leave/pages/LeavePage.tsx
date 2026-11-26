/**

 * Composes leave sections with demo role switcher and provider-backed panels.

 * Section nav via sidebar URLs (/leave, /leave/requests, …).

 */



import { useSearchParams, useLocation } from 'react-router-dom'

import { AccessDeniedPage } from '@/features/rbac/components/AccessDeniedPage'
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'

import { leaveTabFeature } from '../constants/leaveTabFeatures'



import type { HrRequestsSegment } from '../context/leavePageNavTypes'

import { LeaveProvider } from '../context/LeaveProvider'

import { LeavePageNavProvider } from '../context/LeavePageNavProvider'

import { useLeave } from '../hooks/useLeave'

import { useLeaveRoute } from '../hooks/useLeaveRoute'

import { useLeaveViewer } from '../hooks/useLeaveViewer'

import {
  isEmployeeExperience,
  isHrAdminExperience,
  isManagerExperience,
  isSuperAdminExperience,
} from '../constants/userRoles'
import { resolveCalendarScope } from '../utils/resolveCalendarScope'

import { consumeLeaveSettingsGuard } from '../hooks/leaveSettingsUnsavedBridge'

import type { LeavePageTabId } from '../hooks/useLeavePageTabs'

import { tabsForRole } from '../hooks/useLeavePageTabs'

import { LeavePageHeader } from '../components/LeavePageHeader'

import { LeavePageChrome } from '../components/shared/LeavePageChrome'

import { LeaveSkeleton } from '../components/LeaveSkeleton'

import { LeaveErrorState } from '../components/LeaveErrorState'

import { LeaveToastProvider } from '../components/LeaveToastProvider'

import { MyLeaveTab } from '../components/myLeave/MyLeaveTab'

import { ApprovalsTab } from '../components/approvals/ApprovalsTab'
import { EmployeeApprovalsTab } from '../components/approvals/EmployeeApprovalsTab'

import { CalendarTab } from '../components/calendar/CalendarTab'

import { BalancesTab } from '../components/balances/BalancesTab'

import { AccrualsTab } from '../components/accruals/AccrualsTab'

import { LeaveSettingsTab } from '../components/settings/LeaveSettingsTab'

import { HrOverviewTab } from '../components/overview/HrOverviewTab'

import { HrRequestsTab } from '../components/hrRequests/HrRequestsTab'

import { ReportsTab } from '../components/reports/ReportsTab'

import { AuditTab } from '../components/superAdmin/AuditTab'

import { AccessTab } from '../components/superAdmin/AccessTab'



function LeavePagePanels() {

  const { loading, error, reload } = useLeave()

  const { viewer, role, setViewerRole } = useLeaveViewer()

  const { activeTab, goToTab } = useLeaveRoute(role)

  const { canAccess } = useOptionalFeatureAccess()

  const [searchParams] = useSearchParams()

  const location = useLocation()



  const requestsSegment = (searchParams.get('segment') as HrRequestsSegment | null) ?? 'action'

  const requestsSearch = searchParams.get('q') ?? ''

  const calendarDepartment = searchParams.get('department') ?? undefined

  const accrualConfirm = searchParams.get('accrual') === 'confirm'

  const panelNavKey = `${location.pathname}?${searchParams.toString()}`



  function tryLeaveSettings(next: () => void) {

    const guard = consumeLeaveSettingsGuard()

    if (activeTab === 'Leave Settings' && guard?.isDirty && !guard.promptConfirm()) return

    next()

  }



  const onTabNavigate = (tab: LeavePageTabId, opts?: Parameters<typeof goToTab>[1]) =>

    tryLeaveSettings(() => goToTab(tab, opts))



  const onRoleChange = (roleNext: Parameters<typeof setViewerRole>[0]) => {

    tryLeaveSettings(() => {

      setViewerRole(roleNext)

      const defaultTab = tabsForRole(roleNext)[0]

      goToTab(defaultTab)

    })

  }



  // Same rule as the sidebar child for this tab: the role-specific tab list
  // still decides which tabs exist, and the tab's backend permission must
  // also be held (e.g. Approvals needs leaves:approve, not just leaves:read).
  const tabFeature = leaveTabFeature(activeTab)
  if (tabFeature && !canAccess(tabFeature)) {
    return <AccessDeniedPage featureLabel={`Leave: ${activeTab}`} />
  }

  if (loading) return <LeaveSkeleton />

  if (error) return <LeaveErrorState message={error} onRetry={() => void reload()} />



  return (

    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 overflow-x-hidden">

      <LeavePageChrome header={<LeavePageHeader viewer={viewer} role={role} onRoleChange={onRoleChange} />} />

      <section

        id={`leave-page-panel-${activeTab}`}

        aria-label={activeTab}

        className="relative z-0 min-w-0 space-y-6"

      >

        {isHrAdminExperience(role) ? (

          <>

            {activeTab === 'Overview' ? <HrOverviewTab onNavigate={onTabNavigate} /> : null}

            {activeTab === 'Requests' ? (

              <HrRequestsTab

                key={panelNavKey}

                viewer={viewer}

                initialSegment={requestsSegment}

                initialSearch={requestsSearch}

              />

            ) : null}

            {activeTab === 'Calendar' ? (

              <CalendarTab
                key={panelNavKey}
                viewer={viewer}
                initialDepartment={calendarDepartment}
                scope={resolveCalendarScope(role)}
              />

            ) : null}

            {activeTab === 'Balances' ? <BalancesTab /> : null}

            {activeTab === 'Accruals & Year-End' ? (

              <AccrualsTab key={panelNavKey} openAccrualConfirm={accrualConfirm} />

            ) : null}

            {activeTab === 'Reports' ? <ReportsTab /> : null}

            {activeTab === 'Leave Settings' ? <LeaveSettingsTab /> : null}

            {activeTab === 'My Leave' ? <MyLeaveTab viewer={viewer} /> : null}

            {isSuperAdminExperience(role) && activeTab === 'Audit' ? <AuditTab /> : null}

            {isSuperAdminExperience(role) && activeTab === 'Access' ? <AccessTab /> : null}

          </>

        ) : (

          <>

            {activeTab === 'My Leave' ? <MyLeaveTab viewer={viewer} /> : null}

            {isManagerExperience(role) && activeTab === 'Approvals' ? <ApprovalsTab viewer={viewer} /> : null}

            {isEmployeeExperience(role) && activeTab === 'Approvals' ? <EmployeeApprovalsTab viewer={viewer} /> : null}

            {activeTab === 'Calendar' ? (
              <CalendarTab
                key={panelNavKey}
                viewer={viewer}
                initialDepartment={calendarDepartment}
                scope={resolveCalendarScope(role)}
              />
            ) : null}

          </>

        )}

      </section>

    </div>

  )

}



export function LeavePage() {

  return (

    <LeaveProvider>

      <LeavePageNavProvider>

        <LeaveToastProvider>

          <LeavePagePanels />

        </LeaveToastProvider>

      </LeavePageNavProvider>

    </LeaveProvider>

  )

}



export default LeavePage

