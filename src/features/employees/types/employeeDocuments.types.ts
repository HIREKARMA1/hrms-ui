export type DocumentCategory =
  | 'Resume'
  | 'Aadhaar'
  | 'PAN'
  | 'Educational Certificate'
  | 'Previous Employment Certificate'
  | 'Experience Letter'
  | 'Offer Letter'
  | 'Appointment Letter'
  | 'Joining Letter'
  | 'NDA'
  | 'Address Proof'
  | 'Bank Document'
  | 'Passport Photograph'
  | 'Other'

export type DocumentVerificationStatus =
  | 'Pending'
  | 'Verified'
  | 'Rejected'
  | 'Expired'

export type DocumentVersion = {
  version: number
  fileName: string
  uploadedAt: string
  uploadedBy: string
}

export type EmployeeDocument = {
  id: string
  employeeId: string
  employeeName: string
  category: DocumentCategory
  fileName: string
  verificationStatus: DocumentVerificationStatus
  uploadedAt: string
  expiryDate: string
  accessLevel: 'HR-only' | 'Employee+HR' | 'Admin-view'
  versions: DocumentVersion[]
}
