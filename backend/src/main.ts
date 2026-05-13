import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import { container } from 'tsyringe'
import { config } from 'dotenv'
import pino from 'pino'

config()

const logger = pino()
const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Socket.io
const httpServer = app.listen(PORT, () => {
    logger.info(`Backend läuft auf http://localhost:${PORT}`)
})

const io = new Server(httpServer, {
    cors: { origin: "*" }
})

// Container Setup später hier
// container.register...