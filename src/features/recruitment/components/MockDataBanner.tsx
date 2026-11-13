import { Badge } from '@/components/ui/badge'

/** Visible marker that recruitment screens use local mock data (no API). */
export function MockDataBanner({ message }: { message?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
      <Badge variant="warning">Mock data</Badge>
      <span>
        {message ??
          'Recruitment APIs are not connected yet. Changes stay in this browser session only.'}
      </span>
    </div>
  )
}
