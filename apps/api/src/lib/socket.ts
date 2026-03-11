import type { Server as HttpServer } from 'node:http'

import { Server } from 'socket.io'

import { env } from '../config/env.js'

export interface TrackingBroadcastPayload {
  id: string
  latitude: number
  longitude: number
  speedKph: number | null
  headingDeg: number | null
  accuracyM: number | null
  batteryLevel: number | null
  recordedAt: string
  ageSeconds: number
  vehicle: {
    id: string
    plateNumber: string
    make: string
    model: string
    status: string
  }
  driver: {
    id: string
    name: string
  } | null
  trip: {
    id: string
    routeName: string
    status: string
  } | null
}

let io: Server | null = null

export function attachSocketServer(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin(origin, callback) {
        if (!origin || origin.startsWith('http://localhost') || origin === env.CLIENT_ORIGIN) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by Socket.IO CORS'))
        }
      },
    },
  })

  io.on('connection', (socket) => {
    socket.join('tracking')
  })

  return io
}

export function broadcastTrackingUpdate(payload: TrackingBroadcastPayload) {
  io?.to('tracking').emit('tracking:update', payload)
}