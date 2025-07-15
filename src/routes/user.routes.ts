import express from 'express'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  changePasswordController,
  getAllUserController,
  getMeController,
  getProfileByCitizenIdNumberController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  updateMeController
} from '~/controllers/user.controllers'
import {
  accessTokenValidator,
  changePasswordValidator,
  isStaffOrAdminValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  updateMeValidator
} from '~/middlewares/user.middlewares'
import { UpdateMeReqBody } from '~/models/requests/User.requests'
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
 * Body : { RegisterReqBody }
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

/**
 * Description. Get My Profile
 * Path: /me
 * METHOD: GET
 * Header: { Authorization: Bearer <access_token>}
 */
usersRouter.get('/me', accessTokenValidator, wrapAsync(getMeController))

/**
 * Description. Get All User for Admin or Staff
 * Path: /
 * METHOD: GET
 * Header: { Authorization: Bearer <access_token>}
 */
usersRouter.get('/', isStaffOrAdminValidator, wrapAsync(getAllUserController))

/**
 * Description. Get Profile by citizen id number
 * Path: /:citizen_id_number
 * METHOD: GET
 * Header: { Authorization: Bearer <access_token>}
 */
usersRouter.get('/:citizen_id_number', accessTokenValidator, wrapAsync(getProfileByCitizenIdNumberController))

/**
 * Description. Update My Profile
 * Path: /update-me
 * METHOD: PATCH
 * Header: { Authorization: Bearer <access_token>}
 * Body : UserSchema
 */
usersRouter.patch(
  '/update-me',
  accessTokenValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>([
    'avatar_url',
    'blood_group_id',
    'weight',
    'date_of_birth',
    'gender',
    'full_name',
    'blood_group_id',
    'address'
  ]),
  wrapAsync(updateMeController)
)

/**
 * Description. Change Password
 * Path: /change-password
 * METHOD: POST
 * Header: { Authorization: Bearer <access_token>}
 * Body : UserSchema
 */
usersRouter.post('/change-password', accessTokenValidator, changePasswordValidator, wrapAsync(changePasswordController))

export default usersRouter
