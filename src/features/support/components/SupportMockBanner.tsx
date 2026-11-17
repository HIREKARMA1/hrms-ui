export function SupportMockBanner({ scope }: { scope: 'public' | 'hr' }) {
  const message =
    scope === 'public'
      ? 'No API is connected. Requests are stored in this browser session only.'
      : 'Replies are simulated. Email is not sent until the mail API is connected.'

  return (
    <p className="rounded-lg border border-brand-100 bg-brand-50/80 px-3 py-2 text-xs text-slate-600">
      {message}
    </p>
  )
}