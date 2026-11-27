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
import type { RecruitmentPipeline } from '../api/analyticsApi.types'
import { APPLICATION_STATUSES } from '../api/applicationsApi.types'
import { formatApplicationStatus } from '../utils/applicationFormat'
import { STAGE_BAR_FILL } from '../utils/pipelineStageStyle'

import { RECRUITMENT_CARD } from './shared/recruitmentUi'

const PIE_COLORS = ['#0F766E', '#7C5CFC', '#A78BFA', '#C4B5FD', '#DDD6FE']

export function PipelineFunnelChart({ pipeline }: { pipeline: RecruitmentPipeline }) {
  const counts = new Map(pipeline.stages.map((s) => [s.status, s.count]))
  const data = APPLICATION_STATUSES.filter(
    (s) => s !== 'REJECTED' && s !== 'WITHDRAWN',
  ).map((status) => ({
    stage: formatApplicationStatus(status),
    status,
    count: counts.get(status) ?? 0,
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
                    key={row.status}
                    fill={STAGE_BAR_FILL[row.status]}
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
                fill="#0F766E"
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
                stroke="#0F766E"
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
