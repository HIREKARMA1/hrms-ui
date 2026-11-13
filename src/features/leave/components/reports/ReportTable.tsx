/**
 * Simple report table with optional totals row for HR Reports tab.
 */

import { Card, CardContent } from '@/components/ui/card'

import { LEAVE_TABLE_THEAD } from '../shared/leaveUi'

type ReportTableProps = {
  headers: string[]
  rows: (string | number)[][]
}

export function ReportTable({ headers, rows }: ReportTableProps) {
  const lastHeader = headers[headers.length - 1]
  const numeric = rows.reduce((sum, row) => sum + Number(row[row.length - 1] ?? 0), 0)

  return (
    <Card>
      <CardContent className="min-w-0 overflow-x-auto p-0">
        <table className="w-full min-w-[28rem] text-left text-sm">
          <thead className={LEAVE_TABLE_THEAD}>
            <tr>
              {headers.map((head) => (
                <th key={head} className="px-3 py-2 font-medium">
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-hrms-border/60">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2 tabular-nums text-hrms-navy">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-hrms-border bg-hrms-muted-bg/50 font-semibold">
              <td className="px-3 py-2" colSpan={headers.length - 1}>
                Total {lastHeader?.toLowerCase()}
              </td>
              <td className="px-3 py-2 tabular-nums">{numeric}</td>
            </tr>
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
