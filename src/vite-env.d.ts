/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend API base URL including the global prefix, e.g. http://localhost:3000/api/v1 */
  readonly VITE_API_BASE_URL: string
  /** `true` to upload employee profile photos via POST /uploads. Optional; off by default. */
  readonly VITE_EMPLOYEE_PHOTO_UPLOAD_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
