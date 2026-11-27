/**
 * Daily attendance series line chart from analytics API.
 */

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type ChartPoint = {
  label: string
  present: number
  absent: number
  onLeave: number
  late: number
}

type Props = {
  chartData: ChartPoint[]
  isFetching: boolean
  yMaxHint?: number
}

export function AttendanceAnalyticsChart({ chartData, isFetching, yMaxHint }: Props) {
  if (chartData.length === 0) {
    return <p className="text-sm text-text-secondary">No attendance series for this period.</p>
  }

  const yMax = yMaxHint && yMaxHint > 0 ? Math.max(yMaxHint, 1) : undefined

  return (
    <div>
      <p className="mb-2 text-xs text-text-secondary">Per day (each line is a daily count)</p>
      <div className={`h-64 w-full min-w-0 ${isFetching ? 'opacity-70' : ''}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E6EF" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#667085', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              domain={yMax ? [0, yMax] : [0, 'auto']}
              tick={{ fill: '#667085', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #E2E6EF',
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="present" name="Present" stroke="#16A34A" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="absent" name="Absent" stroke="#EF4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="onLeave" name="On leave" stroke="#3B82F6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="late" name="Late" stroke="#F59E0B" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}