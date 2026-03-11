import { createServer } from 'node:http'

import { env } from './config/env.js'
import { app } from './app.js'
import { attachSocketServer } from './lib/socket.js'

const httpServer = createServer(app)

attachSocketServer(httpServer)

httpServer.listen(env.PORT, () => {
  console.log(`Fleet API listening on http://localhost:${env.PORT}`)
})