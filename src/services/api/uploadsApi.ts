import { baseApi } from './baseApi'
import { unwrapData, type ApiResponse } from './types'

/** `data` payload of POST /uploads (hrms-server UploadsService.upload). */
export interface UploadedAsset {
  /** Object key: `<folder>/<uuid><ext>`. */
  key: string
  /** Public asset URL to store on the owning record. */
  assetUrl: string
  folder: string
  originalName: string
  contentType: string
  size: number
}

export interface UploadFileRequest {
  file: Blob
  fileName: string
  /** 1-3 segments of letters, numbers, `_` or `-`, e.g. `employees/photos`. */
  folder: string
}

/** Server-side limit (UploadsController: `limits.fileSize`). */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

/** Mirrors the server's folder validation (uploadFileBodySchema). */
export const UPLOAD_FOLDER_PATTERN = /^[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+){0,2}$/

export const uploadsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * POST /uploads (Bearer access token, any active role). Multipart fields:
     * `file` (max 10MB) and `folder`. Returns the stored asset; the caller is
     * responsible for saving `assetUrl` on the owning record.
     */
    uploadFile: build.mutation<UploadedAsset, UploadFileRequest>({
      query: ({ file, fileName, folder }) => {
        const body = new FormData()
        body.append('file', file, fileName)
        body.append('folder', folder)
        return { url: '/uploads', method: 'POST', body }
      },
      transformResponse: (response: ApiResponse<UploadedAsset>) =>
        unwrapData(response),
    }),
  }),
})

export const { useUploadFileMutation } = uploadsApi
