import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

const s3Client = new S3Client({ region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-2' })
const BUCKET_NAME = process.env.NEXT_PUBLIC_S3_BUCKET || 'precrapui-dashboard-data-jilanih-us-east-2'

export async function POST(request: NextRequest) {
  try {
    const feedback = await request.json()
    
    // Read existing feedback from S3
    let allFeedback: any[] = []
    
    try {
      const getCommand = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: 'feedback.json'
      })
      const response = await s3Client.send(getCommand)
      const fileContent = await response.Body?.transformToString()
      
      if (fileContent) {
        allFeedback = JSON.parse(fileContent)
      }
    } catch (error: any) {
      if (error.name !== 'NoSuchKey') {
        console.error('Error reading feedback from S3:', error)
      }
    }
    
    // Add new feedback
    allFeedback.push({
      ...feedback,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString()
    })
    
    // Save feedback to S3
    const putCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: 'feedback.json',
      Body: JSON.stringify(allFeedback, null, 2),
      ContentType: 'application/json'
    })
    
    await s3Client.send(putCommand)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving feedback to S3:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save feedback' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: 'feedback.json'
    })
    
    const response = await s3Client.send(command)
    const fileContent = await response.Body?.transformToString()
    
    if (!fileContent) {
      return NextResponse.json([])
    }
    
    const feedback = JSON.parse(fileContent)
    return NextResponse.json(feedback)
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      return NextResponse.json([])
    }
    console.error('Error reading feedback from S3:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to read feedback' },
      { status: 500 }
    )
  }
}
