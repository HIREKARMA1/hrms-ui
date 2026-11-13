import type { PipelineStage } from '../types/recruitment'

export const PIPELINE_STAGES: PipelineStage[] = [
  'Applied',
  'Screening',
  'Shortlisted',
  'Interview',
  'Selected',
  'Offer Released',
  'Joined',
  'Rejected',
]

const FORWARD: Record<PipelineStage, PipelineStage[]> = {
  Applied: ['Screening', 'Rejected'],
  Screening: ['Shortlisted', 'Rejected'],
  Shortlisted: ['Interview', 'Rejected'],
  Interview: ['Selected', 'Rejected'],
  Selected: ['Offer Released', 'Rejected'],
  'Offer Released': ['Joined', 'Rejected'],
  Joined: [],
  Rejected: [],
}

export function getAllowedNextStages(current: PipelineStage): PipelineStage[] {
  return FORWARD[current] ?? []
}

export function canTransition(
  from: PipelineStage,
  to: PipelineStage,
): boolean {
  if (from === to) return true
  return getAllowedNextStages(from).includes(to)
}
