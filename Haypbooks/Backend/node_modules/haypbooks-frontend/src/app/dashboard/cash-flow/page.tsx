import CashFlowWidget from '@/components/CashFlowWidget'
import CashFlowForecastWidget from '@/components/CashFlowForecastWidget'
import DashboardSection from '@/components/DashboardSection'
import DashboardTopBar from '@/components/DashboardTopBar'

export const metadata = { title: 'Cash Flow' }

export default function DashboardCashFlowPage(){
  return (
    <div className="space-y-2">
      <div className="glass-card print:hidden px-3 md:px-4 py-1.5 md:py-2">
        <DashboardTopBar />
      </div>
      <div className="glass-card bar-master-frame space-y-6 print:hidden pt-2 pb-5 px-4">
        <DashboardSection title="Cash Flow">
          <CashFlowWidget />
        </DashboardSection>
        <DashboardSection title="Cash Flow Forecast">
          <CashFlowForecastWidget />
        </DashboardSection>
      </div>
    </div>
  )
}
