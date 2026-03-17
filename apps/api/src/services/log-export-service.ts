import { readFile } from 'node:fs/promises'

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

import { env } from '../config/env.js'
import { createHttpError } from '../lib/http-error.js'
import { getAccessLogFilePath } from '../middleware/request-logger.js'

function createS3Client() {
  if (!env.AWS_REGION || !env.AWS_S3_LOGS_BUCKET) {
    return null
  }

  return new S3Client({ region: env.AWS_REGION })
}

export async function uploadAccessLogsToS3(keyPrefix = 'fleet-logs') {
  const bucket = env.AWS_S3_LOGS_BUCKET
  const client = createS3Client()

  if (!bucket || !client) {
    throw createHttpError(
      503,
      'AWS log export is not configured. Set AWS_REGION and AWS_S3_LOGS_BUCKET in your environment.',
    )
  }

  const content = await readFile(getAccessLogFilePath(), 'utf8')
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const key = `${keyPrefix}/access-${timestamp}.ndjson`

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: content,
      ContentType: 'application/x-ndjson',
    }),
  )

  return { bucket, key }
}
