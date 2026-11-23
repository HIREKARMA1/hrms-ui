import { useMemo } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

type SourceRow = { name: string; value: number }

const SOURCE_SLICE_COLORS = ['#5938DB', '#3B82F6', '#16A34A', '#F59E0B', '#98A2B3', '#7055EB'] as const

function leadCountLabel(count: number): string {
  return count === 1 ? '1 lead' : `${count} leads`
}

function buildTopSourceInsight(rows: SourceRow[], total: number): string | null {
  if (rows.length === 0 || total === 0) return null
  const top = rows[0]
  const topPct = Math.round((top.value / total) * 100)
  const others = rows.slice(1)
  const allOthersSingle = others.length > 0 && others.every((row) => row.value === 1)

  const base = `Top source: ${top.name} brings in ${topPct}% of leads (${top.value} of ${total}).`
  if (allOthersSingle && others.length > 0) {
    const noun = others.length === 1 ? 'source' : 'sources'
    return `${base} The other ${others.length} ${noun} contribute one lead each.`
  }
  return base
}

export function LeadsSourceDonutCard({ data }: { data: SourceRow[] }) {
  const rows = useMemo(() => (data.length ? [...data] : [{ name: '—', value: 0 }]), [data])
  const total = rows.reduce((sum, row) => sum + row.value, 0)
  const slices = rows.map((row, index) => ({
    ...row,
    color: SOURCE_SLICE_COLORS[index % SOURCE_SLICE_COLORS.length],
    percent: total > 0 ? Math.round((row.value / total) * 100) : 0,
  }))
  const insight = buildTopSourceInsight(rows, total)
  const sourceCount = rows.filter((row) => row.value > 0).length
  const summary = `Leads by source: ${total} leads across ${sourceCount} sources`

  if (total === 0) {
    return <p className="text-sm text-[#667085]">No leads to show by source.</p>
  }

  return (
    <div className="flex flex-col gap-4" aria-label={summary}>
      <div className="relative mx-auto h-40 w-full max-w-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius="58%"
              outerRadius="88%"
              isAnimationActive={false}
              stroke="#FFFFFF"
              strokeWidth={2}
            >
              {slices.map((slice) => (
                <Cell key={slice.name} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
          <span className="text-[11px] font-medium text-[#667085]">Total leads</span>
          <span className="text-2xl font-bold tabular-nums text-[#17213A]">{total}</span>
          <span className="text-[11px] text-[#667085]">
            {sourceCount} {sourceCount === 1 ? 'source' : 'sources'}
          </span>
        </div>
      </div>

      <ul className="space-y-2.5">
        {slices.map((slice) => (
          <li key={slice.name} className="flex items-center justify-between gap-2 text-[13px]">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: slice.color }}
                aria-hidden
              />
              <span className="truncate font-semibold text-[#17213A]">{slice.name}</span>
            </div>
            <span className="shrink-0 tabular-nums text-[#667085]">
              {leadCountLabel(slice.value)}{' '}
              <span className="font-bold text-[#17213A]">{slice.percent}%</span>
            </span>
          </li>
        ))}
      </ul>

      {insight ? (
        <p className="rounded-xl bg-[#F0EDFF] px-3 py-2.5 text-[12.5px] leading-snug text-[#17213A]">
          {insight}
        </p>
      ) : null}

      <table className="sr-only">
        <caption>{summary}</caption>
        <thead>
          <tr>
            <th scope="col">Source</th>
            <th scope="col">Leads</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          {slices.map((slice) => (
            <tr key={slice.name}>
              <td>{slice.name}</td>
              <td>{slice.value}</td>
              <td>{slice.percent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}