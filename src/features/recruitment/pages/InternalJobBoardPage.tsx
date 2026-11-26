/**
 * Internal job board for Managers and Employees — view eligible jobs and apply.
 * Eligible = status PUBLISHED and isActive true (production list filters).
 * Reference name/email are not shown: OpenAPI CreateJobDto has no such fields.
 */
import { Briefcase, Loader2, RefreshCw, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useAuthenticatedUser } from '@/features/auth/hooks/useAuthenticatedUser'
import { useListDepartmentsQuery } from '@/features/organization/api/departmentsApi'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { TablePagination } from '@/components/ui/table-pagination'
import { getApiErrorMessage } from '@/services/api/errors'

import {
  useCreateApplicationMutation,
  useListApplicationsQuery,
} from '../api/applicationsApi'
import { useSearchCandidatesQuery } from '../api/candidatesApi'
import { JOBS_PAGE_SIZE, useListJobsQuery } from '../api/jobsApi'
import type {
  BackendJob,
  JobEmploymentType,
  JobWorkMode,
} from '../api/jobsApi.types'
import { RecruitmentPageShell } from '../components'
import { ApiJobStatusBadge } from '../components/jobs/ApiJobStatusBadge'
import { RECRUITMENT_CARD, RECRUITMENT_FILTER_BAR } from '../components/shared/recruitmentUi'
import {
  formatEmploymentType,
  formatExperience,
  formatPostedDate,
  formatWorkMode,
} from '../utils/jobFormat'
import {
  createSubmitGuard,
  resolveCandidateFromSearch,
  submitInternalApplication,
} from '../utils/internalApply'
import { internalApplicationsPath, recruitmentWorkspacePrefix } from '../utils/recruitmentRoutes'

const SEARCH_DEBOUNCE_MS = 350
const ALL = '__all__'
const EMPLOYMENT_TYPES: JobEmploymentType[] = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERN',
  'TEMPORARY',
]
const WORK_MODES: JobWorkMode[] = ['ONSITE', 'REMOTE', 'HYBRID']

type Notice = { tone: 'success' | 'error'; text: string }

