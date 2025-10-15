"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  ArrowUpIcon,
  ArrowDownIcon,
  SearchIcon,
  ExternalLinkIcon,
  TrendingUpIcon,
  TrendingDownIcon,
} from "lucide-react"

// Mock data for ASIN performance
const mockASINData = [
  {
    asin: "B08N5WRWNW",
    title: "Premium Wireless Headphones",
    category: "Electronics",
    currentPrice: 89.99,
    basePrice: 99.99,
    competitorPrice: 85.99,
    decision: "Price Match",
    llmClassification: "Comparable",
    cmtStatus: "Passed",
    revenue: 45230,
    units: 503,
    margin: 23.5,
    owner: "Sarah Chen",
    lastUpdated: "2024-01-15T10:30:00Z",
    validationResults: {
      cmt: { passed: true, score: 0.92 },
      flc: { passed: true, difference: -2.3 },
      pcogs: { passed: true, margin: 18.2 },
      packaging: { passed: true, cost: 1.25 },
      fcVar: { passed: false, variance: 15.2 },
      shipCogs: { passed: true, cost: 3.45 },
    },
    priceHistory: [
      { date: "2024-01-01", price: 99.99, decision: "Base Price" },
      { date: "2024-01-08", price: 94.99, decision: "Price Match" },
      { date: "2024-01-15", price: 89.99, decision: "Price Match" },
    ],
  },
  {
    asin: "B09JQKL123",
    title: "Smart Home Security Camera",
    category: "Home & Garden",
    currentPrice: 129.99,
    basePrice: 139.99,
    competitorPrice: 124.99,
    decision: "Manual Review",
    llmClassification: "Overspec",
    cmtStatus: "Failed",
    revenue: 32150,
    units: 247,
    margin: 31.2,
    owner: "Mike Rodriguez",
    lastUpdated: "2024-01-14T15:45:00Z",
    validationResults: {
      cmt: { passed: false, score: 0.67 },
      flc: { passed: true, difference: 1.8 },
      pcogs: { passed: true, margin: 25.1 },
      packaging: { passed: true, cost: 2.15 },
      fcVar: { passed: true, variance: 8.3 },
      shipCogs: { passed: false, cost: 8.95 },
    },
    priceHistory: [
      { date: "2024-01-01", price: 139.99, decision: "Base Price" },
      { date: "2024-01-07", price: 134.99, decision: "Price Match" },
      { date: "2024-01-14", price: 129.99, decision: "Manual Review" },
    ],
  },
]

