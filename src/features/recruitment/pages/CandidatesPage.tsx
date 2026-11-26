import { Eye, Pencil, Plus, RefreshCw, Search, Upload } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Feature } from '@/features/rbac/components/Feature'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { getApiErrorMessage } from '@/services/api/errors'

import {
  CANDIDATES_PAGE_SIZE,
  getCandidateErrorMessage,
  useCreateCandidateMutation,
  useGetCandidateStatusQuery,
  useListCandidatesQuery,
  useParseResumeMutation,
  useUpdateCandidateMutation,
  useUploadCandidateResumeMutation,
} from '../api/candidatesApi'
import type { BackendCandidate, CandidateSource } from '../api/candidatesApi.types'
import { RecruitmentPageShell } from '../components'
import { ApplicationStatusBadge } from '../components'
import { RECRUITMENT_FILTER_BAR } from '../components/shared/recruitmentUi'
import {
  formatCandidateSource,
  formatExperienceYears,
  formatApplicationStatus,
} from '../utils/applicationFormat'

const SEARCH_DEBOUNCE_MS = 350
const SOURCES: CandidateSource[] = [
  'CAREER_PAGE',
  'REFERRAL',
  'LINKEDIN',
  'JOB_PORTAL',
  'AGENCY',
  'WALK_IN',
  'OTHER',
]

type CandidateForm = {
  fullName: string
  email: string
  phone: string
  location: string
  experienceYears: string
  currentCompany: string
  currentDesignation: string
  skills: string
  source: CandidateSource
}

const emptyForm: CandidateForm = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  experienceYears: '',
  currentCompany: '',
  currentDesignation: '',
  skills: '',
  source: 'LINKEDIN',
}

function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function toFormBody(form: CandidateForm) {
  const experienceYears = form.experienceYears.trim()
    ? Number(form.experienceYears)
    : undefined
  return {
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    ...(form.location.trim() ? { location: form.location.trim() } : {}),
    ...(experienceYears !== undefined && Number.isFinite(experienceYears)
      ? { experienceYears }
      : {}),
    ...(form.currentCompany.trim() ? { currentCompany: form.currentCompany.trim() } : {}),
    ...(form.currentDesignation.trim()
      ? { currentDesignation: form.currentDesignation.trim() }
      : {}),
    skills: form.skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    source: form.source,
  }
}

