import express from 'express'
import {
  loginController,
  logoutController,
  refreshTokenController,
  registerController
} from '~/controllers/user.controllers'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const usersRouter = express.Router()

/**
 * @openapi
 * /users/login:
 *  post:
 *    description:
 *    tags:
 *      - Users
 *    requestBody:
 *      description: Information Login
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

/**
 * Description. Refresh Token
 * Path: /refresh-token
 * METHOD: POST
 * Body : { refresh_token: string }
 */
usersRouter.post('/refresh-token', refreshTokenValidator, wrapAsync(refreshTokenController))

export default usersRouter
