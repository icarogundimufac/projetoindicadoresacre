import { PageShell, PageContent } from '@/components/layout/PageShell'
import { ProjectPresentation } from '@/components/dashboard/ProjectPresentation'

export function DashboardPage() {
  return (
    <PageShell>
      <PageContent>
        <ProjectPresentation />
      </PageContent>
    </PageShell>
  )
}