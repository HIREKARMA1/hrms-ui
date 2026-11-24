export type OnboardingFormStatus = 'INCOMPLETE' | 'FILLED' | 'VERIFIED'

export type OnboardingAddress = {
  line1: string
  line2?: string | null
  city: string
  state: string
  pincode: string
  country?: string | null
}

export type OnboardingBankDetail = {
  accountHolderName: string
  accountNumber: string
  ifsc: string
  bankName: string
  branch?: string | null
}

export type OrganisationOnboarding = {
  id: string
  employeeCode: string
  email: string
  status: OnboardingFormStatus
  expiresAt: string
  filledAt: string | null
  dateOfBirth: string
  firstName: string
  lastName: string | null
  professionalIdentity: string | null
  phone: string | null
  aadhaar: string | null
  pan: string | null
  bloodGroup: string | null
  photoUrl: string | null
  uanNumber: string | null
  salarySlipUrls: string[]
  /** @deprecated Prefer salarySlipUrls */
  salarySlipUrl: string | null
  relievingLetterUrl: string | null
  permanentAddress: OnboardingAddress | null
  currentAddress: OnboardingAddress | null
  bankDetail: OnboardingBankDetail | null
  userId: string
  employeeId: string | null
  createdAt: string
  updatedAt: string
}

export type CreateOnboardingAccountBody = {
  employeeCode: string
  firstName: string
  dateOfBirth: string
  email: string
}

export type CreateOnboardingAccountResult = {
  onboardingId: string
  employeeCode: string
  email: string
  password: string
  status: OnboardingFormStatus
  expiresAt: string
  firstName: string
  dateOfBirth: string
  emailDelivery: {
    sent: boolean
    formUrl: string | null
    error?: string
  }
}

export type ListOnboardingsArgs = {
  status?: OnboardingFormStatus
  skip?: number
  take?: number
}

export type OnboardingsPage = {
  total: number
  skip: number
  take: number
  items: OrganisationOnboarding[]
}

export type SubmitOnboardingFormBody = {
  email: string
  password: string
  firstName: string
  lastName: string
  professionalIdentity: string
  phone: string
  aadhaar: string
  pan: string
  bloodGroup: string
  photoUrl: string
  uanNumber?: string
  salarySlipUrls?: string[]
  /** @deprecated Prefer salarySlipUrls */
  salarySlipUrl?: string
  relievingLetterUrl?: string
  permanentAddress: OnboardingAddress
  currentAddress?: OnboardingAddress
  bankDetail: OnboardingBankDetail
}

export type OnboardingFormLoginBody = {
  email: string
  password: string
}

export type OnboardingFormLoginResult = {
  onboardingId: string
  email: string
  firstName: string
  employeeCode: string
  status: OnboardingFormStatus
  expiresAt: string
}

export type VerifyOnboardingBody = {
  designation: string
  dateOfJoining: string
  employmentStatus: 'ACTIVE' | 'ON_LEAVE' | 'PROBATION' | 'TERMINATED'
  deviceId: string
  departmentId?: string
  deviceUserId?: string
  role?: 'EMPLOYEE' | 'HR_ADMIN' | 'MANAGER' | 'SUPER_ADMIN'
}

export type VerifyOnboardingResult = OrganisationOnboarding & {
  employeeId: string
  employeeCode: string
}

export type OnboardingUploadResult = {
  key: string
  assetUrl: string
  folder: string
  originalName: string
  contentType: string
  size: number
}
