"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Filter, X, Search, Package, Users, Brain, DollarSign, AlertTriangle, ChevronDown } from "lucide-react"
import type { DateRange } from "react-day-picker"

interface FilterState {
  dateRange?: DateRange
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

interface FilterOption {
  value: string
  label: string
  count?: number
}

const filterOptions = {
  priceActions: [
    { value: "price-match", label: "Price Match", count: 847 },
    { value: "revert-base", label: "Revert to Base", count: 405 },
    { value: "manual-review", label: "Manual Review", count: 23 },
  ],
  cmtStatus: [
    { value: "passed", label: "CMT Passed", count: 1089 },
    { value: "failed", label: "CMT Failed", count: 156 },
    { value: "pending", label: "CMT Pending", count: 30 },
  ],
  llmClassifications: [
    { value: "overspec", label: "Overspec", count: 342 },
    { value: "underspec", label: "Underspec", count: 189 },
    { value: "comparable", label: "Comparable", count: 667 },
  ],
  workflowStages: [
    { value: "data-extraction", label: "Data Extraction", count: 45 },
    { value: "cmt-validation", label: "CMT Validation", count: 23 },
    { value: "cost-analysis", label: "Cost Analysis", count: 67 },
    { value: "llm-classification", label: "LLM Classification", count: 34 },
    { value: "decision-making", label: "Decision Making", count: 12 },
    { value: "completed", label: "Completed", count: 1094 },
  ],
  decisionOutcomes: [
    { value: "automated", label: "Automated Decision", count: 1252 },
    { value: "manual", label: "Manual Review Required", count: 23 },
  ],
  productCategories: [
    { value: "electronics", label: "Electronics", count: 456 },
    { value: "home-garden", label: "Home & Garden", count: 234 },
    { value: "sports", label: "Sports & Outdoors", count: 189 },
    { value: "health", label: "Health & Personal Care", count: 167 },
    { value: "automotive", label: "Automotive", count: 145 },
    { value: "other", label: "Other Categories", count: 84 },
  ],
  owners: [
    { value: "team-alpha", label: "Team Alpha", count: 423 },
    { value: "team-beta", label: "Team Beta", count: 387 },
    { value: "team-gamma", label: "Team Gamma", count: 298 },
    { value: "team-delta", label: "Team Delta", count: 167 },
  ],
}

interface MultiSelectFilterProps {
  title: string
  icon: React.ComponentType<{ className?: string }>
  options: FilterOption[]
  selected: string[]
  onChange: (selected: string[]) => void
}

function MultiSelectFilter({ title, icon: Icon, options, selected, onChange }: MultiSelectFilterProps) {
  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-start bg-transparent">
          <Icon className="h-4 w-4 mr-2" />
          {title}
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {selected.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">{title}</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={option.value}
                  checked={selected.includes(option.value)}
                  onCheckedChange={() => handleToggle(option.value)}
                />
                <label
                  htmlFor={option.value}
                  className="text-sm flex-1 cursor-pointer flex items-center justify-between"
                >
                  <span>{option.label}</span>
                  {option.count && (
                    <span className="text-xs text-muted-foreground">{option.count.toLocaleString()}</span>
                  )}
                </label>
              </div>
            ))}
          </div>
          {selected.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => onChange([])} className="w-full">
              Clear All
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

interface DynamicFiltersProps {
  onFiltersChange: (filters: FilterState) => void
}

