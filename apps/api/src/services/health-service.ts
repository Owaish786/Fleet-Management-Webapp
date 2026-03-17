import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3'
import { GetFunctionCommand, LambdaClient } from '@aws-sdk/client-lambda'

import { env } from '../config/env.js'

export async function checkAWSConnection() {
  const result = {
    s3Analytics: { status: 'unchecked', error: null as string | null },
    s3Logs: { status: 'unchecked', error: null as string | null },
    lambda: { status: 'unchecked', error: null as string | null },
  }

  if (env.AWS_REGION && (env.AWS_S3_ANALYTICS_BUCKET || env.AWS_S3_LOGS_BUCKET || env.AWS_LAMBDA_ANALYTICS_FUNCTION)) {
    try {
      const s3Client = new S3Client({ region: env.AWS_REGION })
      
      if (env.AWS_S3_ANALYTICS_BUCKET) {
        try {
          await s3Client.send(new HeadBucketCommand({ Bucket: env.AWS_S3_ANALYTICS_BUCKET }))
          result.s3Analytics.status = 'connected'
        } catch (error: any) {
          result.s3Analytics.status = 'error'
          result.s3Analytics.error = error.message || 'Unknown error'
        }
      }

      if (env.AWS_S3_LOGS_BUCKET && env.AWS_S3_LOGS_BUCKET !== env.AWS_S3_ANALYTICS_BUCKET) {
        try {
          await s3Client.send(new HeadBucketCommand({ Bucket: env.AWS_S3_LOGS_BUCKET }))
          result.s3Logs.status = 'connected'
        } catch (error: any) {
          result.s3Logs.status = 'error'
          result.s3Logs.error = error.message || 'Unknown error'
        }
      } else if (env.AWS_S3_LOGS_BUCKET) {
        result.s3Logs = result.s3Analytics // Same bucket
      }

      if (env.AWS_LAMBDA_ANALYTICS_FUNCTION) {
        const lambdaClient = new LambdaClient({ region: env.AWS_REGION })
        try {
          await lambdaClient.send(new GetFunctionCommand({ FunctionName: env.AWS_LAMBDA_ANALYTICS_FUNCTION }))
          result.lambda.status = 'connected'
        } catch (error: any) {
          result.lambda.status = 'error'
          result.lambda.error = error.message || 'Unknown error'
        }
      }

    } catch (error: any) {
      // General client initialization error
      result.s3Analytics.error = error.message
      result.s3Logs.error = error.message
      result.lambda.error = error.message
    }
  }

  return result
}
