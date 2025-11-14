"use client"

import { cn } from "@/lib/utils"
import { BarChart3, TrendingUp, Filter, Activity, Package, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { useEffect, useState } from "react"

const navigationItems = [
  {
    title: "Overview",
    icon: BarChart3,
    active: true,
  },
  {
    title: "Analytics",
    icon: TrendingUp,
    children: [
      { title: "GL Summary", active: false },
      { title: "ASIN Performance", active: false },
      { title: "Price Actions", active: false },
      { title: "Owner Metrics", active: false },
    ],
  },
  {
    title: "Workflow",
    icon: Activity,
    children: [
      { title: "Real-time Status", active: false },
      { title: "Processing Stages", active: false },
      { title: "Decision Outcomes", active: false },
    ],
  },
  {
    title: "Classifications",
    icon: Package,
    children: [
      { title: "LLM Analysis", active: false },
      { title: "CMT Validation", active: false },
      { title: "Cost Checks", active: false },
    ],
  },
  {
    title: "Filters",
    icon: Filter,
  },
]

export function DashboardSidebar() {
  const [totalProcessed, setTotalProcessed] = useState<number>(0)
  const [totalExecutions, setTotalExecutions] = useState<number>(0)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load RBM Time Saved to calculate total processed ASINs
        const rbmResponse = await fetch('/api/rbm-time-saved')
        if (rbmResponse.ok) {
          const rbmData = await rbmResponse.json()
          const totalMinutes = rbmData.totalMinutes || 0
          // Each ASIN takes 15 minutes, so divide by 15
          setTotalProcessed(Math.round(totalMinutes / 15))
          // Track executions count if available
          setTotalExecutions(rbmData.executionCount || 0)
        }
      } catch (error) {
        console.error('Error loading sidebar data:', error)
      }
    }
    
    loadData()
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 300000)
    return () => clearInterval(interval)
  }, [])

  return (
    <aside className="w-64 border-r border-border bg-sidebar">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">Pricing Hub</span>
        </div>
      </div>

      <nav className="px-4 pb-4">
        {navigationItems.map((item, index) => (
          <div key={index} className="mb-2">
            <div
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors",
                item.active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </div>

            {item.children && (
              <div className="ml-7 mt-1 space-y-1">
                {item.children.map((child, childIndex) => (
                  <div
                    key={childIndex}
                    className="px-3 py-1 text-xs text-muted-foreground hover:text-sidebar-foreground cursor-pointer"
                  >
                    {child.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground mb-2">Workflow Status</div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs">
            <CheckCircle className="h-3 w-3 text-chart-2" />
            <span className="text-sidebar-foreground">Active: {totalProcessed.toLocaleString()} ASINs</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <Clock className="h-3 w-3 text-chart-3" />
            <span className="text-sidebar-foreground">Total Executions: {totalExecutions}</span>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <AlertTriangle className="h-3 w-3 text-chart-4" />
            <span className="text-sidebar-foreground">Output Error: 6</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
