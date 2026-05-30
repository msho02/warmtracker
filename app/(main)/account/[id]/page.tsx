import AccountDetailPage from '@/components/accounts/AccountDetailPage'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <AccountDetailPage accountId={id} />
}
