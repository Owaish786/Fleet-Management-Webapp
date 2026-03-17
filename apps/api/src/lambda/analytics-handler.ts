import { getFleetAnalyticsInsights } from '../services/analytics-service.js'

interface AnalyticsLambdaResult {
  statusCode: number
  body: string
}

export async function handler(): Promise<AnalyticsLambdaResult> {
  const insights = await getFleetAnalyticsInsights()

  return {
    statusCode: 200,
    body: JSON.stringify(insights),
  }
}
