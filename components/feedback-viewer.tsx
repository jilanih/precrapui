"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface FeedbackItem {
  id: string
  asin: string
  type: 'positive' | 'negative'
  text: string
  timestamp: string
  submittedAt: string
}

export function FeedbackViewer() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadFeedback = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/feedback')
      const data = await response.json()
      setFeedback(data)
    } catch (error) {
      console.error('Error loading feedback:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadFeedback()
  }, [])

  const positiveFeedback = feedback.filter(f => f.type === 'positive')
  const negativeFeedback = feedback.filter(f => f.type === 'negative')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Feedback</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feedback.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Positive</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{positiveFeedback.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Negative</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{negativeFeedback.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feedback Details</CardTitle>
          <CardDescription>
            Review user feedback on recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : feedback.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No feedback submitted yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ASIN</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Feedback</TableHead>
                    <TableHead>Submitted</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedback.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.asin}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={item.type === 'positive' ? 'default' : 'destructive'}
                          className={item.type === 'positive' ? 'bg-green-600' : ''}
                        >
                          {item.type === 'positive' ? '👍 Positive' : '👎 Negative'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        {item.text || '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(item.submittedAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
