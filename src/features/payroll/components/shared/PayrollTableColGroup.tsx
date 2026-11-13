/**
 * Renders colgroup widths for table-fixed payroll tables.
 * Used with PAYROLL_TABLE_WIDTHS from payrollTableLayout.ts.
 */

type PayrollTableColGroupProps = {
  widths: readonly string[]
}

export function PayrollTableColGroup({ widths }: PayrollTableColGroupProps) {
  return (
    <colgroup>
      {widths.map((width, index) => (
        <col key={`${width}-${index}`} style={{ width }} />
      ))}
    </colgroup>
  )
}
