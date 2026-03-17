import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

import { env } from '../config/env.js'
import { createHttpError } from '../lib/http-error.js'
import type { FleetAnalyticsInsights } from './analytics-service.js'

function createS3Client() {
  if (!env.AWS_REGION || !env.AWS_S3_ANALYTICS_BUCKET) {
    return null
  }

  return new S3Client({
    region: env.AWS_REGION,
  })
}

export async function uploadAnalyticsSnapshotToS3(
  snapshot: FleetAnalyticsInsights,
  keyPrefix = 'fleet-analytics',
): Promise<{ bucket: string; key: string }> {
  const bucket = env.AWS_S3_ANALYTICS_BUCKET
  const client = createS3Client()

  if (!bucket || !client) {
    throw createHttpError(
      503,
      'AWS analytics export is not configured. Set AWS_REGION and AWS_S3_ANALYTICS_BUCKET in your environment.',
    )
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const key = `${keyPrefix}/${timestamp}.json`

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(snapshot),
      ContentType: 'application/json',
    }),
  )

  return { bucket, key }
}
