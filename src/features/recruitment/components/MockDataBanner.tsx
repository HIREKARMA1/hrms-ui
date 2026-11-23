import { RECRUITMENT_INFO_NOTE } from './shared/recruitmentUi'

/** Inline note when a screen needs extra mock-data context (overview uses demo pill). */
export function MockDataBanner({ message }: { message?: string }) {
  return (
    <p className={RECRUITMENT_INFO_NOTE}>
      {message ??
        'Recruitment APIs are not connected yet. Changes stay in this browser session only.'}
    </p>
  )
}
