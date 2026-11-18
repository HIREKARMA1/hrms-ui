/** Standard success envelope returned by hrms-server. */
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

/** Error body returned by hrms-server (shape may vary by exception type). */
export interface ApiErrorBody {
  statusCode?: number
  message?: string | string[]
  error?: string
}

/** Unwrap the `data` field from the standard envelope. Use as `transformResponse`. */
export function unwrapData<T>(response: ApiResponse<T>): T {
  return response.data
}
