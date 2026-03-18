import { createServer } from 'node:http'

import { env } from './config/env.js'
import { app } from './app.js'
import { attachSocketServer } from './lib/socket.js'
import { initializeExportScheduler, stopExportScheduler } from './services/export-scheduler-service.js'

const httpServer = createServer(app)

attachSocketServer(httpServer)

httpServer.listen(env.PORT, () => {
  console.log(`Fleet API listening on http://localhost:${env.PORT}`)
  
  // Initialize periodic export scheduler
  initializeExportScheduler()
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received, shutting down gracefully...')
  stopExportScheduler()
  httpServer.close(() => {
    console.log('[SERVER] HTTP server closed')
    process.exit(0)
  })
})