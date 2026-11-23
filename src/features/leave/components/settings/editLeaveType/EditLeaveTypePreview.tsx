/**
 * Sticky "What employees will see" preview card in the leave type editor.
 */

import type { LeaveTypePolicy } from '../../../types/leaveSettings'
import { buildEmployeeLeavePreview } from '../../../utils/buildEmployeeLeavePreview'

export function EditLeaveTypePreview({ policy }: { policy: LeaveTypePolicy }) {
  const lines = buildEmployeeLeavePreview(policy)
  return (
    <aside className="lg:sticky lg:top-4">
      <div className="rounded-xl border border-hrms-border bg-hrms-lavender/40 p-4">
        <h4 className="text-sm font-semibold text-hrms-navy">What employees will see</h4>
        <ul className="mt-3 space-y-2 text-sm text-hrms-navy">
          {lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
