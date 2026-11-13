/**
 * Composes leave tabs with demo role switcher and provider-backed panels.
 * Routed from App.tsx at /leave inside MainLayout.
 */

import { LeaveProvider } from '../context/LeaveProvider'
import { useLeave } from '../hooks/useLeave'
import { useLeavePageTabs } from '../hooks/useLeavePageTabs'
import { useLeaveViewer } from '../hooks/useLeaveViewer'
import { LeavePageTabs } from '../components/LeavePageTabs'
import { LeaveDemoViewSelect } from '../components/LeaveDemoViewSelect'
import { LeaveSkeleton } from '../components/LeaveSkeleton'
import { LeaveErrorState } from '../components/LeaveErrorState'
import { MyLeaveTab } from '../components/myLeave/MyLeaveTab'
import { ApprovalsTab } from '../components/approvals/ApprovalsTab'
import { CalendarTab } from '../components/calendar/CalendarTab'
import { BalancesTab } from '../components/balances/BalancesTab'
import { AccrualsTab } from '../components/accruals/AccrualsTab'
import { LeaveSettingsTab } from '../components/settings/LeaveSettingsTab'

function LeavePagePanels() {
  const { loading, error, reload } = useLeave()
  const { viewer, role, setViewerRole } = useLeaveViewer()
  const { activeTab, setActiveTab, onKeyDown, allowedTabs } = useLeavePageTabs(role)

  if (loading) {
    return <LeaveSkeleton />
  }
  if (error) {
    return <LeaveErrorState message={error} onRetry={() => void reload()} />
  }

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-hrms-navy">Leave Management</h1>
          <p className="text-sm text-hrms-text-secondary">
            Signed in as {viewer.displayName} ({viewer.role})
          </p>
        </div>
        <LeaveDemoViewSelect value={role} onChange={setViewerRole} />
      </div>
      <LeavePageTabs tabs={allowedTabs} activeTab={activeTab} onTabChange={setActiveTab} onKeyDown={onKeyDown} />
      <div role="tabpanel" id={`leave-page-panel-${activeTab}`} aria-labelledby={`leave-page-tab-${activeTab}`}>
        {activeTab === 'My Leave' ? <MyLeaveTab viewer={viewer} /> : null}
        {activeTab === 'Approvals' ? <ApprovalsTab viewer={viewer} /> : null}
        {activeTab === 'Calendar' ? <CalendarTab viewer={viewer} /> : null}
        {activeTab === 'Balances' ? <BalancesTab /> : null}
        {activeTab === 'Accruals & Year-End' ? <AccrualsTab /> : null}
        {activeTab === 'Leave Settings' ? <LeaveSettingsTab /> : null}
      </div>
    </div>
  )
}

export function LeavePage() {
  return (
    <LeaveProvider>
      <LeavePagePanels />
    </LeaveProvider>
  )
}

export default LeavePage
