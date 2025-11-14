"use client"

import { AnalyticsOverview } from "@/components/analytics-overview"
import { TrendVisualizations } from "@/components/trend-visualizations"
import { WorkflowMonitoring } from "@/components/workflow-monitoring"
import { ASINPerformanceDrilldown } from "@/components/asin-performance-drilldown"
import { WorkflowResults } from "@/components/workflow-results"
import { FeedbackViewer } from "@/components/feedback-viewer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DashboardContent() {

  return (
    <main className="p-6">
      <div className="space-y-6">
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
