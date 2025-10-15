"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  Pause,
  RefreshCw,
  Zap,
  Database,
  Brain,
  DollarSign,
  Package,
} from "lucide-react"

interface WorkflowStage {
  id: string
  name: string
  description: string
  status: "idle" | "running" | "completed" | "error" | "warning"
  progress: number
  duration: number
  throughput: number
  icon: React.ComponentType<{ className?: string }>
}

interface ProcessingItem {
  id: string
  asin: string
  productName: string
  stage: string
  status: "processing" | "completed" | "failed" | "waiting"
  startTime: Date
  estimatedCompletion?: Date
  priority: "high" | "medium" | "low"
}

const workflowStages: WorkflowStage[] = [
  {
    id: "data-extraction",
    name: "Data Extraction",
    description: "Extracting product data from CSV files",
    status: "completed",
    progress: 100,
    duration: 2.3,
    throughput: 450,
    icon: Database,
  },
  {
    id: "cmt-validation",
    name: "CMT Validation",
    description: "Validating competitive market testing criteria",
    status: "running",
    progress: 67,
    duration: 4.2,
    throughput: 180,
    icon: CheckCircle,
  },
  {
    id: "cost-analysis",
    name: "Cost Analysis",
    description: "Analyzing FLC, PCOGS, and shipping costs",
    status: "running",
    progress: 45,
    duration: 3.1,
    throughput: 220,
    icon: DollarSign,
  },
  {
    id: "llm-classification",
    name: "LLM Classification",
    description: "AI-powered product specification analysis",
    status: "waiting",
    progress: 0,
    duration: 1.8,
    throughput: 380,
    icon: Brain,
  },
  {
    id: "decision-making",
    name: "Decision Making",
    description: "Final pricing decision and outcome determination",
    status: "idle",
    progress: 0,
    duration: 0.9,
    throughput: 520,
    icon: Zap,
  },
]

const processingQueue: ProcessingItem[] = [
  {
    id: "1",
    asin: "B08N5WRWNW",
    productName: "Wireless Bluetooth Headphones",
    stage: "CMT Validation",
    status: "processing",
    startTime: new Date(Date.now() - 120000),
    estimatedCompletion: new Date(Date.now() + 180000),
    priority: "high",
  },
  {
    id: "2",
    asin: "B07XJ8C8F5",
    productName: "Smart Home Security Camera",
    stage: "Cost Analysis",
    status: "processing",
    startTime: new Date(Date.now() - 90000),
    estimatedCompletion: new Date(Date.now() + 240000),
    priority: "medium",
  },
  {
    id: "3",
    asin: "B09JQMJHXY",
    productName: "Portable Power Bank 20000mAh",
    stage: "CMT Validation",
    status: "waiting",
    startTime: new Date(Date.now() - 30000),
    priority: "low",
  },
  {
    id: "4",
    asin: "B08HLMS6VZ",
    productName: "Gaming Mechanical Keyboard",
    stage: "Data Extraction",
    status: "completed",
    startTime: new Date(Date.now() - 300000),
    priority: "medium",
  },
  {
    id: "5",
    asin: "B07ZPKN6YR",
    productName: "Fitness Tracker Watch",
    stage: "Cost Analysis",
    status: "failed",
    startTime: new Date(Date.now() - 180000),
    priority: "high",
  },
]

