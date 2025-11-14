import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasS3AccessKey: !!process.env.S3_ACCESS_KEY_ID,
    hasS3SecretKey: !!process.env.S3_SECRET_ACCESS_KEY,
    bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('S3') || k.includes('AWS') || k.includes('NEXT'))
  })
}
