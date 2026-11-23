/**
 * Section heading for grouped fields inside Apply leave dialog.
 */

export function ApplyLeaveSectionTitle({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wide text-hrms-text-muted">{children}</h3>
  )
}
