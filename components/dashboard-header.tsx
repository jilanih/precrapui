"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Download, Settings, RefreshCw, Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export function DashboardHeader() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-foreground">Pricing Workflow</h1>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-chart-2"></div>
            <span>Production</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Select defaultValue="last-12-hours">
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-hour">Last hour</SelectItem>
              <SelectItem value="last-12-hours">Last 12 hours</SelectItem>
              <SelectItem value="last-24-hours">Last 24 hours</SelectItem>
              <SelectItem value="last-7-days">Last 7 days</SelectItem>
              <SelectItem value="last-30-days">Last 30 days</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).workflowRefresh) {
                (window as any).workflowRefresh()
              }
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).workflowClearAll) {
                (window as any).workflowClearAll()
              }
            }}
          >
            Clear All
          </Button>
        </div>
      </div>
    </header>
  )
}
