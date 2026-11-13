/**
 * Payroll sections via sidebar URLs and shared demo role (Leave viewer).
 */

import {
  isEmployeeExperience,
  isHrAdminExperience,
  isManagerExperience,
  type UserRole,
} from '@/features/leave/constants/userRoles'
import { useLeaveViewer } from '@/features/leave/hooks/useLeaveViewer'

import { PayrollPageHeader } from '../components/PayrollPageHeader'
import { PayrollErrorState } from '../components/PayrollErrorState'
import { PayrollSkeleton } from '../components/PayrollSkeleton'
import { PayrollOverviewTab } from '../components/overview/PayrollOverviewTab'
import { PayrollSettingsTab } from '../components/settings/PayrollSettingsTab'
import { FinalSettlementTab } from '../components/settlement/FinalSettlementTab'
import { RunPayrollDialog } from '../components/RunPayrollDialog'
import { SalaryStructuresTab } from '../components/structures/SalaryStructuresTab'
import { VariablePayTab } from '../components/variablePay/VariablePayTab'
import { MyPayslipsTab } from '../components/myPayslips/MyPayslipsTab'
import { PayrollPageChrome } from '../components/shared/PayrollPageChrome'
import { PayrollToastProvider } from '../components/PayrollToastProvider'
import { PayrollProvider } from '../context/PayrollProvider'
import { defaultPayrollTabForRole } from '../hooks/usePayrollPageTabs'
import { usePayrollRoute } from '../hooks/usePayrollRoute'
import { usePayroll } from '../hooks/usePayroll'
function PayrollPagePanels() {
  const { loading, error, reload } = usePayroll()
  const { viewer, role, setViewerRole } = useLeaveViewer()
  const { activeTab, goToTab } = usePayrollRoute(role)

  const onRoleChange = (roleNext: UserRole) => {
    setViewerRole(roleNext)
    goToTab(defaultPayrollTabForRole(roleNext))
  }

  if (loading) return <PayrollSkeleton />
  if (error) return <PayrollErrorState message={error} onRetry={reload} />

  return (
    <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-4 overflow-visible">
      <PayrollPageChrome header={<PayrollPageHeader viewer={viewer} role={role} onRoleChange={onRoleChange} />} />
      <section aria-label={activeTab} className="min-h-0 w-full overflow-visible" id={`payroll-page-panel-${activeTab}`}>
        {isEmployeeExperience(role) && activeTab === 'My Payslips' ? <MyPayslipsTab /> : null}
        {isHrAdminExperience(role) || isManagerExperience(role) ? (
          <>
            {activeTab === 'Overview' ? <PayrollOverviewTab /> : null}
            {activeTab === 'Variable Pay' ? <VariablePayTab /> : null}
          </>
        ) : null}
        {isHrAdminExperience(role) ? (
          <>
            {activeTab === 'Salary Structures' ? <SalaryStructuresTab /> : null}
            {activeTab === 'Final Settlement' ? <FinalSettlementTab /> : null}
            {activeTab === 'Payroll Settings' ? <PayrollSettingsTab /> : null}
          </>
        ) : null}
      </section>
      {isHrAdminExperience(role) ? <RunPayrollDialog /> : null}
    </div>
  )
}

export function PayrollPage() {
  return (
    <PayrollToastProvider>
      <PayrollProvider>
        <PayrollPagePanels />
      </PayrollProvider>
    </PayrollToastProvider>
  )
}

export default PayrollPage
