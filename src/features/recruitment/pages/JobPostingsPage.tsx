/**
 * Job Management — production `/recruitment/jobs` APIs.
 * Authenticated server mode only; no mock job list fallback.
 */
import {
  Eye,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { Feature } from '@/features/rbac/components/Feature'
import { useOptionalFeatureAccess } from '@/features/rbac/hooks/useFeatureAccess'
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

import { JOBS_PAGE_SIZE, useGetJobQuery, useListJobsQuery } from '../api/jobsApi'
import type {
  BackendJob,
  JobEmploymentType,
  JobPostingStatus,
  JobWorkMode,
} from '../api/jobsApi.types'
import { RecruitmentPageShell } from '../components'
import { ApiJobStatusBadge } from '../components/jobs/ApiJobStatusBadge'
import {
  formatEmploymentType,
  formatExperience,
  formatPostedDate,
  formatWorkMode,
} from '../utils/jobFormat'
import { DeleteJobDialog } from '../components/jobs/DeleteJobDialog'
import { JobDescriptionDialog } from '../components/jobs/JobDescriptionDialog'
import { JobDetailDialog } from '../components/jobs/JobDetailDialog'
import { JobFormDialog } from '../components/jobs/JobFormDialog'
import { RECRUITMENT_FILTER_BAR } from '../components/shared/recruitmentUi'
import { jobHiringDeskPath, recruitmentRoutePrefix } from '../utils/recruitmentRoutes'

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
const STATUSES: JobPostingStatus[] = ['DRAFT', 'PUBLISHED', 'CLOSED', 'CANCELLED']

type Notice = { tone: 'success' | 'error'; text: string }

export function JobPostingsPage() {
  const routerLocation = useLocation()
  const routePrefix = recruitmentRoutePrefix(routerLocation.pathname)
  const { canAccess } = useOptionalFeatureAccess()
  const canManage = canAccess('recruitment.manage')

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState(ALL)
  const [employmentType, setEmploymentType] = useState(ALL)
  const [workMode, setWorkMode] = useState(ALL)
  const [isActive, setIsActive] = useState(ALL)
  const [departmentId, setDepartmentId] = useState(ALL)

  const departmentsQuery = useListDepartmentsQuery({
    isActive: true,
    limit: 100,
    page: 1,
    sortBy: 'name',
    sortOrder: 'asc',
  })

  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [editJob, setEditJob] = useState<BackendJob | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BackendJob | null>(null)
  const [descriptionTarget, setDescriptionTarget] = useState<BackendJob | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const list = useListJobsQuery({
    page,
    limit: JOBS_PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(status !== ALL ? { status: status as JobPostingStatus } : {}),
    ...(employmentType !== ALL
      ? { employmentType: employmentType as JobEmploymentType }
      : {}),
    ...(workMode !== ALL ? { workMode: workMode as JobWorkMode } : {}),
    ...(isActive === 'true' ? { isActive: true } : isActive === 'false' ? { isActive: false } : {}),
    ...(departmentId !== ALL ? { departmentId } : {}),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  // Refresh detail target when opening description from list/detail so we keep latest text.
  const descriptionRefresh = useGetJobQuery(descriptionTarget?.id ?? '', {
    skip: !descriptionTarget?.id,
    refetchOnMountOrArgChange: true,
  })

  const items = list.data?.items ?? []
  const pagination = list.data?.pagination
  const totalPages = pagination?.totalPages ?? 0

  const openCreate = () => {
    setFormMode('create')
    setEditJob(null)
    setFormOpen(true)
  }

  const openEdit = (job: BackendJob) => {
    setFormMode('edit')
    setEditJob(job)
    setDetailId(null)
    setFormOpen(true)
  }

  return (
    <RecruitmentPageShell
      activeSection="Job Postings"
      trailing={
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void list.refetch()}
            disabled={list.isFetching}
          >
            <RefreshCw className={`h-4 w-4 ${list.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Feature name="recruitment.manage">
            <Button type="button" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Create Job
            </Button>
          </Feature>
        </div>
      }
    >
      {notice ? (
        <p
          role="status"
          className={
            notice.tone === 'success'
              ? 'mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900'
              : 'mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
          }
        >
          {notice.text}
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
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          value={isActive}
          onValueChange={(value) => {
            setIsActive(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full lg:w-36">
            <SelectValue placeholder="Active" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All activity</SelectItem>
            <SelectItem value="true">Active</SelectItem>
            <SelectItem value="false">Inactive</SelectItem>
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

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
        {list.isLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : list.isError ? (
          <div className="space-y-3 p-6">
            <p role="alert" className="text-sm text-red-600">
              {getApiErrorMessage(list.error, 'Could not load job postings.')}
            </p>
            <Button type="button" variant="outline" onClick={() => void list.refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No job postings match these filters.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job</TableHead>
                <TableHead className="hidden md:table-cell">Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="hidden lg:table-cell">Type</TableHead>
                <TableHead className="hidden sm:table-cell">Experience</TableHead>
                <TableHead className="hidden xl:table-cell">Openings</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Posted</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="align-middle">
                    <p className="font-medium text-navy">{job.title}</p>
                    <p className="text-xs text-text-secondary">
                      {formatWorkMode(job.workMode)}
                      {!job.isActive ? ' · Inactive' : ''}
                    </p>
                  </TableCell>
                  <TableCell className="hidden align-middle md:table-cell">
                    {job.department?.name ?? job.departmentId ?? '—'}
                  </TableCell>
                  <TableCell className="align-middle">{job.location}</TableCell>
                  <TableCell className="hidden align-middle lg:table-cell">
                    <Badge variant="secondary">{formatEmploymentType(job.employmentType)}</Badge>
                  </TableCell>
                  <TableCell className="hidden align-middle sm:table-cell">
                    {formatExperience(job.minExperienceYears, job.maxExperienceYears)}
                  </TableCell>
                  <TableCell className="hidden align-middle tabular-nums xl:table-cell">
                    {job.openings}
                  </TableCell>
                  <TableCell className="align-middle">
                    <ApiJobStatusBadge status={job.status} />
                  </TableCell>
                  <TableCell className="hidden align-middle md:table-cell">
                    {formatPostedDate(job.createdAt)}
                  </TableCell>
                  <TableCell className="text-center align-middle">
                    <div className="inline-flex items-center justify-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        title="View details"
                        onClick={() => setDetailId(job.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        title="Hiring desk"
                        asChild
                      >
                        <Link to={jobHiringDeskPath(routePrefix, job.id)}>
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Feature name="recruitment.manage">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          title="Edit"
                          onClick={() => openEdit(job)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Feature>
                      <Feature name="recruitment.manage">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                          title="Deactivate"
                          onClick={() => setDeleteTarget(job)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Feature>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {pagination && totalPages > 0 ? (
        <TablePagination
          className="mt-4"
          page={page}
          totalPages={totalPages}
          total={pagination.total}
          itemLabel="jobs"
          disabled={list.isFetching}
          onPageChange={setPage}
        />
      ) : null}

      <JobFormDialog
        open={formOpen}
        mode={formMode}
        job={formMode === 'edit' ? editJob : null}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open) setEditJob(null)
        }}
        onSaved={(job, mode) => {
          setNotice({
            tone: 'success',
            text:
              mode === 'create'
                ? `Created job “${job.title}”.`
                : `Updated job “${job.title}”.`,
          })
          if (mode === 'create') setPage(1)
        }}
      />

      <JobDetailDialog
        jobId={detailId}
        onOpenChange={(open) => {
          if (!open) setDetailId(null)
        }}
        canManage={canManage}
        onEdit={(jobId) => {
          const row = items.find((item) => item.id === jobId)
          if (row) openEdit(row)
        }}
        onEditDescription={(jobId) => {
          const row = items.find((item) => item.id === jobId)
          if (row) {
            setDescriptionTarget(row)
            setDetailId(null)
          }
        }}
      />

      <DeleteJobDialog
        job={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        onDeleted={(job) => {
          setNotice({ tone: 'success', text: `Deactivated job “${job.title}”.` })
          setDeleteTarget(null)
        }}
      />

      <JobDescriptionDialog
        job={descriptionRefresh.data ?? descriptionTarget}
        onOpenChange={(open) => {
          if (!open) setDescriptionTarget(null)
        }}
        onSaved={(job) => {
          setNotice({ tone: 'success', text: `Updated description for “${job.title}”.` })
          setDescriptionTarget(null)
        }}
      />
    </RecruitmentPageShell>
  )
}
