import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardContent } from "@/components/dashboard-content"

export default function PricingDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <DashboardSidebar />
        <div className="flex-1">
          <DashboardHeader />
          <DashboardContent />
        </div>
      </div>
    </div>
  )
}
