import express from 'express'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import databaseService from './services/database.services'
import usersRouter from './routes/user.routes'

databaseService.connect()
const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    data: 'FPT',
    message: 'Dustin'
  })
})

app.use('/users', usersRouter)
app.use(defaultErrorHandler)

const PORT = 8080
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`)
})