export function InternalJobBoardPage() {
  const { pathname } = useLocation()
  const prefix = recruitmentWorkspacePrefix(pathname)
  const { user } = useAuthenticatedUser()

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [employmentType, setEmploymentType] = useState(ALL)
  const [workMode, setWorkMode] = useState(ALL)
  const [departmentId, setDepartmentId] = useState(ALL)
  const [locationFilter, setLocationFilter] = useState('')
  const [selected, setSelected] = useState<BackendJob | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [notice, setNotice] = useState<Notice | null>(null)
  const [applying, setApplying] = useState(false)
  const [guard] = useState(() => createSubmitGuard())

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const departmentsQuery = useListDepartmentsQuery({
    isActive: true,
    limit: 100,
    page: 1,
    sortBy: 'name',
    sortOrder: 'asc',
  })

  const list = useListJobsQuery({
    page,
    limit: JOBS_PAGE_SIZE,
    status: 'PUBLISHED',
    isActive: true,
    ...(search ? { search } : {}),
    ...(employmentType !== ALL
      ? { employmentType: employmentType as JobEmploymentType }
      : {}),
    ...(workMode !== ALL ? { workMode: workMode as JobWorkMode } : {}),
    ...(departmentId !== ALL ? { departmentId } : {}),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const email = user?.email?.trim() ?? ''
  const candidateSearch = useSearchCandidatesQuery(
    { q: email, limit: 20, isActive: true },
    { skip: !email },
  )
  const candidateResolution = useMemo(
    () =>
      resolveCandidateFromSearch({
        email,
        page: candidateSearch.data,
        searchError: candidateSearch.isError ? candidateSearch.error : undefined,
      }),
    [email, candidateSearch.data, candidateSearch.isError, candidateSearch.error],
  )
  const candidateId =
    candidateResolution.status === 'resolved' ? candidateResolution.candidateId : null

  const myApplications = useListApplicationsQuery(
    { candidateId: candidateId ?? undefined, limit: 100, page: 1 },
    { skip: !candidateId },
  )
  const appliedJobIds = useMemo(() => {
    const ids = new Set<string>()
    for (const app of myApplications.data?.items ?? []) {
      if (app.status !== 'WITHDRAWN' && app.status !== 'REJECTED') {
        ids.add(app.jobPostingId)
      }
    }
    return ids
  }, [myApplications.data?.items])

  const [createApplication] = useCreateApplicationMutation()

  const items = useMemo(() => {
    const rows = list.data?.items ?? []
    const loc = locationFilter.trim().toLowerCase()
    if (!loc) return rows
    return rows.filter((job) => job.location.toLowerCase().includes(loc))
  }, [list.data?.items, locationFilter])

  const pagination = list.data?.pagination
  const totalPages = pagination?.totalPages ?? 0

  const handleApply = async (job: BackendJob) => {
    setNotice(null)
    if (candidateResolution.status !== 'resolved') {
      setNotice({
        tone: 'error',
        text:
          candidateResolution.status === 'missing' || candidateResolution.status === 'error'
            ? candidateResolution.message
            : 'Cannot resolve candidate profile.',
      })
      return
    }
    setApplying(true)
    const outcome = await submitInternalApplication({
      jobPostingId: job.id,
      candidateId: candidateResolution.candidateId,
      coverLetter,
      guard,
      send: (body) => createApplication(body),
    })
    setApplying(false)
    if (outcome.status === 'busy') return
    if (outcome.status === 'success') {
      setNotice({
        tone: 'success',
        text: `Application submitted for “${job.title}”.`,
      })
      setCoverLetter('')
      setSelected(null)
      return
    }
    setNotice({ tone: 'error', text: outcome.message })
  }

  return (
    <RecruitmentPageShell
      activeSection="Internal Jobs"
      trailing={
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" asChild>
            <Link to={internalApplicationsPath(prefix)}>My applications</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void list.refetch()}
            disabled={list.isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${list.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      }
    >
      <p className="rounded-xl border border-[#CCFBF1] bg-[#F0FDFA] px-4 py-3 text-sm text-[#0F766E]">
        Browse published internal openings and apply with your linked recruitment candidate
        profile. Draft and inactive jobs are hidden.
      </p>

      {notice ? (
        <p
          role="status"
          className={
            notice.tone === 'success'
              ? 'rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900'
              : 'rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
          }
        >
          {notice.text}
        </p>
      ) : null}

      {candidateResolution.status !== 'resolved' && email ? (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {candidateResolution.status === 'missing' || candidateResolution.status === 'error'
            ? candidateResolution.message
            : null}
        </p>
      ) : null}

      <div className={RECRUITMENT_FILTER_BAR}>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            className="pl-9"
            placeholder="Search title, location, description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Input
          className="w-full lg:w-44"
          placeholder="Filter location"
          value={locationFilter}
          onChange={(e) => {
            setLocationFilter(e.target.value)
            setPage(1)
          }}
        />
        <Select
          value={employmentType}
          onValueChange={(value) => {
            setEmploymentType(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Employment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All types</SelectItem>
            {EMPLOYMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {formatEmploymentType(type)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={workMode}
          onValueChange={(value) => {
            setWorkMode(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full lg:w-36">
            <SelectValue placeholder="Work mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All modes</SelectItem>
            {WORK_MODES.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {formatWorkMode(mode)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={departmentId}
          onValueChange={(value) => {
            setDepartmentId(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full lg:w-52">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All departments</SelectItem>
            {(departmentsQuery.data?.items ?? []).map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {list.isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : list.isError ? (
        <div className="space-y-3 rounded-2xl border border-red-200 bg-white p-6">
          <p role="alert" className="text-sm text-red-600">
            {getApiErrorMessage(list.error, 'Could not load internal jobs.')}
          </p>
          <Button type="button" variant="outline" onClick={() => void list.refetch()}>
            Retry
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className={`${RECRUITMENT_CARD} flex flex-col items-center gap-3 p-10 text-center`}>
          <Briefcase className="h-10 w-10 text-[#14B8A6]" />
          <p className="text-sm text-slate-600">No published internal jobs match these filters.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((job) => {
            const alreadyApplied = appliedJobIds.has(job.id)
            return (
              <article key={job.id} className={RECRUITMENT_CARD}>
                <div className="space-y-3 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-[#17213A]">{job.title}</h3>
                      <p className="text-sm text-[#667085]">
                        {job.department?.name ?? 'Department TBA'} · {job.location}
                      </p>
                    </div>
                    <ApiJobStatusBadge status={job.status} />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{formatEmploymentType(job.employmentType)}</Badge>
                    <Badge variant="outline">{formatWorkMode(job.workMode)}</Badge>
                    <Badge variant="outline">
                      {formatExperience(job.minExperienceYears, job.maxExperienceYears)}
                    </Badge>
                    <Badge variant="outline">{job.openings} opening{job.openings === 1 ? '' : 's'}</Badge>
                  </div>
                  {job.skills.length ? (
                    <p className="line-clamp-2 text-xs text-[#667085]">
                      Skills: {job.skills.join(', ')}
                    </p>
                  ) : null}
                  <p className="line-clamp-3 text-sm text-slate-600">{job.description}</p>
                  <p className="text-xs text-[#667085]">
                    Deadline: {job.applicationDeadline ?? 'Open'} · Posted{' '}
                    {formatPostedDate(job.createdAt)}
                    {job.referenceName?.trim()
                      ? ` · Ref: ${job.referenceName.trim()}`
                      : ''}
                  </p>
                  {job.referenceEmail?.trim() ? (
                    <p className="text-xs text-[#667085] break-all">{job.referenceEmail.trim()}</p>
                  ) : null}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button type="button" variant="outline" onClick={() => setSelected(job)}>
                      View details
                    </Button>
                    <Button
                      type="button"
                      className="bg-[#0F766E] hover:bg-[#0D9488]"
                      disabled={alreadyApplied || applying || candidateResolution.status !== 'resolved'}
                      onClick={() => void handleApply(job)}
                    >
                      {alreadyApplied ? 'Already applied' : applying ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> Applying...
                        </>
                      ) : (
                        'Apply Now'
                      )}
                    </Button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {pagination && totalPages > 0 ? (
        <TablePagination
          className="mt-2"
          page={page}
          totalPages={totalPages}
          total={pagination.total}
          itemLabel="jobs"
          disabled={list.isFetching}
          onPageChange={setPage}
        />
      ) : null}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div
            role="dialog"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#E2E6EF] bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-[#17213A]">{selected.title}</h2>
                <p className="text-sm text-[#667085]">
                  {selected.department?.name ?? '—'} · {selected.location}
                </p>
              </div>
              <Button type="button" variant="ghost" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              <ApiJobStatusBadge status={selected.status} />
              <Badge variant="secondary">{formatEmploymentType(selected.employmentType)}</Badge>
              <Badge variant="outline">{formatWorkMode(selected.workMode)}</Badge>
            </div>
            <dl className="mb-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Experience</dt>
                <dd>
                  {formatExperience(selected.minExperienceYears, selected.maxExperienceYears)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Openings</dt>
                <dd>{selected.openings}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Deadline</dt>
                <dd>{selected.applicationDeadline ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Skills</dt>
                <dd>{selected.skills.length ? selected.skills.join(', ') : '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Reference Name</dt>
                <dd>{selected.referenceName?.trim() ? selected.referenceName : '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">Reference Email</dt>
                <dd className="break-all">
                  {selected.referenceEmail?.trim() ? selected.referenceEmail : '—'}
                </dd>
              </div>
            </dl>
            <p className="mb-3 whitespace-pre-wrap text-sm text-slate-700">{selected.description}</p>
            {selected.requirements ? (
              <p className="mb-4 whitespace-pre-wrap text-sm text-slate-700">
                <span className="font-medium text-[#17213A]">Requirements: </span>
                {selected.requirements}
              </p>
            ) : null}
            <label className="mb-2 block text-sm font-medium text-[#17213A]" htmlFor="cover-letter">
              Cover letter (optional)
            </label>
            <textarea
              id="cover-letter"
              className="mb-4 min-h-24 w-full rounded-xl border border-[#E2E6EF] px-3 py-2 text-sm"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Add a short note for HR..."
            />
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-[#0F766E] hover:bg-[#0D9488]"
                disabled={
                  applying ||
                  appliedJobIds.has(selected.id) ||
                  candidateResolution.status !== 'resolved'
                }
                onClick={() => void handleApply(selected)}
              >
                {appliedJobIds.has(selected.id)
                  ? 'Already applied'
                  : applying
                    ? 'Submitting...'
                    : 'Apply Now'}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </RecruitmentPageShell>
  )
}
