import type { EmployeeRecord } from '../api/employeeMappers'
import type {
  DocumentCategory,
  EmployeeDocument,
} from '../types/employeeDocuments.types'

const TYPE_TO_CATEGORY: Record<string, DocumentCategory> = {
  TENTH: 'Educational Certificate',
  TWELFTH: 'Educational Certificate',
  GRADUATION: 'Educational Certificate',
  CERTIFICATE: 'Educational Certificate',
  RELIEVING: 'Previous Employment Certificate',
  EXPERIENCE: 'Experience Letter',
  SALARY_SLIP: 'Other',
}

export type EmployeeDocumentOption = {
  id: string
  employeeCode: string
  name: string
  documentCount: number
}

function employeeDisplayName(employee: EmployeeRecord): string {
  const name = `${employee.profile.firstName} ${employee.profile.lastName}`.trim()
  return name || employee.server.employeeCode
}

/** Employees available in the documents picker (includes those with zero files). */
export function mapEmployeeDocumentOptions(
  employees: EmployeeRecord[],
): EmployeeDocumentOption[] {
  return employees.map((employee) => {
    const docs = employee.server.documents ?? []
    const photoExtra = employee.profile.profilePictureUrl ? 1 : 0
    return {
      id: employee.server.id,
      employeeCode: employee.server.employeeCode,
      name: employeeDisplayName(employee),
      documentCount: docs.length + photoExtra,
    }
  })
}

export function mapEmployeeRecordsToDocuments(
  employees: EmployeeRecord[],
): EmployeeDocument[] {
  const rows: EmployeeDocument[] = []
  for (const employee of employees) {
    const name = employeeDisplayName(employee)
    const employeeCode = employee.server.employeeCode
    const photoUrl = employee.profile.profilePictureUrl?.trim()
    if (photoUrl) {
      rows.push({
        id: `${employee.server.id}-photo`,
        employeeId: employee.server.id,
        employeeCode,
        employeeName: name || employeeCode,
        category: 'Passport Photograph',
        fileName: employee.profile.profilePictureName || 'photo',
        fileUrl: photoUrl,
        verificationStatus: 'Verified',
        uploadedAt: '',
        expiryDate: '',
        accessLevel: 'Employee+HR',
        fromServer: true,
        versions: [
          {
            version: 1,
            fileName: employee.profile.profilePictureName || 'photo',
            uploadedAt: '',
            uploadedBy: 'Employee profile',
          },
        ],
      })
    }
    for (const doc of employee.server.documents ?? []) {
      rows.push({
        id: doc.id,
        employeeId: employee.server.id,
        employeeCode,
        employeeName: name || employeeCode,
        category: TYPE_TO_CATEGORY[doc.type] ?? 'Other',
        fileName: doc.fileName || doc.label || doc.type,
        fileUrl: doc.url,
        verificationStatus: 'Verified',
        uploadedAt: doc.uploadedAt?.slice(0, 10) || '',
        expiryDate: '',
        accessLevel: 'Employee+HR',
        fromServer: true,
        versions: [
          {
            version: 1,
            fileName: doc.fileName || doc.label || doc.type,
            uploadedAt: doc.uploadedAt?.slice(0, 10) || '',
            uploadedBy: 'Organisation onboarding / HR',
          },
        ],
      })
    }
  }
  return rows
}
