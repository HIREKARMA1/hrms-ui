/**
 * Read-only expandable salary revision history for one employee.
 * Used in StructureDetailPanel Revision history tab.
 */

import { useEffect, useState } from 'react'

import { SALARY_COMPONENT_IDS, SALARY_COMPONENT_LABELS } from '../../constants/salaryComponents'
import type { SalaryRevision } from '../../types/salaryStructure'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'

type RevisionHistoryTabProps = {
  employeeId: string
  loadRevisions: (employeeId: string) => Promise<SalaryRevision[]>
}

export function RevisionHistoryTab({ employeeId, loadRevisions }: RevisionHistoryTabProps) {
  const [revisions, setRevisions] = useState<SalaryRevision[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRevisions(employeeId)
      .then(setRevisions)
      .catch((cause: Error) => setError(cause.message))
  }, [employeeId, loadRevisions])

  if (error) {
    return <p className="text-sm text-hrms-danger">{error}</p>
  }

  return (
    <ul className="space-y-3 text-sm">
      {revisions.map((revision) => {
        const change = revision.newGross - revision.previousGross
        const changePct =
          revision.previousGross === 0
            ? 0
            : (change / revision.previousGross) * 100
        const expanded = expandedId === revision.id
        return (
          <li key={revision.id} className="rounded-xl border border-hrms-border p-3">
            <button
              type="button"
              className="w-full text-left"
              aria-expanded={expanded}
              onClick={() => setExpandedId(expanded ? null : revision.id)}
            >
              <p className="font-semibold text-hrms-navy">
                {formatDate(revision.effectiveFrom)} ·{' '}
                {formatCurrency(revision.previousGross)} → {formatCurrency(revision.newGross)}
              </p>
              <p className="text-hrms-text-secondary">
                {change >= 0 ? '+' : ''}
                {formatCurrency(change)} ({changePct.toFixed(1)}%) · {revision.reason}
              </p>
              <p className="text-xs text-hrms-text-muted">
                {revision.changedBy} on {formatDate(revision.changedAt)}
              </p>
            </button>
            {expanded ? (
              <table className="mt-3 w-full text-left text-xs">
                <thead>
                  <tr className="text-hrms-text-muted">
                    <th className="py-1">Component</th>
                    <th className="py-1">Before</th>
                    <th className="py-1">After</th>
                  </tr>
                </thead>
                <tbody>
                  {SALARY_COMPONENT_IDS.map((id) => (
                    <tr key={id} className="border-t border-hrms-border/60">
                      <td className="py-1">{SALARY_COMPONENT_LABELS[id]}</td>
                      <td className="py-1 tabular-nums">
                        {formatCurrency(revision.previousStructure[id])}
                      </td>
                      <td className="py-1 tabular-nums">
                        {formatCurrency(revision.newStructure[id])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}
