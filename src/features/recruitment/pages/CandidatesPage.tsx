import { Eye, Pencil, Plus, Search, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  MockDataBanner,
  RecruitmentPageShell,
  ResumeParseBadge,
  StageBadge,
} from '../components'
import { RECRUITMENT_FILTER_BAR } from '../components/shared/recruitmentUi'
import {
  getParsedResume,
  listCandidates,
  listJobs,
  listStageHistory,
} from '../services/recruitmentService'
import type { Candidate, PipelineStage } from '../types/recruitment'
import { PIPELINE_STAGES } from '../utils/pipeline'

type CandidateForm = {
  fullName: string
  email: string
  phone: string
  currentLocation: string
  totalExperience: string
  currentCompany: string
  currentDesignation: string
  skills: string
  highestQualification: string
  appliedJobId: string
  resumeFileName: string
  source: string
}

const emptyForm: CandidateForm = {
  fullName: '',
  email: '',
  phone: '',
  currentLocation: '',
  totalExperience: '',
  currentCompany: '',
  currentDesignation: '',
  skills: '',
  highestQualification: '',
  appliedJobId: '',
  resumeFileName: '',
  source: 'LinkedIn',
}

const sources = [
  'LinkedIn',
  'Referral',
  'Naukri',
  'Company Careers',
  'Agency',
  'Other',
]

