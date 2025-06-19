import express from 'express'
import { createRequestRegistrationController } from '~/controllers/request.controllers'
import { isStaffOrAdminValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

const requestsRouter = express.Router()

/**
 * Description. Create a new request registration
 * Path: /
 * Method: POST
 * Body: { CreateRequestRegistrationReqBody }
 * Header: { Authorization: Bearer <access_token>}
 */
requestsRouter.post('/', isStaffOrAdminValidator, wrapAsync(createRequestRegistrationController))

export default requestsRouter
