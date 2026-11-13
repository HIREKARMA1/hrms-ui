import { useMemo, useState } from 'react'

import { Feature } from '@/features/rbac/components/Feature'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { MockDataBanner, StageBadge } from '../components'
import { departments } from '../mocks/recruitmentMocks'
import {
  listCandidates,
  listJobs,
  listStageHistory,
  transitionCandidateStage,
} from '../services/recruitmentService'
import type { Candidate, PipelineStage } from '../types/recruitment'
import { getAllowedNextStages, PIPELINE_STAGES } from '../utils/pipeline'

export function ApplicationPipelinePage() {
  const [candidates, setCandidates] = useState(() => listCandidates())
  const [jobs] = useState(() => listJobs())
  const [jobFilter, setJobFilter] = useState('All')
  const [department, setDepartment] = useState('All')
  const [dateFrom, setDateFrom] = useState('')
  const [selected, setSelected] = useState<Candidate | null>(null)
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return candidates.filter((c) => {
      if (jobFilter !== 'All' && c.appliedJobId !== jobFilter) return false
      if (dateFrom && c.applicationDate < dateFrom) return false
      if (department !== 'All') {
        const job = jobs.find((j) => j.id === c.appliedJobId)
        if (!job || job.department !== department) return false
      }
      return true
    })
  }, [candidates, jobFilter, department, dateFrom, jobs])

  const byStage = useMemo(() => {
    const map = Object.fromEntries(
      PIPELINE_STAGES.map((stage) => [stage, [] as Candidate[]]),
    ) as Record<PipelineStage, Candidate[]>
    for (const c of filtered) {
      map[c.stage].push(c)
    }
    return map
  }, [filtered])

  const history = selected ? listStageHistory(selected.id) : []

  const changeStage = (candidateId: string, next: PipelineStage) => {
    const result = transitionCandidateStage(candidates, candidateId, next)
    if (!result.ok) {
      setError(result.reason)
      return
    }
    setError(null)
    setCandidates(result.candidates)
    setSelected((prev) =>
      prev && prev.id === candidateId ? { ...prev, stage: next } : prev,
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-navy">
          Application Pipeline
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Kanban view of candidates by stage. Use the stage dropdown to move
          candidates (drag-and-drop library not installed).
        </p>
      </div>

      <MockDataBanner />

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-2xl border border-border-soft bg-white p-4 shadow-sm lg:flex-row lg:items-center">
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
        <Input
          type="date"
          className="w-full lg:w-44"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          aria-label="Applications from date"
        />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {PIPELINE_STAGES.map((stage) => (
          <div
            key={stage}
            className="w-[260px] shrink-0 rounded-2xl border border-border-soft bg-muted-bg/40"
          >
            <div className="flex items-center justify-between border-b border-border-soft px-3 py-3">
              <p className="text-sm font-semibold text-navy">{stage}</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-brand-500 shadow-sm">
                {byStage[stage].length}
              </span>
            </div>
            <ul className="space-y-2 p-3">
              {byStage[stage].map((c) => {
                const nextStages = getAllowedNextStages(c.stage)
                return (
                  <li
                    key={c.id}
                    className="rounded-xl border border-border-soft bg-white p-3 shadow-sm"
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => setSelected(c)}
                    >
                      <p className="font-medium text-navy">{c.fullName}</p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {c.appliedJobTitle}
                      </p>
                      <p className="mt-1 text-xs text-text-secondary">
                        {c.totalExperience} · {c.applicationDate}
                      </p>
                    </button>
                    <Feature name="recruitment.manage">
                      {nextStages.length > 0 ? (
                        <Select
                          key={`${c.id}-${c.stage}`}
                          onValueChange={(v) =>
                            changeStage(c.id, v as PipelineStage)
                          }
                        >
                          <SelectTrigger className="mt-2 h-8 text-xs">
                            <SelectValue placeholder="Move stage" />
                          </SelectTrigger>
                          <SelectContent>
                            {nextStages.map((s) => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-2 text-xs text-text-secondary">
                          Terminal stage
                        </p>
                      )}
                    </Feature>
                  </li>
                )
              })}
              {byStage[stage].length === 0 ? (
                <li className="rounded-xl border border-dashed border-border-soft px-3 py-6 text-center text-xs text-text-secondary">
                  No candidates
                </li>
              ) : null}
            </ul>
          </div>
        ))}
      </div>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.fullName}</DialogTitle>
            <DialogDescription>
              {selected?.appliedJobTitle} · {selected?.email}
            </DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-navy">Current stage:</span>
                <StageBadge stage={selected.stage} />
              </div>
              <p>
                Experience: {selected.totalExperience} · Applied{' '}
                {selected.applicationDate}
              </p>
              <div>
                <p className="font-medium text-navy">Application history</p>
                <ul className="mt-2 space-y-2">
                  {history.length === 0 ? (
                    <li className="text-text-secondary">No history yet.</li>
                  ) : (
                    history.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-lg border border-border-soft px-3 py-2"
                      >
                        {item.fromStage ?? '—'} → {item.toStage} ·{' '}
                        {item.changedAt}
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <Feature name="recruitment.manage">
                <div className="flex flex-wrap gap-2">
                  {getAllowedNextStages(selected.stage).map((s) => (
                    <Button
                      key={s}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => changeStage(selected.id, s)}
                    >
                      Move to {s}
                    </Button>
                  ))}
                </div>
              </Feature>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
