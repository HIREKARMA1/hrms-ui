type ApplyLeaveBalanceStripProps = {
  available: number | null
  used?: number
  pending?: number
}

export function ApplyLeaveBalanceStrip({ available, used, pending }: ApplyLeaveBalanceStripProps) {
  if (available === null) return null
  const showBreakdown = used !== undefined && pending !== undefined
  return (
    <div
      className="flex flex-wrap gap-x-4 gap-y-1 rounded-lg border border-hrms-border/80 bg-hrms-muted-bg/60 px-3 py-2 text-xs text-hrms-text-secondary"
      role="status"
    >
      <span>
        <span className="font-medium text-hrms-navy">Available</span>{' '}
        <span className="tabular-nums">{available}</span>
      </span>
      {showBreakdown ? (
        <>
          <span>
            <span className="font-medium text-hrms-navy">Used</span>{' '}
            <span className="tabular-nums">{used}</span>
          </span>
          <span>
            <span className="font-medium text-hrms-navy">Pending</span>{' '}
            <span className="tabular-nums">{pending}</span>
          </span>
        </>
      ) : null}
    </div>
  )
}