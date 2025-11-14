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

export async function GET() {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: 'rbm-time-saved.json'
    })
    
    const response = await s3Client.send(command)
    const fileContent = await response.Body?.transformToString()
    
    if (!fileContent) {
      return NextResponse.json({ totalMinutes: 0 })
    }
    
    const data = JSON.parse(fileContent)
    return NextResponse.json(data)
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      return NextResponse.json({ totalMinutes: 0 })
    }
    console.error('Error reading RBM time saved from S3:', error)
    return NextResponse.json({ totalMinutes: 0 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { asinCount } = await request.json()
    
    // Read existing data from S3
    let currentTotal = 0
    let executionCount = 0
    
    try {
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: 'rbm-time-saved.json'
      })
      const response = await s3Client.send(getCommand)
      const fileContent = await response.Body?.transformToString()
      
      if (fileContent) {
        const data = JSON.parse(fileContent)
        currentTotal = data.totalMinutes || 0
        executionCount = data.executionCount || 0
      }
    } catch (error: any) {
      if (error.name !== 'NoSuchKey') {
        console.error('Error reading from S3:', error)
      }
    }
    
    // Add new time saved (15 minutes per ASIN)
    const newMinutes = asinCount * 15
    const newTotal = currentTotal + newMinutes
    executionCount += 1
    
    // Save updated data to S3
    const updatedData = {
      totalMinutes: newTotal,
      executionCount: executionCount,
      lastUpdated: new Date().toISOString()
    }
    
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: 'rbm-time-saved.json',
      Body: JSON.stringify(updatedData, null, 2),
      ContentType: 'application/json'
    })
    
    await s3Client.send(putCommand)
    
    return NextResponse.json({ 
      success: true, 
      totalMinutes: newTotal,
      addedMinutes: newMinutes
    })
  } catch (error) {
    console.error('Error updating RBM time saved in S3:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update RBM time saved' },
      { status: 500 }
    )
  }
}
