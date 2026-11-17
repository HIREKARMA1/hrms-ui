import type { Interview } from '../types/recruitment'

export function interviewsForCandidateOnJob(
  interviews: Interview[],
  jobId: string,
  candidateId: string,
) {
  return interviews.filter(
    (i) => i.jobId === jobId && i.candidateId === candidateId,
  )
}

export function nextScheduledInterview(
  rows: Interview[],
): Interview | null {
  const active = rows.filter(
    (i) => i.status === 'Scheduled' || i.status === 'Rescheduled',
  )
  if (active.length === 0) return null
  return [...active].sort((a, b) =>
    `${a.date}${a.startTime}`.localeCompare(`${b.date}${b.startTime}`),
  )[0]
}