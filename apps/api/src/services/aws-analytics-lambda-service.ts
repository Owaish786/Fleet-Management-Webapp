import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda'

import { env } from '../config/env.js'
import { createHttpError } from '../lib/http-error.js'
import type { FleetAnalyticsInsights } from './analytics-service.js'

function createLambdaClient() {
  if (!env.AWS_REGION) {
    return null
  }

  return new LambdaClient({ region: env.AWS_REGION })
}

export async function getAnalyticsInsightsFromLambda(): Promise<FleetAnalyticsInsights> {
  const functionName = env.AWS_LAMBDA_ANALYTICS_FUNCTION
  const client = createLambdaClient()

  if (!functionName || !client) {
    throw createHttpError(
      503,
      'AWS Lambda analytics is not configured. Set AWS_REGION and AWS_LAMBDA_ANALYTICS_FUNCTION in your environment.',
    )
  }

  const output = await client.send(
    new InvokeCommand({
      FunctionName: functionName,
      Payload: JSON.stringify({ source: 'fleet-api' }),
    }),
  )

  if (!output.Payload) {
    throw createHttpError(502, 'Lambda returned an empty response payload.')
  }

  const raw = Buffer.from(output.Payload).toString('utf8')
  const parsed = JSON.parse(raw) as { statusCode?: number; body?: string } | FleetAnalyticsInsights

  if ('body' in parsed && typeof parsed.body === 'string') {
    const body = JSON.parse(parsed.body) as FleetAnalyticsInsights
    return body
  }

  return parsed as FleetAnalyticsInsights
}
