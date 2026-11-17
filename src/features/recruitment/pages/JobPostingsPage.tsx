import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { Feature } from '@/features/rbac/components/Feature'
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
import { Textarea } from '@/components/ui/textarea'

import { JobStatusBadge, RecruitmentPageShell } from '../components'
import { RECRUITMENT_FILTER_BAR } from '../components/shared/recruitmentUi'
import { jobHiringDeskPath, recruitmentRoutePrefix } from '../utils/recruitmentRoutes'
import { departments, locations } from '../mocks/recruitmentMocks'
import { listJobDescriptions, listJobs } from '../services/recruitmentService'
import type {
  EmploymentType,
  JobPosting,
  JobStatus,
  WorkMode,
} from '../types/recruitment'

type JobFormState = {
  title: string
  department: string
  designation: string
  location: string
  employmentType: EmploymentType
  workMode: WorkMode
  experienceRequired: string
  openings: string
  salaryRange: string
  description: string
  requiredSkills: string
  qualifications: string
  applicationDeadline: string
  status: JobStatus
  jobDescriptionId: string
}

const emptyForm: JobFormState = {
  title: '',
  department: 'Engineering',
  designation: '',
  location: 'Hyderabad',
  employmentType: 'Full-time',
  workMode: 'Hybrid',
  experienceRequired: '',
  openings: '1',
  salaryRange: '',
  description: '',
  requiredSkills: '',
  qualifications: '',
  applicationDeadline: '',
  status: 'Draft',
  jobDescriptionId: 'none',
}

const employmentTypes: EmploymentType[] = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
]
const workModes: WorkMode[] = ['On-site', 'Hybrid', 'Remote']
const jobStatuses: JobStatus[] = ['Draft', 'Published', 'Closed', 'On Hold']

