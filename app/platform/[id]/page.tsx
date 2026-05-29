import AppShell from '@/components/layout/AppShell'
import PlatformDetailPage from '@/components/platforms/PlatformDetailPage'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <AppShell>
      <PlatformDetailPage platformId={id} />
    </AppShell>
  )
}
