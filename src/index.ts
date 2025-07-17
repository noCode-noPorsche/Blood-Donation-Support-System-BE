import express from 'express'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import databaseService from './services/database.services'
import usersRouter from './routes/user.routes'
import bloodRouter from './routes/blood.routes'
import cors from 'cors'
import YAML from 'yaml'
import fs from 'fs'
import path from 'path'
import swaggerUi from 'swagger-ui-express'
import swaggerJsdoc from 'swagger-jsdoc'
import donationRouter from './routes/donation.routes'
import blogRouter from './routes/blog.routes'
import healthCheckRouter from './routes/healthCheck.routes'
import bloodUnitRouter from './routes/bloodUnit.routes'
import requestsRouter from './routes/request.routes'
import dashboardRouter from './routes/dashboard.routes'
import notificationRouter from './routes/notification.routes'

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
const app = express()
app.use(express.json())
app.use(cors())

app.use(
  cors({
    origin: ['https://your-frontend.com', 'https://be-t8i8.onrender.com/'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  })
)

app.get('/', (req, res) => {
  res.json({
    data: 'FPT',
    message: 'Dustin'
  })
})

app.use('/api/users', usersRouter)
app.use('/api/bloods', bloodRouter)
app.use('/api/blood-units', bloodUnitRouter)
app.use('/api/donations', donationRouter)
app.use('/api/health-checks', healthCheckRouter)
app.use('/api/requests', requestsRouter)
app.use('/api/blogs', blogRouter)
app.use('/api/notifications', notificationRouter)
app.use('/api/dashboards', dashboardRouter)
app.use(defaultErrorHandler)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

const PORT = 8080
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`)
})
