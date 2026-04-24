import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import driversRoutes from './routes/driversRoutes.js'
import vehiclesRoutes from './routes/vehiclesRoutes.js'
import registrationsRoutes from './routes/registrationsRoutes.js'

dotenv.config()

const app = express()

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? true,
  }),
)
app.use(express.json())

app.use('/drivers', driversRoutes)
app.use('/vehicles', vehiclesRoutes)
app.use('/registrations', registrationsRoutes)

const port = Number(process.env.PORT ?? 3001)
app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
})
