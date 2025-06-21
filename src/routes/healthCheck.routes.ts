import express from 'express'
import {
  getAllHealthChecksController,
  getHealthCheckByIdController,
  getHealthCheckByUserIdController,
  updateHealthCheckByIdController
} from '~/controllers/healthCheck.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { updateHealthCheckValidator } from '~/middlewares/healthCheck.middlewares'
import { accessTokenValidator, isStaffOrAdminValidator } from '~/middlewares/user.middlewares'
import { UpdateHealthCheckReqBody } from '~/models/requests/HealthCheck.requests'

import { wrapAsync } from '~/utils/handler'

const healthCheckRouter = express.Router()

/**
 * Description. Get all health checks
 * Path: /
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
healthCheckRouter.get('/', isStaffOrAdminValidator, wrapAsync(getAllHealthChecksController))

/**
 * Description. Get health checks by user id now
 * Path: /user
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
healthCheckRouter.get('/user', accessTokenValidator, wrapAsync(getHealthCheckByUserIdController))

/**
 * Description. Get health checks by id
 * Path: /:id
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 */
healthCheckRouter.get('/:id', isStaffOrAdminValidator, wrapAsync(getHealthCheckByIdController))

/**
 * Description. Update health checks by id
 * Path: /:id
 * Method: PATCH
 * Header: { Authorization: Bearer <access_token>}
 */
healthCheckRouter.patch(
  '/:id',
  isStaffOrAdminValidator,
  updateHealthCheckValidator,
  filterMiddleware<UpdateHealthCheckReqBody>([
    'blood_component_ids',
    'blood_group_id',
    'weight',
    'heart_rate',
    'temperature',
    'description',
    'underlying_health_condition',
    'diastolic_blood_pressure',
    'systolic_blood_pressure',
    'hemoglobin',
    'status'
  ]),
  wrapAsync(updateHealthCheckByIdController)
)

export default healthCheckRouter
