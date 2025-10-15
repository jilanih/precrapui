import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

// Simple in-memory lock to prevent race conditions
let isWriting = false
const writeQueue: Array<() => Promise<void>> = []

async function acquireLock() {
  while (isWriting) {
    await new Promise(resolve => setTimeout(resolve, 10))
  }
  isWriting = true
}

function releaseLock() {
  isWriting = false
}

export async function POST(request: NextRequest) {
  // Acquire lock to prevent race conditions
  await acquireLock()
  
  try {
    let data = await request.json()
    
    // Handle different data formats from n8n
    // If data has a 'data' property, unwrap it
    if (data && typeof data === 'object' && 'data' in data && !Array.isArray(data)) {
      data = data.data
    }
    
    // Ensure data is an array
    const newRecords = Array.isArray(data) ? data : [data]
    
    // Add timestamp to each new record
    const timestamp = new Date().toISOString()
    const recordsWithTimestamp = newRecords.map(record => ({
      ...record,
      _timestamp: timestamp,
      _lastUpdated: timestamp
    }))
    
    // Read existing data
    const dataPath = path.join(process.cwd(), 'public', 'workflow-data.json')
    const fs = require('fs')
    let existingRecords: any[] = []
    
    if (fs.existsSync(dataPath)) {
      try {
        const fileContent = await fs.promises.readFile(dataPath, 'utf-8')
        existingRecords = JSON.parse(fileContent)
      } catch (error) {
        console.log('No existing data or invalid JSON, starting fresh')
        existingRecords = []
      }
    }
    
    // Merge and deduplicate by PB C-ASIN
    const mergedMap = new Map()
    
    // Add existing records first
    existingRecords.forEach((record: any) => {
      const key = record['PB C-ASIN']
      if (key) {
        mergedMap.set(key, record)
      }
    })
    
    // Add/update with new records (overwrites if ASIN exists)
    recordsWithTimestamp.forEach((record: any) => {
      const key = record['PB C-ASIN']
      if (key) {
        mergedMap.set(key, record)
      }
    })
    
    // Convert back to array
    const finalRecords = Array.from(mergedMap.values())
    
    // Save merged data
    await writeFile(dataPath, JSON.stringify(finalRecords, null, 2))
    
    const newASINCount = recordsWithTimestamp.filter((r: any) => 
      !existingRecords.some((e: any) => e['PB C-ASIN'] === r['PB C-ASIN'])
    ).length
    
    return NextResponse.json({ 
      success: true, 
      message: 'Workflow data received and merged',
      recordCount: newRecords.length,
      totalRecords: finalRecords.length,
      newASINs: newASINCount,
      updatedASINs: newRecords.length - newASINCount
    })
  } catch (error) {
    console.error('Error processing workflow data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process data' },
      { status: 500 }
    )
  } finally {
    // Always release lock
    releaseLock()
  }
}

export async function GET() {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'workflow-data.json')
    const fs = require('fs')
    
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({ data: [] })
    }
    
    const fileContent = await fs.promises.readFile(dataPath, 'utf-8')
    const data = JSON.parse(fileContent)
    
    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error reading workflow data:', error)
    return NextResponse.json({ data: [] })
  }
}

export async function DELETE() {
  try {
    const dataPath = path.join(process.cwd(), 'public', 'workflow-data.json')
    await writeFile(dataPath, JSON.stringify([], null, 2))
    
    return NextResponse.json({ 
      success: true, 
      message: 'All workflow data cleared' 
    })
  } catch (error) {
    console.error('Error clearing workflow data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear data' },
      { status: 500 }
    )
  }
}
