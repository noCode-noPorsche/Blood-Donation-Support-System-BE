import express from 'express'
import {
  changeIsActiveController,
  changePasswordController,
  changeRoleForAdminController,
  getAllUserController,
  getMeController,
  getProfileByCitizenIdNumberController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  registerForAdminController,
  updateMeController
} from '~/controllers/user.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  changePasswordValidator,
  changeRoleForAdminValidator,
  isAdminValidator,
  isStaffOrAdminValidator,
  loginValidator,
  refreshTokenValidator,
  registerForAdminValidator,
  registerValidator,
  updateMeValidator
} from '~/middlewares/user.middlewares'
import { ChangeRoleForAdminReqBody, RegisterForAdminReqBody, UpdateMeReqBody } from '~/models/requests/User.requests'
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
    'address',
    'latitude',
    'longitude'
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

/**
 * Description. Change user by update is_active to false and true for Admin
 * Path: /is-active/:user_id
 * Header: { Authorization: Bearer <access_token>}
 */
usersRouter.patch('/is-active/:user_id', isAdminValidator, wrapAsync(changeIsActiveController))

/**
 * Description. Register a new user for Admin
 * Path: /register-for-admin
 * METHOD: POST
 * Body : { RegisterForAdminReqBody }
 */
usersRouter.post(
  '/register-for-admin',
  isAdminValidator,
  registerForAdminValidator,
  wrapAsync(registerForAdminController)
)

/**
 * Description. Change role user for Admin
 * Path: /role-for-admin/:user_id
 * METHOD: PATCH
 * Body : { ChangeRoleForAdminReqBody }
 */
usersRouter.patch(
  '/role-for-admin/:user_id',
  isAdminValidator,
  changeRoleForAdminValidator,
  filterMiddleware<ChangeRoleForAdminReqBody>(['role']),
  wrapAsync(changeRoleForAdminController)
)

export default usersRouter
