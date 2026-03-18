import cron from 'node-cron'
import { env } from '../config/env.js'
import { uploadAccessLogsToS3 } from './log-export-service.js'

let logsJob: cron.ScheduledTask | null = null

export function initializeExportScheduler() {
  try {
    // Schedule logs export every 2 hours (at 0, 2, 4, 6, 8, ... hours)
    // Analytics exports are per-user and triggered manually via API
    logsJob = cron.schedule('0 */2 * * *', async () => {
      try {
        console.log('[SCHEDULER] Starting periodic access logs export...')
        const result = await uploadAccessLogsToS3('fleet-logs')
        console.log(`[SCHEDULER] ✓ Access logs uploaded to S3: s3://${result.bucket}/${result.key}`)
      } catch (error) {
        console.error('[SCHEDULER] ✗ Failed to export logs:', error)
      }
    })

    console.log('[SCHEDULER] Export scheduler initialized:')
    console.log('  • Access logs export: every 2 hours')
    console.log('  • Analytics exports: per-user, triggered manually via POST /api/analytics/insights/export-s3')
  } catch (error) {
    console.error('[SCHEDULER] Failed to initialize export scheduler:', error)
  }
}

export function stopExportScheduler() {
  if (logsJob) {
    logsJob.stop()
    console.log('[SCHEDULER] Logs export job stopped')
  }
}

export function getSchedulerStatus() {
  return {
    logsExport: {
      schedule: 'every 2 hours (0 */2 * * *)',
      enabled: logsJob !== null,
    },
    analyticsExport: {
      schedule: 'per-user, triggered manually',
      enabled: true,
    },
  }
}
