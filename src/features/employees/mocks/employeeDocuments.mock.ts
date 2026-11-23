import type {
  DocumentCategory,
  EmployeeDocument,
} from '../types/employeeDocuments.types'

export const documentCategories: DocumentCategory[] = [
  'Resume',
  'Aadhaar',
  'PAN',
  'Educational Certificate',
  'Previous Employment Certificate',
  'Experience Letter',
  'Offer Letter',
  'Appointment Letter',
  'Joining Letter',
  'NDA',
  'Address Proof',
  'Bank Document',
  'Passport Photograph',
  'Other',
]

/** Mock document vault — uploads are UI-only (file name captured). */
export const employeeDocumentsMock: EmployeeDocument[] = [
  {
    id: 'doc1',
    employeeId: 'EMP-1021',
    employeeName: 'Ananya Sharma',
    category: 'Resume',
    fileName: 'Ananya_Sharma_Resume.pdf',
    verificationStatus: 'Verified',
    uploadedAt: '2021-03-10',
    expiryDate: '',
    accessLevel: 'Employee+HR',
    versions: [
      {
        version: 1,
        fileName: 'Ananya_Sharma_Resume.pdf',
        uploadedAt: '2021-03-10',
        uploadedBy: 'HR Manager',
      },
    ],
  },
  {
    id: 'doc2',
    employeeId: 'EMP-1021',
    employeeName: 'Ananya Sharma',
    category: 'Aadhaar',
    fileName: 'Ananya_Aadhaar.pdf',
    verificationStatus: 'Verified',
    uploadedAt: '2021-03-10',
    expiryDate: '',
    accessLevel: 'HR-only',
    versions: [
      {
        version: 1,
        fileName: 'Ananya_Aadhaar.pdf',
        uploadedAt: '2021-03-10',
        uploadedBy: 'HR Manager',
      },
    ],
  },
  {
    id: 'doc3',
    employeeId: 'EMP-1201',
    employeeName: 'Ishita Kapoor',
    category: 'PAN',
    fileName: 'Ishita_PAN.pdf',
    verificationStatus: 'Pending',
    uploadedAt: '2026-11-03',
    expiryDate: '',
    accessLevel: 'HR-only',
    versions: [
      {
        version: 1,
        fileName: 'Ishita_PAN.pdf',
        uploadedAt: '2026-11-03',
        uploadedBy: 'HR Manager',
      },
    ],
  },
  {
    id: 'doc4',
    employeeId: 'EMP-1201',
    employeeName: 'Ishita Kapoor',
    category: 'Offer Letter',
    fileName: 'Ishita_Offer.pdf',
    verificationStatus: 'Verified',
    uploadedAt: '2026-10-28',
    expiryDate: '',
    accessLevel: 'Employee+HR',
    versions: [
      {
        version: 1,
        fileName: 'Ishita_Offer_v1.pdf',
        uploadedAt: '2026-10-20',
        uploadedBy: 'HR Manager',
      },
      {
        version: 2,
        fileName: 'Ishita_Offer.pdf',
        uploadedAt: '2026-10-28',
        uploadedBy: 'HR Manager',
      },
    ],
  },
  {
    id: 'doc5',
    employeeId: 'EMP-1133',
    employeeName: 'Arjun Das',
    category: 'Passport Photograph',
    fileName: 'Arjun_photo.jpg',
    verificationStatus: 'Expired',
    uploadedAt: '2020-05-20',
    expiryDate: '2026-05-20',
    accessLevel: 'Employee+HR',
    versions: [
      {
        version: 1,
        fileName: 'Arjun_photo.jpg',
        uploadedAt: '2020-05-20',
        uploadedBy: 'Employee',
      },
    ],
  },
]
