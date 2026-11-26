/**
 * Application history for the signed-in Manager/Employee.
 * Uses GET /recruitment/applications/me after resolving candidate via
 * GET /recruitment/candidates/me (jobs:read — no ATS candidates:read required).
 * No status-management controls (PATCH status is for authorized ATS roles).
 */
import { RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TablePagination } from '@/components/ui/table-pagination'
import { getApiErrorMessage } from '@/services/api/errors'

import {
  APPLICATIONS_PAGE_SIZE,
  useListMyApplicationsQuery,
} from '../api/applicationsApi'
import { useGetMyCandidateQuery } from '../api/candidatesApi'
import { RecruitmentPageShell } from '../components'
import { RECRUITMENT_CARD } from '../components/shared/recruitmentUi'
import { formatApplicationStatus } from '../utils/applicationFormat'
import { formatPostedDate } from '../utils/jobFormat'
import { resolveCandidateFromMe } from '../utils/internalApply'
import { internalJobsPath, recruitmentWorkspacePrefix } from '../utils/recruitmentRoutes'

export function MyApplicationsPage() {
  const { pathname } = useLocation()
  const prefix = recruitmentWorkspacePrefix(pathname)
  const { user } = useAuthenticatedUser()
  const [page, setPage] = useState(1)

  const email = user?.email?.trim() ?? ''
  const myCandidate = useGetMyCandidateQuery(undefined, { skip: !email })
  const candidateResolution = useMemo(
    () =>
      resolveCandidateFromMe({
        email,
        candidate: myCandidate.data,
        fetchError: myCandidate.isError ? myCandidate.error : undefined,
        is404:
          myCandidate.isError &&
          (myCandidate.error as { status?: unknown })?.status === 404,
      }),
    [email, myCandidate.data, myCandidate.isError, myCandidate.error],
  )
  const candidateId =
    candidateResolution.status === 'resolved' ? candidateResolution.candidateId : null

  const list = useListMyApplicationsQuery(
    {
      page,
      limit: APPLICATIONS_PAGE_SIZE,
      sortBy: 'appliedAt',
      sortOrder: 'desc',
    },
    { skip: !email || candidateResolution.status === 'error' },
  )

  const items = list.data?.items ?? []
  const pagination = list.data?.pagination
  const totalPages = pagination?.totalPages ?? 0
  const candidateLookupFailed = candidateResolution.status === 'error'

  return (
    <RecruitmentPageShell
      activeSection="My Applications"
      trailing={
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" asChild>
            <Link to={internalJobsPath(prefix)}>Browse jobs</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={list.isFetching}
            onClick={() => {
              void myCandidate.refetch()
              void list.refetch()
            }}
          >
            <RefreshCw className={`h-4 w-4 ${list.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      }
    >
      {candidateLookupFailed ? (
        <div className={`${RECRUITMENT_CARD} space-y-3 p-6`}>
          <p role="status" className="text-sm text-amber-900">
            {candidateResolution.message}
          </p>
          <Button type="button" variant="outline" asChild>
            <Link to={internalJobsPath(prefix)}>Back to job board</Link>
          </Button>
        </div>
      ) : myCandidate.isLoading || list.isLoading ? (
        <div className="space-y-3 p-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : list.isError ? (
        <div className="space-y-3 rounded-2xl border border-red-200 bg-white p-6">
          <p role="alert" className="text-sm text-red-600">
            {getApiErrorMessage(list.error, 'Could not load your applications.')}
          </p>
          <Button type="button" variant="outline" onClick={() => void list.refetch()}>
            Retry
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className={`${RECRUITMENT_CARD} space-y-4 p-8 text-center`}>
          <p className="text-sm text-slate-500">
            You have not submitted any applications yet.
          </p>
          <Button type="button" variant="outline" asChild>
            <Link to={internalJobsPath(prefix)}>Browse open jobs</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Source</TableHead>
                <TableHead>Applied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <p className="font-medium text-navy">
                      {app.jobPosting?.title ?? app.jobPostingId}
                    </p>
                    <p className="text-xs text-text-secondary break-all">{app.id}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{formatApplicationStatus(app.status)}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{app.source}</TableCell>
                  <TableCell>{formatPostedDate(app.appliedAt ?? app.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {candidateId && pagination && totalPages > 0 ? (
        <TablePagination
          className="mt-4"
          page={page}
          totalPages={totalPages}
          total={pagination.total}
          itemLabel="applications"
          disabled={list.isFetching}
          onPageChange={setPage}
        />
      ) : null}
    </RecruitmentPageShell>
  )
}
