"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchWorkflowData, aggregateWorkflowStats, type WorkflowRecord } from "@/lib/workflow-data"
import { RefreshCw, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRef } from "react"

type FilterType = 'all' | 'priceMatch' | 'cpRoiPricing' | 'comparable' | 'underSpec' | 'overSpec'

export function WorkflowResults() {
  const [data, setData] = useState<WorkflowRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [uploading, setUploading] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [selectedGLs, setSelectedGLs] = useState<string[]>([])
  const [glDropdownOpen, setGlDropdownOpen] = useState(false)
  const [vmAccretiveFilter, setVmAccretiveFilter] = useState<string>('all')
  const [cmAccretiveFilter, setCmAccretiveFilter] = useState<string>('all')
  const [ctsFilter, setCtsFilter] = useState<string>('all')
  const [cmtFilter, setCmtFilter] = useState<string>('all')
  const [vmDropdownOpen, setVmDropdownOpen] = useState(false)
  const [cmDropdownOpen, setCmDropdownOpen] = useState(false)
  const [ctsDropdownOpen, setCtsDropdownOpen] = useState(false)
  const [cmtDropdownOpen, setCmtDropdownOpen] = useState(false)
  const [rbmTimeSaved, setRbmTimeSaved] = useState<number>(0)
  const [feedbackStates, setFeedbackStates] = useState<Record<string, 'positive' | 'negative' | null>>({})
  const [showFeedbackInput, setShowFeedbackInput] = useState<Record<string, boolean>>({})
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({})
  const [searchTerm, setSearchTerm] = useState<string>('')
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

  const handleFeedback = async (asin: string | undefined, type: 'positive' | 'negative') => {
    if (!asin) return
    setFeedbackStates(prev => ({ ...prev, [asin]: type }))
    
    // Submit feedback immediately for both positive and negative
    await submitFeedback(asin, type, '')
    // if (type === 'negative') {
    //   setShowFeedbackInput(prev => ({ ...prev, [asin]: true }))
    // } else {
    //   setShowFeedbackInput(prev => ({ ...prev, [asin]: false }))
    // }
  }

  const submitFeedback = async (asin: string, type: 'positive' | 'negative', text: string) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asin,
          type,
          text,
          timestamp: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        console.log('Feedback submitted successfully')
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  const handleSubmitFeedbackText = async (asin: string | undefined) => {
    if (!asin) return
    const text = feedbackText[asin] || ''
    await submitFeedback(asin, 'negative', text)
    setShowFeedbackInput(prev => ({ ...prev, [asin]: false }))
    setFeedbackText(prev => ({ ...prev, [asin]: '' }))
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
      
      // Load RBM Time Saved
      const rbmResponse = await fetch('/api/rbm-time-saved')
      if (rbmResponse.ok) {
        const rbmData = await rbmResponse.json()
        setRbmTimeSaved(rbmData.totalMinutes || 0)
      }
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

  // Register functions with context for header buttons
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).workflowRefresh = loadData;
      (window as any).workflowClearAll = async () => {
        if (confirm('Are you sure you want to clear all workflow data?')) {
          await fetch('/api/workflow-data', { method: 'DELETE' });
          loadData();
        }
      };
    }
  }, [loadData])

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
  let filteredByParentFilters = selectedGLs.length > 0
    ? data.filter(record => {
        const recordGL = record.GL || record.gl || ''
        return selectedGLs.includes(recordGL)
      })
    : data

  // Apply VM Accretive filter
  if (vmAccretiveFilter !== 'all') {
    filteredByParentFilters = filteredByParentFilters.filter(record => {
      const vm = (record['VM Accretiveness'] || '').toLowerCase()
      if (vmAccretiveFilter === 'accretive') return vm.includes('accretive') && !vm.includes('decretive')
      if (vmAccretiveFilter === 'not-accretive') return vm.includes('decretive')
      return true
    })
  }

  // Apply CM Accretive filter
  if (cmAccretiveFilter !== 'all') {
    filteredByParentFilters = filteredByParentFilters.filter(record => {
      const cm = (record['CM Accretiveness'] || '').toLowerCase()
      if (cmAccretiveFilter === 'accretive') return cm.includes('accretive') && !cm.includes('decretive')
      if (cmAccretiveFilter === 'not-accretive') return cm.includes('decretive')
      return true
    })
  }

  // Apply CTS filter
  if (ctsFilter !== 'all') {
    filteredByParentFilters = filteredByParentFilters.filter(record => {
      const cts = (record['CTS Check'] || '').toLowerCase()
      if (ctsFilter === 'competitive') return cts.includes('competitive') && !cts.includes('un')
      if (ctsFilter === 'un-competitive') return cts.includes('un-competitive') || cts.includes('uncompetitive')
      return true
    })
  }

  // Apply CMT filter
  if (cmtFilter !== 'all') {
    filteredByParentFilters = filteredByParentFilters.filter(record => {
      const isValid = record.is_valid_cmt
      if (cmtFilter === 'valid') return isValid === true || isValid === 'true' || isValid === 'True' || isValid === 'TRUE'
      if (cmtFilter === 'invalid') return isValid === false || isValid === 'false' || isValid === 'False' || isValid === 'FALSE'
      return true
    })
  }

  // Apply search filter
  if (searchTerm.trim()) {
    filteredByParentFilters = filteredByParentFilters.filter(record => {
      const search = searchTerm.toLowerCase()
      return (
        (record['PB C-ASIN'] || '').toLowerCase().includes(search) ||
        (record['1P C-ASIN'] || '').toLowerCase().includes(search)
      )
    })
  }

  // Calculate stats based on parent-filtered data
  const stats = aggregateWorkflowStats(filteredByParentFilters)
  
  // Then apply sub-filter (price match, positioning, etc.)
  const filteredData = filteredByParentFilters.filter(record => {
    if (activeFilter === 'all') return true
    
    const priceRec = (record.pricing_recommendation || record.price_recommendation || '').toLowerCase()
    const positioning = (record.positioning || '').toLowerCase()
    
    switch (activeFilter) {
      case 'priceMatch':
        return priceRec.includes('price match')
      case 'cpRoiPricing':
        return priceRec.includes('cp/roi pricing') || priceRec.includes('revert to base')
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
              GL {selectedGLs.length > 0 && `(${selectedGLs.length})`}
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

          {/* VM Accretive Filter */}
          <div className="relative">
            <Button 
              onClick={() => setVmDropdownOpen(!vmDropdownOpen)}
              variant="outline" 
              size="sm"
              className={vmAccretiveFilter !== 'all' ? 'bg-blue-100 border-blue-500 text-blue-700' : ''}
            >
              VM {vmAccretiveFilter !== 'all' && '✓'}
            </Button>
            {vmDropdownOpen && (
              <div className="absolute top-full mt-1 z-50 w-48 bg-background border rounded-md shadow-lg">
                <div className="p-2">
                  <button onClick={() => { setVmAccretiveFilter('all'); setVmDropdownOpen(false) }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded">All</button>
                  <button onClick={() => { setVmAccretiveFilter('accretive'); setVmDropdownOpen(false) }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded">Accretive</button>
                  <button onClick={() => { setVmAccretiveFilter('not-accretive'); setVmDropdownOpen(false) }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded">Dilutive</button>
                </div>
              </div>
            )}
          </div>

          {/* CM Accretive Filter */}
          <div className="relative">
            <Button 
              onClick={() => setCmDropdownOpen(!cmDropdownOpen)}
              variant="outline" 
              size="sm"
              className={cmAccretiveFilter !== 'all' ? 'bg-blue-100 border-blue-500 text-blue-700' : ''}
            >
              CM {cmAccretiveFilter !== 'all' && '✓'}
            </Button>
            {cmDropdownOpen && (
              <div className="absolute top-full mt-1 z-50 w-48 bg-background border rounded-md shadow-lg">
                <div className="p-2">
                  <button onClick={() => { setCmAccretiveFilter('all'); setCmDropdownOpen(false) }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded">All</button>
                  <button onClick={() => { setCmAccretiveFilter('accretive'); setCmDropdownOpen(false) }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded">Accretive</button>
                  <button onClick={() => { setCmAccretiveFilter('not-accretive'); setCmDropdownOpen(false) }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded">Dilutive</button>
                </div>
              </div>
            )}
          </div>

          {/* CTS Filter */}
          <div className="relative">
            <Button 
              onClick={() => setCtsDropdownOpen(!ctsDropdownOpen)}
              variant="outline" 
              size="sm"
              className={ctsFilter !== 'all' ? 'bg-blue-100 border-blue-500 text-blue-700' : ''}
            >
              CTS {ctsFilter !== 'all' && '✓'}
            </Button>
            {ctsDropdownOpen && (
              <div className="absolute top-full mt-1 z-50 w-48 bg-background border rounded-md shadow-lg">
                <div className="p-2">
                  <button onClick={() => { setCtsFilter('all'); setCtsDropdownOpen(false) }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded">All</button>
                  <button onClick={() => { setCtsFilter('competitive'); setCtsDropdownOpen(false) }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded">Competitive</button>
                  <button onClick={() => { setCtsFilter('un-competitive'); setCtsDropdownOpen(false) }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded">Un-competitive</button>
                </div>
              </div>
            )}
          </div>

          {/* CMT Filter */}
          <div className="relative">
            <Button 
              onClick={() => setCmtDropdownOpen(!cmtDropdownOpen)}
              variant="outline" 
              size="sm"
              className={cmtFilter !== 'all' ? 'bg-blue-100 border-blue-500 text-blue-700' : ''}
            >
              CMT {cmtFilter !== 'all' && '✓'}
            </Button>
            {cmtDropdownOpen && (
              <div className="absolute top-full mt-1 z-50 w-48 bg-background border rounded-md shadow-lg">
                <div className="p-2">
                  <button onClick={() => { setCmtFilter('all'); setCmtDropdownOpen(false) }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded">All</button>
                  <button onClick={() => { setCmtFilter('valid'); setCmtDropdownOpen(false) }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded">Valid</button>
                  <button onClick={() => { setCmtFilter('invalid'); setCmtDropdownOpen(false) }} className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded">Invalid</button>
                </div>
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

          {/* Search Input */}
          <div className="flex items-center gap-2 ml-4">
            <input
              type="text"
              placeholder="Search by PB C-ASIN or 1P C-ASIN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80 px-3 py-2 text-sm border rounded-md bg-background"
            />
            {searchTerm && (
              <Button 
                onClick={() => setSearchTerm('')}
                variant="ghost" 
                size="sm"
              >
                Clear
              </Button>
            )}
          </div>

        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
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
          className={`cursor-pointer transition-all hover:shadow-md ${activeFilter === 'cpRoiPricing' ? 'ring-2 ring-orange-600' : ''}`}
          onClick={() => setActiveFilter('cpRoiPricing')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">CP/ROI Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.cpRoiPricing}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeFilter === 'cpRoiPricing' ? 'Filtered' : 'Recommendation'}
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

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">RBM Time Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{(rbmTimeSaved / 60).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">Hours (cumulative)</p>
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
                              <span className="text-lg text-blue-500 hover:text-blue-600 transition-colors">
                                {isExpanded ? '▼' : '▶'}
                              </span>
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
                                {(record.pricing_recommendation || record.price_recommendation || '').toLowerCase().includes('revert to base') 
                                  ? 'CP/ROI Pricing' 
                                  : (record.pricing_recommendation || record.price_recommendation)}
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
                              <div className="space-y-4 overflow-hidden">
                                {/* Header with Product Title and Feedback Buttons */}
                                <div className="relative">
                                  <div className="pr-72">
                                    {record.llm_our_product && (
                                      <div>
                                        <h4 className="font-semibold text-sm mb-2">Product Title</h4>
                                        <p className="text-sm text-muted-foreground">
                                          {record.llm_our_product}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Feedback Buttons and Input Container - Absolute positioned */}
                                  <div className="absolute top-0 right-0 flex flex-col items-end gap-3" style={{ width: '250px', maxWidth: '25%' }}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">Helpful?</span>
                                      <button
                                        onClick={() => handleFeedback(record['PB C-ASIN'], 'positive')}
                                        className={`p-2 rounded-md transition-all border-2 border-green-400 hover:bg-green-50 hover:border-green-500 ${
                                          record['PB C-ASIN'] && feedbackStates[record['PB C-ASIN']] === 'positive'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-white text-gray-400'
                                        }`}
                                        title="Helpful"
                                      >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => handleFeedback(record['PB C-ASIN'], 'negative')}
                                        className={`p-2 rounded-md transition-all border-2 border-red-400 hover:bg-red-50 hover:border-red-500 ${
                                          record['PB C-ASIN'] && feedbackStates[record['PB C-ASIN']] === 'negative'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-white text-gray-400'
                                        }`}
                                        title="Not helpful"
                                      >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                          <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                                        </svg>
                                      </button>
                                    </div>

                                    {/* Feedback Text Input */}
                                    {false && record['PB C-ASIN'] && showFeedbackInput[record['PB C-ASIN']] && (
                                      <div className="w-full bg-red-50/50 border border-red-300 rounded-md p-3 space-y-2" style={{ marginRight: '-40px' }}>
                                        <label className="text-xs font-medium text-gray-700">
                                          What went wrong?
                                        </label>
                                        <textarea
                                          value={(record['PB C-ASIN'] && feedbackText[record['PB C-ASIN']]) || ''}
                                          onChange={(e) => {
                                            const asin = record['PB C-ASIN']
                                            if (asin) setFeedbackText(prev => ({ ...prev, [asin]: e.target.value }))
                                          }}
                                          className="w-full p-2 border border-gray-300 rounded-md text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                          rows={3}
                                          placeholder="Describe the issue..."
                                        />
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => handleSubmitFeedbackText(record['PB C-ASIN'])}
                                            className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-md hover:bg-red-700 transition-colors"
                                          >
                                            Submit
                                          </button>
                                          <button
                                            onClick={() => {
                                              const asin = record['PB C-ASIN']
                                              if (asin) {
                                                setShowFeedbackInput(prev => ({ ...prev, [asin]: false }))
                                                setFeedbackStates(prev => ({ ...prev, [asin]: null }))
                                              }
                                            }}
                                            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs rounded-md hover:bg-gray-300 transition-colors"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
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
                                  <summary className="text-xs text-blue-500 cursor-pointer hover:text-blue-600 transition-colors">
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