export function CandidatesPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sourceFilter, setSourceFilter] = useState<string>('__all__')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<BackendCandidate | null>(null)
  const [form, setForm] = useState<CandidateForm>(emptyForm)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim())
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const list = useListCandidatesQuery({
    page,
    limit: CANDIDATES_PAGE_SIZE,
    ...(search ? { search } : {}),
    ...(sourceFilter !== '__all__' ? { source: sourceFilter as CandidateSource } : {}),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const statusQuery = useGetCandidateStatusQuery(profileId ?? '', { skip: !profileId })
  const [createCandidate] = useCreateCandidateMutation()
  const [updateCandidate] = useUpdateCandidateMutation()
  const [uploadResume] = useUploadCandidateResumeMutation()
  const [parseResume, parseState] = useParseResumeMutation()

  const items = list.data?.items ?? []
  const profile = items.find((c) => c.id === profileId) ?? null

  const latestStatus = useMemo(() => {
    const entries = statusQuery.data?.entries ?? []
    return entries[0]?.status ?? null
  }, [statusQuery.data])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setResumeFile(null)
    setFormError(null)
    setFormOpen(true)
  }

  const openEdit = (c: BackendCandidate) => {
    setEditing(c)
    setForm({
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      location: c.location ?? '',
      experienceYears: c.experienceYears != null ? String(c.experienceYears) : '',
      currentCompany: c.currentCompany ?? '',
      currentDesignation: c.currentDesignation ?? '',
      skills: c.skills.join(', '),
      source: c.source,
    })
    setResumeFile(null)
    setFormError(null)
    setFormOpen(true)
  }

  const onResumeSelected = (file: File | undefined) => {
    if (!file) return
    const ok = /\.pdf$/i.test(file.name) || /\.docx?$/i.test(file.name)
    if (!ok) return
    setResumeFile(file)
    void parseResume(file)
  }

  const saveCandidate = async () => {
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      setFormError('Full name, email, and phone are required.')
      return
    }
    setSaving(true)
    setFormError(null)
    try {
      const body = toFormBody(form)
      const saved = editing
        ? await updateCandidate({ id: editing.id, body }).unwrap()
        : await createCandidate(body).unwrap()
      if (resumeFile) {
        await uploadResume({ id: saved.id, file: resumeFile }).unwrap()
      }
      setFormOpen(false)
    } catch (error) {
      setFormError(getCandidateErrorMessage(error, 'Could not save candidate.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <RecruitmentPageShell
      activeSection="Candidates"
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
              Register Candidate
            </Button>
          </Feature>
        </div>
      }
    >
      <div className={RECRUITMENT_FILTER_BAR}>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            className="pl-9"
            placeholder="Search name, email, skills..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Select
          value={sourceFilter}
          onValueChange={(value) => {
            setSourceFilter(value)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All sources</SelectItem>
            {SOURCES.map((s) => (
              <SelectItem key={s} value={s}>
                {formatCandidateSource(s)}
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
          </div>
        ) : list.isError ? (
          <div className="space-y-3 p-6">
            <p role="alert" className="text-sm text-red-600">
              {getApiErrorMessage(list.error, 'Could not load candidates.')}
            </p>
            <Button type="button" variant="outline" onClick={() => void list.refetch()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">No candidates match these filters.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Resume</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{initialsFromName(c.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-navy">{c.fullName}</p>
                        <p className="text-xs text-text-secondary">{c.email}</p>
                        <p className="text-xs text-text-secondary">{c.phone}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{c.location ?? '—'}</TableCell>
                  <TableCell>{formatExperienceYears(c.experienceYears)}</TableCell>
                  <TableCell>
                    <div className="flex max-w-[160px] flex-wrap gap-1">
                      {c.skills.slice(0, 2).map((s) => (
                        <Badge key={s} variant="secondary">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-text-secondary">
                    {c.resumes[0]?.fileName ?? '—'}
                  </TableCell>
                  <TableCell>{formatCandidateSource(c.source)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      <Button type="button" size="sm" variant="ghost" onClick={() => setProfileId(c.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Feature name="recruitment.manage">
                        <Button type="button" size="sm" variant="ghost" onClick={() => openEdit(c)}>
                          <Pencil className="h-4 w-4" />
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

      {list.data && list.data.pagination.totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-text-secondary">
            Page {page} of {list.data.pagination.totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= list.data.pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Candidate' : 'Register Candidate'}</DialogTitle>
            <DialogDescription>Required: full name, email, phone.</DialogDescription>
          </DialogHeader>
          {formError ? (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ['fullName', 'Full Name *'],
                ['email', 'Email *'],
                ['phone', 'Phone *'],
                ['location', 'Location'],
                ['experienceYears', 'Experience (years)'],
                ['currentCompany', 'Current Company'],
                ['currentDesignation', 'Current Designation'],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <Input
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="space-y-2 sm:col-span-2">
              <Label>Skills</Label>
              <Input
                placeholder="Comma-separated"
                value={form.skills}
                onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select
                value={form.source}
                onValueChange={(v) => setForm((f) => ({ ...f, source: v as CandidateSource }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {formatCandidateSource(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Feature name="recruitment.manage">
              <div className="space-y-2 sm:col-span-2">
                <Label>Resume Upload (PDF / DOC / DOCX)</Label>
                <div className="flex flex-wrap items-center gap-3">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf"
                    onChange={(e) => onResumeSelected(e.target.files?.[0])}
                  />
                  {resumeFile ? (
                    <Badge variant="secondary" className="gap-1">
                      <Upload className="h-3 w-3" />
                      {resumeFile.name}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </Feature>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Feature name="recruitment.manage">
              <Button type="button" onClick={() => void saveCandidate()} disabled={saving}>
                {saving ? 'Saving…' : 'Save Candidate'}
              </Button>
            </Feature>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(profileId)} onOpenChange={(open) => !open && setProfileId(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{profile?.fullName}</DialogTitle>
            <DialogDescription>
              {profile?.email} · {profile?.phone}
            </DialogDescription>
          </DialogHeader>
          {profile ? (
            <div className="space-y-5 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <p>
                  <span className="font-medium text-navy">Location: </span>
                  {profile.location ?? '—'}
                </p>
                <p>
                  <span className="font-medium text-navy">Experience: </span>
                  {formatExperienceYears(profile.experienceYears)}
                </p>
                {latestStatus ? (
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <span className="font-medium text-navy">Latest application status:</span>
                    <ApplicationStatusBadge status={latestStatus} />
                  </div>
                ) : null}
              </div>
              {parseState.data ? (
                <pre className="rounded-xl border border-border-soft bg-muted-bg/40 p-4 text-xs whitespace-pre-wrap">
                  Parsed preview: {parseState.data.skills.join(', ') || 'No skills detected'}
                </pre>
              ) : null}
              {statusQuery.isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : statusQuery.isError ? (
                <p className="text-red-600">
                  {getApiErrorMessage(statusQuery.error, 'Could not load status history.')}
                </p>
              ) : (
                <ul className="space-y-2">
                  {(statusQuery.data?.entries ?? []).length === 0 ? (
                    <li className="text-text-secondary">No status history yet.</li>
                  ) : (
                    statusQuery.data?.entries.map((item, index) => (
                      <li key={item.id ?? index} className="rounded-lg border border-border-soft px-3 py-2">
                        {item.previousStatus
                          ? `${formatApplicationStatus(item.previousStatus)} → `
                          : ''}
                        {item.status ? formatApplicationStatus(item.status) : '—'}
                        {item.jobTitle ? ` · ${item.jobTitle}` : ''}
                        {item.changedAt ? ` · ${item.changedAt}` : ''}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </RecruitmentPageShell>
  )
}