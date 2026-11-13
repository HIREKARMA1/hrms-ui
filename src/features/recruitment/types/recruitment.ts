export type JobStatus = 'Draft' | 'Published' | 'Closed' | 'On Hold'

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship'

export type WorkMode = 'On-site' | 'Hybrid' | 'Remote'

export type PipelineStage =
  | 'Applied'
  | 'Screening'
  | 'Shortlisted'
  | 'Interview'
  | 'Selected'
  | 'Offer Released'
  | 'Joined'
  | 'Rejected'

export type InterviewStatus =
  | 'Scheduled'
  | 'Completed'
  | 'Cancelled'
  | 'Rescheduled'

export type InterviewType = 'Technical' | 'HR' | 'Managerial' | 'Final' | 'Cultural'

export type HireRecommendation = 'Strong Hire' | 'Hire' | 'Hold' | 'Reject'

export type OfferStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Released'
  | 'Accepted'
  | 'Rejected'
  | 'Expired'

export type ResumeParseStatus = 'Not Started' | 'Pending' | 'Completed (Demo)' | 'Unavailable'

export type JobPosting = {
  id: string
  title: string
  department: string
  designation: string
  location: string
  employmentType: EmploymentType
  workMode: WorkMode
  experienceRequired: string
  openings: number
  salaryRange: string
  description: string
  requiredSkills: string[]
  qualifications: string
  applicationDeadline: string
  status: JobStatus
  applicants: number
  jobDescriptionId?: string
  createdAt: string
}

export type JobDescription = {
  id: string
  title: string
  department: string
  summary: string
  responsibilities: string
  requiredSkills: string[]
  qualifications: string
  experienceRequired: string
  updatedAt: string
}

export type Candidate = {
  id: string
  fullName: string
  email: string
  phone: string
  currentLocation: string
  totalExperience: string
  currentCompany: string
  currentDesignation: string
  skills: string[]
  highestQualification: string
  appliedJobId: string
  appliedJobTitle: string
  applicationDate: string
  stage: PipelineStage
  resumeFileName: string
  resumeParseStatus: ResumeParseStatus
  source: string
  initials: string
}

export type ParsedResumeInfo = {
  name: string
  email: string
  phone: string
  skills: string[]
  education: string
  experience: string
  previousEmployment: string
  note: string
}

export type Interview = {
  id: string
  candidateId: string
  candidateName: string
  jobId: string
  jobTitle: string
  round: string
  interviewType: InterviewType
  date: string
  startTime: string
  endTime: string
  interviewers: string[]
  meetingLink: string
  location: string
  notes: string
  status: InterviewStatus
}

export type InterviewFeedback = {
  id: string
  interviewId: string
  candidateId: string
  candidateName: string
  jobTitle: string
  interviewer: string
  technicalRating: number
  communicationRating: number
  problemSolvingRating: number
  overallRating: number
  recommendation: HireRecommendation
  comments: string
  submittedAt: string
}

export type Offer = {
  id: string
  candidateId: string
  candidateName: string
  jobTitle: string
  offeredDesignation: string
  department: string
  offeredSalary: string
  joiningDate: string
  offerExpiryDate: string
  employmentType: EmploymentType
  status: OfferStatus
}

export type RecruitmentActivity = {
  id: string
  text: string
  time: string
}

export type StageHistoryItem = {
  id: string
  candidateId: string
  fromStage: PipelineStage | null
  toStage: PipelineStage
  changedAt: string
  changedBy: string
}
