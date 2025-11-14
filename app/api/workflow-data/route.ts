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

// Simple in-memory lock to prevent race conditions
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
    
    // Save merged data to S3
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
    console.log('Fetching workflow data from S3...')
    console.log('Bucket:', BUCKET_NAME)
    console.log('S3_ACCESS_KEY_ID exists:', !!process.env.S3_ACCESS_KEY_ID)
    console.log('S3_ACCESS_KEY_ID value:', process.env.S3_ACCESS_KEY_ID ? 'SET' : 'NOT SET')
    console.log('All env vars:', Object.keys(process.env).filter(k => k.includes('S3') || k.includes('AWS')))
    
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: 'workflow-data.json'
    })
    
    const response = await s3Client.send(command)
    const fileContent = await response.Body?.transformToString()
    
    if (!fileContent) {
      console.log('No file content returned')
      return NextResponse.json({ data: [] })
    }
    
    const data = JSON.parse(fileContent)
    console.log('Successfully loaded', data.length, 'records')
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Error reading workflow data from S3:', error.name, error.message)
    if (error.name === 'NoSuchKey') {
      return NextResponse.json({ data: [], error: 'File not found' })
    }
    return NextResponse.json({ data: [], error: error.message })
  }
}

export async function DELETE() {
  try {
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: 'workflow-data.json',
      Body: JSON.stringify([], null, 2),
      ContentType: 'application/json'
    })
    
    await s3Client.send(putCommand)
    
    return NextResponse.json({ 
      success: true, 
      message: 'All workflow data cleared' 
    })
  } catch (error) {
    console.error('Error clearing workflow data from S3:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to clear data' },
      { status: 500 }
    )
  }
}
