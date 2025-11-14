"use client"

import { useState } from "react"
import { AnalyticsOverview } from "@/components/analytics-overview"
import { DynamicFilters } from "@/components/dynamic-filters"
import { TrendVisualizations } from "@/components/trend-visualizations"
import { WorkflowMonitoring } from "@/components/workflow-monitoring"
import { ASINPerformanceDrilldown } from "@/components/asin-performance-drilldown"
import { WorkflowResults } from "@/components/workflow-results"
import { FeedbackViewer } from "@/components/feedback-viewer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FilterState {
  dateRange?: any
  priceActions: string[]
  cmtStatus: string[]
  llmClassifications: string[]
  workflowStages: string[]
  decisionOutcomes: string[]
  productCategories: string[]
  owners: string[]
  revenueRange: { min: string; max: string }
  searchQuery: string
}

export function DashboardContent() {
  const [filters, setFilters] = useState<FilterState>({
    priceActions: [],
    cmtStatus: [],
    llmClassifications: [],
    workflowStages: [],
    decisionOutcomes: [],
    productCategories: [],
    owners: [],
    revenueRange: { min: "", max: "" },
    searchQuery: "",
  })

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
    // In a real implementation, this would trigger data refetch with new filters
    console.log("[v0] Filters updated:", newFilters)
  }

  return (
    <main className="p-6">
      <div className="space-y-6">
        <DynamicFilters onFiltersChange={handleFiltersChange} />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Analytics Overview</TabsTrigger>
            <TabsTrigger value="results">Workflow Results</TabsTrigger>
            <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
            <TabsTrigger value="feedback">User Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <AnalyticsOverview />
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <WorkflowResults />
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <TrendVisualizations />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <WorkflowMonitoring />
          </TabsContent>

          <TabsContent value="asin-performance" className="space-y-6">
            <ASINPerformanceDrilldown />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <FeedbackViewer />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
