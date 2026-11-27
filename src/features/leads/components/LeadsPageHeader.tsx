import { AppPageHeader } from '@/components/design/AppPageHeader'

type LeadsPageHeaderProps = {
  activeSection?: string
}

export function LeadsPageHeader({ activeSection }: LeadsPageHeaderProps) {
  const isOverview = activeSection === 'Overview'

  if (isOverview) {
    return <AppPageHeader title="Leads Management" />
  }

  return (
    <AppPageHeader
      title="Leads Management"
      description="Capture prospects, assign owners, and track status through conversion."
    />
  )
}
