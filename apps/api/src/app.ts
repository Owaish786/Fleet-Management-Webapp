import cors from 'cors'
import express from 'express'
import { ZodError } from 'zod'

import { env } from './config/env.js'
import { requestLogger } from './middleware/request-logger.js'
import { apiRouter } from './routes/index.js'

export const app = express()

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (curl, mobile apps) and any localhost port
      if (!origin || origin.startsWith('http://localhost')) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
  }),
)
app.use(express.json())
app.use(requestLogger)

app.use('/api', apiRouter)

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      message: 'Validation failed.',
      issues: error.issues,
    })
    return
  }

  if (error instanceof Error && 'status' in error) {
    const status = (error as Error & { status: number }).status
    response.status(status).json({ message: error.message })
    return
  }

  console.error(error)
  response.status(500).json({
    message: 'Internal server error.',
  })
})