import PriceListDetailPage from '@/components/sales/PriceListDetailPage'

export default function Page({ params }: { params: { id: string } }) {
  return <PriceListDetailPage id={params.id} />
}
