import {
  Briefcase,
  CalendarClock,
  CheckCircle2,
  FileCheck2,
  Handshake,
  RefreshCw,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getApiErrorMessage } from '@/services/api/errors'

import {
  useGetDashboardActivitiesQuery,
  useGetDashboardOverviewQuery,
  useGetRecentApplicationsQuery,
  useGetRecruitmentPipelineQuery,
  useGetUpcomingInterviewsQuery,
} from '../api/analyticsApi'
import {
  ApplicationStatusBadge,
  MonthlyApplicationsChart,
  PipelineFunnelChart,
  RecruitmentPageShell,
  SummaryStatCards,
} from '../components'
import { RECRUITMENT_CARD } from '../components/shared/recruitmentUi'
export function RecruitmentOverviewPage() {
  const overview = useGetDashboardOverviewQuery()
  const pipeline = useGetRecruitmentPipelineQuery()
  const recent = useGetRecentApplicationsQuery()
  const upcoming = useGetUpcomingInterviewsQuery()
  const activities = useGetDashboardActivitiesQuery()

  const loading =
    overview.isLoading || pipeline.isLoading || recent.isLoading || upcoming.isLoading

  const stats = overview.data
    ? [
        { label: 'Total Open Jobs', value: overview.data.openJobs, icon: Briefcase },
        { label: 'Total Candidates', value: overview.data.totalCandidates, icon: Users },
        { label: 'Applications Received', value: overview.data.totalApplications, icon: FileCheck2 },
        { label: 'Candidates Shortlisted', value: overview.data.shortlisted, icon: UserCheck },
        { label: 'Interviews Scheduled', value: overview.data.interviewsScheduled, icon: CalendarClock },
        { label: 'Offers Released', value: overview.data.offersReleased, icon: Handshake },
        { label: 'Candidates Joined', value: overview.data.joined, icon: CheckCircle2 },
        { label: 'Pending Offers', value: overview.data.pendingOffers, icon: Wallet },
      ]
    : []

  const refetchAll = () => {
    void overview.refetch()
    void pipeline.refetch()
    void recent.refetch()
    void upcoming.refetch()
    void activities.refetch()
  }

  const hasError =
    overview.isError || pipeline.isError || recent.isError || upcoming.isError

  return (
    <RecruitmentPageShell
      activeSection="Overview"
      trailing={
        <Button type="button" variant="outline" onClick={refetchAll}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      }
    >
      {loading ? <Skeleton className="mb-4 h-24 w-full" /> : null}
      {hasError ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {getApiErrorMessage(
            overview.error ?? pipeline.error ?? recent.error ?? upcoming.error,
            'Could not load dashboard data.',
          )}
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={refetchAll}>
            Retry
          </Button>
        </div>
      ) : null}

      {stats.length > 0 ? <SummaryStatCards stats={stats} /> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {pipeline.data ? <PipelineFunnelChart pipeline={pipeline.data} /> : <Skeleton className="h-72" />}
        <MonthlyApplicationsChart />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className={cn(RECRUITMENT_CARD, 'shadow-none xl:col-span-1')}>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>From dashboard API</CardDescription>
          </CardHeader>
          <CardContent>
            {recent.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : recent.isError ? (
              <p className="text-sm text-red-600">
                {getApiErrorMessage(recent.error, 'Could not load recent applications.')}
              </p>
            ) : (recent.data ?? []).length === 0 ? (
              <p className="text-sm text-text-secondary">No recent applications.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Stage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(recent.data ?? []).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <p className="font-medium text-navy">{row.candidateName}</p>
                        <p className="text-xs text-text-secondary">{row.appliedAt}</p>
                      </TableCell>
                      <TableCell className="text-text-secondary">{row.jobTitle}</TableCell>
                      <TableCell>
                        {row.status ? (
                          <ApplicationStatusBadge status={row.status} />
                        ) : (
                          '—'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className={cn(RECRUITMENT_CARD, 'shadow-none xl:col-span-1')}>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (upcoming.data ?? []).length === 0 ? (
              <p className="text-sm text-text-secondary">None scheduled.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>When</TableHead>
                    <TableHead>Round</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(upcoming.data ?? []).map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium text-navy">{row.candidateName}</TableCell>
                      <TableCell className="text-text-secondary">{row.scheduledAt}</TableCell>
                      <TableCell className="text-text-secondary">{row.round}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className={cn(RECRUITMENT_CARD, 'shadow-none xl:col-span-1')}>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            {activities.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : (activities.data ?? []).length === 0 ? (
              <p className="text-sm text-text-secondary">No activities logged.</p>
            ) : (
              <ul className="space-y-3">
                {(activities.data ?? []).map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl border border-border-soft bg-muted-bg/40 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-navy">{item.text}</p>
                    <p className="mt-1 text-xs text-text-secondary">{item.occurredAt}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </RecruitmentPageShell>
  )
}