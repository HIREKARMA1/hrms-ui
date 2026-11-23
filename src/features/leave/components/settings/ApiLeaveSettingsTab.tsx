/**
 * Server Leave Settings: read-only leave types (GET /leave-types) and company
 * entitlement defaults (GET /employee-leave-policies/defaults). The server has
 * no store for the other demo settings (holidays, approval chains, coverage).
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { getLeaveErrorMessage, useListLeavePolicyDefaultsQuery } from '../../api/leaveApi'
import { useLeave } from '../../hooks/useLeave'
import { useLeavePermissions } from '../../hooks/useLeavePermissions'
import { LeaveErrorState } from '../LeaveErrorState'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { LeaveEmptyState } from '../shared/LeaveEmptyState'
import { LeaveInlineLoading, LeaveServerNotice } from '../shared/LeaveServerNotice'
import { LEAVE_TABLE_THEAD } from '../shared/leaveUi'

const TH = 'px-3 py-2 font-semibold'
const TD = 'px-3 py-2'

export function ApiLeaveSettingsTab() {
  const { snapshot } = useLeave()
  const permissions = useLeavePermissions()
  const defaults = useListLeavePolicyDefaultsQuery(undefined, { skip: !permissions.canViewPolicyDefaults })
  const types = snapshot?.api?.leaveTypes ?? []

  return (
    <div className="space-y-6">
      <LeaveTabHeader title="Leave settings" subtitle="Leave types and entitlement defaults configured on the server." />
      <LeaveServerNotice>
        These settings are read-only here. Holidays, approval chains, team coverage and notice rules are not stored by the server yet.
      </LeaveServerNotice>
      <Card>
        <CardHeader className="border-b border-hrms-border pb-3">
          <CardTitle className="text-base font-semibold text-hrms-navy">Leave types</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0 overflow-x-auto p-0">
          {types.length === 0 ? (
            <LeaveEmptyState message="No leave types are configured." />
          ) : (
            <table className="w-full text-left text-xs">
              <thead className={LEAVE_TABLE_THEAD}>
                <tr>
                  {['Code', 'Name', 'Paid', 'Approval', 'Max days', 'Requests', 'Status'].map((head) => (
                    <th key={head} className={TH}>{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {types.map((type) => (
                  <tr key={type.id} className="border-b border-hrms-border/40">
                    <td className={`${TD} font-semibold text-hrms-navy`}>{type.code}</td>
                    <td className={TD}>
                      {type.name}
                      {type.description ? <span className="block text-hrms-text-muted">{type.description}</span> : null}
                    </td>
                    <td className={TD}>{type.isPaid ? 'Paid' : 'Unpaid'}</td>
                    <td className={TD}>{type.requiresApproval ? 'Required' : 'Auto'}</td>
                    <td className={`${TD} tabular-nums`}>{type.maxAllowedDays ?? 'No limit'}</td>
                    <td className={`${TD} tabular-nums`}>{type.requestCount}</td>
                    <td className={TD}>{type.isActive ? 'Active' : 'Inactive'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
      {permissions.canViewPolicyDefaults ? (
        <Card>
          <CardHeader className="border-b border-hrms-border pb-3">
            <CardTitle className="text-base font-semibold text-hrms-navy">Entitlement defaults</CardTitle>
          </CardHeader>
          <CardContent className="min-w-0 overflow-x-auto p-0">
            {defaults.isFetching && !defaults.data ? (
              <div className="px-5"><LeaveInlineLoading label="Loading entitlement defaults…" /></div>
            ) : defaults.isError && !defaults.data ? (
              <LeaveErrorState message={getLeaveErrorMessage(defaults.error, 'Could not load entitlement defaults.')} onRetry={() => void defaults.refetch()} />
            ) : !defaults.data || defaults.data.length === 0 ? (
              <LeaveEmptyState message="No entitlement defaults are configured." />
            ) : (
              <table className="w-full text-left text-xs">
                <thead className={LEAVE_TABLE_THEAD}>
                  <tr>
                    {['Leave type', 'Annual entitlement', 'Monthly accrual', 'Grant mode', 'Status'].map((head) => (
                      <th key={head} className={TH}>{head}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {defaults.data.map((item) => (
                    <tr key={item.id} className="border-b border-hrms-border/40">
                      <td className={TD}>{item.leaveTypeName} ({item.leaveTypeCode})</td>
                      <td className={`${TD} tabular-nums`}>{item.annualEntitlement}</td>
                      <td className={`${TD} tabular-nums`}>{item.monthlyAccrualAmount}</td>
                      <td className={TD}>{item.grantMode === 'MONTHLY_ACCRUAL' ? 'Monthly accrual' : 'Annual grant'}</td>
                      <td className={TD}>{item.isActive ? 'Active' : 'Inactive'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
