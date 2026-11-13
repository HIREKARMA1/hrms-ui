/**
 * Super Admin audit log for leave settings and batch job history.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useLeave } from '../../hooks/useLeave'
import { superAdminAuditInsights } from '../../utils/superAdminAuditInsights'
import { LeaveTabHeader } from '../LeaveTabHeader'
import { HistorySettingsSection } from '../settings/sections/HistorySettingsSection'
import { AuditTabOverview } from './AuditTabOverview'

export function AuditTab() {
  const { snapshot } = useLeave()
  if (!snapshot) return null

  const insights = superAdminAuditInsights(snapshot)

  return (
    <div className="space-y-6">
      <LeaveTabHeader
        title="Audit"
        subtitle="Append-only history of saved leave policy changes and demo batch runs."
      />
      <AuditTabOverview insights={insights} />
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-hrms-navy">Settings change log</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <HistorySettingsSection />
        </CardContent>
      </Card>
      {(snapshot.accrualRuns.length > 0 || snapshot.yearEndRuns.length > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-hrms-navy">Recorded batch jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0 text-sm text-hrms-text-secondary">
            {snapshot.accrualRuns.length > 0 ? (
              <p>
                <span className="font-medium text-hrms-navy">Accrual runs: </span>
                {snapshot.accrualRuns.join(', ')}
              </p>
            ) : null}
            {snapshot.yearEndRuns.length > 0 ? (
              <p>
                <span className="font-medium text-hrms-navy">Year-end runs: </span>
                {snapshot.yearEndRuns.join(', ')}
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
