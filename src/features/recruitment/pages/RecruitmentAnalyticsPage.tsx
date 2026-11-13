import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
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

import {
  CandidateSourceChart,
  HiringTrendsChart,
  MockDataBanner,
  MonthlyApplicationsChart,
  PipelineFunnelChart,
  SummaryStatCards,
} from '../components'
import {
  listCandidates,
  listInterviews,
  listJobs,
  listOffers,
} from '../services/recruitmentService'
import {
  CheckCircle2,
  Clock3,
  FileCheck2,
  Handshake,
  Percent,
  UserCheck,
  UserMinus,
  Users,
} from 'lucide-react'

export function RecruitmentAnalyticsPage() {
  const [candidates] = useState(() => listCandidates())
  const [interviews] = useState(() => listInterviews())
  const [offers] = useState(() => listOffers())
  const [jobs] = useState(() => listJobs())

  const metrics = useMemo(() => {
    const shortlisted = candidates.filter((c) =>
      [
        'Shortlisted',
        'Interview',
        'Selected',
        'Offer Released',
        'Joined',
      ].includes(c.stage),
    ).length
    const joined = candidates.filter((c) => c.stage === 'Joined').length
    const rejected = candidates.filter((c) => c.stage === 'Rejected').length
    const offersReleased = offers.filter((o) =>
      ['Released', 'Accepted', 'Rejected', 'Expired'].includes(o.status),
    ).length
    const offersAccepted = offers.filter((o) => o.status === 'Accepted').length
    const interviewsCompleted = interviews.filter(
      (i) => i.status === 'Completed',
    ).length
    const conversion =
      candidates.length === 0
        ? 0
        : Math.round((joined / candidates.length) * 100)
    const interviewToOffer =
      interviewsCompleted === 0
        ? 0
        : Math.round((offersReleased / interviewsCompleted) * 100)
    const offerAcceptance =
      offersReleased === 0
        ? 0
        : Math.round((offersAccepted / offersReleased) * 100)

    return {
      shortlisted,
      joined,
      rejected,
      offersReleased,
      offersAccepted,
      interviewsCompleted,
      conversion,
      interviewToOffer,
      offerAcceptance,
      avgTimeToHire: 28,
    }
  }, [candidates, interviews, offers])

  const departmentHiring = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of candidates.filter((x) => x.stage === 'Joined')) {
      const dept =
        jobs.find((j) => j.id === c.appliedJobId)?.department ?? 'Other'
      counts.set(dept, (counts.get(dept) ?? 0) + 1)
    }
    // Include departments with applications for richer chart
    for (const c of candidates) {
      const dept =
        jobs.find((j) => j.id === c.appliedJobId)?.department ?? 'Other'
      if (!counts.has(dept)) counts.set(dept, 0)
    }
    return [...counts.entries()].map(([department, hired]) => ({
      department,
      hired,
      applications: candidates.filter(
        (c) =>
          jobs.find((j) => j.id === c.appliedJobId)?.department === department,
      ).length,
    }))
  }, [candidates, jobs])

  const jobApplications = useMemo(
    () =>
      jobs.map((job) => ({
        job: job.title.length > 18 ? `${job.title.slice(0, 18)}…` : job.title,
        applications: candidates.filter((c) => c.appliedJobId === job.id)
          .length,
      })),
    [jobs, candidates],
  )

  const conversionChart = [
    {
      label: 'Interview → Offer',
      rate: metrics.interviewToOffer,
    },
    {
      label: 'Offer acceptance',
      rate: metrics.offerAcceptance,
    },
    {
      label: 'Hiring conversion',
      rate: metrics.conversion,
    },
  ]

  const stats = [
    {
      label: 'Total Applications',
      value: candidates.length,
      icon: Users,
    },
    {
      label: 'Candidates Shortlisted',
      value: metrics.shortlisted,
      icon: UserCheck,
    },
    {
      label: 'Interviews Completed',
      value: metrics.interviewsCompleted,
      icon: FileCheck2,
    },
    {
      label: 'Offers Released',
      value: metrics.offersReleased,
      icon: Handshake,
    },
    {
      label: 'Offers Accepted',
      value: metrics.offersAccepted,
      icon: CheckCircle2,
    },
    {
      label: 'Candidates Joined',
      value: metrics.joined,
      icon: CheckCircle2,
    },
    {
      label: 'Rejected Candidates',
      value: metrics.rejected,
      icon: UserMinus,
    },
    {
      label: 'Hiring Conversion Rate',
      value: `${metrics.conversion}%`,
      icon: Percent,
    },
    {
      label: 'Average Time to Hire',
      value: `${metrics.avgTimeToHire}d`,
      icon: Clock3,
    },
  ]

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">
          Recruitment Analytics
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Funnel conversion, source mix, and hiring performance (mock metrics).
        </p>
      </div>

      <MockDataBanner />
      <SummaryStatCards stats={stats} />

      <div className="grid gap-4 xl:grid-cols-2">
        <MonthlyApplicationsChart />
        <PipelineFunnelChart candidates={candidates} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <CandidateSourceChart />
        <HiringTrendsChart />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border-soft shadow-sm">
          <CardHeader>
            <CardTitle>Department-wise Hiring</CardTitle>
            <CardDescription>Applications and joined counts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentHiring}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E6EF" />
                  <XAxis
                    dataKey="department"
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
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #E2E6EF',
                    }}
                  />
                  <Bar
                    dataKey="applications"
                    fill="#C4B5FD"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={22}
                  />
                  <Bar
                    dataKey="hired"
                    fill="#5938DB"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-soft shadow-sm">
          <CardHeader>
            <CardTitle>Job-wise Applications</CardTitle>
            <CardDescription>Volume by open role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={jobApplications} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E6EF" />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="job"
                    width={120}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#667085', fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #E2E6EF',
                    }}
                  />
                  <Bar
                    dataKey="applications"
                    fill="#5938DB"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border-soft shadow-sm">
        <CardHeader>
          <CardTitle>Conversion Rates</CardTitle>
          <CardDescription>
            Interview-to-offer and offer acceptance (derived from mock data)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={conversionChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E6EF" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#667085', fontSize: 12 }}
                />
                <YAxis
                  unit="%"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#667085', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #E2E6EF',
                  }}
                />
                <Bar
                  dataKey="rate"
                  fill="#5938DB"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
