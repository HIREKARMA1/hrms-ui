export type QueryViewState = 'loading' | 'error' | 'empty' | 'ready'

/**
 * Which state an API-backed list or record should render. Data already on
 * screen wins over a background refetch error, so a failed refresh does not
 * blank the page.
 */
export function getQueryViewState(input: {
  isLoading: boolean
  isError: boolean
  hasData: boolean
  itemCount?: number
}): QueryViewState {
  if (input.hasData) {
    return input.itemCount === 0 ? 'empty' : 'ready'
  }
  if (input.isLoading) return 'loading'
  if (input.isError) return 'error'
  return 'loading'
}

/** True for an RTK Query 404 error. */
export function isNotFoundError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'status' in error && (error as { status: unknown }).status === 404
}