export function DynamicFilters({ onFiltersChange }: DynamicFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
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

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)
  }

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      priceActions: [],
      cmtStatus: [],
      llmClassifications: [],
      workflowStages: [],
      decisionOutcomes: [],
      productCategories: [],
      owners: [],
      revenueRange: { min: "", max: "" },
      searchQuery: "",
    }
    setFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const getActiveFilterCount = () => {
    return (
      filters.priceActions.length +
      filters.cmtStatus.length +
      filters.llmClassifications.length +
      filters.workflowStages.length +
      filters.decisionOutcomes.length +
      filters.productCategories.length +
      filters.owners.length +
      (filters.dateRange ? 1 : 0) +
      (filters.revenueRange.min || filters.revenueRange.max ? 1 : 0) +
      (filters.searchQuery ? 1 : 0)
    )
  }

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 p-0 h-auto hover:bg-transparent">
                <Filter className="h-5 w-5" />
                <span>Dynamic Filters</span>
                {getActiveFilterCount() > 0 && <Badge variant="default">{getActiveFilterCount()} active</Badge>}
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            {getActiveFilterCount() > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search ASINs or Products</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by ASIN, product name, or keyword..."
              value={filters.searchQuery}
              onChange={(e) => updateFilters({ searchQuery: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <DatePickerWithRange date={filters.dateRange} onDateChange={(dateRange) => updateFilters({ dateRange })} />
        </div>

        {/* Multi-select Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <MultiSelectFilter
            title="Price Actions"
            icon={DollarSign}
            options={filterOptions.priceActions}
            selected={filters.priceActions}
            onChange={(priceActions) => updateFilters({ priceActions })}
          />

          <MultiSelectFilter
            title="CMT Status"
            icon={AlertTriangle}
            options={filterOptions.cmtStatus}
            selected={filters.cmtStatus}
            onChange={(cmtStatus) => updateFilters({ cmtStatus })}
          />

          <MultiSelectFilter
            title="LLM Classifications"
            icon={Brain}
            options={filterOptions.llmClassifications}
            selected={filters.llmClassifications}
            onChange={(llmClassifications) => updateFilters({ llmClassifications })}
          />

          <MultiSelectFilter
            title="Workflow Stages"
            icon={Package}
            options={filterOptions.workflowStages}
            selected={filters.workflowStages}
            onChange={(workflowStages) => updateFilters({ workflowStages })}
          />

          <MultiSelectFilter
            title="Decision Outcomes"
            icon={AlertTriangle}
            options={filterOptions.decisionOutcomes}
            selected={filters.decisionOutcomes}
            onChange={(decisionOutcomes) => updateFilters({ decisionOutcomes })}
          />

          <MultiSelectFilter
            title="Product Categories"
            icon={Package}
            options={filterOptions.productCategories}
            selected={filters.productCategories}
            onChange={(productCategories) => updateFilters({ productCategories })}
          />

          <MultiSelectFilter
            title="Team Owners"
            icon={Users}
            options={filterOptions.owners}
            selected={filters.owners}
            onChange={(owners) => updateFilters({ owners })}
          />
        </div>

        {/* Revenue Range */}
        <div className="space-y-2">
          <Label>Revenue Impact Range</Label>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Min ($)"
              value={filters.revenueRange.min}
              onChange={(e) =>
                updateFilters({
                  revenueRange: { ...filters.revenueRange, min: e.target.value },
                })
              }
              className="flex-1"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              placeholder="Max ($)"
              value={filters.revenueRange.max}
              onChange={(e) =>
                updateFilters({
                  revenueRange: { ...filters.revenueRange, max: e.target.value },
                })
              }
              className="flex-1"
            />
          </div>
        </div>

        {/* Active Filters Summary */}
        {getActiveFilterCount() > 0 && (
          <div className="pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground mb-2">Active Filters:</div>
            <div className="flex flex-wrap gap-2">
              {filters.priceActions.map((action) => (
                <Badge key={action} variant="secondary" className="text-xs">
                  Price: {filterOptions.priceActions.find((o) => o.value === action)?.label}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() =>
                      updateFilters({
                        priceActions: filters.priceActions.filter((a) => a !== action),
                      })
                    }
                  />
                </Badge>
              ))}
              {filters.cmtStatus.map((status) => (
                <Badge key={status} variant="secondary" className="text-xs">
                  CMT: {filterOptions.cmtStatus.find((o) => o.value === status)?.label}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() =>
                      updateFilters({
                        cmtStatus: filters.cmtStatus.filter((s) => s !== status),
                      })
                    }
                  />
                </Badge>
              ))}
              {filters.llmClassifications.map((classification) => (
                <Badge key={classification} variant="secondary" className="text-xs">
                  LLM: {filterOptions.llmClassifications.find((o) => o.value === classification)?.label}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() =>
                      updateFilters({
                        llmClassifications: filters.llmClassifications.filter((c) => c !== classification),
                      })
                    }
                  />
                </Badge>
              ))}
              {filters.searchQuery && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{filters.searchQuery}"
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilters({ searchQuery: "" })} />
                </Badge>
              )}
            </div>
          </div>
        )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
