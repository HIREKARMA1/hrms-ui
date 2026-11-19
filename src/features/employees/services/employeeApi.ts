/**
 * Employee profile photo upload via the verified POST /uploads endpoint.
 *
 * Opt-in: disabled unless VITE_EMPLOYEE_PHOTO_UPLOAD_ENABLED=true. When
 * disabled it returns `missing_api` and never fakes a successful upload.
 * The returned `assetUrl` is not yet saved on the employee record: the
 * Employee pages still use mock data (PATCH /employees/:id `photoUrl` is the
 * backend field for that).
 */

import { env } from '@/config/env'
import { getApiErrorMessage } from '@/services/api/errors'
import {
  MAX_UPLOAD_BYTES,
  type UploadedAsset,
  type UploadFileRequest,
} from '@/services/api/uploadsApi'

export const EMPLOYEE_PHOTO_FOLDER = 'employees/photos'

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

/** Performs the upload, e.g. `(req) => uploadFile(req).unwrap()` from `useUploadFileMutation`. */
export type UploadFileFn = (request: UploadFileRequest) => Promise<UploadedAsset>

export function isEmployeePhotoUploadConfigured() {
  return env.employeePhotoUploadEnabled
}

function isNetworkError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    ((error as { status: unknown }).status === 'FETCH_ERROR' ||
      (error as { status: unknown }).status === 'TIMEOUT_ERROR')
  )
}

/**
 * Uploads a profile photo. Returns a clear `missing_api` result when uploads
 * are not enabled.
 */
export async function uploadEmployeeProfilePhoto(
  input: {
    employeeId: string
    file: Blob
    fileName: string
  },
  upload: UploadFileFn,
): Promise<ProfilePhotoUploadResult> {
  if (!input.employeeId.trim()) {
    return {
      ok: false,
      code: 'invalid',
      message: 'Employee ID is required before uploading a profile photo.',
    }
  }

  if (!isEmployeePhotoUploadConfigured()) {
    return {
      ok: false,
      code: 'missing_api',
      message:
        'Profile photo upload is not enabled (VITE_EMPLOYEE_PHOTO_UPLOAD_ENABLED). Photo was not saved to the server.',
    }
  }

  if (input.file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      code: 'invalid',
      message: 'Photo exceeds the 10MB upload limit.',
    }
  }

  try {
    const asset = await upload({
      file: input.file,
      fileName: input.fileName,
      folder: EMPLOYEE_PHOTO_FOLDER,
    })
    if (!asset?.assetUrl) {
      return {
        ok: false,
        code: 'http',
        message:
          'Upload response did not include a photo URL. Server save could not be confirmed.',
      }
    }
    return {
      ok: true,
      url: asset.assetUrl,
      fileName: asset.originalName || input.fileName,
    }
  } catch (error) {
    if (isNetworkError(error)) {
      return {
        ok: false,
        code: 'network',
        message: getApiErrorMessage(error),
      }
    }
    return {
      ok: false,
      code: 'http',
      message: getApiErrorMessage(error, 'Photo upload failed.'),
    }
  }
}