export function ASINPerformanceDrilldown() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedASIN, setSelectedASIN] = useState<(typeof mockASINData)[0] | null>(null)
  const [sortField, setSortField] = useState<string>("revenue")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const filteredData = mockASINData.filter(
    (item) =>
      item.asin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField as keyof typeof a]
    const bValue = b[sortField as keyof typeof b]
    const multiplier = sortDirection === "asc" ? 1 : -1

    if (typeof aValue === "number" && typeof bValue === "number") {
      return (aValue - bValue) * multiplier
    }
    return String(aValue).localeCompare(String(bValue)) * multiplier
  })

  const getDecisionBadgeColor = (decision: string) => {
    switch (decision) {
      case "Price Match":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Revert to Base Price":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Manual Review":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getLLMBadgeColor = (classification: string) => {
    switch (classification) {
      case "Comparable":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Overspec":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "Underspec":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">ASIN Performance Analysis</h2>
          <p className="text-gray-400">Detailed product-level insights and decision rationale</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search ASINs, titles, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80 bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Product Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800">
                  <TableHead className="text-gray-300">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("asin")}
                      className="text-gray-300 hover:text-white p-0 h-auto font-medium"
                    >
                      ASIN
                      {sortField === "asin" &&
                        (sortDirection === "asc" ? (
                          <ArrowUpIcon className="ml-1 h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="ml-1 h-4 w-4" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead className="text-gray-300">Product</TableHead>
                  <TableHead className="text-gray-300">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("currentPrice")}
                      className="text-gray-300 hover:text-white p-0 h-auto font-medium"
                    >
                      Current Price
                      {sortField === "currentPrice" &&
                        (sortDirection === "asc" ? (
                          <ArrowUpIcon className="ml-1 h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="ml-1 h-4 w-4" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead className="text-gray-300">Decision</TableHead>
                  <TableHead className="text-gray-300">LLM Classification</TableHead>
                  <TableHead className="text-gray-300">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("revenue")}
                      className="text-gray-300 hover:text-white p-0 h-auto font-medium"
                    >
                      Revenue
                      {sortField === "revenue" &&
                        (sortDirection === "asc" ? (
                          <ArrowUpIcon className="ml-1 h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="ml-1 h-4 w-4" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead className="text-gray-300">
                    <Button
                      variant="ghost"
                      onClick={() => handleSort("margin")}
                      className="text-gray-300 hover:text-white p-0 h-auto font-medium"
                    >
                      Margin %
                      {sortField === "margin" &&
                        (sortDirection === "asc" ? (
                          <ArrowUpIcon className="ml-1 h-4 w-4" />
                        ) : (
                          <ArrowDownIcon className="ml-1 h-4 w-4" />
                        ))}
                    </Button>
                  </TableHead>
                  <TableHead className="text-gray-300">Owner</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((item) => (
                  <TableRow key={item.asin} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell className="font-mono text-blue-400">{item.asin}</TableCell>
                    <TableCell>
                      <div>
                        <div className="text-white font-medium">{item.title}</div>
                        <div className="text-gray-400 text-sm">{item.category}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">${item.currentPrice}</span>
                        {item.currentPrice < item.basePrice ? (
                          <TrendingDownIcon className="h-4 w-4 text-red-400" />
                        ) : (
                          <TrendingUpIcon className="h-4 w-4 text-green-400" />
                        )}
                      </div>
                      <div className="text-gray-400 text-sm">Base: ${item.basePrice}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getDecisionBadgeColor(item.decision)}>{item.decision}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getLLMBadgeColor(item.llmClassification)}>{item.llmClassification}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-white font-medium">${item.revenue.toLocaleString()}</div>
                      <div className="text-gray-400 text-sm">{item.units} units</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{item.margin}%</span>
                        {item.margin > 25 ? (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        ) : item.margin > 15 ? (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        ) : (
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">{item.owner}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedASIN(item)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLinkIcon className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl bg-gray-900 border-gray-800 text-white">
                          <DialogHeader>
                            <DialogTitle className="text-xl">
                              ASIN Performance Details: {selectedASIN?.asin}
                            </DialogTitle>
                          </DialogHeader>
                          {selectedASIN && (
                            <Tabs defaultValue="overview" className="w-full">
                              <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                                <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">
                                  Overview
                                </TabsTrigger>
                                <TabsTrigger value="validation" className="data-[state=active]:bg-gray-700">
                                  Validation Results
                                </TabsTrigger>
                                <TabsTrigger value="pricing" className="data-[state=active]:bg-gray-700">
                                  Pricing History
                                </TabsTrigger>
                                <TabsTrigger value="competitive" className="data-[state=active]:bg-gray-700">
                                  Competitive Analysis
                                </TabsTrigger>
                              </TabsList>

                              <TabsContent value="overview" className="space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                  <Card className="bg-gray-800 border-gray-700">
                                    <CardHeader>
                                      <CardTitle className="text-lg">Product Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <div>
                                        <label className="text-gray-400 text-sm">Title</label>
                                        <p className="text-white font-medium">{selectedASIN.title}</p>
                                      </div>
                                      <div>
                                        <label className="text-gray-400 text-sm">Category</label>
                                        <p className="text-white">{selectedASIN.category}</p>
                                      </div>
                                      <div>
                                        <label className="text-gray-400 text-sm">Owner</label>
                                        <p className="text-white">{selectedASIN.owner}</p>
                                      </div>
                                      <div>
                                        <label className="text-gray-400 text-sm">Last Updated</label>
                                        <p className="text-white">
                                          {new Date(selectedASIN.lastUpdated).toLocaleString()}
                                        </p>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card className="bg-gray-800 border-gray-700">
                                    <CardHeader>
                                      <CardTitle className="text-lg">Performance Metrics</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Revenue</span>
                                        <span className="text-white font-medium">
                                          ${selectedASIN.revenue.toLocaleString()}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Units Sold</span>
                                        <span className="text-white font-medium">{selectedASIN.units}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Margin</span>
                                        <span className="text-white font-medium">{selectedASIN.margin}%</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Current Price</span>
                                        <span className="text-white font-medium">${selectedASIN.currentPrice}</span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>

                              <TabsContent value="validation" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  {Object.entries(selectedASIN.validationResults).map(([key, result]) => (
                                    <Card key={key} className="bg-gray-800 border-gray-700">
                                      <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-white font-medium uppercase">{key}</span>
                                          <Badge
                                            className={
                                              result.passed
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-red-500/20 text-red-400"
                                            }
                                          >
                                            {result.passed ? "PASSED" : "FAILED"}
                                          </Badge>
                                        </div>
                                        {key === "cmt" && (
                                          <div>
                                            <div className="text-gray-400 text-sm mb-1">Match Score</div>
                                            <Progress value={result.score * 100} className="h-2" />
                                            <div className="text-white text-sm mt-1">
                                              {(result.score * 100).toFixed(1)}%
                                            </div>
                                          </div>
                                        )}
                                        {key === "flc" && (
                                          <div className="text-gray-400 text-sm">
                                            Cost Difference: {result.difference > 0 ? "+" : ""}
                                            {result.difference}%
                                          </div>
                                        )}
                                        {key === "pcogs" && (
                                          <div className="text-gray-400 text-sm">Margin: {result.margin}%</div>
                                        )}
                                        {(key === "packaging" || key === "shipCogs") && (
                                          <div className="text-gray-400 text-sm">Cost: ${result.cost}</div>
                                        )}
                                        {key === "fcVar" && (
                                          <div className="text-gray-400 text-sm">Variance: {result.variance}%</div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              </TabsContent>

                              <TabsContent value="pricing" className="space-y-4">
                                <Card className="bg-gray-800 border-gray-700">
                                  <CardHeader>
                                    <CardTitle className="text-lg">Pricing History</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-3">
                                      {selectedASIN.priceHistory.map((entry, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                                        >
                                          <div>
                                            <div className="text-white font-medium">
                                              {new Date(entry.date).toLocaleDateString()}
                                            </div>
                                            <Badge className={getDecisionBadgeColor(entry.decision)}>
                                              {entry.decision}
                                            </Badge>
                                          </div>
                                          <div className="text-white font-bold text-lg">${entry.price}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>

                              <TabsContent value="competitive" className="space-y-4">
                                <div className="grid grid-cols-2 gap-6">
                                  <Card className="bg-gray-800 border-gray-700">
                                    <CardHeader>
                                      <CardTitle className="text-lg">Price Comparison</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Our Current Price</span>
                                        <span className="text-white font-medium">${selectedASIN.currentPrice}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Our Base Price</span>
                                        <span className="text-white font-medium">${selectedASIN.basePrice}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-400">Competitor Price</span>
                                        <span className="text-white font-medium">${selectedASIN.competitorPrice}</span>
                                      </div>
                                      <div className="flex justify-between border-t border-gray-600 pt-2">
                                        <span className="text-gray-400">Price Gap</span>
                                        <span
                                          className={`font-medium ${selectedASIN.currentPrice > selectedASIN.competitorPrice ? "text-red-400" : "text-green-400"}`}
                                        >
                                          $
                                          {Math.abs(selectedASIN.currentPrice - selectedASIN.competitorPrice).toFixed(
                                            2,
                                          )}
                                        </span>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card className="bg-gray-800 border-gray-700">
                                    <CardHeader>
                                      <CardTitle className="text-lg">LLM Analysis</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <div>
                                        <label className="text-gray-400 text-sm">Classification</label>
                                        <div className="mt-1">
                                          <Badge className={getLLMBadgeColor(selectedASIN.llmClassification)}>
                                            {selectedASIN.llmClassification}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-gray-400 text-sm">CMT Status</label>
                                        <div className="mt-1">
                                          <Badge
                                            className={
                                              selectedASIN.cmtStatus === "Passed"
                                                ? "bg-green-500/20 text-green-400"
                                                : "bg-red-500/20 text-red-400"
                                            }
                                          >
                                            {selectedASIN.cmtStatus}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-gray-400 text-sm">Recommendation</label>
                                        <div className="mt-1">
                                          <Badge className={getDecisionBadgeColor(selectedASIN.decision)}>
                                            {selectedASIN.decision}
                                          </Badge>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>
                            </Tabs>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
