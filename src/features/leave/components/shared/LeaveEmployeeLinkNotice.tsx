/**
 * Shown where personal records are needed but the signed-in account has no
 * known employee record (the session API does not return one yet).
 */

export function LeaveEmployeeLinkNotice({ what = 'personal leave details' }: { what?: string }) {
  return (
    <div
      role="status"
      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      Your account is not linked to an employee record here yet, so {what} cannot be shown.
    </div>
  )
}
