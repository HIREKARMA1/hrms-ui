import { RECRUITMENT_DEMO_PILL } from './shared/recruitmentUi'

export function RecruitmentDemoPill({ message }: { message?: string }) {
  return (
    <p className={RECRUITMENT_DEMO_PILL}>
      <span className="h-2 w-2 shrink-0 rounded-full bg-[#0F766E]" aria-hidden />
      <span>
        <span className="font-semibold text-[#17213A]">Demo data</span>
        <span className="font-normal">
          {' '}
          — {message ?? 'ATS APIs are not connected; changes stay in this browser session.'}
        </span>
      </span>
    </p>
  )
}