"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, Brain, CheckCircle, AlertTriangle, DollarSign } from "lucide-react"
import { useState } from "react"

// Mock data for trend visualizations
const pricingTrendData = [
  { date: "2024-01-01", priceMatches: 145, baseReverts: 67, manualReviews: 8, totalASINs: 220, revenue: 420000 },
  { date: "2024-01-02", priceMatches: 167, baseReverts: 72, manualReviews: 5, totalASINs: 244, revenue: 485000 },
  { date: "2024-01-03", priceMatches: 189, baseReverts: 89, manualReviews: 12, totalASINs: 290, revenue: 567000 },
  { date: "2024-01-04", priceMatches: 156, baseReverts: 78, manualReviews: 6, totalASINs: 240, revenue: 445000 },
  { date: "2024-01-05", priceMatches: 203, baseReverts: 95, manualReviews: 9, totalASINs: 307, revenue: 612000 },
  { date: "2024-01-06", priceMatches: 178, baseReverts: 82, manualReviews: 7, totalASINs: 267, revenue: 523000 },
  { date: "2024-01-07", priceMatches: 234, baseReverts: 101, manualReviews: 11, totalASINs: 346, revenue: 689000 },
]

const cmtValidationData = [
  { week: "Week 1", passed: 89, failed: 11, pending: 5, passRate: 84.8 },
  { week: "Week 2", passed: 92, failed: 8, pending: 3, passRate: 89.3 },
  { week: "Week 3", passed: 87, failed: 13, pending: 7, passRate: 81.3 },
  { week: "Week 4", passed: 94, failed: 6, pending: 2, passRate: 92.2 },
  { week: "Week 5", passed: 91, failed: 9, pending: 4, passRate: 87.5 },
  { week: "Week 6", passed: 96, failed: 4, pending: 1, passRate: 95.0 },
]

const llmClassificationData = [
  { month: "Oct", overspec: 45, underspec: 23, comparable: 89, total: 157 },
  { month: "Nov", overspec: 52, underspec: 31, comparable: 94, total: 177 },
  { month: "Dec", overspec: 67, underspec: 28, comparable: 112, total: 207 },
  { month: "Jan", overspec: 78, underspec: 35, comparable: 134, total: 247 },
  { month: "Feb", overspec: 89, underspec: 42, comparable: 156, total: 287 },
  { month: "Mar", overspec: 95, underspec: 38, comparable: 178, total: 311 },
]

const revenueImpactData = [
  { category: "Electronics", impact: 1200000, percentage: 35.2 },
  { category: "Home & Garden", impact: 850000, percentage: 24.9 },
  { category: "Sports", impact: 620000, percentage: 18.2 },
  { category: "Health", impact: 480000, percentage: 14.1 },
  { category: "Automotive", impact: 260000, percentage: 7.6 },
]

const workflowEfficiencyData = [
  { stage: "Data Extract", avgTime: 2.3, efficiency: 95 },
  { stage: "CMT Validation", avgTime: 4.7, efficiency: 87 },
  { stage: "Cost Analysis", avgTime: 3.2, efficiency: 92 },
  { stage: "LLM Classification", avgTime: 1.8, efficiency: 96 },
  { stage: "Decision Making", avgTime: 0.9, efficiency: 98 },
]

interface TrendChartProps {
  title: string
  data: any[]
  timeframe: string
  onTimeframeChange: (value: string) => void
}

