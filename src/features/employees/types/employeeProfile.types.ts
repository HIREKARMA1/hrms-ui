export type EmploymentStatus =
  | 'Active'
  | 'Inactive'
  | 'Probation'
  | 'Notice Period'
  | 'Resigned'
  | 'Terminated'
  | 'Archived'

export type EmploymentType =
  | 'Full-time'
  | 'Part-time'
  | 'Contract'
  | 'Intern'

export type EmployeeActivityItem = {
  id: string
  at: string
  action: string
  by: string
}

export type EmployeeProfile = {
  id: string
  employeeId: string
  employeeCode: string
  firstName: string
  middleName: string
  lastName: string
  profilePictureName: string
  /** Local or remote preview URL for the profile photo. Empty when none. */
  profilePictureUrl: string
  dateOfBirth: string
  gender: string
  maritalStatus: string
  bloodGroup: string
  nationality: string
  personalEmail: string
  personalMobile: string
  currentAddress: string
  permanentAddress: string
  city: string
  state: string
  country: string
  pinCode: string
  emergencyContactPerson: string
  emergencyContactNumber: string
  emergencyRelationship: string
  dateOfJoining: string
  employmentType: EmploymentType
  department: string
  designation: string
  jobRole: string
  reportingManager: string
  teamLeader: string
  workLocation: string
  branch: string
  workEmail: string
  workPhone: string
  employmentStatus: EmploymentStatus
  probationStartDate: string
  probationEndDate: string
  confirmationDate: string
  noticePeriod: string
  workShift: string
  activityHistory: EmployeeActivityItem[]
}

export type EmployeeProfileFormState = Omit<EmployeeProfile, 'id' | 'activityHistory'>
