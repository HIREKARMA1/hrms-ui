/**
 * Employee profile photo upload.
 *
 * No confirmed backend upload endpoint exists in this frontend yet.
 * Set VITE_EMPLOYEE_PHOTO_UPLOAD_URL when the API is available.
 * This module never returns a mock/fake successful upload.
 */

export type ProfilePhotoUploadResult =
  | {
      ok: true
      url: string
      fileName: string
    }
  | {
      ok: false
      code: 'missing_api' | 'network' | 'http' | 'invalid'
      message: string
    }

export function getEmployeePhotoUploadEndpoint(): string | null {
  const value = import.meta.env.VITE_EMPLOYEE_PHOTO_UPLOAD_URL
  if (typeof value === 'string' && value.trim()) return value.trim()
  return null
}

export function isEmployeePhotoUploadConfigured() {
  return Boolean(getEmployeePhotoUploadEndpoint())
}

/**
 * Uploads a profile photo via the configured endpoint.
 * Returns a clear missing_api result when the endpoint is not configured.
 */
export async function uploadEmployeeProfilePhoto(input: {
  employeeId: string
  file: Blob
  fileName: string
}): Promise<ProfilePhotoUploadResult> {
  if (!input.employeeId.trim()) {
    return {
      ok: false,
      code: 'invalid',
      message: 'Employee ID is required before uploading a profile photo.',
    }
  }

  const endpoint = getEmployeePhotoUploadEndpoint()
  if (!endpoint) {
    return {
      ok: false,
      code: 'missing_api',
      message:
        'Profile photo upload API is not configured (VITE_EMPLOYEE_PHOTO_UPLOAD_URL). Photo was not saved to the server.',
    }
  }

  const body = new FormData()
  body.append('employeeId', input.employeeId)
  body.append('photo', input.file, input.fileName)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body,
      credentials: 'include',
    })

    if (!response.ok) {
      return {
        ok: false,
        code: 'http',
        message: `Photo upload failed (${response.status}).`,
      }
    }

    const payload = (await response.json().catch(() => null)) as {
      url?: string
      fileName?: string
    } | null

    if (!payload?.url) {
      return {
        ok: false,
        code: 'http',
        message:
          'Upload response did not include a photo URL. Server save could not be confirmed.',
      }
    }

    return {
      ok: true,
      url: payload.url,
      fileName: payload.fileName ?? input.fileName,
    }
  } catch {
    return {
      ok: false,
      code: 'network',
      message: 'Network error while uploading the profile photo.',
    }
  }
}
