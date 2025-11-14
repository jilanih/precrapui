import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({ 
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ''
  }
})
const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET || 'precrapui-dashboard-data-jilanih-us-east-2'

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
    
    // Read existing data from S3
    let existingRecords: any[] = []
    
    try {
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: 'workflow-data.json'
      })
      const response = await s3Client.send(getCommand)
      const fileContent = await response.Body?.transformToString()
      
      if (fileContent) {
        existingRecords = JSON.parse(fileContent)
      }
    } catch (error: any) {
      if (error.name !== 'NoSuchKey') {
        console.error('Error reading from S3:', error)
      }
      existingRecords = []
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
    
    // Save to S3
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: 'workflow-data.json',
      Body: JSON.stringify(finalRecords, null, 2),
      ContentType: 'application/json'
    })
    
    await s3Client.send(putCommand)
    
    const newASINCount = recordsWithTimestamp.filter((r: any) => 
      !existingRecords.some((e: any) => e['PB C-ASIN'] === r['PB C-ASIN'])
    ).length
    
    // Update RBM Time Saved for all processed ASINs (including updates)
    if (newRecords.length > 0) {
      try {
        await fetch('http://localhost:3000/api/rbm-time-saved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ asinCount: newRecords.length })
        })
      } catch (error) {
        console.error('Error updating RBM time saved:', error)
      }
    }
    
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
