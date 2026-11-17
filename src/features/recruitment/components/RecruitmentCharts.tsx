import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

import {
  candidateSources,
  monthlyApplications,
} from '../mocks/recruitmentMocks'
import type { Candidate } from '../types/recruitment'
import { PIPELINE_STAGES } from '../utils/pipeline'
import { STAGE_BAR_FILL } from '../utils/pipelineStageStyle'

import { RECRUITMENT_CARD } from './shared/recruitmentUi'

const PIE_COLORS = ['#5938DB', '#7C5CFC', '#A78BFA', '#C4B5FD', '#DDD6FE']

export function PipelineFunnelChart({ candidates }: { candidates: Candidate[] }) {
  const data = PIPELINE_STAGES.filter((s) => s !== 'Rejected').map((stage) => ({
    stage,
    count: candidates.filter((c) => c.stage === stage).length,
  }))

  return (
    <Card className={cn('h-full shadow-none', RECRUITMENT_CARD)}>
      <CardHeader className="border-b border-[#E2E6EF] bg-[#FAFBFD]">
        <CardTitle>Recruitment Pipeline Funnel</CardTitle>
        <CardDescription>Candidates by hiring stage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E6EF" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="stage"
                width={110}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#667085', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E6EF' }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={18}>
                {data.map((row) => (
                  <Cell
                    key={row.stage}
                    fill={STAGE_BAR_FILL[row.stage as keyof typeof STAGE_BAR_FILL]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function MonthlyApplicationsChart() {
  return (
    <Card className={cn('h-full shadow-none', RECRUITMENT_CARD)}>
      <CardHeader className="border-b border-[#E2E6EF] bg-[#FAFBFD]">
        <CardTitle>Applications Received Monthly</CardTitle>
        <CardDescription>Mock trend for the last six months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyApplications}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E6EF" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#667085', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#667085', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E6EF' }}
              />
              <Bar
                dataKey="applications"
                fill="#5938DB"
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function HiringTrendsChart() {
  const data = monthlyApplications.map((row, index) => ({
    month: row.month,
    hired: Math.max(2, Math.round(row.applications / 12) - (index % 2)),
    offers: Math.max(3, Math.round(row.applications / 10)),
  }))

  return (
    <Card className={cn('h-full shadow-none', RECRUITMENT_CARD)}>
      <CardHeader className="border-b border-[#E2E6EF] bg-[#FAFBFD]">
        <CardTitle>Hiring Trends</CardTitle>
        <CardDescription>Offers vs joined (mock)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E6EF" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#667085', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#667085', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E6EF' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="offers"
                stroke="#5938DB"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="hired"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function CandidateSourceChart() {
  return (
    <Card className={cn('h-full shadow-none', RECRUITMENT_CARD)}>
      <CardHeader className="border-b border-[#E2E6EF] bg-[#FAFBFD]">
        <CardTitle>Candidate Source Distribution</CardTitle>
        <CardDescription>Where applicants originate (mock)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={candidateSources}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {candidateSources.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #E2E6EF' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