export function JobPostingsPage() {
  const routerLocation = useLocation()
  const routePrefix = recruitmentRoutePrefix(routerLocation.pathname)
  const [jobs, setJobs] = useState(() => listJobs())
  const [jds] = useState(() => listJobDescriptions())
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('All')
  const [location, setLocation] = useState('All')
  const [employmentType, setEmploymentType] = useState<string>('All')
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<JobFormState>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<JobPosting | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return jobs.filter((job) => {
      if (department !== 'All' && job.department !== department) return false
      if (location !== 'All' && job.location !== location) return false
      if (employmentType !== 'All' && job.employmentType !== employmentType)
        return false
      if (!q) return true
      return (
        job.title.toLowerCase().includes(q) ||
        job.department.toLowerCase().includes(q) ||
        job.id.toLowerCase().includes(q)
      )
    })
  }, [jobs, search, department, location, employmentType])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (job: JobPosting) => {
    setEditingId(job.id)
    setForm({
      title: job.title,
      department: job.department,
      designation: job.designation,
      location: job.location,
      employmentType: job.employmentType,
      workMode: job.workMode,
      experienceRequired: job.experienceRequired,
      openings: String(job.openings),
      salaryRange: job.salaryRange,
      description: job.description,
      requiredSkills: job.requiredSkills.join(', '),
      qualifications: job.qualifications,
      applicationDeadline: job.applicationDeadline,
      status: job.status,
      jobDescriptionId: job.jobDescriptionId ?? 'none',
    })
    setFormOpen(true)
  }

  const saveJob = () => {
    if (!form.title.trim()) return
    const payload: Omit<JobPosting, 'id' | 'applicants' | 'createdAt'> & {
      applicants?: number
      createdAt?: string
    } = {
      title: form.title.trim(),
      department: form.department,
      designation: form.designation.trim(),
      location: form.location,
      employmentType: form.employmentType,
      workMode: form.workMode,
      experienceRequired: form.experienceRequired.trim(),
      openings: Number(form.openings) || 1,
      salaryRange: form.salaryRange.trim(),
      description: form.description.trim(),
      requiredSkills: form.requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      qualifications: form.qualifications.trim(),
      applicationDeadline: form.applicationDeadline,
      status: form.status,
      jobDescriptionId:
        form.jobDescriptionId === 'none' ? undefined : form.jobDescriptionId,
    }

    if (editingId) {
      setJobs((prev) =>
        prev.map((job) =>
          job.id === editingId ? { ...job, ...payload } : job,
        ),
      )
    } else {
      setJobs((prev) => [
        {
          ...payload,
          id: `JOB-${100 + prev.length + 1}`,
          applicants: 0,
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ])
    }
    setFormOpen(false)
  }

  const setStatus = (id: string, status: JobStatus) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, status } : job)),
    )
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    if (deleteTarget.status === 'Published' && deleteTarget.applicants > 0) {
      setDeleteTarget(null)
      return
    }
    setJobs((prev) => prev.filter((job) => job.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <RecruitmentPageShell
      activeSection="Job Postings"
      trailing={
        <Feature name="recruitment.manage">
          <Button type="button" className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Create Job
          </Button>
        </Feature>
      }
    >
      <div className={RECRUITMENT_FILTER_BAR}>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-secondary" />
          <Input
            className="pl-9"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((d) => (
              <SelectItem key={d} value={d}>
                {d === 'All' ? 'All departments' : d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={location} onValueChange={setLocation}>
          <SelectTrigger className="w-full lg:w-40">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc === 'All' ? 'All locations' : loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={employmentType} onValueChange={setEmploymentType}>
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Employment type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All types</SelectItem>
            {employmentTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Applicants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <p className="font-medium text-navy">{job.title}</p>
                  <p className="text-xs text-text-secondary">{job.id}</p>
                </TableCell>
                <TableCell>{job.department}</TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{job.employmentType}</Badge>
                </TableCell>
                <TableCell className="tabular-nums">{job.applicants}</TableCell>
                <TableCell>
                  <JobStatusBadge status={job.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      title="View applicants & interviews"
                      asChild
                    >
                      <Link to={jobHiringDeskPath(routePrefix, job.id)}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Feature name="recruitment.manage">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(job)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {job.status !== 'Published' ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setStatus(job.id, 'Published')}
                        >
                          Publish
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setStatus(job.id, 'Closed')}
                        >
                          Close
                        </Button>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={
                          job.status === 'Published' && job.applicants > 0
                        }
                        title={
                          job.status === 'Published' && job.applicants > 0
                            ? 'Close the job before deleting when applicants exist'
                            : 'Delete job'
                        }
                        onClick={() => setDeleteTarget(job)}
                      >
                        <Trash2 className="h-4 w-4 text-rose-600" />
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
            <DialogTitle>{editingId ? 'Edit Job' : 'Create Job'}</DialogTitle>
            <DialogDescription>
              Job details are stored locally until a recruitment API is available.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={form.department}
                onValueChange={(v) => setForm((f) => ({ ...f, department: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments
                    .filter((d) => d !== 'All')
                    .map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={form.designation}
                onChange={(e) =>
                  setForm((f) => ({ ...f, designation: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Select
                value={form.location}
                onValueChange={(v) => setForm((f) => ({ ...f, location: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations
                    .filter((l) => l !== 'All')
                    .map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select
                value={form.employmentType}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    employmentType: v as EmploymentType,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {employmentTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Work Mode</Label>
              <Select
                value={form.workMode}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, workMode: v as WorkMode }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {workModes.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Experience Required</Label>
              <Input
                id="experience"
                value={form.experienceRequired}
                onChange={(e) =>
                  setForm((f) => ({ ...f, experienceRequired: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="openings">Number of Openings</Label>
              <Input
                id="openings"
                type="number"
                min={1}
                value={form.openings}
                onChange={(e) =>
                  setForm((f) => ({ ...f, openings: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Salary Range</Label>
              <Input
                id="salary"
                value={form.salaryRange}
                onChange={(e) =>
                  setForm((f) => ({ ...f, salaryRange: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline">Application Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={form.applicationDeadline}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    applicationDeadline: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Job Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as JobStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {jobStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Linked Job Description</Label>
              <Select
                value={form.jobDescriptionId}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, jobDescriptionId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {jds.map((jd) => (
                    <SelectItem key={jd.id} value={jd.id}>
                      {jd.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="skills">Required Skills</Label>
              <Input
                id="skills"
                placeholder="Comma-separated"
                value={form.requiredSkills}
                onChange={(e) =>
                  setForm((f) => ({ ...f, requiredSkills: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="qualifications">Qualifications</Label>
              <Input
                id="qualifications"
                value={form.qualifications}
                onChange={(e) =>
                  setForm((f) => ({ ...f, qualifications: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveJob}>
              Save Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete job posting?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `This removes “${deleteTarget.title}” from the local mock list only.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-rose-600 text-white hover:bg-rose-700"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </RecruitmentPageShell>
  )
}
