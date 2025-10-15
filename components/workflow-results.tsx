"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchWorkflowData, aggregateWorkflowStats, type WorkflowRecord } from "@/lib/workflow-data"
import { RefreshCw, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef } from "react"

type FilterType = 'all' | 'priceMatch' | 'revertToBase' | 'comparable' | 'underSpec' | 'overSpec'

export function WorkflowResults() {
  const [data, setData] = useState<WorkflowRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [uploading, setUploading] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [selectedGLs, setSelectedGLs] = useState<string[]>([])
  const [glDropdownOpen, setGlDropdownOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  const toggleGL = (gl: string) => {
    setSelectedGLs(prev => 
      prev.includes(gl) 
        ? prev.filter(g => g !== gl)
        : [...prev, gl]
    )
  }

  const clearGLFilter = () => {
    setSelectedGLs([])
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const workflowData = await fetchWorkflowData()
      console.log('Fetched workflow data:', workflowData)
      // Ensure we always have an array
      const records = Array.isArray(workflowData) ? workflowData : []
      console.log('Records array:', records)
      setData(records)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error loading workflow data:', error)
      setData([])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 300000)
    return () => clearInterval(interval)
  }, [])

  // Close GL dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (glDropdownOpen && !target.closest('.relative')) {
        setGlDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [glDropdownOpen])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload-data', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert(`✅ Success! Added ${result.newASINs} new ASINs, updated ${result.updatedASINs} existing. Total: ${result.totalRecords}`)
        loadData()
      } else {
        alert(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      alert(`❌ Error uploading file: ${error}`)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Get unique GLs from data
  const availableGLs = Array.from(new Set(
    data
      .map(record => record.GL || record.gl || '')
      .filter(gl => gl.trim() !== '')
  )).sort()

  // First filter by GL (parent filter)
  const glFilteredData = selectedGLs.length > 0
    ? data.filter(record => {
        const recordGL = record.GL || record.gl || ''
        return selectedGLs.includes(recordGL)
      })
    : data

  // Calculate stats based on GL-filtered data
  const stats = aggregateWorkflowStats(glFilteredData)
  
  // Then apply sub-filter (price match, positioning, etc.)
  const filteredData = glFilteredData.filter(record => {
    if (activeFilter === 'all') return true
    
    const priceRec = (record.pricing_recommendation || record.price_recommendation || '').toLowerCase()
    const positioning = (record.positioning || '').toLowerCase()
    
    switch (activeFilter) {
      case 'priceMatch':
        return priceRec.includes('price match')
      case 'revertToBase':
        return priceRec.includes('revert to base')
      case 'comparable':
        return positioning.includes('comparable')
      case 'underSpec':
        return positioning.includes('under-spec') || positioning.includes('underspec')
      case 'overSpec':
        return positioning.includes('over-spec') || positioning.includes('overspec')
      default:
        return true
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Results</h2>
          {lastUpdated && (
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {/* GL Filter Dropdown */}
          <div className="relative">
            <Button 
              onClick={() => setGlDropdownOpen(!glDropdownOpen)}
              variant="outline" 
              size="sm"
              className={selectedGLs.length > 0 
                ? 'bg-blue-100 border-blue-500 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:border-blue-500 dark:text-blue-200 dark:hover:bg-blue-800' 
                : 'bg-blue-50/50 border-blue-300 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900'
              }
            >
              GL Filter {selectedGLs.length > 0 && `(${selectedGLs.length})`}
            </Button>
            {glDropdownOpen && (
              <div className="absolute top-full mt-1 z-50 w-64 bg-background border rounded-md shadow-lg max-h-96 overflow-y-auto">
                <div className="p-2 border-b flex justify-between items-center sticky top-0 bg-background">
                  <span className="text-sm font-semibold">Select GLs</span>
                  {selectedGLs.length > 0 && (
                    <Button 
                      onClick={clearGLFilter}
                      variant="ghost" 
                      size="sm"
                      className="h-6 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>
                {availableGLs.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground text-center">
                    No GLs available
                  </div>
                ) : (
                  <div className="p-2">
                    {availableGLs.map(gl => (
                      <label 
                        key={gl}
                        className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedGLs.includes(gl)}
                          onChange={() => toggleGL(gl)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{gl}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={uploading}
            variant="outline" 
            size="sm"
          >
            <Upload className={`h-4 w-4 mr-2 ${uploading ? 'animate-pulse' : ''}`} />
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
          <Button onClick={loadData} disabled={loading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={async () => {
              if (confirm('Are you sure you want to clear all workflow data?')) {
                await fetch('/api/workflow-data', { method: 'DELETE' })
                loadData()
              }
            }} 
            variant="destructive" 
            size="sm"
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${activeFilter === 'all' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total ASINs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
            {activeFilter === 'all' && <p className="text-xs text-primary mt-1">Showing all</p>}
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${activeFilter === 'priceMatch' ? 'ring-2 ring-green-600' : ''}`}
          onClick={() => setActiveFilter('priceMatch')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Price Match</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.priceMatch}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeFilter === 'priceMatch' ? 'Filtered' : 'Recommendation'}
            </p>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${activeFilter === 'revertToBase' ? 'ring-2 ring-orange-600' : ''}`}
          onClick={() => setActiveFilter('revertToBase')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Revert to Base</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.revertToBase}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeFilter === 'revertToBase' ? 'Filtered' : 'Recommendation'}
            </p>
          </CardContent>
        </Card>
        
        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${activeFilter === 'comparable' ? 'ring-2 ring-blue-600' : ''}`}
          onClick={() => setActiveFilter('comparable')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Comparable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.comparable}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeFilter === 'comparable' ? 'Filtered' : 'Positioning'}
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${activeFilter === 'underSpec' ? 'ring-2 ring-yellow-600' : ''}`}
          onClick={() => setActiveFilter('underSpec')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Under-Spec'd</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.underSpec}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeFilter === 'underSpec' ? 'Filtered' : 'Positioning'}
            </p>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-md ${activeFilter === 'overSpec' ? 'ring-2 ring-purple-600' : ''}`}
          onClick={() => setActiveFilter('overSpec')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Over-Spec'd</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.overSpec}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeFilter === 'overSpec' ? 'Filtered' : 'Positioning'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Workflow Execution Details</CardTitle>
              <CardDescription>
                {activeFilter === 'all' 
                  ? 'Detailed results from the latest n8n workflow run'
                  : `Showing ${filteredData.length} of ${data.length} records`
                }
              </CardDescription>
            </div>
            <a 
              href="/sample-upload-template.csv" 
              download
              className="text-xs text-blue-600 hover:underline"
            >
              Download CSV Template
            </a>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {activeFilter === 'all' 
                ? 'No workflow data available. Run your n8n workflow to see results here.'
                : 'No records match this filter.'
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PB C-ASIN</TableHead>
                    <TableHead>1P C-ASIN</TableHead>
                    <TableHead>Positioning</TableHead>
                    <TableHead>Price Recommendation</TableHead>
                    <TableHead>FLC Check</TableHead>
                    <TableHead>PCOGS+IB Check</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((record, index) => {
                    const isExpanded = expandedRows.has(index)
                    return (
                      <>
                        <TableRow 
                          key={index}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => toggleRow(index)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{isExpanded ? '▼' : '▶'}</span>
                              {record['PB C-ASIN'] || '-'}
                            </div>
                          </TableCell>
                          <TableCell>{record['1P C-ASIN'] || '-'}</TableCell>
                          <TableCell>
                            {record.positioning && (
                              <Badge 
                                variant={
                                  record.positioning.toLowerCase().includes('comparable')
                                    ? 'default'
                                    : record.positioning.toLowerCase().includes('under')
                                    ? 'secondary'
                                    : 'destructive'
                                }
                              >
                                {record.positioning}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {(record.pricing_recommendation || record.price_recommendation) && (
                              <Badge 
                                variant={
                                  (record.pricing_recommendation || record.price_recommendation || '').toLowerCase().includes('price match')
                                    ? 'default'
                                    : 'secondary'
                                }
                              >
                                {record.pricing_recommendation || record.price_recommendation}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{record['FLC Check'] || '-'}</TableCell>
                          <TableCell className="max-w-md truncate">
                            {record['PCOGS+IB-VCCC Check'] || record['PCOGS+IB-VFCC Check'] || '-'}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {record._lastUpdated 
                              ? new Date(record._lastUpdated).toLocaleString()
                              : '-'
                            }
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${index}-expanded`}>
                            <TableCell colSpan={7} className="bg-muted/30 p-6">
                              <div className="space-y-4">
                                {/* Try multiple possible field names for Justification */}
                                {(record.Justification || record.justification || record['Core Feature'] || record['core_feature']) && (
                                  <div>
                                    <h4 className="font-semibold text-sm mb-2">Justification / Core Feature</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                      {record.Justification || record.justification || record['Core Feature'] || record['core_feature']}
                                    </p>
                                  </div>
                                )}
                                {/* Try multiple possible field names for Strategic Priority */}
                                {(record['Strategic Priority'] || record['strategic_priority'] || record['Strategic priority'] || record.priority) && (
                                  <div>
                                    <h4 className="font-semibold text-sm mb-2">Strategic Priority</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {record['Strategic Priority'] || record['strategic_priority'] || record['Strategic priority'] || record.priority}
                                    </p>
                                  </div>
                                )}
                                {/* Show all other fields for debugging */}
                                <details className="mt-4">
                                  <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                                    View all fields ({Object.keys(record).filter(k => !k.startsWith('_')).length} fields)
                                  </summary>
                                  <div className="mt-2 space-y-2 text-xs">
                                    {Object.entries(record)
                                      .filter(([key]) => !key.startsWith('_') && !['PB C-ASIN', '1P C-ASIN', 'positioning', 'pricing_recommendation', 'price_recommendation', 'FLC Check', 'PCOGS+IB-VCCC Check', 'PCOGS+IB-VFCC Check'].includes(key))
                                      .map(([key, value]) => (
                                        <div key={key} className="border-l-2 border-muted pl-3">
                                          <span className="font-semibold">{key}:</span>{' '}
                                          <span className="text-muted-foreground">{String(value) || '-'}</span>
                                        </div>
                                      ))
                                    }
                                  </div>
                                </details>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
