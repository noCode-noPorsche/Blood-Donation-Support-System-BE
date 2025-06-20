import express from 'express'
import {
  createRequestRegistrationController,
  updateRequestRegistrationController
} from '~/controllers/request.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  createRequestRegistrationValidator,
  updateRequestRegistrationValidator
} from '~/middlewares/request.middlewares'
import { isStaffOrAdminValidator } from '~/middlewares/user.middlewares'
import { CreateRequestRegistrationReqBody, UpdateRequestRegistrationReqBody } from '~/models/requests/Request.requests'
import { wrapAsync } from '~/utils/handler'

const requestsRouter = express.Router()

/**
 * Description. Create a new request registration
 * Path: /
 * Method: POST
 * Body: { CreateRequestRegistrationReqBody }
 * Header: { Authorization: Bearer <access_token>}
 */
requestsRouter.post(
  '/',
  isStaffOrAdminValidator,
  createRequestRegistrationValidator,
  filterMiddleware<CreateRequestRegistrationReqBody>([
    'blood_component_id',
    'blood_group_id',
    'citizen_id_number',
    'full_name',
    'image',
    'is_emergency',
    'phone',
    'receive_date_request'
  ]),
  wrapAsync(createRequestRegistrationController)
)

/**
 * Description. Update a request registration by id
 * Path: /
 * Method: PATCH
 * Body: { UpdateRequestRegistrationReqBody }
 * Header: { Authorization: Bearer <access_token>}
 */
requestsRouter.patch(
  '/:id',
  isStaffOrAdminValidator,
  updateRequestRegistrationValidator,
  filterMiddleware<UpdateRequestRegistrationReqBody>([
    'blood_component_id',
    'blood_group_id',
    'citizen_id_number',
    'full_name',
    'image',
    'is_emergency',
    'phone',
    'receive_date_request',
    'status'
  ]),
  wrapAsync(updateRequestRegistrationController)
)

export default requestsRouter
