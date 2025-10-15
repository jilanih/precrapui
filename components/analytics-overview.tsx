import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, DollarSign, Package, Brain } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  change?: {
    value: string
    trend: "up" | "down" | "neutral"
  }
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

function MetricCard({ title, value, change, icon: Icon, description }: MetricCardProps) {
  const getTrendIcon = () => {
    if (!change) return null
    switch (change.trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-chart-2" />
      case "down":
        return <TrendingDown className="h-3 w-3 text-chart-4" />
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />
    }
  }

  const getTrendColor = () => {
    if (!change) return "text-muted-foreground"
    switch (change.trend) {
      case "up":
        return "text-chart-2"
      case "down":
        return "text-chart-4"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change && (
          <div className={`flex items-center space-x-1 text-xs mt-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{change.value}</span>
          </div>
        )}
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}

interface StatusDistributionProps {
  data: Array<{
    label: string
    value: number
    percentage: number
    color: string
  }>
}

function StatusDistribution({ data }: StatusDistributionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Decision Outcomes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`h-3 w-3 rounded-full ${item.color}`}></div>
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold">{item.value.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{item.percentage}%</div>
              </div>
            </div>
            <Progress value={item.percentage} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

interface LLMClassificationProps {
  data: {
    overspec: number
    underspec: number
    comparable: number
    total: number
  }
}

function LLMClassification({ data }: LLMClassificationProps) {
  const overspecPercentage = (data.overspec / data.total) * 100
  const underspecPercentage = (data.underspec / data.total) * 100
  const comparablePercentage = (data.comparable / data.total) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>LLM Product Classifications</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-chart-3">{data.overspec}</div>
              <div className="text-xs text-muted-foreground">Overspec</div>
              <div className="text-xs text-chart-3">{overspecPercentage.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-chart-4">{data.underspec}</div>
              <div className="text-xs text-muted-foreground">Underspec</div>
              <div className="text-xs text-chart-4">{underspecPercentage.toFixed(1)}%</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-chart-2">{data.comparable}</div>
              <div className="text-xs text-muted-foreground">Comparable</div>
              <div className="text-xs text-chart-2">{comparablePercentage.toFixed(1)}%</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Classification Accuracy</span>
              <span className="font-medium">94.2%</span>
            </div>
            <Progress value={94.2} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ValidationMetricsProps {
  cmt: {
    passed: number
    failed: number
    pending: number
  }
  costChecks: {
    flc: number
    pcogs: number
    packaging: number
    shipping: number
  }
}

function ValidationMetrics({ cmt, costChecks }: ValidationMetricsProps) {
  const cmtTotal = cmt.passed + cmt.failed + cmt.pending
  const cmtPassRate = (cmt.passed / cmtTotal) * 100

  const costCheckTotals = {
    flc: 1200,
    pcogs: 1150,
    packaging: 1180,
    shipping: 1100,
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>CMT Validation Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Pass Rate</span>
              <span className="text-lg font-bold text-chart-2">{cmtPassRate.toFixed(1)}%</span>
            </div>
            <Progress value={cmtPassRate} className="h-2" />

            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-bold text-chart-2">{cmt.passed}</div>
                <div className="text-muted-foreground">Passed</div>
              </div>
              <div>
                <div className="font-bold text-chart-4">{cmt.failed}</div>
                <div className="text-muted-foreground">Failed</div>
              </div>
              <div>
                <div className="font-bold text-chart-3">{cmt.pending}</div>
                <div className="text-muted-foreground">Pending</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cost Check Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">FLC Validation</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {Math.round((costChecks.flc / 100) * costCheckTotals.flc)}/{costCheckTotals.flc}
                </span>
                <Badge variant={costChecks.flc > 80 ? "default" : "destructive"}>{costChecks.flc}% Pass</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">PCOGS + IB</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {Math.round((costChecks.pcogs / 100) * costCheckTotals.pcogs)}/{costCheckTotals.pcogs}
                </span>
                <Badge variant={costChecks.pcogs > 75 ? "default" : "destructive"}>{costChecks.pcogs}% Pass</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Packaging</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {Math.round((costChecks.packaging / 100) * costCheckTotals.packaging)}/{costCheckTotals.packaging}
                </span>
                <Badge variant={costChecks.packaging > 85 ? "default" : "destructive"}>
                  {costChecks.packaging}% Pass
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Shipping COGS</span>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">
                  {Math.round((costChecks.shipping / 100) * costCheckTotals.shipping)}/{costCheckTotals.shipping}
                </span>
                <Badge variant={costChecks.shipping > 70 ? "default" : "destructive"}>
                  {costChecks.shipping}% Pass
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AnalyticsOverview() {
  // Mock data - in real implementation, this would come from API
  const metrics = [
    {
      title: "Total ASINs Processed",
      value: "1,275",
      change: { value: "+12% from last week", trend: "up" as const },
      icon: Package,
      description: "24h processing volume",
    },
    {
      title: "Revenue Impact",
      value: "$2.4M",
      change: { value: "+8.3% from last week", trend: "up" as const },
      icon: DollarSign,
      description: "Estimated weekly impact",
    },
    {
      title: "Price Match Success",
      value: "66.4%",
      change: { value: "-2.1% from last week", trend: "down" as const },
      icon: CheckCircle,
      description: "Competitive pricing achieved",
    },
    {
      title: "Manual Reviews",
      value: "23",
      change: { value: "Stable", trend: "neutral" as const },
      icon: AlertTriangle,
      description: "Requiring human intervention",
    },
  ]

  const decisionOutcomes = [
    { label: "Price Match", value: 847, percentage: 66.4, color: "bg-chart-2" },
    { label: "Revert to Base", value: 405, percentage: 31.8, color: "bg-chart-3" },
    { label: "Manual Review", value: 23, percentage: 1.8, color: "bg-chart-4" },
  ]

  const llmData = {
    overspec: 342,
    underspec: 189,
    comparable: 667,
    total: 1198,
  }

  const validationData = {
    cmt: { passed: 1089, failed: 156, pending: 30 },
    costChecks: { flc: 87, pcogs: 79, packaging: 92, shipping: 74 },
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Decision Outcomes and LLM Classifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDistribution data={decisionOutcomes} />
        <LLMClassification data={llmData} />
      </div>

      {/* Validation Metrics */}
      <ValidationMetrics {...validationData} />
    </div>
  )
}
