import {
  Briefcase,
  CalendarClock,
  CheckCircle2,
  FileCheck2,
  Handshake,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react'
import { useMemo, useState } from 'react'

import { cn } from '@/lib/utils'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  CandidateSourceChart,
  HiringTrendsChart,
  MonthlyApplicationsChart,
  PipelineFunnelChart,
  RecruitmentPageShell,
  StageBadge,
  SummaryStatCards,
} from '../components'
import { RECRUITMENT_CARD } from '../components/shared/recruitmentUi'
import { useRecruitment } from '../hooks/useRecruitment'
import {
  listActivities,
  listOffers,
} from '../services/recruitmentService'

export function RecruitmentOverviewPage() {
  const { jobs, candidates, interviews } = useRecruitment()
  const [offers] = useState(() => listOffers())
  const [activities] = useState(() => listActivities())

  const stats = useMemo(() => {
    const openJobs = jobs.filter((j) => j.status === 'Published').length
    return [
      {
        label: 'Total Open Jobs',
        value: openJobs,
        icon: Briefcase,
      },
      {
        label: 'Total Candidates',
        value: candidates.length,
        icon: Users,
      },
      {
        label: 'Applications Received',
        value: candidates.length,
        icon: FileCheck2,
      },
      {
        label: 'Candidates Shortlisted',
        value: candidates.filter((c) =>
          ['Shortlisted', 'Interview', 'Selected', 'Offer Released', 'Joined'].includes(
            c.stage,
          ),
        ).length,
        icon: UserCheck,
      },
      {
        label: 'Interviews Scheduled',
        value: interviews.filter((i) => i.status === 'Scheduled').length,
        icon: CalendarClock,
      },
      {
        label: 'Offers Released',
        value: offers.filter((o) =>
          ['Released', 'Accepted', 'Rejected', 'Expired'].includes(o.status),
        ).length,
        icon: Handshake,
      },
      {
        label: 'Candidates Joined',
        value: candidates.filter((c) => c.stage === 'Joined').length,
        icon: CheckCircle2,
      },
      {
        label: 'Pending Offers',
        value: offers.filter((o) =>
          ['Draft', 'Pending Approval', 'Released'].includes(o.status),
        ).length,
        icon: Wallet,
      },
    ]
  }, [jobs, candidates, interviews, offers])

  const recentApplications = useMemo(
    () =>
      [...candidates].sort((a, b) =>
        b.applicationDate.localeCompare(a.applicationDate),
      ).slice(0, 5),
    [candidates],
  )

  const upcomingInterviews = useMemo(
    () =>
      interviews
        .filter((i) => i.status === 'Scheduled')
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 5),
    [interviews],
  )

  return (
    <RecruitmentPageShell activeSection="Overview">
      <SummaryStatCards stats={stats} />

      <div className="grid gap-4 xl:grid-cols-2">
        <PipelineFunnelChart candidates={candidates} />
        <MonthlyApplicationsChart />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <HiringTrendsChart />
        <CandidateSourceChart />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className={cn(RECRUITMENT_CARD, 'shadow-none xl:col-span-1')}>
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>Latest candidate submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Stage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentApplications.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <p className="font-medium text-navy">{row.fullName}</p>
                      <p className="text-xs text-text-secondary">
                        {row.applicationDate}
                      </p>
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {row.appliedJobTitle}
                    </TableCell>
                    <TableCell>
                      <StageBadge stage={row.stage} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className={cn(RECRUITMENT_CARD, 'shadow-none xl:col-span-1')}>
          <CardHeader>
            <CardTitle>Upcoming Interviews</CardTitle>
            <CardDescription>Next scheduled sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Round</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingInterviews.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium text-navy">
                      {row.candidateName}
                    </TableCell>
                    <TableCell className="text-text-secondary">
                      {row.date} · {row.startTime}
                    </TableCell>
                    <TableCell className="text-text-secondary">{row.round}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className={cn(RECRUITMENT_CARD, 'shadow-none xl:col-span-1')}>
          <CardHeader>
            <CardTitle>Recent Recruitment Activities</CardTitle>
            <CardDescription>Latest recruiter actions</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {activities.map((item) => (
                <li
                  key={item.id}
                  className="rounded-xl border border-border-soft bg-muted-bg/40 px-4 py-3"
                >
                  <p className="text-sm font-medium text-navy">{item.text}</p>
                  <p className="mt-1 text-xs text-text-secondary">{item.time}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </RecruitmentPageShell>
  )
}
