import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  Handshake,
  Percent,
  RefreshCw,
  UserCheck,
  UserMinus,
  Users,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/services/api/errors'

import {
  useGetRecruitmentAnalyticsQuery,
  useGetRecruitmentPipelineQuery,
} from '../api/analyticsApi'
import {
  CandidateSourceChart,
  HiringTrendsChart,
  PipelineFunnelChart,
  RecruitmentPageShell,
  SummaryStatCards,
} from '../components'
import { RECRUITMENT_CARD } from '../components/shared/recruitmentUi'

export function RecruitmentAnalyticsPage() {
  const analytics = useGetRecruitmentAnalyticsQuery()
  const pipeline = useGetRecruitmentPipelineQuery()

  const refetch = () => {
    void analytics.refetch()
    void pipeline.refetch()
  }

  const metrics = analytics.data
  const stats = metrics
    ? [
        { label: 'Shortlisted', value: metrics.shortlisted, icon: UserCheck },
        { label: 'Joined', value: metrics.joined, icon: CheckCircle2 },
        { label: 'Rejected', value: metrics.raw.rejected as number ?? 0, icon: UserMinus },
        { label: 'Offers released', value: metrics.offersReleased, icon: Handshake },
        { label: 'Interviews', value: metrics.interviewsScheduled, icon: Clock3 },
        { label: 'Applications', value: metrics.totalApplications, icon: FileCheck2 },
        { label: 'Candidates', value: metrics.totalCandidates, icon: Users },
        {
          label: 'Conversion %',
          value: metrics.conversionRate ?? 0,
          icon: Percent,
        },
      ]
    : []

  return (
    <RecruitmentPageShell
      activeSection="Analytics"
      trailing={
        <Button type="button" variant="outline" onClick={refetch}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      }
    >
      {analytics.isError || pipeline.isError ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {getApiErrorMessage(analytics.error ?? pipeline.error, 'Could not load analytics.')}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={refetch}>
            Retry
          </Button>
        </div>
      ) : null}

      {analytics.isLoading ? <Skeleton className="mb-4 h-24 w-full" /> : null}
      {stats.length > 0 ? <SummaryStatCards stats={stats} /> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {pipeline.isLoading ? (
          <Skeleton className="h-72" />
        ) : pipeline.data ? (
          <PipelineFunnelChart pipeline={pipeline.data} />
        ) : null}
        <HiringTrendsChart />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <CandidateSourceChart />
        <Card className={cn(RECRUITMENT_CARD, 'shadow-none')}>
          <CardHeader>
            <CardTitle>Time to hire</CardTitle>
            <CardDescription>From analytics API when provided</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold text-navy">
            {metrics?.avgTimeToHireDays != null ? `${metrics.avgTimeToHireDays} days` : '—'}
          </CardContent>
        </Card>
      </div>
    </RecruitmentPageShell>
  )
}