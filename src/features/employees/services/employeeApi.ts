/**
 * Employee profile photo upload via POST /uploads.
 *
 * All employee photos use the same folder (`employees/photos`). Enable with
 * `VITE_EMPLOYEE_PHOTO_UPLOAD_ENABLED=true`. The returned `assetUrl` must be
 * stored on the employee as `photoUrl` (create multipart or PATCH).
 */

import { env } from '@/config/env'
import { getApiErrorMessage } from '@/services/api/errors'
import {
  MAX_UPLOAD_BYTES,
  UPLOAD_FOLDER_PATTERN,
  type UploadedAsset,
  type UploadFileRequest,
} from '@/services/api/uploadsApi'

/** Shared S3/local folder for every employee profile picture. */
export const EMPLOYEE_PHOTO_FOLDER = 'employees/photos'

if (!UPLOAD_FOLDER_PATTERN.test(EMPLOYEE_PHOTO_FOLDER)) {
  throw new Error(`Invalid EMPLOYEE_PHOTO_FOLDER: ${EMPLOYEE_PHOTO_FOLDER}`)
}

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
 * Uploads a profile photo into `employees/photos`.
 * `employeeId` is optional (registration may not have a server id yet) and is
 * only used to build a clearer file name.
 */
export async function uploadEmployeeProfilePhoto(
  input: {
    employeeId?: string
    file: Blob
    fileName: string
  },
  upload: UploadFileFn,
): Promise<ProfilePhotoUploadResult> {
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

  const safeName =
    input.fileName.trim() ||
    `photo-${(input.employeeId ?? 'employee').trim() || 'employee'}-${Date.now()}.jpg`

  try {
    const asset = await upload({
      file: input.file,
      fileName: safeName,
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
      fileName: asset.originalName || safeName,
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
