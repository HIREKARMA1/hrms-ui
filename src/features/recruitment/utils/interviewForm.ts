import type {
  Interview,
  InterviewStatus,
  InterviewType,
} from '../types/recruitment'

export type InterviewFormState = {
  candidateId: string
  jobId: string
  round: string
  interviewType: InterviewType
  date: string
  startTime: string
  endTime: string
  interviewers: string
  meetingLink: string
  location: string
  notes: string
  status: InterviewStatus
}

export const INTERVIEW_TYPES: InterviewType[] = [
  'Technical',
  'HR',
  'Managerial',
  'Final',
  'Cultural',
]

export const INTERVIEW_STATUSES: InterviewStatus[] = [
  'Scheduled',
  'Completed',
  'Cancelled',
  'Rescheduled',
]

export const emptyInterviewForm: InterviewFormState = {
  candidateId: '',
  jobId: '',
  round: 'Technical Round 1',
  interviewType: 'Technical',
  date: '',
  startTime: '10:00',
  endTime: '11:00',
  interviewers: '',
  meetingLink: '',
  location: 'Virtual',
  notes: '',
  status: 'Scheduled',
}

export function interviewToForm(item: Interview): InterviewFormState {
  return {
    candidateId: item.candidateId,
    jobId: item.jobId,
    round: item.round,
    interviewType: item.interviewType,
    date: item.date,
    startTime: item.startTime,
    endTime: item.endTime,
    interviewers: item.interviewers.join(', '),
    meetingLink: item.meetingLink,
    location: item.location,
    notes: item.notes,
    status: item.status,
  }
}