import cors from 'cors'
import express from 'express'
import fs from 'fs'
import path from 'path'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yaml'
import envConfig from '~/config'
import { defaultResponseHandler } from '~/middlewares/response.middleware'
import { scheduleJobs } from './jobs/defineJob'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import blogRouter from './routes/blog.routes'
import bloodRouter from './routes/blood.routes'
import bloodInventoryThreshold from './routes/bloodInventoryThreshold.routes'
import bloodUnitRouter from './routes/bloodUnit.routes'
import dashboardRouter from './routes/dashboard.routes'
import donationRouter from './routes/donation.routes'
import healthCheckRouter from './routes/healthCheck.routes'
import locationRouter from './routes/location.routes'
import notificationRouter from './routes/notification.routes'
import questionRouter from './routes/question.routes'
import requestsRouter from './routes/request.routes'
import usersRouter from './routes/user.routes'
import databaseService from './services/database.services'

async function startServer() {
  const file = fs.readFileSync(path.resolve('BE-swagger.yaml'), 'utf8')
  const swaggerDocument = YAML.parse(file)

  const options: swaggerJsdoc.Options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Blood Donation Support System',
        version: '1.0.0'
      }
    },

    apis: ['./src/routes/*.routes.ts'] // files containing annotations as above
  }
  const openapiSpecification = swaggerJsdoc(options)

  databaseService.connect()
  await scheduleJobs()

  const app = express()
  app.use(express.json())
  app.use(cors())

  app.use(
    cors({
      origin: ['https://your-frontend.com'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true
    })
  )

  app.get('/', (req, res) => {
    res.json({
      data: 'FPT',
      message: 'Dustin'
    })
  })
  app.use(defaultResponseHandler)
  app.use('/api/users', usersRouter)
  app.use('/api/bloods', bloodRouter)
  app.use('/api/blood-units', bloodUnitRouter)
  app.use('/api/donations', donationRouter)
  app.use('/api/health-checks', healthCheckRouter)
  app.use('/api/requests', requestsRouter)
  app.use('/api/blogs', blogRouter)
  app.use('/api/notifications', notificationRouter)
  app.use('/api/dashboards', dashboardRouter)
  app.use('/api/locations', locationRouter)
  app.use('/api/questions', questionRouter)
  app.use('/api/blood-inventory-thresholds', bloodInventoryThreshold)
  app.use(defaultErrorHandler)

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

  app.listen(envConfig.PORT, () => {
    console.log(`Server is running on PORT ${envConfig.PORT}`)
  })
}

startServer().catch(console.error)
