import { appendFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

import type { NextFunction, Request, Response } from 'express'

const LOG_DIR = resolve(process.cwd(), './logs')
const ACCESS_LOG_FILE = resolve(LOG_DIR, 'access.log.ndjson')

export async function requestLogger(request: Request, response: Response, next: NextFunction) {
  const startedAt = Date.now()

  response.on('finish', () => {
    void writeAccessLog({
      timestamp: new Date().toISOString(),
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs: Date.now() - startedAt,
      userAgent: request.headers['user-agent'] ?? null,
      ip: request.ip ?? 'unknown',
    })
  })

  next()
}

async function writeAccessLog(entry: {
  timestamp: string
  method: string
  path: string
  statusCode: number
  durationMs: number
  userAgent: string | null
  ip: string
}) {
  try {
    await mkdir(LOG_DIR, { recursive: true })
    await appendFile(ACCESS_LOG_FILE, `${JSON.stringify(entry)}\n`)
  } catch {
    // Logging should never crash request flow.
  }
}

export function getAccessLogFilePath() {
  return ACCESS_LOG_FILE
}