function WorkflowStageCard({ stage }: { stage: WorkflowStage }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-chart-2"
      case "running":
        return "text-chart-1"
      case "error":
        return "text-chart-4"
      case "warning":
        return "text-chart-3"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-chart-2" />
      case "running":
        return <Activity className="h-4 w-4 text-chart-1 animate-pulse" />
      case "error":
        return <XCircle className="h-4 w-4 text-chart-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-chart-3" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30">Completed</Badge>
      case "running":
        return <Badge className="bg-chart-1/20 text-chart-1 border-chart-1/30">Running</Badge>
      case "error":
        return <Badge className="bg-chart-4/20 text-chart-4 border-chart-4/30">Error</Badge>
      case "warning":
        return <Badge className="bg-chart-3/20 text-chart-3 border-chart-3/30">Warning</Badge>
      default:
        return <Badge variant="outline">Idle</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <stage.icon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">{stage.name}</CardTitle>
          </div>
          {getStatusIcon(stage.status)}
        </div>
        <p className="text-sm text-muted-foreground">{stage.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Status</span>
          {getStatusBadge(stage.status)}
        </div>

        {stage.status === "running" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span className={getStatusColor(stage.status)}>{stage.progress}%</span>
            </div>
            <Progress value={stage.progress} className="h-2" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Avg Duration</div>
            <div className="font-medium">{stage.duration}min</div>
          </div>
          <div>
            <div className="text-muted-foreground">Throughput</div>
            <div className="font-medium">{stage.throughput}/hr</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ProcessingQueueItem({ item }: { item: ProcessingItem }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-chart-2"
      case "processing":
        return "text-chart-1"
      case "failed":
        return "text-chart-4"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-chart-2" />
      case "processing":
        return <Activity className="h-4 w-4 text-chart-1 animate-pulse" />
      case "failed":
        return <XCircle className="h-4 w-4 text-chart-4" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-chart-4/20 text-chart-4 border-chart-4/30"
      case "medium":
        return "bg-chart-3/20 text-chart-3 border-chart-3/30"
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30"
    }
  }

  const formatDuration = (startTime: Date) => {
    const duration = Date.now() - startTime.getTime()
    const minutes = Math.floor(duration / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
      <div className="flex items-center space-x-3">
        {getStatusIcon(item.status)}
        <div>
          <div className="font-medium text-sm">{item.asin}</div>
          <div className="text-xs text-muted-foreground truncate max-w-48">{item.productName}</div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Badge className={getPriorityColor(item.priority)} variant="outline">
          {item.priority}
        </Badge>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">{item.stage}</div>
          <div className={`text-xs font-medium ${getStatusColor(item.status)}`}>
            {item.status === "processing" ? formatDuration(item.startTime) : item.status}
          </div>
        </div>
      </div>
    </div>
  )
}

function WorkflowControls() {
  const [isRunning, setIsRunning] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const handleToggleWorkflow = () => {
    setIsRunning(!isRunning)
    console.log("[v0] Workflow", isRunning ? "paused" : "resumed")
  }

  const handleRefresh = () => {
    setLastRefresh(new Date())
    console.log("[v0] Workflow data refreshed")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Workflow Controls</span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant={isRunning ? "destructive" : "default"} size="sm" onClick={handleToggleWorkflow}>
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? "Pause" : "Resume"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground">Status</div>
            <div className={`font-medium ${isRunning ? "text-chart-2" : "text-chart-3"}`}>
              {isRunning ? "Running" : "Paused"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Queue Size</div>
            <div className="font-medium">{processingQueue.filter((item) => item.status === "waiting").length}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Processing</div>
            <div className="font-medium">{processingQueue.filter((item) => item.status === "processing").length}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Last Refresh</div>
            <div className="font-medium">{lastRefresh.toLocaleTimeString()}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function WorkflowMonitoring() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-6">
      {/* Workflow Controls */}
      <WorkflowControls />

      {/* Workflow Stages */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Workflow Stages</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {workflowStages.map((stage) => (
            <WorkflowStageCard key={stage.id} stage={stage} />
          ))}
        </div>
      </div>

      {/* Processing Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Active Processing Queue</span>
              <Badge variant="outline">{processingQueue.length} items</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              <div className="space-y-3">
                {processingQueue.map((item) => (
                  <ProcessingQueueItem key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>System Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">CPU Usage</span>
                <span className="text-sm font-medium">67%</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Memory Usage</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <Progress value={45} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Connections</span>
                <span className="text-sm font-medium">12/50</span>
              </div>
              <Progress value={24} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">LLM API Rate Limit</span>
                <span className="text-sm font-medium">89%</span>
              </div>
              <Progress value={89} className="h-2" />
            </div>

            <div className="pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground">System Time</div>
              <div className="text-sm font-mono">{currentTime.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
