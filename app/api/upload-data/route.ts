import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'

// Reuse the same lock mechanism
let isWriting = false

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
  await acquireLock()
  
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }
    
    const fileContent = await file.text()
    let newRecords: any[] = []
    
    // Parse based on file type
    if (file.name.endsWith('.json')) {
      newRecords = JSON.parse(fileContent)
    } else if (file.name.endsWith('.csv')) {
      // Improved CSV parser that handles quoted fields and line breaks
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = []
        let current = ''
        let inQuotes = false
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          const nextChar = line[i + 1]
          
          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              // Escaped quote
              current += '"'
              i++
            } else {
              // Toggle quote state
              inQuotes = !inQuotes
            }
          } else if (char === ',' && !inQuotes) {
            // Field separator
            result.push(current.trim())
            current = ''
          } else {
            current += char
          }
        }
        result.push(current.trim())
        return result
      }
      
      // Parse CSV handling quoted fields that may contain newlines
      const rows: string[] = []
      let currentRow = ''
      let inQuotes = false
      
      for (let i = 0; i < fileContent.length; i++) {
        const char = fileContent[i]
        const nextChar = fileContent[i + 1]
        
        if (char === '"') {
          currentRow += char
          if (inQuotes && nextChar === '"') {
            // Escaped quote
            currentRow += nextChar
            i++
          } else {
            inQuotes = !inQuotes
          }
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
          // End of row
          if (currentRow.trim()) {
            rows.push(currentRow.trim())
          }
          currentRow = ''
          // Skip \r\n combination
          if (char === '\r' && nextChar === '\n') {
            i++
          }
        } else {
          currentRow += char
        }
      }
      
      // Add last row if exists
      if (currentRow.trim()) {
        rows.push(currentRow.trim())
      }
      
      if (rows.length < 2) {
        return NextResponse.json(
          { success: false, error: 'CSV file is empty or invalid' },
          { status: 400 }
        )
      }
      
      const headers = parseCSVLine(rows[0])
      console.log('CSV Headers:', headers)
      console.log('Total rows:', rows.length)
      
      newRecords = rows.slice(1).map((row, rowIndex) => {
        const values = parseCSVLine(row)
        const record: any = {}
        
        headers.forEach((header, index) => {
          const value = values[index] || ''
          // Clean up the value - remove extra quotes if present
          record[header] = value.replace(/^["']|["']$/g, '').trim()
        })
        
        // Debug first few records
        if (rowIndex < 3) {
          console.log(`Record ${rowIndex}:`, record)
        }
        
        return record
      }).filter(record => record['PB C-ASIN'] && record['PB C-ASIN'].trim()) // Only include rows with PB C-ASIN
      
      console.log('Parsed records count:', newRecords.length)
      console.log('Sample record keys:', Object.keys(newRecords[0] || {}))
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Please upload CSV or JSON.' },
        { status: 400 }
      )
    }
    
    // Ensure it's an array
    if (!Array.isArray(newRecords)) {
      newRecords = [newRecords]
    }
    
    // Add timestamp to each record
    const timestamp = new Date().toISOString()
    const recordsWithTimestamp = newRecords.map(record => ({
      ...record,
      _timestamp: timestamp,
      _lastUpdated: timestamp,
      _source: 'manual_upload'
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
        existingRecords = []
      }
    }
    
    // Merge and deduplicate by PB C-ASIN
    const mergedMap = new Map()
    
    existingRecords.forEach((record: any) => {
      const key = record['PB C-ASIN']
      if (key) {
        mergedMap.set(key, record)
      }
    })
    
    recordsWithTimestamp.forEach((record: any) => {
      const key = record['PB C-ASIN']
      if (key) {
        mergedMap.set(key, record)
      }
    })
    
    const finalRecords = Array.from(mergedMap.values())
    
    await writeFile(dataPath, JSON.stringify(finalRecords, null, 2))
    
    const newASINCount = recordsWithTimestamp.filter((r: any) => 
      !existingRecords.some((e: any) => e['PB C-ASIN'] === r['PB C-ASIN'])
    ).length
    
    return NextResponse.json({ 
      success: true, 
      message: 'File uploaded and data merged successfully',
      recordCount: newRecords.length,
      totalRecords: finalRecords.length,
      newASINs: newASINCount,
      updatedASINs: newRecords.length - newASINCount
    })
  } catch (error) {
    console.error('Error processing uploaded file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process file: ' + (error as Error).message },
      { status: 500 }
    )
  } finally {
    releaseLock()
  }
}
