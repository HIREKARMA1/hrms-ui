/** Interview types for `/recruitment/interviews`. */

export type InterviewRecommendation = 'PASS' | 'FAIL' | 'HOLD'

export type BackendInterview = {
  id: string
  applicationId: string | null
  candidateId: string | null
  jobPostingId: string | null
  candidateName: string | null
  jobTitle: string | null
  round: string | null
  scheduledAt: string | null
  endAt: string | null
  location: string | null
  meetingLink: string | null
  status: string | null
  interviewerIds: string[]
  interviewerNames: string[]
  notes: string | null
  createdAt: string | null
  updatedAt: string | null
}

export type InterviewsPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type InterviewsPage = {
  items: BackendInterview[]
  pagination: InterviewsPagination
}

export type ListInterviewsArgs = {
  page?: number
  limit?: number
  search?: string
  candidateId?: string
  jobPostingId?: string
  applicationId?: string
  status?: string
  from?: string
  to?: string
}

export type CreateInterviewBody = {
  applicationId?: string
  candidateId?: string
  jobPostingId?: string
  round?: string
  scheduledAt: string
  endAt?: string
  location?: string
  meetingLink?: string
  notes?: string
}

export type UpdateInterviewBody = {
  round?: string
  scheduledAt?: string
  endAt?: string
  location?: string
  meetingLink?: string
  status?: string
  notes?: string
}

export type AssignInterviewersBody = {
  employeeIds: string[]
}

export type InterviewFeedbackItem = {
  id: string | null
  interviewId: string | null
  interviewerId: string | null
  interviewerName: string | null
  recommendation: InterviewRecommendation | null
  comments: string | null
  technicalRating: number | null
  communicationRating: number | null
  createdAt: string | null
}

export type CreateInterviewFeedbackBody = {
  recommendation: InterviewRecommendation
  comments?: string
  technicalRating?: number
  communicationRating?: number
  problemSolvingRating?: number
  overallRating?: number
}