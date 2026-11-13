import { Eye, Link2, Pencil, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

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

import { MockDataBanner } from '../components'
import { departments } from '../mocks/recruitmentMocks'
import {
  listJobDescriptions,
  listJobs,
} from '../services/recruitmentService'
import type { JobDescription } from '../types/recruitment'

type JdForm = {
  title: string
  department: string
  summary: string
  responsibilities: string
  requiredSkills: string
  qualifications: string
  experienceRequired: string
}

const emptyForm: JdForm = {
  title: '',
  department: 'Engineering',
  summary: '',
  responsibilities: '',
  requiredSkills: '',
  qualifications: '',
  experienceRequired: '',
}

export function JobDescriptionsPage() {
  const [jds, setJds] = useState(() => listJobDescriptions())
  const [jobs, setJobs] = useState(() => listJobs())
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [viewId, setViewId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<JdForm>(emptyForm)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkJdId, setLinkJdId] = useState<string | null>(null)
  const [linkJobId, setLinkJobId] = useState('')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return jds
    return jds.filter(
      (jd) =>
        jd.title.toLowerCase().includes(q) ||
        jd.department.toLowerCase().includes(q),
    )
  }, [jds, search])

  const viewing = jds.find((jd) => jd.id === viewId) ?? null

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEdit = (jd: JobDescription) => {
    setEditingId(jd.id)
    setForm({
      title: jd.title,
      department: jd.department,
      summary: jd.summary,
      responsibilities: jd.responsibilities,
      requiredSkills: jd.requiredSkills.join(', '),
      qualifications: jd.qualifications,
      experienceRequired: jd.experienceRequired,
    })
    setFormOpen(true)
  }

  const saveJd = () => {
    if (!form.title.trim()) return
    const payload = {
      title: form.title.trim(),
      department: form.department,
      summary: form.summary.trim(),
      responsibilities: form.responsibilities.trim(),
      requiredSkills: form.requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      qualifications: form.qualifications.trim(),
      experienceRequired: form.experienceRequired.trim(),
      updatedAt: new Date().toISOString().slice(0, 10),
    }
    if (editingId) {
      setJds((prev) =>
        prev.map((jd) => (jd.id === editingId ? { ...jd, ...payload } : jd)),
      )
    } else {
      setJds((prev) => [
        { ...payload, id: `JD-${String(prev.length + 1).padStart(2, '0')}` },
        ...prev,
      ])
    }
    setFormOpen(false)
  }

  const openLink = (jdId: string) => {
    setLinkJdId(jdId)
    setLinkJobId(jobs[0]?.id ?? '')
    setLinkOpen(true)
  }

  const saveLink = () => {
    if (!linkJdId || !linkJobId) return
    setJobs((prev) =>
      prev.map((job) =>
        job.id === linkJobId ? { ...job, jobDescriptionId: linkJdId } : job,
      ),
    )
    setLinkOpen(false)
  }

  const linkedJobs = (jdId: string) =>
    jobs.filter((job) => job.jobDescriptionId === jdId)

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">
            Job Descriptions
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            Reusable JD templates linked to job postings.
          </p>
        </div>
        <Feature name="recruitment.manage">
          <Button type="button" className="gap-2" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Create JD
          </Button>
        </Feature>
      </div>

      <MockDataBanner />

      <Input
        placeholder="Search job descriptions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <div className="overflow-hidden rounded-2xl border border-border-soft bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Linked Jobs</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((jd) => (
              <TableRow key={jd.id}>
                <TableCell>
                  <p className="font-medium text-navy">{jd.title}</p>
                  <p className="text-xs text-text-secondary">{jd.id}</p>
                </TableCell>
                <TableCell>{jd.department}</TableCell>
                <TableCell>{jd.experienceRequired}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {jd.requiredSkills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="tabular-nums">
                  {linkedJobs(jd.id).length}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setViewId(jd.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Feature name="recruitment.manage">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(jd)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => openLink(jd.id)}
                      >
                        <Link2 className="h-4 w-4" />
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
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Job Description' : 'Create Job Description'}
            </DialogTitle>
            <DialogDescription>
              Manage skills, qualifications, and experience requirements.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
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
              <Label>Summary</Label>
              <Textarea
                rows={2}
                value={form.summary}
                onChange={(e) =>
                  setForm((f) => ({ ...f, summary: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Responsibilities</Label>
              <Textarea
                rows={3}
                value={form.responsibilities}
                onChange={(e) =>
                  setForm((f) => ({ ...f, responsibilities: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Required Skills</Label>
              <Input
                placeholder="Comma-separated"
                value={form.requiredSkills}
                onChange={(e) =>
                  setForm((f) => ({ ...f, requiredSkills: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Qualifications</Label>
              <Input
                value={form.qualifications}
                onChange={(e) =>
                  setForm((f) => ({ ...f, qualifications: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Experience Required</Label>
              <Input
                value={form.experienceRequired}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    experienceRequired: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveJd}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(viewing)}
        onOpenChange={(open) => !open && setViewId(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewing?.title}</DialogTitle>
            <DialogDescription>
              {viewing?.department} · Updated {viewing?.updatedAt}
            </DialogDescription>
          </DialogHeader>
          {viewing ? (
            <div className="space-y-3 text-sm">
              <p className="text-text-secondary">{viewing.summary}</p>
              <div>
                <p className="font-medium text-navy">Responsibilities</p>
                <p className="text-text-secondary">{viewing.responsibilities}</p>
              </div>
              <div>
                <p className="font-medium text-navy">Skills</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {viewing.requiredSkills.map((s) => (
                    <Badge key={s} variant="secondary">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <p>
                <span className="font-medium text-navy">Qualifications: </span>
                {viewing.qualifications}
              </p>
              <p>
                <span className="font-medium text-navy">Experience: </span>
                {viewing.experienceRequired}
              </p>
              <div>
                <p className="font-medium text-navy">Linked postings</p>
                <ul className="mt-1 list-inside list-disc text-text-secondary">
                  {linkedJobs(viewing.id).map((job) => (
                    <li key={job.id}>
                      {job.title} ({job.id})
                    </li>
                  ))}
                  {linkedJobs(viewing.id).length === 0 ? (
                    <li>No linked jobs</li>
                  ) : null}
                </ul>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Link to Job Posting</DialogTitle>
            <DialogDescription>
              Associate this JD template with an existing job posting.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Job Posting</Label>
            <Select value={linkJobId} onValueChange={setLinkJobId}>
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLinkOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveLink}>
              Link JD
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