function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function CandidatesPage() {
  const [candidates, setCandidates] = useState(() => listCandidates())
  const [jobs] = useState(() => listJobs())
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('All')
  const [jobFilter, setJobFilter] = useState('All')
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<CandidateForm>(emptyForm)
  const [profileId, setProfileId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return candidates.filter((c) => {
      if (stageFilter !== 'All' && c.stage !== stageFilter) return false
      if (jobFilter !== 'All' && c.appliedJobId !== jobFilter) return false
      if (!q) return true
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q))
      )
    })
  }, [candidates, search, stageFilter, jobFilter])

  const profile = candidates.find((c) => c.id === profileId) ?? null
  const parsed = profile ? getParsedResume(profile.id) : null
  const history = profile ? listStageHistory(profile.id) : []

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm, appliedJobId: jobs[0]?.id ?? '' })
    setFormOpen(true)
  }

  const openEdit = (c: Candidate) => {
    setEditingId(c.id)
    setForm({
      fullName: c.fullName,
      email: c.email,
      phone: c.phone,
      currentLocation: c.currentLocation,
      totalExperience: c.totalExperience,
      currentCompany: c.currentCompany,
      currentDesignation: c.currentDesignation,
      skills: c.skills.join(', '),
      highestQualification: c.highestQualification,
      appliedJobId: c.appliedJobId,
      resumeFileName: c.resumeFileName,
      source: c.source,
    })
    setFormOpen(true)
  }

  const onResumeSelected = (file: File | undefined) => {
    if (!file) return
    const ok =
      /\.pdf$/i.test(file.name) ||
      /\.docx?$/i.test(file.name)
    if (!ok) return
    setForm((f) => ({ ...f, resumeFileName: file.name }))
  }

  const saveCandidate = () => {
    if (!form.fullName.trim() || !form.email.trim()) return
    const job = jobs.find((j) => j.id === form.appliedJobId)
    const base = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      currentLocation: form.currentLocation.trim(),
      totalExperience: form.totalExperience.trim(),
      currentCompany: form.currentCompany.trim(),
      currentDesignation: form.currentDesignation.trim(),
      skills: form.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      highestQualification: form.highestQualification.trim(),
      appliedJobId: form.appliedJobId,
      appliedJobTitle: job?.title ?? 'Unknown role',
      resumeFileName: form.resumeFileName || 'Not uploaded',
      source: form.source,
      initials: initialsFromName(form.fullName),
      resumeParseStatus: form.resumeFileName
        ? ('Pending' as const)
        : ('Not Started' as const),
    }

    if (editingId) {
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? {
                ...c,
                ...base,
                resumeParseStatus: c.resumeParseStatus,
              }
            : c,
        ),
      )
    } else {
      setCandidates((prev) => [
        {
          ...base,
          id: `CAN-${200 + prev.length + 1}`,
          applicationDate: new Date().toISOString().slice(0, 10),
          stage: 'Applied' as PipelineStage,
        },
        ...prev,
      ])
    }
    setFormOpen(false)
  }

  return (
    <RecruitmentPageShell
      activeSection="Candidates"
      trailing={
        <Feature name="recruitment.manage">
          <Button type="button" className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Register Candidate
          </Button>
        </Feature>
      }
    >
      <MockDataBanner message="Resume upload stores the file name locally. Resume parsing is demo-only until a parsing API exists." />

      <div className={RECRUITMENT_FILTER_BAR}>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            className="pl-9"
            placeholder="Search name, email, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All stages</SelectItem>
            {PIPELINE_STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={jobFilter} onValueChange={setJobFilter}>
          <SelectTrigger className="w-full lg:w-56">
            <SelectValue placeholder="Job" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All jobs</SelectItem>
            {jobs.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                {job.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Applied Job</TableHead>
              <TableHead>Current company</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Resume</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{c.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-navy">{c.fullName}</p>
                      <p className="text-xs text-text-secondary">{c.email}</p>
                      <p className="text-xs text-text-secondary">{c.phone}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{c.appliedJobTitle}</TableCell>
                <TableCell className="max-w-[160px]">
                  <p
                    className="truncate font-medium text-navy"
                    title={c.currentCompany || undefined}
                  >
                    {c.currentCompany || '—'}
                  </p>
                  {c.currentDesignation ? (
                    <p
                      className="truncate text-xs text-text-secondary"
                      title={c.currentDesignation}
                    >
                      {c.currentDesignation}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell>{c.totalExperience}</TableCell>
                <TableCell>
                  <div className="flex max-w-[160px] flex-wrap gap-1">
                    {c.skills.slice(0, 2).map((s) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{c.applicationDate}</TableCell>
                <TableCell>
                  <StageBadge stage={c.stage} />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-xs text-text-secondary">{c.resumeFileName}</p>
                    <ResumeParseBadge status={c.resumeParseStatus} />
                  </div>
                </TableCell>
                <TableCell>{c.source}</TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setProfileId(c.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Feature name="recruitment.manage">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(c)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Feature>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Candidate' : 'Register Candidate'}
            </DialogTitle>
            <DialogDescription>
              Associate the candidate with a job and optionally attach a resume.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {(
              [
                ['fullName', 'Full Name'],
                ['email', 'Email'],
                ['phone', 'Phone Number'],
                ['currentLocation', 'Current Location'],
                ['totalExperience', 'Total Experience'],
                ['currentCompany', 'Current Company'],
                ['currentDesignation', 'Current Designation'],
                ['highestQualification', 'Highest Qualification'],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <Input
                  value={form[key]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, [key]: e.target.value }))
                  }
                />
              </div>
            ))}
            <div className="space-y-2 sm:col-span-2">
              <Label>Skills</Label>
              <Input
                placeholder="Comma-separated"
                value={form.skills}
                onChange={(e) =>
                  setForm((f) => ({ ...f, skills: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Applied Job</Label>
              <Select
                value={form.appliedJobId}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, appliedJobId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select
                value={form.source}
                onValueChange={(v) => setForm((f) => ({ ...f, source: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Resume Upload (PDF / DOC / DOCX)</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf"
                  onChange={(e) => onResumeSelected(e.target.files?.[0])}
                />
                {form.resumeFileName ? (
                  <Badge variant="secondary" className="gap-1">
                    <Upload className="h-3 w-3" />
                    {form.resumeFileName}
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveCandidate}>
              Save Candidate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(profile)}
        onOpenChange={(open) => !open && setProfileId(null)}
      >
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
                  {profile.currentLocation}
                </p>
                <p>
                  <span className="font-medium text-navy">Experience: </span>
                  {profile.totalExperience}
                </p>
                <p>
                  <span className="font-medium text-navy">Company: </span>
                  {profile.currentCompany} · {profile.currentDesignation}
                </p>
                <p>
                  <span className="font-medium text-navy">Applied job: </span>
                  {profile.appliedJobTitle}
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-navy">Stage:</span>
                  <StageBadge stage={profile.stage} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-navy">Parse status:</span>
                  <ResumeParseBadge status={profile.resumeParseStatus} />
                </div>
              </div>

              <div>
                <p className="font-medium text-navy">Skills</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {profile.skills.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="font-medium text-amber-900">
                  Parsed resume information (demo)
                </p>
                <p className="mt-1 text-xs text-amber-800">
                  No resume parsing API is connected. Values below are mock/demo
                  data when available.
                </p>
                {parsed ? (
                  <dl className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-amber-700">Name</dt>
                      <dd>{parsed.name}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-amber-700">Email</dt>
                      <dd>{parsed.email}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-amber-700">Phone</dt>
                      <dd>{parsed.phone}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-amber-700">Education</dt>
                      <dd>{parsed.education}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-amber-700">Skills</dt>
                      <dd>{parsed.skills.join(', ')}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-amber-700">Experience</dt>
                      <dd>{parsed.experience}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-xs text-amber-700">
                        Previous Employment
                      </dt>
                      <dd>{parsed.previousEmployment}</dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-3 text-amber-900">
                    Parsed fields unavailable for this candidate (
                    {profile.resumeParseStatus}).
                  </p>
                )}
              </div>

              <div>
                <p className="font-medium text-navy">Application history</p>
                <ul className="mt-2 space-y-2">
                  {history.length === 0 ? (
                    <li className="text-text-secondary">No stage changes recorded.</li>
                  ) : (
                    history.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-lg border border-border-soft px-3 py-2"
                      >
                        {item.fromStage ?? '—'} → {item.toStage} · {item.changedAt}{' '}
                        by {item.changedBy}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </RecruitmentPageShell>
  )
}
