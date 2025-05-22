import express from 'express'
import { loginController, logoutController, registerController } from '~/controllers/user.controllers'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const usersRouter = express.Router()

/**
 * Description. Login
 * Path: /login
 * METHOD: POST
 * Body : { name: string, email: string, password: string }
 */
usersRouter.post('/login', loginValidator, wrapAsync(loginController))
/**
 * Description. Register a new user
 * Path: /register
 * METHOD: POST
 * Body : { name: string, email: string, password: string, confirm_password: string, date_of_birth: IOString8601 }
 */
usersRouter.post('/register', registerValidator, wrapAsync(registerController))

/**
 * Description. Logout
 * Path: /logout
 * METHOD: POST
 * Header: { Authorization: Bearer <access_token>}
 * Body : { refresh_token: string }
 */
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

export default usersRouter