function PricingTrendsChart({ title, data, timeframe, onTimeframeChange }: TrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
          <Select value={timeframe} onValueChange={onTimeframeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0 0)" />
            <XAxis
              dataKey="date"
              stroke="oklch(0.65 0 0)"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            />
            <YAxis stroke="oklch(0.65 0 0)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.25 0 0)",
                borderRadius: "8px",
                color: "oklch(0.95 0 0)",
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="priceMatches"
              stackId="1"
              stroke="oklch(0.65 0.2 142)"
              fill="oklch(0.65 0.2 142 / 0.3)"
              name="Price Matches"
            />
            <Area
              type="monotone"
              dataKey="baseReverts"
              stackId="1"
              stroke="oklch(0.7 0.25 35)"
              fill="oklch(0.7 0.25 35 / 0.3)"
              name="Base Reverts"
            />
            <Area
              type="monotone"
              dataKey="manualReviews"
              stackId="1"
              stroke="oklch(0.6 0.2 25)"
              fill="oklch(0.6 0.2 25 / 0.3)"
              name="Manual Reviews"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function CMTValidationChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>CMT Validation Trends</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={cmtValidationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0 0)" />
            <XAxis dataKey="week" stroke="oklch(0.65 0 0)" fontSize={12} />
            <YAxis stroke="oklch(0.65 0 0)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.25 0 0)",
                borderRadius: "8px",
                color: "oklch(0.95 0 0)",
              }}
            />
            <Legend />
            <Bar dataKey="passed" fill="oklch(0.65 0.2 142)" name="Passed" />
            <Bar dataKey="failed" fill="oklch(0.6 0.2 25)" name="Failed" />
            <Bar dataKey="pending" fill="oklch(0.7 0.25 35)" name="Pending" />
            <Line
              type="monotone"
              dataKey="passRate"
              stroke="oklch(0.7 0.15 264)"
              strokeWidth={3}
              name="Pass Rate (%)"
              yAxisId="right"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function LLMClassificationChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>LLM Classification Distribution</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={llmClassificationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0 0)" />
            <XAxis dataKey="month" stroke="oklch(0.65 0 0)" fontSize={12} />
            <YAxis stroke="oklch(0.65 0 0)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.25 0 0)",
                borderRadius: "8px",
                color: "oklch(0.95 0 0)",
              }}
            />
            <Legend />
            <Bar dataKey="overspec" fill="oklch(0.7 0.25 35)" name="Overspec" />
            <Bar dataKey="underspec" fill="oklch(0.6 0.2 25)" name="Underspec" />
            <Bar dataKey="comparable" fill="oklch(0.65 0.2 142)" name="Comparable" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function RevenueImpactChart() {
  const COLORS = [
    "oklch(0.7 0.15 264)",
    "oklch(0.65 0.2 142)",
    "oklch(0.7 0.25 35)",
    "oklch(0.6 0.2 25)",
    "oklch(0.75 0.1 285)",
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5" />
          <span>CP Impact by Category</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={revenueImpactData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="impact"
                label={({ percentage }) => `${percentage}%`}
              >
                {revenueImpactData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.12 0 0)",
                  border: "1px solid oklch(0.25 0 0)",
                  borderRadius: "8px",
                  color: "oklch(0.95 0 0)",
                }}
                formatter={(value: number) => [`$${(value / 1000000).toFixed(1)}M`, "Revenue Impact"]}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-3">
            {revenueImpactData.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm font-medium">{item.category}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">${(item.impact / 1000000).toFixed(1)}M</div>
                  <div className="text-xs text-muted-foreground">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function WorkflowEfficiencyChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <span>Workflow Stage Efficiency</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={workflowEfficiencyData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0 0)" />
            <XAxis type="number" stroke="oklch(0.65 0 0)" fontSize={12} />
            <YAxis dataKey="stage" type="category" stroke="oklch(0.65 0 0)" fontSize={12} width={100} />
            <Tooltip
              contentStyle={{
                backgroundColor: "oklch(0.12 0 0)",
                border: "1px solid oklch(0.25 0 0)",
                borderRadius: "8px",
                color: "oklch(0.95 0 0)",
              }}
            />
            <Legend />
            <Bar dataKey="avgTime" fill="oklch(0.7 0.25 35)" name="Avg Time (min)" />
            <Bar dataKey="efficiency" fill="oklch(0.65 0.2 142)" name="Efficiency %" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function TrendVisualizations() {
  const [pricingTimeframe, setPricingTimeframe] = useState("7d")

  return (
    <div className="space-y-6">
      {/* Pricing Trends */}
      <PricingTrendsChart
        title="Pricing Decision Trends"
        data={pricingTrendData}
        timeframe={pricingTimeframe}
        onTimeframeChange={setPricingTimeframe}
      />

      {/* Two column layout for medium charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CMTValidationChart />
        <LLMClassificationChart />
      </div>

      {/* Revenue Impact */}
      <RevenueImpactChart />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-chart-2" />
              <div>
                <div className="text-2xl font-bold">+15.3%</div>
                <div className="text-sm text-muted-foreground">Price Match Success Rate</div>
                <div className="text-xs text-chart-2">vs last month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-chart-5" />
              <div>
                <div className="text-2xl font-bold">94.2%</div>
                <div className="text-sm text-muted-foreground">LLM Classification Accuracy</div>
                <div className="text-xs text-chart-2">+2.1% improvement</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-chart-1" />
              <div>
                <div className="text-2xl font-bold">$3.8M</div>
                <div className="text-sm text-muted-foreground">Weekly Revenue Impact</div>
                <div className="text-xs text-chart-2">+12% vs target</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
