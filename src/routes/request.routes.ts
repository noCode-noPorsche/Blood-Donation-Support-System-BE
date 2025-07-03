import express from 'express'
import {
  createRequestRegistrationController,
  getAllRequestHealthProcessByUserIdController,
  getAllRequestProcessController,
  getAllRequestRegistrationController,
  getRequestHealthProcessByRequestIdController,
  getRequestProcessBloodByProcessIdController,
  getRequestProcessByIdController,
  getRequestProcessByUserIdController,
  getRequestProcessDetailByProcessIdController,
  getRequestRegistrationByIdController,
  getRequestRegistrationByUserIdController,
  getStatusRequestHealthProcessByRequestIdController,
  updateRequestProcessBloodByProcessIdController,
  updateRequestProcessByIdController,
  updateRequestProcessDetailByProcessIdController,
  updateRequestRegistrationController
} from '~/controllers/request.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  createRequestRegistrationValidator,
  updateRequestProcessValidator,
  updateRequestRegistrationValidator
} from '~/middlewares/request.middlewares'
import { accessTokenValidator, isStaffOrAdminValidator } from '~/middlewares/user.middlewares'
import {
  CreateRequestRegistrationReqBody,
  UpdateRequestProcessIdReqBody,
  UpdateRequestRegistrationReqBody
} from '~/models/requests/Request.requests'
import { wrapAsync } from '~/utils/handler'

const requestsRouter = express.Router()

//Request - Health - Process
/**
 * Description. Get request registration - health check - request process by user id
 * Path: request-health-process/user
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
requestsRouter.get(
  '/request-health-process/user',
  accessTokenValidator,
  wrapAsync(getAllRequestHealthProcessByUserIdController)
)

/**
 * Description. Get request registration - health check - request process by request id
 * Path: /request-health-process/:id
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
requestsRouter.get(
  '/request-health-process/:id',
  accessTokenValidator,
  wrapAsync(getRequestHealthProcessByRequestIdController)
)

/**
 * Description. Get status request registration - health check - request process by request id
 * Path: request-health-process/user
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
requestsRouter.get(
  '/request-health-process/:id/status',
  accessTokenValidator,
  wrapAsync(getStatusRequestHealthProcessByRequestIdController)
)

// Request Registration
/**
 * Description. Create a new request registration
 * Path: /
 * Method: POST
 * Body: { CreateRequestRegistrationReqBody }
 * Header: { Authorization: Bearer <access_token>}
 */
requestsRouter.post(
  '/request-registrations',
  isStaffOrAdminValidator,
  createRequestRegistrationValidator,
  filterMiddleware<CreateRequestRegistrationReqBody>([
    'blood_group_id',
    'request_type',
    'citizen_id_number',
    'full_name',
    'image',
    'is_emergency',
    'phone',
    'receive_date_request',
    'note'
  ]),
  wrapAsync(createRequestRegistrationController)
)

/**
 * Description. Get request registration by user id
 * Path: /user
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
requestsRouter.get(
  '/request-registrations/user',
  accessTokenValidator,
  wrapAsync(getRequestRegistrationByUserIdController)
)

/**
 * Description. Update a request registration by id
 * Path: /
 * Method: PATCH
 * Body: { UpdateRequestRegistrationReqBody }
 * Header: { Authorization: Bearer <access_token>}
 */
requestsRouter.patch(
  '/request-registrations/:id',
  isStaffOrAdminValidator,
  updateRequestRegistrationValidator,
  filterMiddleware<UpdateRequestRegistrationReqBody>([
    'request_type',
    'blood_group_id',
    'image',
    'status',
    'is_emergency',
    'receive_date_request',
    'note',
    'full_name',
    'phone',
    'citizen_id_number'
  ]),
  wrapAsync(updateRequestRegistrationController)
)

/**
 * Description. Get All request registration for Admin or Staff
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
requestsRouter.get('/request-registrations', isStaffOrAdminValidator, wrapAsync(getAllRequestRegistrationController))

/**
 * Description. Get request registration by id
 * Path: /:id
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
requestsRouter.get(
  '/request-registrations/:id',
  isStaffOrAdminValidator,
  wrapAsync(getRequestRegistrationByIdController)
)

//Request Process
/**
 * Description. Get request Process by user id
 * Path: /user
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
requestsRouter.get('/request-processes/user', accessTokenValidator, wrapAsync(getRequestProcessByUserIdController))

/**
 * Description. Get All request Process for Admin or Staff
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
requestsRouter.get('/request-processes', isStaffOrAdminValidator, wrapAsync(getAllRequestProcessController))

/**
 * Description. Get request Process by id
 * Path: /:id
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
requestsRouter.get('/request-processes/:id', isStaffOrAdminValidator, wrapAsync(getRequestProcessByIdController))

/**
 * Description. Update request Process by id
 * Path: /:id
 * Method: PATCH
 * Body: { UpdateRequestRegistrationReqBody }
 * Header: { Authorization: Bearer <access_token>}
 */
requestsRouter.patch(
  '/request-processes/:id',
  isStaffOrAdminValidator,
  updateRequestProcessValidator,
  filterMiddleware<UpdateRequestProcessIdReqBody>([
    'blood_component_ids',
    'blood_group_id',
    'description',
    'is_emergency',
    'request_date',
    'status',
    'volume_received'
  ]),
  wrapAsync(updateRequestProcessByIdController)
)

//Request Process Detail
/**
 * Description. Get Request Process Detail by request process id
 * Path: /:id
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
requestsRouter.get(
  '/request-process-details/:id',
  isStaffOrAdminValidator,
  wrapAsync(getRequestProcessDetailByProcessIdController)
)

/**
 * Description. Update Request Process Detail by request process id
 * Path: /:id
 * Method: PATCH
 * Body:
 * Header: { Authorization: Bearer <access_token>}
 */
requestsRouter.patch(
  '/request-process-details/:id',
  isStaffOrAdminValidator,
  // filterMiddleware<UpdateRequestProcessDetailIdReqBody>(['status', 'volume_required']),
  wrapAsync(updateRequestProcessDetailByProcessIdController)
)

//Request Process Blood
/**
 * Description. Get Request Process Blood by request process id
 * Path: /:id
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
requestsRouter.get(
  '/request-process-bloods/:id',
  isStaffOrAdminValidator,
  wrapAsync(getRequestProcessBloodByProcessIdController)
)

/**
 * Description. Update Request Process Blood by request process id
 * Path: /:id
 * Method: PATCH
 * Body:
 * Header: { Authorization: Bearer <access_token>}
 */
requestsRouter.patch(
  '/request-process-bloods/:id',
  isStaffOrAdminValidator,
  // filterMiddleware<UpdateRequestProcessDetailIdReqBody>(['status', 'volume_required']),
  wrapAsync(updateRequestProcessBloodByProcessIdController)
)

export default requestsRouter
